import { Request, Response } from "express";
import { responseManager } from "../../utils/responseManager";
import { logger } from "../../utils/logger";
import { questionPaperService } from "./questionPaper.service";

const getAllQuestionPapers = async (req: Request, res: Response) => {
  try {
    const result = await questionPaperService.getAllQuestionPapers();
    responseManager.success(res, {
      statusCode: 200,
      success: true,
      message: "Question papers fetched successfully",
      data: result,
    });
  } catch (error: any) {
    logger.error(error);
    responseManager.error(res, error as Error, 400);
  }
};

const getSingleQuestionPaper = async (req: Request, res: Response) => {
  try {
    console.log(req.params.id);
    const result = await questionPaperService.getSingleQuestionPaper(
      req.params.id as string,
    );
    responseManager.success(res, {
      statusCode: 200,
      success: true,
      message: "Question paper fetched successfully",
      data: result,
    });
  } catch (error: any) {
    logger.error(error);
    responseManager.error(res, error as Error, 400);
  }
};

const getMyQuestionPapers = async (req: Request, res: Response) => {
  try {
    const creatorId = req.user.userId;
    const result = await questionPaperService.getMyQuestionPapers(creatorId);
    responseManager.success(res, {
      statusCode: 200,
      success: true,
      message: "My question papers fetched successfully",
      data: result,
    });
  } catch (error: any) {
    logger.error(error);
    responseManager.error(res, error as Error, 400);
  }
};

const createQuestionPaper = async (req: Request, res: Response) => {
  try {
    const creatorId = req.user.userId;
    const result = await questionPaperService.createQuestionPaper({
      ...req.body,
      creatorId,
    });
    responseManager.success(res, {
      statusCode: 201,
      success: true,
      message: "Question paper created successfully",
      data: result,
    });
  } catch (error: any) {
    logger.error(error);
    responseManager.error(res, error as Error, 400);
  }
};

export const questionPaperController = {
  getAllQuestionPapers,
  getSingleQuestionPaper,
  getMyQuestionPapers,
  createQuestionPaper,
};
