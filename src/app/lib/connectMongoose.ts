import mongoose from "mongoose";
import { envVars } from "../config/env";
import { logger } from "../utils/logger";

export const connectMongoose = async () => {
  try {
    await mongoose.connect(envVars.MONGO_URI);
    logger.log("✅ Connected to MongoDB");
  } catch (error) {
    logger.error(" ❌ Error connecting to MongoDB", error);
    process.exit(1);
  }
};
