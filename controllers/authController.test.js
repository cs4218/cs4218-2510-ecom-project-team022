import {
  updateProfileController,
  getOrdersController,
  getAllOrdersController,
  orderStatusController,
} from "../controllers/authController.js";
import userModel from "../models/userModel.js";
import orderModel from "../models/orderModel.js";
import { hashPassword } from "../helpers/authHelper.js";

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

      expect(res.json).toHaveBeenCalledWith({
        error: "Passsword is required and 6 character long",
      });
    });

    it("updates profile with valid password", async () => {
      const req = { body: { name: "New Name", password: "123456" }, user: { _id: "uid" } };
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
      expect(res.send).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });

    it("updates profile with no new password (EP case)", async () => {
      const req = { body: { name: "Keep Password" }, user: { _id: "uid" } };
      const user = { _id: "uid", name: "Old Name", password: "oldhash" };
      userModel.findById.mockResolvedValue(user);
      userModel.findByIdAndUpdate.mockResolvedValue({ ...user, name: "Keep Password" });
      const res = mockRes();

      await updateProfileController(req, res);

      expect(hashPassword).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
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
      const populateProducts = jest.fn().mockReturnValue({ populate: populateBuyer });
      orderModel.find.mockReturnValue({ populate: populateProducts });

      await getOrdersController(req, res);

      expect(res.json).toHaveBeenCalledWith(mockOrders);
    });

    it("handles no orders found (BVA case)", async () => {
      const req = { user: { _id: "uid" } };
      const res = mockRes();

      const populateBuyer = jest.fn().mockResolvedValue([]);
      const populateProducts = jest.fn().mockReturnValue({ populate: populateBuyer });
      orderModel.find.mockReturnValue({ populate: populateProducts });

      await getOrdersController(req, res);

      expect(res.json).toHaveBeenCalledWith([]);
    });

    it("handles order retrieval error gracefully", async () => {
        const req = { user: { _id: "uid" } };
        const res = mockRes();

        const populateBuyer = jest.fn().mockRejectedValue(new Error("DB error"));
        const populateProducts = jest.fn().mockReturnValue({ populate: populateBuyer });
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
      const populateProducts = jest.fn().mockReturnValue({ populate: populateBuyer });
      orderModel.find.mockReturnValue({ populate: populateProducts });

      await getAllOrdersController(req, res);

      expect(res.json).toHaveBeenCalledWith(mockOrders);
    });

    it("handles empty orders list", async () => {
      const req = {};
      const res = mockRes();

      const sortFn = jest.fn().mockResolvedValue([]);
      const populateBuyer = jest.fn().mockReturnValue({ sort: sortFn });
      const populateProducts = jest.fn().mockReturnValue({ populate: populateBuyer });
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
        const populateProducts = jest.fn().mockReturnValue({ populate: populateBuyer });
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