import { hashPassword, comparePassword } from "./authHelper.js";
import bcrypt from "bcrypt";

jest.mock("bcrypt");

describe("hashPassword", () => {
  it("should hash the password using bcrypt", async () => {
    bcrypt.hash.mockResolvedValue("hashed");
    const result = await hashPassword("mypassword");
    expect(bcrypt.hash).toHaveBeenCalledWith("mypassword", 10);
    expect(result).toBe("hashed");
  });

  it("should log error and return undefined if bcrypt throws", async () => {
    const error = new Error("fail");
    bcrypt.hash.mockRejectedValue(error);
    const logSpy = jest.spyOn(console, "log").mockImplementation(() => { });
    const result = await hashPassword("mypassword");
    expect(logSpy).toHaveBeenCalledWith(error);
    expect(result).toBeUndefined();
    logSpy.mockRestore();
  });
});

describe("comparePassword", () => {
  it("should call bcrypt.compare and return result", async () => {
    bcrypt.compare.mockResolvedValue(true);
    const result = await comparePassword("plain", "hashed");
    expect(bcrypt.compare).toHaveBeenCalledWith("plain", "hashed");
    expect(result).toBe(true);
  });

  it("should return false if bcrypt.compare rejects", async () => {
    bcrypt.compare.mockRejectedValue(new Error("fail"));
    await expect(comparePassword("plain", "hashed")).resolves.toBe(false);
  });
});
