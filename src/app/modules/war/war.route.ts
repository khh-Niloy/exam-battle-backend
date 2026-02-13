import express from "express";
import { warController } from "./war.controller";
import { roleBasedProtection } from "../../middleware/roleBasedProtection";
import { Roles } from "../users/user.interface";
import { validateRequest } from "../../middleware/validateRequest";
import {
  createWarSchema,
  joinWarSchema,
  startWarSchema,
  getWarDetailsSchema,
} from "./war.validation";

const router = express.Router();

/**
 * POST /api/wars
 * Create a new war (Admin only)
 */
router.post(
  "/",
  roleBasedProtection(Roles.ADMIN, Roles.SUPER_ADMIN),
  validateRequest(createWarSchema),
  warController.createWar,
);

/**
 * POST /api/wars/join
 * Join an existing war (All authenticated users)
 */
router.post(
  "/join",
  roleBasedProtection(
    Roles.FREE,
    Roles.PREMIUM,
    Roles.ADMIN,
    Roles.SUPER_ADMIN,
  ),
  validateRequest(joinWarSchema),
  warController.joinWar,
);

/**
 * PATCH /api/wars/:warId/start
 * Start a war (Admin creator only - enforced in service)
 */
router.patch(
  "/:warId/start",
  roleBasedProtection(Roles.ADMIN, Roles.SUPER_ADMIN),
  validateRequest(startWarSchema),
  warController.startWar,
);

/**
 * PATCH /api/wars/:warId/cancel
 * Cancel a war (Admin creator only - enforced in service)
 */
router.patch(
  "/:warId/cancel",
  roleBasedProtection(Roles.ADMIN, Roles.SUPER_ADMIN),
  warController.cancelWar,
);

/**
 * DELETE /api/wars/:warId/participants/:userId
 * Remove a participant from a war (Admin creator only - enforced in service)
 */
router.delete(
  "/:warId/participants/:userId",
  roleBasedProtection(Roles.ADMIN, Roles.SUPER_ADMIN),
  warController.removeParticipant,
);

/**
 * GET /api/wars/:warId
 * Get war details (All authenticated users)
 */
router.get(
  "/:warId",
  roleBasedProtection(
    Roles.FREE,
    Roles.PREMIUM,
    Roles.ADMIN,
    Roles.SUPER_ADMIN,
  ),
  validateRequest(getWarDetailsSchema),
  warController.getWarDetails,
);

/**
 * GET /api/wars/my/created
 * Get wars created by current admin
 */
router.get(
  "/my/created",
  roleBasedProtection(Roles.ADMIN, Roles.SUPER_ADMIN),
  warController.getMyCreatedWars,
);

/**
 * GET /api/wars/my/joined
 * Get wars joined by current user
 */
router.get(
  "/my/joined",
  roleBasedProtection(
    Roles.FREE,
    Roles.PREMIUM,
    Roles.ADMIN,
    Roles.SUPER_ADMIN,
  ),
  warController.getMyJoinedWars,
);

export const WarRoutes = router;
