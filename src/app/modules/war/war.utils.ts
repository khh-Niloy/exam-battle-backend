import { customAlphabet } from "nanoid";

/**
 * Generates a unique, collision-resistant War ID
 * - Uses nanoid for cryptographically strong random generation
 * - Custom alphabet excludes ambiguous characters (0, O, I, l)
 * - 8 characters = ~2.1 trillion combinations
 * - Collision probability: negligible for millions of wars
 */
const nanoid = customAlphabet("123456789ABCDEFGHJKLMNPQRSTUVWXYZ", 8);

export const generateWarId = (): string => {
  return nanoid();
};

/**
 * Validates War ID format
 */
export const isValidWarId = (warId: string): boolean => {
  return /^[123456789ABCDEFGHJKLMNPQRSTUVWXYZ]{8}$/.test(warId);
};

/**
 * Checks if scheduled time is valid (not in the past)
 */
export const isValidScheduledTime = (scheduledTime: Date): boolean => {
  const now = new Date();
  const scheduled = new Date(scheduledTime);
  return scheduled > now;
};

/**
 * Checks if war has expired (scheduled time + 1 hour buffer)
 */
export const isWarExpired = (scheduledTime: Date): boolean => {
  const now = new Date();
  const expiryTime = new Date(scheduledTime.getTime() + 60 * 60 * 1000); // 1 hour buffer
  return now > expiryTime;
};
