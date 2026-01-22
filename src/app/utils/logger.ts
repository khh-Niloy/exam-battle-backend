import { envVars } from "../config/env";

export const logger = {
  log: (...data: unknown[]) => {
    if (envVars.NODE_ENV === "development") {
      console.log(...data);
    }
  },
  error: (...data: unknown[]) => {
    if (envVars.NODE_ENV === "development") {
      console.error(...data);
    }
  },
};

