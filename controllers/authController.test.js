import {
  updateProfileController,
  getOrdersController,
  getAllOrdersController,
  orderStatusController,
  forgotPasswordController,
  loginController,
  registerController,
  testController,
  getAllUsersController,
} from "../controllers/authController.js";
import userModel from "../models/userModel.js";
import orderModel from "../models/orderModel.js";
import { hashPassword } from "../helpers/authHelper.js";

import JWT from "jsonwebtoken";

import * as authHelper from "../helpers/authHelper.js";

// Mock dependencies
jest.mock("../models/userModel.js");
jest.mock("../models/orderModel.js");
jest.mock("../helpers/authHelper.js");

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("authController unit tests (happy + error paths)", () => {
  let consoleSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  // ---------------- updateProfileController ----------------
  describe("updateProfileController", () => {
    it("rejects password shorter than 6 chars (BVA case)", async () => {
      const req = { body: { password: "123" }, user: { _id: "uid" } };
      userModel.findById.mockResolvedValue({ password: "oldpass" });
      const res = mockRes();

      await updateProfileController(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({
        error: "Password is required and at least 6 characters long",
      });
    });

    it("updates profile with valid password", async () => {
      const req = {
        body: { name: "New Name", password: "123456" },
        user: { _id: "uid" },
      };
      const user = { _id: "uid", name: "Old Name", password: "oldhash" };
      userModel.findById.mockResolvedValue(user);
      hashPassword.mockResolvedValue("newhash");
      userModel.findByIdAndUpdate.mockResolvedValue({
        ...user,
        name: "New Name",
        password: "newhash",
      });
      const res = mockRes();

      await updateProfileController(req, res);

      expect(hashPassword).toHaveBeenCalledWith("123456");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({ success: true })
      );
    });

    it("updates profile with no new password (EP case)", async () => {
      const req = { body: { name: "Keep Password" }, user: { _id: "uid" } };
      const user = { _id: "uid", name: "Old Name", password: "oldhash" };
      userModel.findById.mockResolvedValue(user);
      userModel.findByIdAndUpdate.mockResolvedValue({
        ...user,
        name: "Keep Password",
      });
      const res = mockRes();

      await updateProfileController(req, res);

      expect(hashPassword).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({ success: true })
      );
    });

    it("handles database error gracefully", async () => {
      const req = { body: { name: "Any Name" }, user: { _id: "uid" } };
      const res = mockRes();

      userModel.findById.mockRejectedValue(new Error("DB error"));

      await updateProfileController(req, res);

      expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error));
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Error WHile Update profile",
          error: expect.any(Error),
        })
      );

      consoleSpy.mockRestore();
    });
  });

  // ---------------- getOrdersController ----------------
  describe("getOrdersController", () => {
    it("returns orders for the user", async () => {
      const req = { user: { _id: "uid" } };
      const res = mockRes();
      const mockOrders = [{ _id: "o1" }];

      const populateBuyer = jest.fn().mockResolvedValue(mockOrders);
      const populateProducts = jest
        .fn()
        .mockReturnValue({ populate: populateBuyer });
      orderModel.find.mockReturnValue({ populate: populateProducts });

      await getOrdersController(req, res);

      expect(res.json).toHaveBeenCalledWith(mockOrders);
    });

    it("handles no orders found (BVA case)", async () => {
      const req = { user: { _id: "uid" } };
      const res = mockRes();

      const populateBuyer = jest.fn().mockResolvedValue([]);
      const populateProducts = jest
        .fn()
        .mockReturnValue({ populate: populateBuyer });
      orderModel.find.mockReturnValue({ populate: populateProducts });

      await getOrdersController(req, res);

      expect(res.json).toHaveBeenCalledWith([]);
    });

    it("handles order retrieval error gracefully", async () => {
      const req = { user: { _id: "uid" } };
      const res = mockRes();

      const populateBuyer = jest.fn().mockRejectedValue(new Error("DB error"));
      const populateProducts = jest
        .fn()
        .mockReturnValue({ populate: populateBuyer });
      orderModel.find.mockReturnValue({ populate: populateProducts });

      await getOrdersController(req, res);

      expect(console.log).toHaveBeenCalledWith(expect.any(Error));
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({ success: false, message: expect.any(String) })
      );
    });
  });

  // ---------------- getAllOrdersController ----------------
  describe("getAllOrdersController", () => {
    it("returns all orders", async () => {
      const req = {};
      const res = mockRes();
      const mockOrders = [{ _id: "o1" }, { _id: "o2" }];

      const sortFn = jest.fn().mockResolvedValue(mockOrders);
      const populateBuyer = jest.fn().mockReturnValue({ sort: sortFn });
      const populateProducts = jest
        .fn()
        .mockReturnValue({ populate: populateBuyer });
      orderModel.find.mockReturnValue({ populate: populateProducts });

      await getAllOrdersController(req, res);

      expect(res.json).toHaveBeenCalledWith(mockOrders);
    });

    it("handles empty orders list", async () => {
      const req = {};
      const res = mockRes();

      const sortFn = jest.fn().mockResolvedValue([]);
      const populateBuyer = jest.fn().mockReturnValue({ sort: sortFn });
      const populateProducts = jest
        .fn()
        .mockReturnValue({ populate: populateBuyer });
      orderModel.find.mockReturnValue({ populate: populateProducts });

      await getAllOrdersController(req, res);

      expect(res.json).toHaveBeenCalledWith([]);
    });

    it("handles error while retrieving all orders", async () => {
      const req = {};
      const res = mockRes();

      // Make the query chain throw an error
      const sortFn = jest.fn().mockRejectedValue(new Error("DB error"));
      const populateBuyer = jest.fn().mockReturnValue({ sort: sortFn });
      const populateProducts = jest
        .fn()
        .mockReturnValue({ populate: populateBuyer });
      orderModel.find.mockReturnValue({ populate: populateProducts });

      await getAllOrdersController(req, res);

      // Verify error logging
      expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error));

      // Verify response
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Error WHile Geting Orders",
          error: expect.any(Error),
        })
      );
    });
  });

  // ---------------- orderStatusController ----------------
  describe("orderStatusController", () => {
    it("updates an order status successfully", async () => {
      const req = { params: { orderId: "o1" }, body: { status: "Shipped" } };
      const res = mockRes();
      const updatedOrder = { _id: "o1", status: "Shipped" };
      orderModel.findByIdAndUpdate.mockResolvedValue(updatedOrder);

      await orderStatusController(req, res);

      expect(orderModel.findByIdAndUpdate).toHaveBeenCalledWith(
        "o1",
        { status: "Shipped" },
        { new: true }
      );
      expect(res.json).toHaveBeenCalledWith(updatedOrder);
    });

    it("handles error during update", async () => {
      const req = { params: { orderId: "badid" }, body: { status: "Fail" } };
      const res = mockRes();
      orderModel.findByIdAndUpdate.mockRejectedValue(new Error("DB error"));

      await orderStatusController(req, res);

      expect(console.log).toHaveBeenCalledWith(expect.any(Error));
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({ success: false, message: expect.any(String) })
      );
    });
  });
});

