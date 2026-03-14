import { Router } from "express";
import { questionPaperController } from "./questionPaper.controller";
import { roleBasedProtection } from "../../middleware/roleBasedProtection";
import { Roles } from "../users/user.interface";
import { cacheMiddleware } from "../../lib/cache";

const router = Router();

router.get(
  "/",
  cacheMiddleware(
    () => "questionPapers:all",
    60,
  ),
  questionPaperController.getAllQuestionPapers,
);
router.get(
  "/my-papers",
  roleBasedProtection(Roles.COACHING, Roles.SUPER_ADMIN),
  questionPaperController.getMyQuestionPapers,
);
router.post(
  "/create",
  roleBasedProtection(Roles.COACHING, Roles.SUPER_ADMIN),
  questionPaperController.createQuestionPaper,
);
router.get(
  "/:id",
  cacheMiddleware(
    (req) => `questionPaper:${req.params.id}`,
    60,
  ),
  questionPaperController.getSingleQuestionPaper,
);

export const questionPaperRoutes = router;
