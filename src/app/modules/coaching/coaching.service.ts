import httpStatus from "http-status";
import AppError from "../../errors/AppError";
import { ICoaching } from "./coaching.interface";
import { Coaching } from "./coaching.model";
import { Types } from "mongoose";
import { User } from "../users/user.model";
import { War } from "../war/war.model";

const createCoaching = async (
  ownerId: string,
  payload: Partial<ICoaching>,
): Promise<ICoaching> => {
  // Check if user already has a coaching
  const existingCoaching = await Coaching.findOne({ ownerId });
  if (existingCoaching) {
    throw new AppError(httpStatus.BAD_REQUEST, "User already has a coaching");
  }

  // Generate a unique join code
  let joinCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  let isUnique = false;
  while (!isUnique) {
    const existing = await Coaching.findOne({ joinCode });
    if (!existing) {
      isUnique = true;
    } else {
      joinCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    }
  }

  const coaching = await Coaching.create({
    ...payload,
    ownerId,
    joinCode,
    students: [],
    invitations: [],
  });

  return coaching;
};

const joinCoaching = async (
  userId: string,
  joinCode: string,
): Promise<ICoaching> => {
  const coaching = await Coaching.findOne({ joinCode });
  if (!coaching) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Coaching not found with this code",
    );
  }

  // Check if already a student
  const isAlreadyStudent = coaching.students.some(
    (s) => s.studentId.toString() === userId,
  );
  if (isAlreadyStudent) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "You are already a student of this coaching",
    );
  }

  // Add student
  coaching.students.push({
    studentId: new Types.ObjectId(userId) as any,
    joinedAt: new Date(),
  });

  await coaching.save();
  return coaching;
};

const getMyCoaching = async (userId: string): Promise<ICoaching | null> => {
  // Try to find as owner
  let coaching = await Coaching.findOne({ ownerId: userId }).populate(
    "students.studentId",
  );

  if (!coaching) {
    // Try to find as student
    coaching = await Coaching.findOne({ "students.studentId": userId })
      .populate("ownerId")
      .populate("students.studentId");
  }

  return coaching;
};

const getCoachingById = async (id: string): Promise<ICoaching | null> => {
  return await Coaching.findById(id)
    .populate("ownerId")
    .populate("students.studentId");
};

const removeStudent = async (
  ownerId: string,
  studentId: string,
): Promise<ICoaching | null> => {
  const coaching = await Coaching.findOne({ ownerId });
  if (!coaching) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Coaching not found for this user",
    );
  }

  // Filter out the student
  coaching.students = coaching.students.filter(
    (s) => s.studentId.toString() !== studentId,
  );

  await coaching.save();
  return coaching;
};

const getAllCoachings = async () => {
  const coachings = await Coaching.find().populate("ownerId", "name email");

  // Enhance with counts
  const enhancedCoachings = await Promise.all(
    coachings.map(async (coaching) => {
      const warCount = await War.countDocuments({
        creatorId: coaching.ownerId,
      });
      return {
        ...coaching.toObject(),
        totalStudents: coaching.students.length,
        totalExams: warCount,
      };
    }),
  );

  return enhancedCoachings;
};

const deleteCoaching = async (id: string) => {
  const coaching = await Coaching.findByIdAndDelete(id);
  if (!coaching) {
    throw new AppError(httpStatus.NOT_FOUND, "Coaching not found");
  }
  return coaching;
};

export const CoachingService = {
  createCoaching,
  joinCoaching,
  getMyCoaching,
  getCoachingById,
  removeStudent,
  getAllCoachings,
  deleteCoaching,
};
