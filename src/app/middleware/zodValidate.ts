import { NextFunction, Request, Response } from "express";
import { ZodObject } from "zod";

export const validateSchema =
  (zodSchema: ZodObject<any>) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Handle multipart form data if it's sent as a single 'data' field
      if (req.body?.data) {
        try {
          const parsedData = typeof req.body.data === 'string' 
            ? JSON.parse(req.body.data) 
            : req.body.data;
          
          if (typeof parsedData === 'object' && parsedData !== null) {
            req.body = { ...req.body, ...parsedData };
          }
          // Optionally delete req.body.data if you don't want it sticking around
          // delete req.body.data;
        } catch (error) {
          // If parsing fails, we keep req.body as is
        }
      }

      // Ensure req.body exists
      if (!req.body) {
        req.body = {};
      }

      // Validate the request object
      const validatedData = await zodSchema.parseAsync({
        body: req.body,
        params: req.params,
        query: req.query,
      });

      // Update request objects with validated and transformed data
      if (validatedData.body) {
        req.body = validatedData.body;
      }
      if (validatedData.params) {
        req.params = validatedData.params as any;
      }
      if (validatedData.query) {
        req.query = validatedData.query as any;
      }



      next();
    } catch (error) {
      next(error);
    }
  };