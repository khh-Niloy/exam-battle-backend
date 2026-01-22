/**
 * Parses a field that could be a JSON string, a comma-separated string, or already an array.
 * Useful for handling FormData where arrays might be sent as strings.
 */
export const parseArrayField = (field: any): any[] => {
  if (!field) return [];
  if (Array.isArray(field)) return field;
  if (typeof field === "string") {
    try {
      const parsed = JSON.parse(field);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      return field
        .split(",")
        .map((item: string) => item.trim())
        .filter(Boolean);
    }
  }
  return [];
};

/**
 * Parses a field that could be a JSON string or already an object.
 * Useful for handling FormData where objects might be sent as JSON strings.
 */
export const parseObjectField = (field: any): any => {
  if (!field) return null;
  if (typeof field === "object") return field;
  if (typeof field === "string") {
    try {
      return JSON.parse(field);
    } catch {
      return null;
    }
  }
  return null;
};
