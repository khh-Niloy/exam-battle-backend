"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const war_service_1 = require("../../src/app/modules/war/war.service");
const war_model_1 = require("../../src/app/modules/war/war.model");
jest.mock("nanoid", () => ({
    customAlphabet: () => () => "A1B2C3D4",
}));
jest.mock("../../src/app/modules/war/war.model", () => ({
    War: {
        findOneAndUpdate: jest.fn(),
        findOne: jest.fn(),
    },
}));
describe("warServices.joinWar - integration-style tests", () => {
    const mockedWar = war_model_1.War;
    beforeEach(() => {
        jest.clearAllMocks();
    });
    it("throws AppError NOT_FOUND when war does not exist", () => __awaiter(void 0, void 0, void 0, function* () {
        mockedWar.findOneAndUpdate.mockReturnValue({
            populate: jest.fn().mockResolvedValue(null),
        });
        mockedWar.findOne.mockResolvedValue(null);
        const validUserId = "507f1f77bcf86cd799439011";
        yield expect(war_service_1.warServices.joinWar(validUserId, "NON_EXISTENT_WAR")).rejects.toMatchObject({
            statusCode: 404,
            message: "War not found",
        });
    }));
});
