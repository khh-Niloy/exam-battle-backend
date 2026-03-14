import AppError from "../../src/app/errors/AppError";
import { warServices } from "../../src/app/modules/war/war.service";
import { War } from "../../src/app/modules/war/war.model";

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
  const mockedWar = War as unknown as {
    findOneAndUpdate: jest.Mock;
    findOne: jest.Mock;
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("throws AppError NOT_FOUND when war does not exist", async () => {
    mockedWar.findOneAndUpdate.mockReturnValue({
      populate: jest.fn().mockResolvedValue(null),
    } as any);
    mockedWar.findOne.mockResolvedValue(null as any);

    const validUserId = "507f1f77bcf86cd799439011";

    await expect(
      warServices.joinWar(validUserId, "NON_EXISTENT_WAR"),
    ).rejects.toMatchObject({
      statusCode: 404,
      message: "War not found",
    });
  });
});

