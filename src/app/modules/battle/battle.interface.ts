import { Types } from "mongoose";

export interface IBattleParticipant {
  userId: Types.ObjectId;
  score: number;
  accuracy: number;
  result: "win" | "loss" | "draw";
}

export interface IBattle {
  battleRoomId: string;
  questionPaperId: Types.ObjectId;
  participants: IBattleParticipant[];
  winner: Types.ObjectId | null; // null for draw
  isDraw: boolean;
  createdAt: Date;
  updatedAt: Date;
}
