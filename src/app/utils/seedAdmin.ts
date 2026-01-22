import bcryptjs from "bcryptjs";
import { envVars } from "../config/env";
import { User } from "../modules/users/user.model";
import { logger } from "./logger";
import { IUser, Roles } from "../modules/users/user.interface";

export const seedAdmin = async () => {
  const user = await User.findOne({ email: envVars.ADMIN_EMAIL });

  if (user) {
    return;
  }

  const hashedPassword = await bcryptjs.hash(
    envVars.ADMIN_PASSWORD as string,
    parseInt(envVars.BCRYPT_SALT_ROUND)
  );

  const playLoad: Partial<IUser> = {
    name: "niloy admin",
    email: envVars.ADMIN_EMAIL,
    password: hashedPassword,
    role: Roles.ADMIN,
  };

  const admin = await User.create(playLoad);
  logger.log(`Admin created successfully: ${admin}`);
};
