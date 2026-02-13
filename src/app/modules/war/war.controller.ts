import { Request, Response } from "express";
import { warServices } from "./war.service";
import catchAsync from "../../utils/catchAsync";
import { responseManager } from "../../utils/responseManager";
import httpStatus from "http-status";

const createWar = catchAsync(async (req: Request, res: Response) => {
  const creatorId = req.user.userId;
  const { questionPaperId, maxPlayers, scheduledStartTime } = req.body;

  const result = await warServices.createWar(
    creatorId,
    questionPaperId,
    maxPlayers,
    new Date(scheduledStartTime),
  );

  responseManager.success(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "War created successfully",
    data: result,
  });
});

const joinWar = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.userId;
  const { warId } = req.body;

  const result = await warServices.joinWar(userId, warId);

  responseManager.success(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Successfully joined the war",
    data: result,
  });
});

const startWar = catchAsync(async (req: Request, res: Response) => {
  const creatorId = req.user.userId;
  const { warId } = req.params;

  const result = await warServices.startWar(creatorId, warId as string);

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
  const creatorId = req.user.userId;

  const result = await warServices.getMyCreatedWars(creatorId);

  responseManager.success(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Created wars retrieved successfully",
    data: result,
  });
});

const getMyJoinedWars = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.userId;

  const result = await warServices.getMyJoinedWars(userId);

  responseManager.success(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Joined wars retrieved successfully",
    data: result,
  });
});

const cancelWar = catchAsync(async (req: Request, res: Response) => {
  const creatorId = req.user.userId;
  const { warId } = req.params;

  const result = await warServices.cancelWar(creatorId, warId as string);

  responseManager.success(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "War cancelled successfully",
    data: result,
  });
});

const removeParticipant = catchAsync(async (req: Request, res: Response) => {
  const creatorId = req.user.userId;
  const { warId, userId } = req.params;

  const result = await warServices.removeParticipant(
    creatorId,
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

export const warController = {
  createWar,
  joinWar,
  startWar,
  getWarDetails,
  getMyCreatedWars,
  getMyJoinedWars,
  cancelWar,
  removeParticipant,
};
