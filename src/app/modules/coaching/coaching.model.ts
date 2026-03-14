import { model, Schema } from "mongoose";
import { ICoaching } from "./coaching.interface";

const coachingSchema = new Schema<ICoaching>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    students: [
      {
        studentId: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    invitations: [
      {
        email: {
          type: String,
          required: true,
        },
        status: {
          type: String,
          enum: ["pending", "accepted", "rejected"],
          default: "pending",
        },
        invitedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    description: {
      type: String,
    },
    logo: {
      type: String,
    },
    joinCode: {
      type: String,
      unique: true,
      required: true,
    },
  },
  { timestamps: true, versionKey: false },
);

export const Coaching = model<ICoaching>("Coaching", coachingSchema);
