import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

import * as authControllers from "../controllers/authController.js";

// Import routes and models
import authRoutes from "../routes/authRoute.js";
import categoryRoutes from "../routes/categoryRoutes.js";
import productRoutes from "../routes/productRoutes.js";
import userModel from "../models/userModel.js";
import categoryModel from "../models/categoryModel.js";
import productModel from "../models/productModel.js";
import { comparePassword, hashPassword } from "../helpers/authHelper.js";
import { describe } from "node:test";

// Configure environment
dotenv.config();

// Create Express app for testing
const createTestApp = () => {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(morgan("dev"));

  // Routes
  app.use("/api/v1/auth", authRoutes);
  app.use("/api/v1/category", categoryRoutes);
  app.use("/api/v1/product", productRoutes);

  // app.post("/api/v1/auth/register", authControllers.registerController);

  return app;
};

//recommended by AI to prevent errors during testing
jest.mock("braintree", () => ({
  BraintreeGateway: jest.fn().mockImplementation(() => ({
    transaction: {
      sale: jest.fn().mockResolvedValue({ success: true }),
    },
  })),
  Environment: { Sandbox: "sandbox" },
}));

const testUser = {
  name: "Test User",
  email: "testuser@example.com",
  password: "password123",
  phone: "1234567890",
  address: "123 Test St",
  answer: "test answer",
};

