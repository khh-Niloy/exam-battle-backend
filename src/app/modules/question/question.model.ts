import { model, Schema } from "mongoose";
import { IQuestion } from "./question.interface";

const questionSchema = new Schema<IQuestion>(
  {
    question: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    options: {
      type: [String],
      required: true,
    },
    correctIndex: {
      type: Number,
      required: true,
      min: 0,
    },
    questionPaperId: {
      type: Schema.Types.ObjectId,
      ref: "QuestionPaper",
      required: true,
    },
  },
  { timestamps: true, versionKey: false },
);

questionSchema.index({ questionPaperId: 1 });

export const Question = model<IQuestion>("Question", questionSchema);
