import { Types } from "mongoose";

export interface IQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  questionPaperId: Types.ObjectId;
  explanation?: string;
}
