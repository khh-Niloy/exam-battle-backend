import mongoose from "mongoose";
import { Question } from "../question/question.model";
import { QuestionPaper } from "./questionPaper.model";

const getAllQuestionPapers = async () => {
  return await QuestionPaper.find().populate("questionIds");
};

const getSingleQuestionPaper = async (id: string) => {
  console.log(">>>> SERVICE: getSingleQuestionPaper called with id:", id);

  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    console.log(">>>> SERVICE: Invalid ID received:", id);
    return [];
  }

  const res = await Question.find({ questionPaperId: id });
  console.log(">>>> SERVICE: Found questions:", res.length);
  return res;
};

const getMyQuestionPapers = async (creatorId: string) => {
  return await QuestionPaper.find({ creatorId }).populate("questionIds");
};

const createQuestionPaper = async (payload: {
  examName: string;
  creatorId: string;
  questions: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation?: string;
  }[];
}) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const questionPaper = await QuestionPaper.create(
      [
        {
          examName: payload.examName,
          creatorId: payload.creatorId,
          questionIds: [],
        },
      ],
      { session },
    );

    const questionsPayload = payload.questions.map((q) => ({
      ...q,
      questionPaperId: questionPaper[0]._id,
    }));

    const questions = await Question.create(questionsPayload, { session });

    const questionIds = questions.map((q) => q._id);
    await QuestionPaper.findByIdAndUpdate(
      questionPaper[0]._id,
      { questionIds },
      { session },
    );

    await session.commitTransaction();
    session.endSession();

    return questionPaper[0];
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

export const questionPaperService = {
  getAllQuestionPapers,
  getSingleQuestionPaper,
  getMyQuestionPapers,
  createQuestionPaper,
};
