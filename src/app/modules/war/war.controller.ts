import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import { responseManager } from "../../utils/responseManager";
import { warServices } from "./war.service";

const createWar = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { questionPaperId, maxPlayers, scheduledStartTime } = req.body;
  const result = await warServices.createWar(
    user.userId,
    questionPaperId,
    maxPlayers,
    scheduledStartTime,
  );

  responseManager.success(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "War created successfully",
    data: result,
  });
});

const joinWar = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { warId } = req.body;
  const result = await warServices.joinWar(user.userId, warId);

  responseManager.success(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Joined war successfully",
    data: result,
  });
});

const startWar = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { warId } = req.params;
  const result = await warServices.startWar(user.userId, warId as string);

  responseManager.success(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "War started successfully",
    data: result,
  });
});

const getWarDetails = catchAsync(async (req: Request, res: Response) => {
  const { warId } = req.params;
  const result = await warServices.getWarDetails(warId as string);

  responseManager.success(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "War details retrieved successfully",
    data: result,
  });
});

const getMyCreatedWars = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const result = await warServices.getMyCreatedWars(user.userId);

  responseManager.success(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "My created wars retrieved successfully",
    data: result,
  });
});

const getMyJoinedWars = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const result = await warServices.getMyJoinedWars(user.userId);

  responseManager.success(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "My joined wars retrieved successfully",
    data: result,
  });
});

const cancelWar = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { warId } = req.params;
  const result = await warServices.cancelWar(user.userId, warId as string);

  responseManager.success(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "War cancelled successfully",
    data: result,
  });
});

const removeParticipant = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { warId, userId } = req.params;
  const result = await warServices.removeParticipant(
    user.userId,
    warId as string,
    userId as string,
  );

  responseManager.success(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Participant removed successfully",
    data: result,
  });
});

const leaveWar = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { warId } = req.params;
  const result = await warServices.leaveWar(user.userId, warId as string);

  responseManager.success(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Left war successfully",
    data: result,
  });
});

export const warController = {
  createWar,
  joinWar,
  startWar,
  getWarDetails,
  getMyCreatedWars,
  getMyJoinedWars,
  cancelWar,
  removeParticipant,
  leaveWar,
};
