import { model, Schema } from "mongoose";
import { IQuestionPaper } from "./questionPaper.interface";

const questionPaperSchema = new Schema<IQuestionPaper>(
  {
    questionIds: {
      type: [Schema.Types.ObjectId],
      ref: "Question",
      required: true,
    },
    examName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
  },
  { timestamps: true, versionKey: false },
);

questionPaperSchema.index({ examName: 1 });

export const QuestionPaper = model<IQuestionPaper>(
  "QuestionPaper",
  questionPaperSchema,
);
