import { Types } from "mongoose";

export enum WarStatus {
  WAITING = "WAITING",
  STARTED = "STARTED",
  FINISHED = "FINISHED",
  CANCELLED = "CANCELLED",
}

export interface IWarParticipant {
  userId: Types.ObjectId;
  joinedAt: Date;
  score?: number;
  accuracy?: number;
  rank?: number;
}

export interface IWar {
  warId: string; // Unique short ID for joining
  questionPaperId: Types.ObjectId;
  creatorId: Types.ObjectId; // Admin who created the war
  status: WarStatus;
  maxPlayers: number;
  scheduledStartTime: Date;
  actualStartTime?: Date;
  participants: IWarParticipant[];
  createdAt: Date;
  updatedAt: Date;
  version: number; // For optimistic locking
}

export interface ICreateWarInput {
  questionPaperId: string;
  maxPlayers: number;
  scheduledStartTime: Date;
}

export interface IJoinWarInput {
  warId: string;
}

export interface IStartWarInput {
  warId: string;
}
