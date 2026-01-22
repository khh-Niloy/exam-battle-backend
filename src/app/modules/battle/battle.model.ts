import { model, Schema } from "mongoose";
import { IBattle } from "./battle.interface";

const battleSchema = new Schema<IBattle>(
  {
    player1Id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    player2Id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    questionPaperId: {
      type: Schema.Types.ObjectId,
      ref: "QuestionPaper",
      required: true,
    },
    winnerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
  },
  { timestamps: true, versionKey: false },
);

battleSchema.index({ player1Id: 1, player2Id: 1 });
battleSchema.index({ questionPaperId: 1 });
battleSchema.index({ winnerId: 1 });

export const Battle = model<IBattle>("Battle", battleSchema);
