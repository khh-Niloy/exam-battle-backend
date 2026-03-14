import {
  generateWarId,
  isValidScheduledTime,
  isValidWarId,
  isWarExpired,
} from "../../src/app/modules/war/war.utils";

jest.mock("nanoid", () => ({
  customAlphabet: () => () => "A1B2C3D4",
}));

describe("war.utils - unit tests", () => {
  it("generateWarId should return a valid, 8-character ID", () => {
    const id = generateWarId();

    expect(typeof id).toBe("string");
    expect(id).toHaveLength(8);
    expect(isValidWarId(id)).toBe(true);
  });

  it("isValidWarId should validate correct format", () => {
    const valid = "A1B2C3D4";
    const invalidLength = "ABC123";
    const invalidChars = "ABC123$%";

    expect(isValidWarId(valid)).toBe(true);
    expect(isValidWarId(invalidLength)).toBe(false);
    expect(isValidWarId(invalidChars)).toBe(false);
  });

  it("isValidScheduledTime should return true for future times", () => {
    const future = new Date(Date.now() + 60 * 1000);
    const past = new Date(Date.now() - 60 * 1000);

    expect(isValidScheduledTime(future)).toBe(true);
    expect(isValidScheduledTime(past)).toBe(false);
  });

  it("isWarExpired should detect expired wars", () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    const justNow = new Date();

    expect(isWarExpired(twoHoursAgo)).toBe(true);
    expect(isWarExpired(justNow)).toBe(false);
  });
});

