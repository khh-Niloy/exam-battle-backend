import { Router } from "express";
import { questionPaperController } from "./questionPaper.controller";
import { roleBasedProtection } from "../../middleware/roleBasedProtection";
import { Roles } from "../users/user.interface";

const router = Router();

router.get("/", questionPaperController.getAllQuestionPapers);
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
router.get("/:id", questionPaperController.getSingleQuestionPaper);

export const questionPaperRoutes = router;
