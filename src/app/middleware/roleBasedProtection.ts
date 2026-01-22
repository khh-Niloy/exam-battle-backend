import { JwtPayload } from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import { envVars } from "../config/env";
import { jwtManagement } from "../utils/jwtManagement";
import { IisActive } from "../modules/users/user.interface";
import { User } from "../modules/users/user.model";
import AppError from "../errors/AppError";

export const roleBasedProtection =
  (...roles: string[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const accessToken = req.cookies.accessToken;

    if (!accessToken) {
      throw new AppError(401, "You are not authorized!");
    }

    let userInfoJWTAccessToken: JwtPayload;
    try {
      userInfoJWTAccessToken = jwtManagement.verifyToken(
        accessToken,
        envVars.JWT_ACCESS_SECRET
      ) as JwtPayload;
    } catch (error) {
      throw new AppError(401, "Invalid or expired token!");
    }

    const user = await User.findOne({ email: userInfoJWTAccessToken.email });

    if (!user) {
      throw new AppError(404, "User not found!");
    }

    if (user?.isActive === IisActive.INACTIVE) {
      throw new AppError(403, `user is ${user?.isActive}!`);
    }

    if (user?.isDeleted) {
      throw new AppError(403, "user is deleted!");
    }

    if (user?.isBlocked) {
      throw new AppError(403, "user is blocked!");
    }

    if (!roles.includes(userInfoJWTAccessToken.role)) {
      throw new AppError(403, "You are not permitted to view this route!!!");
    }

    req.user = userInfoJWTAccessToken;

    next();
  };
