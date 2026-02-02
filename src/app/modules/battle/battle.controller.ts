import { Request, Response } from "express";
import { battleServices } from "./battle.service";
import catchAsync from "../../utils/catchAsync";
import { responseManager } from "../../utils/responseManager";
import httpStatus from "http-status";

const getMyHistory = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.userId;
  const result = await battleServices.getBattleHistory(userId);

  responseManager.success(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Battle history retrieved successfully",
    data: result,
  });
});

const saveBattleResult = catchAsync(async (req: Request, res: Response) => {
  const { battleRoomId, questionPaperId, participants } = req.body;
  const result = await battleServices.createBattleResult(
    battleRoomId,
    questionPaperId,
    participants,
  );

  responseManager.success(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Battle result saved successfully",
    data: result,
  });
});

export const battleController = {
  getMyHistory,
  saveBattleResult,
};
