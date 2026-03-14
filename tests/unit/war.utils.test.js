"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const war_utils_1 = require("../../src/app/modules/war/war.utils");
jest.mock("nanoid", () => ({
    customAlphabet: () => () => "A1B2C3D4",
}));
describe("war.utils - unit tests", () => {
    it("generateWarId should return a valid, 8-character ID", () => {
        const id = (0, war_utils_1.generateWarId)();
        expect(typeof id).toBe("string");
        expect(id).toHaveLength(8);
        expect((0, war_utils_1.isValidWarId)(id)).toBe(true);
    });
    it("isValidWarId should validate correct format", () => {
        const valid = "A1B2C3D4";
        const invalidLength = "ABC123";
        const invalidChars = "ABC123$%";
        expect((0, war_utils_1.isValidWarId)(valid)).toBe(true);
        expect((0, war_utils_1.isValidWarId)(invalidLength)).toBe(false);
        expect((0, war_utils_1.isValidWarId)(invalidChars)).toBe(false);
    });
    it("isValidScheduledTime should return true for future times", () => {
        const future = new Date(Date.now() + 60 * 1000);
        const past = new Date(Date.now() - 60 * 1000);
        expect((0, war_utils_1.isValidScheduledTime)(future)).toBe(true);
        expect((0, war_utils_1.isValidScheduledTime)(past)).toBe(false);
    });
    it("isWarExpired should detect expired wars", () => {
        const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
        const justNow = new Date();
        expect((0, war_utils_1.isWarExpired)(twoHoursAgo)).toBe(true);
        expect((0, war_utils_1.isWarExpired)(justNow)).toBe(false);
    });
});
