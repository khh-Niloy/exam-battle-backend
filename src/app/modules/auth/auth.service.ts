import bcryptjs from "bcryptjs";
import { IUser } from "../users/user.interface";
import { User } from "../users/user.model";
import { JwtPayload } from "jsonwebtoken";
import { jwtManagement } from "../../utils/jwtManagement";
import { envVars } from "../../config/env";

const userLoginService = async (playLoad: Partial<IUser>) => {
  const { email, password } = playLoad;

  const userEmail = email?.toLowerCase().trim();

  const user = await User.findOne({ email: userEmail }).select("+password");

  if (!user) {
    throw new Error("Please register first");
  }

  const checkPassword = await bcryptjs.compare(
    password as string,
    user.password as string,
  );
  if (!checkPassword) {
    throw new Error("password did not match!");
  }

  // Get user without password for response
  const userWithoutPassword = await User.findById(user._id);

  const jwtPayload = {
    userId: user._id,
    email: user.email,
    role: user.role,
  };

  const { accessToken, refreshToken } =
    jwtManagement.createAccessAndRefreshToken(jwtPayload);

  return { accessToken, refreshToken, user: userWithoutPassword };
};

const getNewAccessTokenService = async (refreshToken: string) => {
  const newAccessstoken =
    jwtManagement.getNewAccessTokenFromRefreshToken(refreshToken);
  return newAccessstoken;
};

const getMeService = async (payload: JwtPayload) => {
  const user = await User.findById(payload.userId).select(
    "_id name email role phone studentInfo image uniqueNameCode",
  );

  if (user && !user.uniqueNameCode) {
    const cleanName = user.name.replace(/\s+/g, "").toUpperCase().slice(0, 6);
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    user.uniqueNameCode = `${cleanName}#${randomDigits}`;
    await user.save();
  }

  return user;
};

const changePassword = async (
  oldPassword: string,
  newPassword: string,
  payload: JwtPayload,
) => {
  const user = await User.findById(payload.userId).select("+password");

  if (!user) {
    throw new Error("user not exist");
  }

  const isPasswordOK = await bcryptjs.compare(
    oldPassword,
    user.password as string,
  );

  if (!isPasswordOK) {
    throw new Error("old password did not match!");
  }

  const newHashedPassword = await bcryptjs.hash(
    newPassword,
    Number(envVars.BCRYPT_SALT_ROUND),
  );

  user.password = newHashedPassword;
  await user.save();
};

export const authService = {
  userLoginService,
  getMeService,
  getNewAccessTokenService,
  changePassword,
};
