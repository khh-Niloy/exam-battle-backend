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

export const BattleRoutes = router;