jest.mock("jsonwebtoken");

jest.mock("../models/userModel.js");
jest.mock("../helpers/authHelper.js");

const PASSWORD_TOO_SHORT = "Password must be at least 6 characters long";

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
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining("Email is required"),
      })
    );
  });

  it("should return 400 if answer is missing", async () => {
    req.body = { email: "a@b.com", newPassword: "123456" };
    await forgotPasswordController(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining("answer is required"),
      })
    );
  });

  it("should return 400 if newPassword is missing", async () => {
    req.body = { email: "a@b.com", answer: "ans" };
    await forgotPasswordController(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining("New Password is required"),
      })
    );
  });

  it("should return 400 if newPassword is too short", async () => {
    req.body = { email: "a@b.com", answer: "ans", newPassword: "123" };
    await forgotPasswordController(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining(PASSWORD_TOO_SHORT),
      })
    );
  });

  it("should return 401 if user is not found", async () => {
    req.body = { email: "a@b.com", answer: "ans", newPassword: "123456" };
    userModel.findOne.mockResolvedValue(null);
    await forgotPasswordController(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    );
  });

  it("should reset password and return success if all is valid", async () => {
    req.body = { email: "a@b.com", answer: "ans", newPassword: "123456" };
    const user = { _id: "1", email: "a@b.com", answer: "ans" };
    userModel.findOne.mockResolvedValue(user);
    authHelper.hashPassword.mockResolvedValue("hashed");
    userModel.findByIdAndUpdate = jest.fn().mockResolvedValue({});
    await forgotPasswordController(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({ success: true })
    );
  });

  it("should return 500 and success: false if hashPassword fails", async () => {
    req.body = { email: "a@b.com", answer: "ans", newPassword: "123456" };
    const user = { _id: "1", email: "a@b.com", answer: "ans" };
    userModel.findOne.mockResolvedValue(user);
    authHelper.hashPassword.mockRejectedValue(new Error("fail"));
    await forgotPasswordController(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    );
  });
});

