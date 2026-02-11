import { Router } from "express";
import { userController } from "./user.controller";
import { Roles } from "./user.interface";
import { roleBasedProtection } from "../../middleware/roleBasedProtection";
import { validateSchema } from "../../middleware/zodValidate";
import { userCreateZodSchema } from "./user.validation";

export const userRoutes = Router();

userRoutes.post(
  "/register",
  validateSchema(userCreateZodSchema),
  userController.createUser,
);

userRoutes.get(
  "/profile",
  roleBasedProtection(...Object.values(Roles)),
  userController.getProfile,
);
userRoutes.get(
  "/friends",
  roleBasedProtection(...Object.values(Roles)),
  userController.getFriends,
);
userRoutes.get(
  "/search/:code",
  roleBasedProtection(...Object.values(Roles)),
  userController.searchUser,
);
userRoutes.post(
  "/friend-request/send",
  roleBasedProtection(...Object.values(Roles)),
  userController.sendFriendRequest,
);
userRoutes.get(
  "/friend-request/pending",
  roleBasedProtection(...Object.values(Roles)),
  userController.getPendingRequests,
);
userRoutes.post(
  "/friend-request/accept",
  roleBasedProtection(...Object.values(Roles)),
  userController.acceptFriendRequest,
);
userRoutes.post(
  "/friend-request/reject",
  roleBasedProtection(...Object.values(Roles)),
  userController.rejectFriendRequest,
);
