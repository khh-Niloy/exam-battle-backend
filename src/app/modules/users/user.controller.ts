import { NextFunction, Request, Response } from "express";
import { userServices } from "./user.service";
import { responseManager } from "../../utils/responseManager";
import { JwtPayload } from "jsonwebtoken";
import { cookiesManagement } from "../../utils/cookiesManagement";
import { Roles } from "./user.interface";

const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userData = { ...req.body };

    const newCreatedUser = await userServices.createUserService(userData);
    cookiesManagement.setCookie(
      res,
      newCreatedUser.accessToken,
      newCreatedUser.refreshToken,
    );

    responseManager.success(res, {
      statusCode: 201,
      success: true,
      message: "User created successfully",
      data: newCreatedUser,
    });
  } catch (err) {
    console.log(err);
    responseManager.error(res, err as Error, 500);
  }
};

const getProfile = async (req: Request, res: Response) => {
  try {
    const userInfo = req.user;
    const profile = await userServices.getProfileService(
      userInfo as JwtPayload,
    );

    responseManager.success(res, {
      statusCode: 200,
      success: true,
      message: "my info",
      data: profile,
    });
  } catch (error) {
    console.log(error);
    responseManager.error(res, error as Error, 500);
  }
};

const getFriends = async (req: Request, res: Response) => {
  try {
    const userId = req.user.userId;
    const friends = await userServices.getFriendsService(userId);

    responseManager.success(res, {
      statusCode: 200,
      success: true,
      message: "Friends fetched successfully",
      data: friends,
    });
  } catch (error) {
    console.log(error);
    responseManager.error(res, error as Error, 500);
  }
};

const searchUser = async (req: Request, res: Response) => {
  try {
    const { code } = req.params;
    console.log("code", code);
    const result = await userServices.searchUserByCodeService(code as string);
    responseManager.success(res, {
      statusCode: 200,
      success: true,
      message: "User fetched successfully",
      data: result,
    });
  } catch (error) {
    responseManager.error(res, error as Error, 500);
  }
};

const sendFriendRequest = async (req: Request, res: Response) => {
  try {
    const senderId = req.user.userId;
    const { receiverCode } = req.body;
    const result = await userServices.sendFriendRequestService(
      senderId,
      receiverCode,
    );
    responseManager.success(res, {
      statusCode: 200,
      success: true,
      message: result.message,
      data: null,
    });
  } catch (error) {
    responseManager.error(res, error as Error, 400);
  }
};

const getPendingRequests = async (req: Request, res: Response) => {
  try {
    const userId = req.user.userId;
    const result = await userServices.getPendingRequestsService(userId);
    responseManager.success(res, {
      statusCode: 200,
      success: true,
      message: "Pending requests fetched successfully",
      data: result,
    });
  } catch (error) {
    responseManager.error(res, error as Error, 500);
  }
};

const acceptFriendRequest = async (req: Request, res: Response) => {
  try {
    const userId = req.user.userId;
    const { senderId } = req.body;
    const result = await userServices.acceptFriendRequestService(
      userId,
      senderId,
    );
    responseManager.success(res, {
      statusCode: 200,
      success: true,
      message: result.message,
      data: null,
    });
  } catch (error) {
    responseManager.error(res, error as Error, 400);
  }
};

const rejectFriendRequest = async (req: Request, res: Response) => {
  try {
    const userId = req.user.userId;
    const { senderId } = req.body;
    const result = await userServices.rejectFriendRequestService(
      userId,
      senderId,
    );
    responseManager.success(res, {
      statusCode: 200,
      success: true,
      message: result.message,
      data: null,
    });
  } catch (error) {
    responseManager.error(res, error as Error, 400);
  }
};

const getAllUsers = async (req: Request, res: Response) => {
  try {
    const { role } = req.query;
    const result = await userServices.getAllUsersService(role as Roles);
    responseManager.success(res, {
      statusCode: 200,
      success: true,
      message: "Users fetched successfully",
      data: result,
    });
  } catch (error) {
    responseManager.error(res, error as Error, 500);
  }
};

const toggleUserBlockStatus = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const result = await userServices.toggleUserBlockStatusService(
      userId as string,
    );
    responseManager.success(res, {
      statusCode: 200,
      success: true,
      message: "User status updated successfully",
      data: result,
    });
  } catch (error) {
    responseManager.error(res, error as Error, 500);
  }
};

export const userController = {
  createUser,
  getProfile,
  getFriends,
  searchUser,
  sendFriendRequest,
  getPendingRequests,
  acceptFriendRequest,
  rejectFriendRequest,
  getAllUsers,
  toggleUserBlockStatus,
};
