import { Router } from "express";
import { userRoutes } from "./app/modules/users/user.route";

export const routes = Router();

const allRoutes = [
  {
    path: "/user",
    route: userRoutes,
  },
];

allRoutes.forEach(({ path, route }) => routes.use(path, route));
