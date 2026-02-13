import { z } from "zod";

export const createWarSchema = z.object({
  body: z.object({
    questionPaperId: z.string().min(1, "Question paper ID is required"),
    maxPlayers: z
      .number()
      .int()
      .min(2, "Minimum 2 players required")
      .max(100, "Maximum 100 players allowed"),
    scheduledStartTime: z.string().refine(
      (date) => {
        const scheduledDate = new Date(date);
        const now = new Date();
        // Add 1 min buffer for minor clock drift
        now.setMinutes(now.getMinutes() - 1);
        return scheduledDate > now;
      },
      { message: "Scheduled start time must be in the future" },
    ),
  }),
});

export const joinWarSchema = z.object({
  body: z.object({
    warId: z
      .string()
      .length(8, "War ID must be 8 characters")
      .regex(
        /^[123456789ABCDEFGHJKLMNPQRSTUVWXYZ]{8}$/,
        "Invalid War ID format",
      ),
  }),
});

export const startWarSchema = z.object({
  params: z.object({
    warId: z
      .string()
      .length(8, "War ID must be 8 characters")
      .regex(
        /^[123456789ABCDEFGHJKLMNPQRSTUVWXYZ]{8}$/,
        "Invalid War ID format",
      ),
  }),
});

export const getWarDetailsSchema = z.object({
  params: z.object({
    warId: z
      .string()
      .length(8, "War ID must be 8 characters")
      .regex(
        /^[123456789ABCDEFGHJKLMNPQRSTUVWXYZ]{8}$/,
        "Invalid War ID format",
      ),
  }),
});
