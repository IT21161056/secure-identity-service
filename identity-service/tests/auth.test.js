import chai, { request } from "chai/chai";
import chaiHttp from "chai-http";
import { stub } from "sinon";
import jwt from "jsonwebtoken";
import { Types } from "mongoose";
const { expect } = chai;

// Import the models and other required modules
import User from "../models/user.model";
import { login, refresh, logout } from "../controllers/auth.controller";

// Mock server setup
import express, { json } from "express";
const app = express();
app.use(json());
import cookieParser from "cookie-parser";
import { resolve } from "path";
app.use(cookieParser());

// Set up auth routes for testing
app.post("/api/v1/auth/login", login);
app.get("/api/v1/auth/refresh", refresh);
app.post("/api/v1/auth/logout", logout);

describe("Authentication Controller", () => {
  let server;
  let userStub;
  let tokenStub;

  before(async () => {
    server = app.listen(5016); // Start the server

    process.env.ACCESS_TOKEN_SECRET = "test_access_secret";
    process.env.REFRESH_TOKEN_SECRET = "test_refresh_secret";
  });

  after(async () => {
    await server.close(); // Close the server after tests
  });

  beforeEach(() => {
    userStub = stub(User, "findOne"); // Create stubs before each test
    tokenStub = stub(jwt, "verify");
  });

  afterEach(() => {
    userStub.restore(); // Restore the stub after each test
    tokenStub.restore();
  });

  describe("POST /api/v1/auth/login", () => {
    it("should retuen 400 if email is missing", async () => {
      const res = await request(app).post("/api/v1/auth/login").send({
        password: "password123",
      });
      expect(res).to.have.status(400);
      expect(res.body).to.have.property(
        "message",
        "Email and password are required."
      );
    });

    it("should retuen 400 if password is missing", async () => {
      const res = await request(app).post("/api/v1/auth/login").send({
        email: "test@example.com",
      });
      expect(res).to.have.status(400);
      expect(res.body).to.have.property(
        "message",
        "Email and password are required."
      );
    });

    it("should retuen 401 if user not found", async () => {
      const res = await request(app).post("/api/v1/auth/login").send({
        email: "nonexistent@example.com",
        password: "password123",
      });
      expect(res).to.have.status(400);
      expect(res.body).to.have.property(
        "message",
        "Invalid email and password."
      );
    });

    it("should retuen 401 if password invalid", async () => {
      const mockUser = {
        _id: new Types.ObjectId(),
        firstName: "Test",
        lastName: "User",
        email: "test@exampple.com",
        nic: "123456789V",
        phone: "1234567890",
        role: "user",
        createdAt: new Date(),
        updatedAt: new Date(),
        matchPassword: stub().returns(Promise.resolve(false)),
      };

      userStub.returns(Promise.resolve(mockUser));

      const res = await request(app).post("/api/v1/auth/login").send({
        email: "test@example.com",
        password: "wrongpassword",
      });
      expect(res).to.have.status(400);
      expect(res.body).to.have.property(
        "message",
        "Invalid email and password."
      );
    });

    it("should login successfully and return user with access token", async () => {
      const userId = new Types.ObjectId();
      const mockUser = {
        _id: userId,
        firstName: "Test",
        lastName: "User",
        email: "test@exampple.com",
        nic: "123456789V",
        phone: "1234567890",
        role: "user",
        createdAt: new Date(),
        updatedAt: new Date(),
        matchPassword: stub().returns(Promise.resolve(false)),
      };

      userStub.returns(Promise.resolve(mockUser));

      const res = await request(app).post("/api/v1/auth/login").send({
        email: "test@example.com",
        password: "password123",
      });
      expect(res).to.have.status(200);
      expect(res.body).to.have.property("user");
      expect(res.body).to.have.property("accessToken");
      expect(res.body.user).to.have.property("email", "test@example.com");
      expect(res.body.user).to.have.property("id", "userId.toString()");
      expect(res.body.user).to.cookie("refreshToken");
    });
  });

  describe("GET /api/auth/refresh", () => {
    it("should return 401 if refresh token is missing", async () => {
      const res = await request(app).get("/api/v1/auth/refresh");

      expect(res).to.have.status(401);
      expect(res.body).to.have.property("message", "Refresh token required");
    });

    it("should return 403 if refresh token is invalid", async () => {
      tokenStub.throws(new Error("Invalid token"));

      const res = await request(app)
        .get("/api/v1/auth/refresh")
        .set("Cookie", "refreshToken=invalid_token");

      expect(res).to.have.status(403);
      expect(res.body).to.have.property("message", "Invalid refresh token");
    });

    it("should return 404 if user not found", async () => {
      const mockDecoded = { id: new Types.ObjectId() };
      tokenStub.returns(mockDecoded);

      const findByIdStub = stub(User, "findById").returns({
        exec: () => Promise.resolve(null),
      });

      const res = await request(app)
        .get("/api/v1/auth/refresh")
        .set("Cookie", "refreshToken=valid_token");

      expect(res).to.have.status(404);
      expect(res.body).to.have.property("message", "User not found");

      findByIdStub.restore();
    });

    it("should return new access token if refresh token is valid", async () => {
      const userId = new Types.ObjectId();
      const mockDecoded = { id: userId };
      tokenStub.returns(mockDecoded);

      const mockUser = {
        _id: userId,
        firstName: "Test",
        lastName: "User",
        email: "test@example.com",
        role: "user",
      };

      const findByIdStub = stub(User, "findById").returns({
        exec: () => Promise.resolve(mockUser),
      });

      const res = await request(app)
        .get("/api/v1/auth/refresh")
        .set("Cookie", "refreshToken=valid_token");

      expect(res).to.have.status(200);
      expect(res.body).to.have.property("accessToken");

      findByIdStub.restore();
    });
  });

  describe("POST /api/v1/auth/logout", () => {
    it("should return 204 if refresh token is not provided", async () => {
      const res = await request(app).post("/api/v1/auth/logout");

      expect(res).to.have.status(204);
    });

    it("should clear refresh token cookie and return 200", async () => {
      const res = await request(app)
        .post("/api/v1/auth/logout")
        .set("Cookie", "refreshToken=token_to_clear");

      expect(res).to.have.status(200);
      expect(res.body).to.have.property("message", "Logged out successfully");
      // Check that the cookie has been cleared
      expect(res).to.have.cookie("refreshToken", "");
    });
  });
});
