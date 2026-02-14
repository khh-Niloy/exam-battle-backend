import { Types } from "mongoose";
import { War } from "./war.model";
import { QuestionPaper } from "../questionPaper/questionPaper.model";
import { User } from "../users/user.model";
import { WarStatus } from "./war.interface";
import { generateWarId, isWarExpired } from "./war.utils";
import httpStatus from "http-status";

class AppError extends Error {
  statusCode: number;
  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * Creates a new War (Admin only)
 * - Validates question paper exists
 * - Generates unique collision-resistant War ID
 * - Uses retry mechanism for ID collision (extremely rare)
 */
const createWar = async (
  creatorId: string,
  questionPaperId: string,
  maxPlayers: number,
  scheduledStartTime: Date,
) => {
  // Validate question paper exists
  const questionPaper = await QuestionPaper.findById(questionPaperId);
  if (!questionPaper) {
    throw new AppError(httpStatus.NOT_FOUND, "Question paper not found");
  }

  // Generate unique War ID with retry mechanism
  let warId: string;
  let attempts = 0;
  const maxAttempts = 5;

  while (attempts < maxAttempts) {
    warId = generateWarId();
    const existing = await War.findOne({ warId });
    if (!existing) break;
    attempts++;
  }

  if (attempts === maxAttempts) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Failed to generate unique War ID. Please try again.",
    );
  }

  const war = await War.create({
    warId: warId!,
    questionPaperId: new Types.ObjectId(questionPaperId),
    creatorId: new Types.ObjectId(creatorId),
    status: WarStatus.WAITING,
    maxPlayers,
    scheduledStartTime: new Date(scheduledStartTime),
    participants: [],
  });

  return war;
};

/**
 * Join a War with race condition prevention
 * - Uses findOneAndUpdate with atomic operations
 * - Validates war state and capacity
 * - Prevents duplicate joins
 */
const joinWar = async (userId: string, warId: string) => {
  const userObjectId = new Types.ObjectId(userId);

  // Atomic operation to prevent race conditions
  // This ensures only one user can claim the last slot
  const war = await War.findOneAndUpdate(
    {
      warId,
      status: WarStatus.WAITING,
      "participants.userId": { $ne: userObjectId }, // User not already joined
      $expr: { $lt: [{ $size: "$participants" }, "$maxPlayers"] }, // Not full
    },
    {
      $push: {
        participants: {
          userId: userObjectId,
          joinedAt: new Date(),
        },
      },
    },
    {
      new: true,
      runValidators: true,
    },
  ).populate("participants.userId", "name image");

  if (!war) {
    // Fetch war to provide specific error message
    const existingWar = await War.findOne({ warId });

    if (!existingWar) {
      throw new AppError(httpStatus.NOT_FOUND, "War not found");
    }

    if (existingWar.status !== WarStatus.WAITING) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        `War has already ${existingWar.status.toLowerCase()}`,
      );
    }

    if (isWarExpired(existingWar.scheduledStartTime)) {
      throw new AppError(httpStatus.BAD_REQUEST, "War has expired");
    }

    if (existingWar.participants.length >= existingWar.maxPlayers) {
      throw new AppError(httpStatus.BAD_REQUEST, "War is full");
    }

    // Check if user already joined
    const alreadyJoined = existingWar.participants.some(
      (p) => p.userId.toString() === userId,
    );
    if (alreadyJoined) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "You have already joined this war",
      );
    }

    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Failed to join war. Please try again.",
    );
  }

  return war;
};

/**
 * Start a War (Admin only)
 * - Validates creator authorization
 * - Enforces state machine transitions
 * - Uses optimistic locking to prevent concurrent starts
 */
