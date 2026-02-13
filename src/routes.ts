import { Router } from "express";
import { userRoutes } from "./app/modules/users/user.route";
import { authRoutes } from "./app/modules/auth/auth.routes";
import { questionPaperRoutes } from "./app/modules/questionPaper/questionPaper.route";
import { BattleRoutes } from "./app/modules/battle/battle.route";
import { WarRoutes } from "./app/modules/war/war.route";

export const routes = Router();

const allRoutes = [
  {
    path: "/user",
    route: userRoutes,
  },
  {
    path: "/auth",
    route: authRoutes,
  },
  {
    path: "/question-paper",
    route: questionPaperRoutes,
  },
  {
    path: "/battles",
    route: BattleRoutes,
  },
  {
    path: "/wars",
    route: WarRoutes,
  },
];

allRoutes.forEach(({ path, route }) => routes.use(path, route));
