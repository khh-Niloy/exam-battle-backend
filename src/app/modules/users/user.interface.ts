import { Types } from "mongoose";

export enum Roles {
  FREE = "FREE",
  PREMIUM = "PREMIUM",
  COACHING = "COACHING",
  SUPER_ADMIN = "SUPER_ADMIN",
}

export enum StudentGroup {
  SCIENCE = "SCIENCE",
  ARTS = "ARTS",
  COMMERCE = "COMMERCE",
}

export interface IUser {
  name: string;
  email: string;
  phone?: string;
  password: string;
  role: Roles;
  image?: string;
  uniqueNameCode: string;
  friends: Types.ObjectId[];
  friendRequests: Types.ObjectId[];
  studentInfo?: {
    instituteName: string;
    group: StudentGroup;
    class: string;
  };
  status: "active" | "blocked";
}
