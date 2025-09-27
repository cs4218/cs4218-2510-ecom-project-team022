import { forgotPasswordController } from "./authController.js";
describe("forgotPasswordController", () => {
  let req, res;
  beforeEach(() => {
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    jest.clearAllMocks();
  });

  it("should return 400 if email is missing", async () => {
    req.body = { answer: "ans", newPassword: "123456" };
    await forgotPasswordController(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining("Emai is required") }));
  });

  it("should return 400 if answer is missing", async () => {
    req.body = { email: "a@b.com", newPassword: "123456" };
    await forgotPasswordController(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining("answer is required") }));
  });

  it("should return 400 if newPassword is missing", async () => {
    req.body = { email: "a@b.com", answer: "ans" };
    await forgotPasswordController(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining("New Password is required") }));
  });

  it("should return 404 if user is not found", async () => {
    req.body = { email: "a@b.com", answer: "ans", newPassword: "123456" };
    userModel.findOne.mockResolvedValue(null);
    await forgotPasswordController(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });

  it("should reset password and return success if all is valid", async () => {
    req.body = { email: "a@b.com", answer: "ans", newPassword: "123456" };
    const user = { _id: "1", email: "a@b.com", answer: "ans" };
    userModel.findOne.mockResolvedValue(user);
    authHelper.hashPassword.mockResolvedValue("hashed");
    userModel.findByIdAndUpdate = jest.fn().mockResolvedValue({});
    await forgotPasswordController(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  it("should return 500 and success: false if hashPassword fails", async () => {
    req.body = { email: "a@b.com", answer: "ans", newPassword: "123456" };
    const user = { _id: "1", email: "a@b.com", answer: "ans" };
    userModel.findOne.mockResolvedValue(user);
    authHelper.hashPassword.mockRejectedValue(new Error("fail"));
    await forgotPasswordController(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });
});
import { updateProfileController } from "./authController.js";

import { loginController } from "./authController.js";
import JWT from "jsonwebtoken";

import { registerController } from "./authController.js";
import userModel from "../models/userModel.js";
import * as authHelper from "../helpers/authHelper.js";


jest.mock("jsonwebtoken");

jest.mock("../models/userModel.js");
jest.mock("../helpers/authHelper.js");

describe("updateProfileController", () => {
  let req, res;
  beforeEach(() => {
    req = { body: {}, user: { _id: "1" } };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  it("should return error if password is less than 6 characters", async () => {
    req.body = { password: "123" };
    userModel.findById = jest.fn().mockResolvedValue({ name: "A", password: "old", phone: "123", address: "addr" });
    await updateProfileController(req, res);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.stringContaining("Passsword is required") }));
  });

  it("should update and return updatedUser if all is valid", async () => {
    req.body = { name: "B", password: "123456", phone: "456", address: "newaddr" };
    const user = { name: "A", password: "old", phone: "123", address: "addr" };
    userModel.findById = jest.fn().mockResolvedValue(user);
    authHelper.hashPassword.mockResolvedValue("hashedpw");
    const updatedUser = { name: "B", password: "hashedpw", phone: "456", address: "newaddr" };
    userModel.findByIdAndUpdate = jest.fn().mockResolvedValue(updatedUser);
    await updateProfileController(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(expect.objectContaining({ success: true, updatedUser }));
  });
});

describe("loginController", () => {
  let req, res;
  beforeEach(() => {
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    jest.clearAllMocks();
  });

  it("should return success: false if email or password is missing", async () => {
    await loginController(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });

  it("should return success: false if user is not found", async () => {
    req.body = { email: "a@b.com", password: "123456" };
    userModel.findOne.mockResolvedValue(null);
    await loginController(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });

  it("should return success: false if password does not match", async () => {
    req.body = { email: "a@b.com", password: "123456" };
    userModel.findOne.mockResolvedValue({ _id: "1", password: "hashed" });
    authHelper.comparePassword.mockResolvedValue(false);
    await loginController(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });

  it("should return success: true and user object if login is successful", async () => {
    req.body = { email: "a@b.com", password: "123456" };
    const user = { _id: "1", name: "A", email: "a@b.com", phone: "123", address: "addr", role: 0, password: "hashed" };
    userModel.findOne.mockResolvedValue(user);
    authHelper.comparePassword.mockResolvedValue(true);
    JWT.sign.mockReturnValue("token");
    await loginController(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(expect.objectContaining({ success: true, user: expect.any(Object), token: "token" }));
  });

  it("should return 500 and success: false if comparePassword throws", async () => {
    req.body = { email: "a@b.com", password: "123456" };
    userModel.findOne.mockResolvedValue({ _id: "1", password: "hashed" });
    authHelper.comparePassword.mockImplementation(() => { throw new Error("fail"); });
    await loginController(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });
});


describe("registerController", () => {
  let req, res;
  beforeEach(() => {
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    jest.clearAllMocks();
  });

  // missing all fields
  it("should fail validation if required fields are missing", async () => {
    await registerController(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith(expect.objectContaining({ error: expect.any(String) }));
  });

  // all fields present but user exists
  it("should return success: false if user already exists", async () => {
    req.body = { name: "A", email: "a@b.com", password: "123456", phone: "123", address: "addr", answer: "ans" };
    userModel.findOne.mockResolvedValue({ _id: "1", email: "a@b.com" });
    await registerController(req, res);

    // todo: keep 200?
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });

  it("should register user and return success: true if user does not exist", async () => {
    req.body = { name: "A", email: "a@b.com", password: "123456", phone: "123", address: "addr", answer: "ans" };
    userModel.findOne.mockResolvedValue(null);
    authHelper.hashPassword.mockResolvedValue("hashed");
    const saveMock = jest.fn().mockResolvedValue({ _id: "2", name: "A" });
    userModel.mockImplementation(() => ({ save: saveMock }));
    await registerController(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.send).toHaveBeenCalledWith(expect.objectContaining({ success: true, user: expect.any(Object) }));
  });

  it("should return 500 and success: false if hashPassword fails", async () => {
    req.body = { name: "A", email: "a@b.com", password: "123456", phone: "123", address: "addr", answer: "ans" };
    userModel.findOne.mockResolvedValue(null);
    authHelper.hashPassword.mockRejectedValue(new Error("fail"));
    await registerController(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });
});