jest.mock("jsonwebtoken");

jest.mock("../models/userModel.js");
jest.mock("../helpers/authHelper.js");

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

  it("should return success: false if password is missing", async () => {
    req.body = { email: "a@b.com" };
    await loginController(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "Invalid email or password",
      })
    );
  });

  it("should return success: false if email is missing", async () => {
    req.body = { password: "123456" };
    await loginController(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "Invalid email or password",
      })
    );
  });

  it("should return success: false if email and password is missing", async () => {
    await loginController(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "Invalid email or password",
      })
    );
  });

  it("should return success: false if user is not found", async () => {
    req.body = { email: "a@b.com", password: "123456" };
    userModel.findOne.mockResolvedValue(null);
    await loginController(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "Email is not registered",
      })
    );
  });

  it("should return success: false if password does not match", async () => {
    req.body = { email: "a@b.com", password: "123456" };
    userModel.findOne.mockResolvedValue({ _id: "1", password: "hashed" });
    authHelper.comparePassword.mockResolvedValue(false);
    await loginController(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, message: "Invalid Password" })
    );
  });

  it("should return success: true and user object if login is successful", async () => {
    req.body = { email: "a@b.com", password: "123456" };
    const user = {
      _id: "1",
      name: "A",
      email: "a@b.com",
      phone: "123",
      address: "addr",
      role: 0,
      password: "hashed",
    };
    userModel.findOne.mockResolvedValue(user);
    authHelper.comparePassword.mockResolvedValue(true);
    JWT.sign.mockReturnValue("token");
    await loginController(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        user: expect.any(Object),
        token: "token",
      })
    );
  });

  it("should return 500 and success: false if comparePassword throws", async () => {
    req.body = { email: "a@b.com", password: "123456" };
    userModel.findOne.mockResolvedValue({ _id: "1", password: "hashed" });
    authHelper.comparePassword.mockImplementation(() => {
      throw new Error("fail");
    });
    await loginController(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    );
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

  // BVA tests for password length validation in registration
  // Equivalence Partitions: 0-5 chars (invalid), 6+ chars (valid)
  // Boundary values: 0, 1, 4, 5, 6, 7

  it("should fail validation if password is 0 characters (empty)", async () => {
    req.body = {
      name: "A",
      email: "a@b.com",
      password: "",
      phone: "123",
      address: "addr",
      answer: "ans",
    };
    await registerController(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining("Password is Required"),
      })
    );
  });

  it("should fail validation if password is 1 character", async () => {
    req.body = {
      name: "A",
      email: "a@b.com",
      password: "1",
      phone: "123",
      address: "addr",
      answer: "ans",
    };
    await registerController(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining(PASSWORD_TOO_SHORT),
      })
    );
  });

  it("should fail validation if password is 4 characters", async () => {
    req.body = {
      name: "A",
      email: "a@b.com",
      password: "1234",
      phone: "123",
      address: "addr",
      answer: "ans",
    };
    await registerController(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining(PASSWORD_TOO_SHORT),
      })
    );
  });

  it("should fail validation if password is 5 characters", async () => {
    req.body = {
      name: "A",
      email: "a@b.com",
      password: "12345",
      phone: "123",
      address: "addr",
      answer: "ans",
    };
    await registerController(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining(PASSWORD_TOO_SHORT),
      })
    );
  });

  it("should register user successfully if password is exactly 6 characters", async () => {
    req.body = {
      name: "A",
      email: "a@b.com",
      password: "123456",
      phone: "123",
      address: "addr",
      answer: "ans",
    };
    userModel.findOne.mockResolvedValue(null);
    authHelper.hashPassword.mockResolvedValue("hashed");
    const saveMock = jest.fn().mockResolvedValue({ _id: "2", name: "A" });
    userModel.mockImplementation(() => ({ save: saveMock }));
    await registerController(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, user: expect.any(Object) })
    );
  });

  it("should register user successfully if password is 7 characters", async () => {
    req.body = {
      name: "A",
      email: "a@b.com",
      password: "1234567",
      phone: "123",
      address: "addr",
      answer: "ans",
    };
    userModel.findOne.mockResolvedValue(null);
    authHelper.hashPassword.mockResolvedValue("hashed");
    const saveMock = jest.fn().mockResolvedValue({ _id: "2", name: "A" });
    userModel.mockImplementation(() => ({ save: saveMock }));
    await registerController(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, user: expect.any(Object) })
    );
  });

  // Test individual field validations for registerController
  it("should fail validation if email is missing", async () => {
    req.body = {
      name: "A",
      password: "123456",
      phone: "123",
      address: "addr",
      answer: "ans",
    };
    await registerController(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining("Email is Required"),
      })
    );
  });

  it("should fail validation if phone is missing", async () => {
    req.body = {
      name: "A",
      email: "a@b.com",
      password: "123456",
      address: "addr",
      answer: "ans",
    };
    await registerController(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining("Phone no is Required"),
      })
    );
  });

  it("should fail validation if address is missing", async () => {
    req.body = {
      name: "A",
      email: "a@b.com",
      password: "123456",
      phone: "123",
      answer: "ans",
    };
    await registerController(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining("Address is Required"),
      })
    );
  });

  it("should fail validation if answer is missing", async () => {
    req.body = {
      name: "A",
      email: "a@b.com",
      password: "123456",
      phone: "123",
      address: "addr",
    };
    await registerController(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining("Answer is Required"),
      })
    );
  });

  // missing all fields
  it("should fail validation if required fields are missing", async () => {
    await registerController(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.any(String) })
    );
  });

  // all fields present but user exists
  it("should return success: false if user already exists", async () => {
    req.body = {
      name: "A",
      email: "a@b.com",
      password: "123456",
      phone: "123",
      address: "addr",
      answer: "ans",
    };
    userModel.findOne.mockResolvedValue({ _id: "1", email: "a@b.com" });
    await registerController(req, res);

    // todo: keep 200?
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    );
  });

  it("should register user and return success: true if user does not exist", async () => {
    req.body = {
      name: "A",
      email: "a@b.com",
      password: "123456",
      phone: "123",
      address: "addr",
      answer: "ans",
    };
    userModel.findOne.mockResolvedValue(null);
    authHelper.hashPassword.mockResolvedValue("hashed");
    const saveMock = jest.fn().mockResolvedValue({ _id: "2", name: "A" });
    userModel.mockImplementation(() => ({ save: saveMock }));
    await registerController(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, user: expect.any(Object) })
    );
  });

  it("should return 500 and success: false if hashPassword fails", async () => {
    req.body = {
      name: "A",
      email: "a@b.com",
      password: "123456",
      phone: "123",
      address: "addr",
      answer: "ans",
    };
    userModel.findOne.mockResolvedValue(null);
    authHelper.hashPassword.mockRejectedValue(new Error("fail"));
    await registerController(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    );
  });
});

