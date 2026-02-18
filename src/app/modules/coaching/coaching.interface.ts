import { Types } from "mongoose";

export interface ICoachingStudent {
  studentId: Types.ObjectId;
  joinedAt: Date;
}

export interface ICoachingInvitation {
  email: string;
  status: "pending" | "accepted" | "rejected";
  invitedAt: Date;
}

export interface ICoaching {
  name: string;
  ownerId: Types.ObjectId;
  students: ICoachingStudent[];
  invitations: ICoachingInvitation[];
  description?: string;
  logo?: string;
  joinCode: string;
}
