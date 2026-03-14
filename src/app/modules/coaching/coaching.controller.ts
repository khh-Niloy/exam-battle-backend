import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import { responseManager } from "../../utils/responseManager";
import { CoachingService } from "./coaching.service";

const createCoaching = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const result = await CoachingService.createCoaching(user.userId, req.body);

  responseManager.success(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Coaching created successfully",
    data: result,
  });
});

const joinCoaching = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { joinCode } = req.body;
  const result = await CoachingService.joinCoaching(user.userId, joinCode);

  responseManager.success(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Joined coaching successfully",
    data: result,
  });
});

const getMyCoaching = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const result = await CoachingService.getMyCoaching(user.userId);

  responseManager.success(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Coaching retrieved successfully",
    data: result,
  });
});

const removeStudent = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { studentId } = req.params;
  const result = await CoachingService.removeStudent(
    user.userId,
    studentId as string,
  );

  responseManager.success(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Student removed successfully",
    data: result,
  });
});

const getAllCoachings = catchAsync(async (req: Request, res: Response) => {
  const result = await CoachingService.getAllCoachings();

  responseManager.success(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Coachings retrieved successfully",
    data: result,
  });
});

const deleteCoaching = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await CoachingService.deleteCoaching(id as string);

  responseManager.success(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Coaching deleted successfully",
    data: result,
  });
});

export const CoachingController = {
  createCoaching,
  joinCoaching,
  getMyCoaching,
  removeStudent,
  getAllCoachings,
  deleteCoaching,
};
