import express, { Request, Response } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { notFound } from "./app/middleware/notFound";
import { globalErrorHandler } from "./app/middleware/globalErrorHandler";
import { routes } from "./routes";
import { envVars } from "./app/config/env";

export const app = express();

app.use(cookieParser());
app.use(express.json());

// Request logger for debugging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.use(
  cors({
    origin: [envVars.CORS_FRONTEND_URL, "http://192.168.31.67:3000"],
    credentials: true,
  }),
);

app.use("/api/v1", routes);

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "welcome to exam-battle backend",
  });
});

app.use(globalErrorHandler);
app.use(notFound);
