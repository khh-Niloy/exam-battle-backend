import { Router } from "express";
import { CoachingController } from "./coaching.controller";
import { CoachingValidation } from "./coaching.validation";
import { Roles } from "../users/user.interface";
import { roleBasedProtection } from "../../middleware/roleBasedProtection";
import { validateSchema } from "../../middleware/zodValidate";

export const coachingRoutes = Router();

coachingRoutes.post(
  "/create",
  roleBasedProtection(Roles.COACHING),
  validateSchema(CoachingValidation.createCoachingZodSchema),
  CoachingController.createCoaching,
);

coachingRoutes.post(
  "/join",
  roleBasedProtection(Roles.FREE, Roles.PREMIUM),
  validateSchema(CoachingValidation.joinCoachingZodSchema),
  CoachingController.joinCoaching,
);

coachingRoutes.get(
  "/my-coaching",
  roleBasedProtection(Roles.COACHING, Roles.FREE, Roles.PREMIUM),
  CoachingController.getMyCoaching,
);

coachingRoutes.delete(
  "/remove-student/:studentId",
  roleBasedProtection(Roles.COACHING),
  CoachingController.removeStudent,
);