describe("testController", () => {
  let req, res;
  beforeEach(() => {
    req = {};
    res = {
      send: jest.fn(),
    };
    jest.clearAllMocks();
  });

  it("should return 'Protected Routes' message", () => {
    testController(req, res);
    expect(res.send).toHaveBeenCalledWith("Protected Routes");
  });

  it("should handle errors gracefully", () => {
    // Mock res.send to throw an error to test the catch block
    res.send = jest.fn().mockImplementation(() => {
      throw new Error("Send error");
    });

    const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});

    // Wrap in expect to catch the error
    expect(() => {
      testController(req, res);
    }).toThrow("Send error");

    expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error));

    consoleSpy.mockRestore();
  });
});

describe("getAllUsersController", () => {
  let req, res;
  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  it("should return all users successfully", async () => {
    const mockUsers = [
      { _id: "1", name: "User1", email: "user1@test.com" },
      { _id: "2", name: "User2", email: "user2@test.com" },
    ];
    userModel.find.mockResolvedValue(mockUsers);

    await getAllUsersController(req, res);

    expect(userModel.find).toHaveBeenCalledWith({});
    expect(res.json).toHaveBeenCalledWith({ users: mockUsers });
  });

  it("should handle database error gracefully", async () => {
    const error = new Error("Database error");
    userModel.find.mockRejectedValue(error);

    const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});

    await getAllUsersController(req, res);

    expect(consoleSpy).toHaveBeenCalledWith(error);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Error While Getting All Users",
      error,
    });

    consoleSpy.mockRestore();
  });
});