describe("AuthController integration Tests", () => {
  let mongoServer;
  let app;

  beforeAll(async () => {
    // Start MongoDB Memory Server
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    // Connect to in-memory database
    await mongoose.connect(mongoUri);

    // Create test app
    app = createTestApp();
  });

  afterAll(async () => {
    // Clean up
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  afterEach(async () => {
    await userModel.deleteMany({});
  });

  describe("registerController", (req, res) => {
    test("should register a new user successfully and without admin access", async () => {
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send(testUser);
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("success", true);

      // expect this user not to have admin access
      const user = await userModel.findOne({ email: testUser.email });

      expect(user).toHaveProperty("role", 0); // 0 is the role for regular users
    });
  });

  describe("loginController", () => {
    test("should be able to authenticate after registering and logging in", async () => {
      // Register the user
      const registerRes = await request(app)
        .post("/api/v1/auth/register")
        .send({
          name: "Test User",
          email: "testuser@example.com",
          password: "password123",
          phone: "1234567890",
          address: "123 Test St",
          answer: "test answer",
        });

      expect(registerRes.statusCode).toBe(201);
      expect(registerRes.body).toHaveProperty("success", true);

      // Login to get the token
      const loginRes = await request(app).post("/api/v1/auth/login").send({
        email: "testuser@example.com",
        password: "password123",
      });

      expect(loginRes.statusCode).toBe(200);
      expect(loginRes.body).toHaveProperty("success", true);
      expect(loginRes.body).toHaveProperty("token");

      // Use the token to authenticate
      const token = loginRes.body.token;
      console.log("token", token);
      const authRes = await request(app)
        .get("/api/v1/auth/user-auth")
        .set("Authorization", `Bearer ${token}`);

      expect(authRes.statusCode).toBe(200);
      expect(authRes.body).toHaveProperty("ok", true);
    });

    test("should fail authenticate with unregistered email", async () => {
      // Attempt to login without registering
      const loginRes = await request(app).post("/api/v1/auth/login").send({
        email: "unregistered@example.com",
        password: "password123",
      });

      expect(loginRes.statusCode).toBe(401);
      expect(loginRes.body).toHaveProperty("success", false);
      expect(loginRes.body).toHaveProperty(
        "message",
        "Email is not registered"
      );
    });

    test("should fail authenticate with invalid login password", async () => {
      // Register the user
      const registerRes = await request(app)
        .post("/api/v1/auth/register")
        .send({
          name: "Test User",
          email: "testuser@example.com",
          password: "password123",
          phone: "1234567890",
          address: "123 Test St",
          answer: "test answer",
        });

      expect(registerRes.statusCode).toBe(201);
      expect(registerRes.body).toHaveProperty("success", true);

      // login with incorrect password
      const loginRes = await request(app).post("/api/v1/auth/login").send({
        email: "testuser@example.com",
        password: "wrongpassword",
      });

      expect(loginRes.statusCode).toBe(401);
      expect(loginRes.body).toHaveProperty("success", false);
      expect(loginRes.body).toHaveProperty("message", "Invalid Password");
    });
  });

  describe("forgotPasswordController", () => {
    test("should reset password with correct email and answer", async () => {
      const password1 = testUser.password;
      const hashedPassword = await hashPassword(password1);

      const newPassword = "newpassword123";
      const hashedNewPassword = await hashPassword(newPassword);
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send(testUser);

      // try to login
      const user = await userModel.findOne({ email: testUser.email });

      const originalPassword = user.password;

      expect(comparePassword(password1, originalPassword)).resolves.toBe(true);

      // try to reset password
      const res2 = await request(app)
        .post("/api/v1/auth/forgot-password")
        .send({
          email: "testuser@example.com",
          answer: "test answer",
          newPassword: "newpassword123",
        });

      expect(res2.statusCode).toBe(200);
      expect(res2.body).toHaveProperty("success", true);
      // verify password is updated
      const updatedUser = await userModel.findOne({
        email: "testuser@example.com",
      });

      const updatedPassword = updatedUser.password;
      expect(comparePassword(newPassword, updatedPassword)).resolves.toBe(true);
    });

    test("should not reset password with incorrect answer", async () => {
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send(testUser);

      // try to reset password
      const res2 = await request(app)
        .post("/api/v1/auth/forgot-password")
        .send({
          email: testUser.email,
          answer: "test answer wrong",
          newPassword: "newpassword123",
        });

      expect(res2.statusCode).toBe(401);

      expect(res2.body).toHaveProperty("success", false);
      expect(res2.body).toHaveProperty("message", "Wrong Email Or Answer");

      const notUpdatedUser = await userModel.findOne({
        email: testUser.email,
      });

      expect(
        comparePassword("newpassword123", notUpdatedUser.password)
      ).resolves.toBe(false);
    });
  });

  describe("updateProfileController", () => {
    test("should update user profile successfully", async () => {
      // Register the user
      const registerRes = await request(app)
        .post("/api/v1/auth/register")
        .send(testUser);

      expect(registerRes.statusCode).toBe(201);
      expect(registerRes.body).toHaveProperty("success", true);

      // Login to get the token
      const loginRes = await request(app).post("/api/v1/auth/login").send({
        email: testUser.email,
        password: testUser.password,
      });

      expect(loginRes.statusCode).toBe(200);
      expect(loginRes.body).toHaveProperty("success", true);
      expect(loginRes.body).toHaveProperty("token");

      const token = loginRes.body.token;

      // Update profile
      const updatedData = {
        name: "Updated User",
        phone: "0987654321",
        address: "456 Updated St",
      };

      const updateRes = await request(app)
        .put("/api/v1/auth/profile")
        .set("Authorization", `Bearer ${token}`)
        .send(updatedData);

      expect(updateRes.statusCode).toBe(200);
      expect(updateRes.body).toHaveProperty("success", true);
      expect(updateRes.body).toHaveProperty(
        "message",
        "Profile Updated Successfully"
      );

      // Verify updates in database
      const updatedUser = await userModel.findOne({ email: testUser.email });
      expect(updatedUser.name).toBe(updatedData.name);
      expect(updatedUser.phone).toBe(updatedData.phone);
      expect(updatedUser.address).toBe(updatedData.address);
    });
  });

  describe("Route protection middleware integration", () => {
    test("should protect user-auth route and allow access with valid token", async () => {
      // Register the user
      const registerRes = await request(app)
        .post("/api/v1/auth/register")
        .send(testUser);

      expect(registerRes.statusCode).toBe(201);
      expect(registerRes.body).toHaveProperty("success", true);

      // Login to get the token
      const loginRes = await request(app).post("/api/v1/auth/login").send({
        email: testUser.email,
        password: testUser.password,
      });

      expect(loginRes.statusCode).toBe(200);
      expect(loginRes.body).toHaveProperty("success", true);
      expect(loginRes.body).toHaveProperty("token");

      const token = loginRes.body.token;

      // Access protected route
      const authRes = await request(app)
        .get("/api/v1/auth/user-auth")
        .set("Authorization", `Bearer ${token}`);

      expect(authRes.statusCode).toBe(200);
      expect(authRes.body).toHaveProperty("ok", true);
    });

    test("should protect user-auth route and deny access with invalid token", async () => {
      // Access protected route with invalid token
      const authRes = await request(app)
        .get("/api/v1/auth/user-auth")
        .set("Authorization", `Bearer invalidtoken`);

      expect(authRes.statusCode).toBe(401);
      expect(authRes.body).toHaveProperty("success", false);
      expect(authRes.body).toHaveProperty("message", "Unauthorized Access");
    });
  });

  describe("Route protection (admin) middleware integration", () => {
    test("should deny access to admin route for non-admin user", async () => {
      // Register the user
      const registerRes = await request(app)
        .post("/api/v1/auth/register")
        .send(testUser);
      expect(registerRes.statusCode).toBe(201);
      expect(registerRes.body).toHaveProperty("success", true);
      // Login to get the token
      const loginRes = await request(app).post("/api/v1/auth/login").send({
        email: testUser.email,
        password: testUser.password,
      });
      expect(loginRes.statusCode).toBe(200);
      expect(loginRes.body).toHaveProperty("success", true);
      expect(loginRes.body).toHaveProperty("token");
      const token = loginRes.body.token;
      // Attempt to access admin route
      const adminRes = await request(app)
        .get("/api/v1/auth/admin-auth")
        .set("Authorization", `Bearer ${token}`)
        .send();

      expect(adminRes.statusCode).toBe(403);
      expect(adminRes.body).toHaveProperty("success", false);
      expect(adminRes.body).toHaveProperty("message", "Forbidden Access");
    });
  });
});
