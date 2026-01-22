import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
import { envVars } from "../config/env";
import { User } from "../modules/users/user.model";

const generateToken = (
  jwtPayload: JwtPayload,
  jwtSecret: string,
  jwtExpiresIn: string
) => {
  const accessToken = jwt.sign(jwtPayload, jwtSecret, {
    expiresIn: jwtExpiresIn,
  } as SignOptions);
  return accessToken;
};

const verifyToken = (accessTokenPayLoad: string, jwtSecret: string) => {
  const accessToken = jwt.verify(accessTokenPayLoad, jwtSecret);
  return accessToken;
};

export const createAccessAndRefreshToken = (jwtPayload: JwtPayload) => {
  const accessToken = generateToken(
    jwtPayload,
    envVars.JWT_ACCESS_SECRET,
    envVars.JWT_ACCESS_EXPIRES
  );

  const refreshToken = generateToken(
    jwtPayload,
    envVars.JWT_REFRESH_SECRET,
    envVars.JWT_REFRESH_EXPIRES
  );

  return { accessToken, refreshToken };
};

export const getNewAccessTokenFromRefreshToken = async (
  refreshToken: string
) => {
  const userInfoFromRefreshToken = verifyToken(
    refreshToken,
    envVars.JWT_REFRESH_SECRET
  );

  if (!userInfoFromRefreshToken) {
    throw new Error("Your session has expired. Please log in again.");
  }

  const user = await User.findById((userInfoFromRefreshToken as JwtPayload).userId);

  if (!user) {
    throw new Error("User account not found. Please contact support.");
  }

  const jwtPayload = {
    userId: user._id,
    email: user.email,
    role: user.role,
  };

  const accessToken = generateToken(
    jwtPayload,
    envVars.JWT_ACCESS_SECRET,
    envVars.JWT_ACCESS_EXPIRES
  );

  return {
    newAccessToken: accessToken,
    user: user,
  };
};

export const jwtManagement = {
  generateToken,
  verifyToken,
  createAccessAndRefreshToken,
  getNewAccessTokenFromRefreshToken,
};
