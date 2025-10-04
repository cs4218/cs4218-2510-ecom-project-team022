import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import Order from "../models/orderModel.js";

let mongoServer;

describe("Order Model Unit Tests", () => {
  beforeAll(async () => {
    // Start in-memory MongoDB
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  afterEach(async () => {
    // Clean up database between tests
    await Order.deleteMany({});
  });

  it("should set default status to 'Not Process'", async () => {
    const order = new Order({ buyer: new mongoose.Types.ObjectId() });
    expect(order.status).toBe("Not Process");
  });

  it("should enforce enum validation on status", async () => {
    const order = new Order({
      buyer: new mongoose.Types.ObjectId(),
      status: "INVALID_STATUS",
    });

    let error;
    try {
      await order.validate();
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.errors.status.kind).toBe("enum");
  });

  it("should require products to be ObjectIds", async () => {
    const order = new Order({
      buyer: new mongoose.Types.ObjectId(),
      products: ["not-an-objectid"],
    });

    let error;
    try {
      await order.validate();
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
  });

  it("should add timestamps automatically", async () => {
    const order = new Order({
      buyer: new mongoose.Types.ObjectId(),
      products: [new mongoose.Types.ObjectId()],
    });

    await order.save();

    expect(order.createdAt).toBeDefined();
    expect(order.updatedAt).toBeDefined();
  });
});
