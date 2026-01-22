import { model, Schema } from "mongoose";
import { IUser, Roles, StudentGroup } from "./user.interface";

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      required: true,
      enum: Object.values(Roles),
      index: true,
    },
    phone: {
      type: String,
      match: [
        /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/,
        "Please provide a valid phone number",
      ],
      trim: true,
    },
    studentInfo: {
      instituteName: {
        type: String,
        required: false,
      },
      group: {
        type: String,
        enum: Object.values(StudentGroup),
        required: false,
      },
      class: {
        type: String,
        required: false,
      },
    },
  },
  { timestamps: true, versionKey: false },
);

export const User = model<IUser>("User", userSchema);
