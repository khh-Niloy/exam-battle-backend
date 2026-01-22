export const createSlug = (text: string) => {
  return text.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "").replace(/^-+|-+$/g, "");
};
