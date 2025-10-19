import { isAdmin } from "./authMiddleware.js";
import userModel from "../models/userModel.js";

import JWT from "jsonwebtoken";
import { requireSignIn } from "./authMiddleware.js";

describe("isAdmin middleware", () => {
  // test the try catch
  it("should return 401 if userModel.findById throws an error", async () => {
    const req = { user: { _id: "errorid" } };
    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    const next = jest.fn();

    jest.spyOn(userModel, "findById").mockImplementation(() => {
      throw new Error("DB error");
    });

    await isAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: expect.stringContaining("Error in admin middleware"),
      })
    );
    expect(next).not.toHaveBeenCalled();

    userModel.findById.mockRestore();
  });

  // test normal unauth flow
  // ASSUMES user is logged in
  it("should return 403 if user is not admin", async () => {
    const req = { user: { _id: "testuserid" } };
    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    const next = jest.fn();

    // Mock userModel.findById to return a non-admin user
    jest
      .spyOn(userModel, "findById")
      .mockResolvedValue({ _id: "testuserid", role: 0 });

    await isAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: expect.stringContaining("Forbidden Access"),
      })
    );
    expect(next).not.toHaveBeenCalled();

    userModel.findById.mockRestore();
  });

  // test normal auth flow
  it("should call next() if user is admin", async () => {
    const req = { user: { _id: "adminid" } };
    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    const next = jest.fn();

    jest
      .spyOn(userModel, "findById")
      .mockResolvedValue({ _id: "adminid", role: 1 });

    await isAdmin(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.send).not.toHaveBeenCalled();

    userModel.findById.mockRestore();
  });
});

describe("requireSignIn middleware", () => {
  it("should call next() and set req.user if JWT verification passes", async () => {
    const fakeUser = { _id: "user1", name: "Test User" };
    const req = { headers: { authorization: "Bearer validtoken" } };
    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    const next = jest.fn();

    // fake the return value of JWT.verify, assume we verified
    jest.spyOn(JWT, "verify").mockReturnValue(fakeUser);

    await requireSignIn(req, res, next);

    expect(req.user).toEqual(fakeUser);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.send).not.toHaveBeenCalled();

    JWT.verify.mockRestore();
  });

  it("should return 401 if no authorization header is provided", async () => {
    const req = { headers: {} };
    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    const next = jest.fn();

    await requireSignIn(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Unauthorized Access",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 401 if authorization header doesn't start with Bearer", async () => {
    const req = { headers: { authorization: "invalidformat" } };
    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    const next = jest.fn();

    await requireSignIn(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Unauthorized Access",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 401 if JWT verification fails", async () => {
    const req = { headers: { authorization: "Bearer invalidtoken" } };
    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    const next = jest.fn();
    const error = new Error("invalid token");
    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});

    // make JWT.verify throw an error
    jest.spyOn(JWT, "verify").mockImplementation(() => {
      throw error;
    });

    await requireSignIn(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Unauthorized Access",
    });
    expect(next).not.toHaveBeenCalled();
    expect(logSpy).toHaveBeenCalledWith(error);

    JWT.verify.mockRestore();
    logSpy.mockRestore();
  });
});
