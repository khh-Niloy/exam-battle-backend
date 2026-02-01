import { Schema, model } from "mongoose";
import { IBattle, IBattleParticipant } from "./battle.interface";
export { IBattle, IBattleParticipant };

const battleParticipantSchema = new Schema<IBattleParticipant>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    score: { type: Number, required: true },
    accuracy: { type: Number, required: true },
    result: {
      type: String,
      enum: ["win", "loss", "draw"],
      required: true,
    },
  },
  { _id: false },
);

const battleSchema = new Schema<IBattle>(
  {
    battleRoomId: { type: String, required: true },
    questionPaperId: {
      type: Schema.Types.ObjectId,
      ref: "QuestionPaper",
      required: true,
    },
    participants: [battleParticipantSchema],
    winner: { type: Schema.Types.ObjectId, ref: "User", default: null },
    isDraw: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false },
);

export const Battle = model<IBattle>("Battle", battleSchema);
