import { z } from "zod";

const createCoachingZodSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    logo: z.string().optional(),
  }),
});

const joinCoachingZodSchema = z.object({
  body: z.object({
    joinCode: z.string().min(1, "Join code is required"),
  }),
});

export const CoachingValidation = {
  createCoachingZodSchema,
  joinCoachingZodSchema,
};
