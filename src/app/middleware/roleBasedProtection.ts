import { JwtPayload } from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import { envVars } from "../config/env";
import { jwtManagement } from "../utils/jwtManagement";
import { User } from "../modules/users/user.model";

export const roleBasedProtection =
  (...roles: string[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const accessToken = req.cookies.accessToken;

    if (!accessToken) {
      throw new Error("You are not authorized!");
    }

    let userInfoJWTAccessToken: JwtPayload;
    try {
      userInfoJWTAccessToken = jwtManagement.verifyToken(
        accessToken,
        envVars.JWT_ACCESS_SECRET,
      ) as JwtPayload;
    } catch (error) {
      throw new Error("Invalid or expired token!");
    }

    const user = await User.findOne({ email: userInfoJWTAccessToken.email });

    if (!user) {
      throw new Error("User not found!");
    }

    if (!roles.includes(userInfoJWTAccessToken.role)) {
      throw new Error("You are not permitted to view this route!!!");
    }

    req.user = userInfoJWTAccessToken;

    next();
  };
