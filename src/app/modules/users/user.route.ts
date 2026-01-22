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
