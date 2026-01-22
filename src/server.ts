import { logger } from "./app/utils/logger";
import { connectMongoose } from "./app/lib/connectMongoose";
import { seedAdmin } from "./app/utils/seedAdmin";
// import { httpServer } from "./web-socket";
import { envVars } from "./app/config/env";
import { app } from "./app";
import { createServer } from "http";

export const httpServer = createServer(app);

const startServer = async () => {
  try {
    await connectMongoose();
    httpServer.listen(envVars.PORT, () => {
      logger.log(`Server is running on http://localhost:${envVars.PORT}`);
    });
  } catch (error) {
    logger.log("Error starting server", error);
  }
};

(async () => {
  await startServer();
  await seedAdmin();
})();

const graceFullyShutDown = () => {
  if (httpServer) {
    httpServer.close(() => {
      process.exit(1);
    });
  }
  process.exit(1);
};

process.on("unhandledRejection", (err) => {
  logger.log("Unhandled Rejecttion detected... Server shutting down..", err);
  graceFullyShutDown();
});

process.on("SIGTERM", () => {
  logger.log("SIGTERM signal recieved... Server shutting down..");
  graceFullyShutDown();
});

process.on("uncaughtException", (err) => {
  logger.log("Uncaught Exception detected... Server shutting down..", err);
  graceFullyShutDown();
});