const startWar = async (creatorId: string, warId: string) => {
  const war = await War.findOne({ warId });

  if (!war) {
    throw new AppError(httpStatus.NOT_FOUND, "War not found");
  }

  // Authorization: Only creator can start
  if (war.creatorId.toString() !== creatorId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Only the war creator can start the war",
    );
  }

  // State machine validation
  if (war.status !== WarStatus.WAITING) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Cannot start war. Current status: ${war.status}`,
    );
  }

  // Business rule: At least 2 participants required
  if (war.participants.length < 2) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "At least 2 participants required to start the war",
    );
  }

  // Optimistic locking: Update only if version matches
  const currentVersion = war.version;
  const updatedWar = await War.findOneAndUpdate(
    {
      warId,
      version: currentVersion,
      status: WarStatus.WAITING,
    },
    {
      status: WarStatus.STARTED,
      actualStartTime: new Date(),
      $inc: { version: 1 },
    },
    {
      new: true,
    },
  ).populate("participants.userId", "name image");

  if (!updatedWar) {
    throw new AppError(
      httpStatus.CONFLICT,
      "War state changed. Please refresh and try again.",
    );
  }

  return updatedWar;
};

/**
 * Get War details with real-time participant list
 */
const getWarDetails = async (warId: string) => {
  try {
    const war = await War.findOne({ warId })
      .populate("questionPaperId", "examName")
      .populate("participants.userId", "name image")
      .populate("creatorId", "name");

    if (!war) {
      throw new AppError(404, "War not found");
    }

    return war;
  } catch (error: any) {
    if (error instanceof AppError) throw error;
    throw new AppError(500, `Error fetching war details: ${error.message}`);
  }
};

/**
 * Get all wars created by admin
 */
const getMyCreatedWars = async (creatorId: string) => {
  const wars = await War.find({ creatorId: new Types.ObjectId(creatorId) })
    .sort({ createdAt: -1 })
    .populate("questionPaperId", "examName")
    .populate("participants.userId", "name image");

  return wars;
};

/**
 * Get all wars user has joined
 */
const getMyJoinedWars = async (userId: string) => {
  const wars = await War.find({
    "participants.userId": new Types.ObjectId(userId),
  })
    .sort({ createdAt: -1 })
    .populate("questionPaperId", "examName")
    .populate("creatorId", "name")
    .populate("participants.userId", "name image");

  return wars;
};

/**
 * Cancel a War (Admin only)
 * - Only creator can cancel
 * - Can only cancel WAITING wars
 */
const cancelWar = async (creatorId: string, warId: string) => {
  const war = await War.findOne({ warId });

  if (!war) {
    throw new AppError(httpStatus.NOT_FOUND, "War not found");
  }

  if (war.creatorId.toString() !== creatorId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Only the war creator can cancel the war",
    );
  }

  if (war.status !== WarStatus.WAITING) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Cannot cancel war. Current status: ${war.status}`,
    );
  }

  // Authorization: Only creator can cancel
  if (war.creatorId.toString() !== creatorId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Only the war creator can cancel this war",
    );
  }

  const updatedWar = await War.findOneAndUpdate(
    { warId },
    {
      $set: {
        status: WarStatus.CANCELLED,
        participants: [],
      },
      $inc: { version: 1 },
    },
    { new: true },
  );

  return updatedWar;
};

/**
 * Remove a participant from a War (Admin only)
 * - Only creator can remove participants
 * - Can only remove from WAITING wars
 */
const removeParticipant = async (
  creatorId: string,
  warId: string,
  userIdToRemove: string,
) => {
  const war = await War.findOne({ warId });

  if (!war) {
    throw new AppError(httpStatus.NOT_FOUND, "War not found");
  }

  // Authorization: Only creator can remove
  if (war.creatorId.toString() !== creatorId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Only the war creator can remove participants",
    );
  }

  // State validation
  if (war.status !== WarStatus.WAITING) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Cannot remove participant. Current status: ${war.status}`,
    );
  }

  const updatedWar = await War.findOneAndUpdate(
    { warId },
    {
      $pull: {
        participants: { userId: new Types.ObjectId(userIdToRemove) },
      },
      $inc: { version: 1 },
    },
    { new: true },
  ).populate("participants.userId", "name image");

  return updatedWar;
};

/**
 * Leave a war (User action)
 * - User can leave if they are a participant
 * - Creator cannot leave (they must cancel/delete the war)
 * - Can only leave WAITING wars
 */
const leaveWar = async (userId: string, warId: string) => {
  const war = await War.findOne({ warId });

  if (!war) {
    throw new AppError(httpStatus.NOT_FOUND, "War not found");
  }

  // Creator cannot leave via this method
  if (war.creatorId.toString() === userId) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Creator cannot leave the war. Use Cancel War instead.",
    );
  }

  // check if user is in participant list
  const isParticipant = war.participants.some(
    (p) => p.userId.toString() === userId,
  );
  if (!isParticipant) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "You are not a participant in this war",
    );
  }

  // State validation
  if (war.status !== WarStatus.WAITING) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Cannot leave war. Current status: ${war.status}`,
    );
  }

  const updatedWar = await War.findOneAndUpdate(
    { warId },
    {
      $pull: {
        participants: { userId: new Types.ObjectId(userId) },
      },
      $inc: { version: 1 },
    },
    { new: true },
  ).populate("participants.userId", "name image");

  return updatedWar;
};

export const warServices = {
  createWar,
  joinWar,
  startWar,
  getWarDetails,
  getMyCreatedWars,
  getMyJoinedWars,
  cancelWar,
  removeParticipant,
  leaveWar,
};
