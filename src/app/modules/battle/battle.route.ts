import express from "express";
import { battleController } from "./battle.controller";
import { roleBasedProtection } from "../../middleware/roleBasedProtection";
import { Roles } from "../users/user.interface";

const router = express.Router();

router.get(
  "/history",
  roleBasedProtection(Roles.FREE, Roles.PREMIUM, Roles.ADMIN),
  battleController.getMyHistory,
);

// Route to save battle result manually if needed
router.post(
  "/",
  // roleBasedProtection(Roles.FREE, Roles.PREMIUM, Roles.ADMIN), // Optional: protect if needed, or allow public if secure enough
  battleController.saveBattleResult,
);

export const BattleRoutes = router;
