import { z } from "zod";
import { Roles } from "./user.interface";
import { parseArrayField } from "../../utils/parseFormData";

const phoneRegex =
  /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;

export const userCreateZodSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(1, "Name is required")
      .max(100, "Name must be less than 100 characters")
      .trim(),
    email: z.string().email("Invalid email format").toLowerCase().trim(),
    password: z.string().max(128, "Password must be less than 128 characters"),
    role: z.nativeEnum(Roles, {
      error: "Invalid role. Must be TOURIST, GUIDE, or ADMIN",
    }),
  }),
});

export const userUpdateZodSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(1, "Name cannot be empty")
      .max(100, "Name must be less than 100 characters")
      .trim()
      .optional(),
    image: z
      .string()
      .url("Image must be a valid URL")
      .optional()
      .or(z.literal("")),
    phone: z
      .string()
      .regex(phoneRegex, "Please provide a valid phone number")
      .optional()
      .or(z.literal("")),
    address: z
      .string()
      .max(500, "Address must be less than 500 characters")
      .optional()
      .or(z.literal("")),
    bio: z
      .string()
      .max(1000, "Bio must be less than 1000 characters")
      .optional()
      .or(z.literal("")),
    language: z
      .preprocess((val) => parseArrayField(val), z.array(z.string()))
      .optional(),
    // Guide-specific fields
    expertise: z
      .preprocess((val) => parseArrayField(val), z.array(z.string()))
      .optional(),
    dailyRate: z
      .union([z.number(), z.string()])
      .optional()
      .transform((val) => {
        if (val === undefined || val === null || val === "") return undefined;
        if (typeof val === "string") {
          const parsed = parseFloat(val);
          if (isNaN(parsed)) return undefined;
          if (parsed < 0) throw new Error("Daily rate must be positive");
          if (parsed > 100000)
            throw new Error("Daily rate must be less than 100,000");
          return parsed;
        }
        if (val < 0) throw new Error("Daily rate must be positive");
        if (val > 100000)
          throw new Error("Daily rate must be less than 100,000");
        return val;
      }),
    // Tourist-specific fields
    travelPreferences: z
      .preprocess((val) => parseArrayField(val), z.array(z.string()))
      .optional(),
  }),
});
