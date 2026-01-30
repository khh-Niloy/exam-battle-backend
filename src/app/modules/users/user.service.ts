import { JwtPayload } from "jsonwebtoken";
import { envVars } from "../../config/env";
import { IUser, Roles } from "./user.interface";
import { User } from "./user.model";
import bcryptjs from "bcryptjs";
import { jwtManagement } from "../../utils/jwtManagement";

const createUserService = async (playLoad: Partial<IUser>) => {
  const { email, password, ...rest } = playLoad;

  const userEmail = email?.toLowerCase().trim();

  const isUserExist = await User.findOne({ email: userEmail });
  if (isUserExist) {
    throw new Error("User already exist");
  }

  const hashedPassword = await bcryptjs.hash(
    password as string,
    Number(envVars.BCRYPT_SALT_ROUND),
  );

  const userData = {
    email: userEmail,
    password: hashedPassword,
    ...rest,
  };

  const newCreatedUser = await User.create(userData);
  const userWithoutPassword = await User.findById(newCreatedUser._id);

  const jwtPayload = {
    userId: newCreatedUser._id,
    email: newCreatedUser.email,
    role: newCreatedUser.role,
  };

  const { accessToken, refreshToken } =
    jwtManagement.createAccessAndRefreshToken(jwtPayload);

  return { accessToken, refreshToken, user: userWithoutPassword };
};

const getProfileService = async (userInfo: JwtPayload) => {
  const profile = await User.findById(userInfo.userId);
  return profile;
};

const getOtherUsersService = async (userInfo: JwtPayload) => {
  const users = await User.find({ _id: { $ne: userInfo.userId } }).select(
    "name email image studentInfo",
  );
  return users;
};

export const userServices = {
  createUserService,
  getProfileService,
  getOtherUsersService,
};
