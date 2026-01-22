import { Types } from "mongoose";

export interface IQuestionPaper {
  questionIds: Types.ObjectId[];
  examName: string;
}
