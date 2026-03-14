import { Schema, model } from "mongoose";
import { IWar, IWarParticipant, WarStatus } from "./war.interface";
import "../users/user.model";
import "../questionPaper/questionPaper.model";

const warParticipantSchema = new Schema<IWarParticipant>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    joinedAt: { type: Date, default: Date.now },
    score: { type: Number },
    accuracy: { type: Number },
    rank: { type: Number },
  },
  { _id: false },
);

const warSchema = new Schema<IWar>(
  {
    warId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    questionPaperId: {
      type: Schema.Types.ObjectId,
      ref: "QuestionPaper",
      required: true,
      index: true,
    },
    creatorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(WarStatus),
      default: WarStatus.WAITING,
      required: true,
      index: true,
    },
    maxPlayers: {
      type: Number,
      required: true,
      min: 2,
      max: 100,
    },
    scheduledStartTime: {
      type: Date,
      required: true,
      index: true,
    },
    actualStartTime: {
      type: Date,
    },
    participants: [warParticipantSchema],
    version: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    versionKey: "version",
    optimisticConcurrency: true,
  },
);

// Compound indexes for efficient queries
warSchema.index({ status: 1, scheduledStartTime: 1 });
warSchema.index({ creatorId: 1, status: 1 });
warSchema.index({ "participants.userId": 1 });

export const War = model<IWar>("War", warSchema);
