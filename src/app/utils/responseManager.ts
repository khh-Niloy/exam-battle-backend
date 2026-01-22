import { Response } from "express";

interface IResponse<T> {
  statusCode: number;
  success: boolean;
  message: string;
  meta?: number;
  data: T;
}

export const success = <T>(res: Response, data: IResponse<T>) => {
  res.status(data.statusCode).json({
    success: data.success,
    message: data.message,
    meta: data.meta,
    data: data.data,
  });
};

export const error = (res: Response, error: Error, statusCode: number) => {
  res.status(statusCode).json({
    success: false,
    message: (error as Error).message,
  });
};

export const responseManager = {
  success,
  error,
};
