import { Types } from "mongoose";

export interface IBattle {
  player1Id: Types.ObjectId;
  player2Id: Types.ObjectId;
  questionPaperId: Types.ObjectId;
  winnerId: Types.ObjectId;
}
