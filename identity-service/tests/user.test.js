import chai, { use, request } from "chai/chai";
import chaiHttp from "chai-http";
import { stub } from "sinon";
import { Types } from "mongoose";
const { expect } = chai;

// Import the models and other required modules
import User from "../models/user.model";
import {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getCurrentUserProfile,
  updateCurrentUserProfile,
} from "../controllers/user.controller";

use(chaiHttp);

// Mock server setup
import express, { json } from "express";
const app = express();
app.use(json());

// Middleware to simulate authenticated user
const authMiddleware = (req, res, next) => {
  req.user = {
    id: "123456789012345678901234", // Mock user ID
    role: "admin",
  };
  next();
};

// Set up user routes for testing
app.post("/api/v1/users", authMiddleware, createUser);
app.get("/api/v1/users", authMiddleware, getAllUsers);
app.get("/api/v1/users/:id", authMiddleware, getUserById);
app.put("/api/v1/users/:id", authMiddleware, updateUser);
app.delete("/api/v1/users/:id", authMiddleware, deleteUser);
app.get("/api/v1/users/profile", authMiddleware, getCurrentUserProfile);
app.put("/api/v1/users/profile", authMiddleware, updateCurrentUserProfile);

describe("User Controller", () => {
  let server;
  let userStub;
  let findOneStub;
  let findByIdStub;
  let findByIdAndUpdateStub;
  let findByIdAndDeleteStub;

  before(async () => {
    // Start the server
    server = app.listen(5001);
  });

  after(async () => {
    // Close the server
    await server.close();
  });

  beforeEach(() => {
    // Create stubs before each test
    findOneStub = stub(User, "findOne");
    findByIdStub = stub(User, "findById");
    findByIdAndUpdateStub = stub(User, "findByIdAndUpdate");
    findByIdAndDeleteStub = stub(User, "findByIdAndDelete");
    userStub = stub(User, "create");
    findStub = stub(User, "find");
  });

  afterEach(() => {
    // Restore stubs after each test
    findOneStub.restore();
    findByIdStub.restore();
    findByIdAndUpdateStub.restore();
    findByIdAndDeleteStub.restore();
    userStub.restore();
    findStub.restore();
  });

  describe("POST /api/v1/users", () => {
    it("should return 400 if required fields are missing", async () => {
      const res = await request(app)
        .post("/api/users")
        .send({ firstName: "Test" }); // Missing other required fields

      expect(res).to.have.status(400);
      expect(res.body).to.have.property("message", "All fields are required");
    });

    it("should return 400 if role is invalid", async () => {
      const res = await request(app).post("/api/v1/users").send({
        firstName: "Test",
        lastName: "User",
        email: "test@example.com",
        nic: "123456789",
        phone: "1234567890",
        password: "password123",
        role: "invalidRole",
      });

      expect(res).to.have.status(400);
      expect(res.body).to.have.property("message", "Invalid role provided");
    });

    it("should return 400 if email already exists", async () => {
      findOneStub
        .withArgs({ email: "existing@example.com" })
        .returns(Promise.resolve({ email: "existing@example.com" }));

      const res = await request(app).post("/api/v1/users").send({
        firstName: "Test",
        lastName: "User",
        email: "existing@example.com",
        nic: "123456789",
        phone: "1234567890",
        password: "password123",
      });

      expect(res).to.have.status(400);
      expect(res.body).to.have.property("message", "Email already exists");
    });

    it("should return 400 if NIC already exists", async () => {
      findOneStub
        .withArgs({ email: "test@example.com" })
        .returns(Promise.resolve(null));
      findOneStub
        .withArgs({ nic: "existing-nic" })
        .returns(Promise.resolve({ nic: "existing-nic" }));

      const res = await request(app).post("/api/users").send({
        firstName: "Test",
        lastName: "User",
        email: "test@example.com",
        nic: "existing-nic",
        phone: "1234567890",
        password: "password123",
      });

      expect(res).to.have.status(400);
      expect(res.body).to.have.property("message", "NIC already exists");
    });

    it("should create a new user successfully", async () => {
      findOneStub.returns(Promise.resolve(null));

      const userId = new Types.ObjectId();
      const newUser = {
        _id: userId,
        firstName: "Test",
        lastName: "User",
        email: "test@example.com",
        nic: "123456789",
        phone: "1234567890",
        role: "student",
        createdAt: new Date(),
      };

      userStub.returns(Promise.resolve(newUser));

      const res = await request(app).post("/api/users").send({
        firstName: "Test",
        lastName: "User",
        email: "test@example.com",
        nic: "123456789",
        phone: "1234567890",
        password: "password123",
      });

      expect(res).to.have.status(201);
      expect(res.body).to.have.property("success", true);
      expect(res.body).to.have.property("data");
      expect(res.body.data).to.have.property("id", userId.toString());
      expect(res.body.data).to.have.property("email", "test@example.com");
    });
  });

  describe("GET /api/v1//users", () => {
    it("should get all users", async () => {
      const users = [
        {
          _id: new Types.ObjectId(),
          firstName: "User",
          lastName: "One",
          email: "user1@example.com",
          nic: "111111111",
          phone: "1111111111",
          role: "student",
          createdAt: new Date(),
        },
        {
          _id: new Types.ObjectId(),
          firstName: "User",
          lastName: "Two",
          email: "user2@example.com",
          nic: "222222222",
          phone: "2222222222",
          role: "lecturer",
          createdAt: new Date(),
        },
      ];

      findStub.returns({
        select: () => ({
          sort: () => Promise.resolve(users),
        }),
      });

      const res = await request(app).get("/api/v1/users");

      expect(res).to.have.status(200);
      expect(res.body).to.have.property("success", true);
      expect(res.body).to.have.property("count", 2);
      expect(res.body)
        .to.have.property("data")
        .to.be.an("array")
        .with.lengthOf(2);
    });

    it("should filter users by search query", async () => {
      const users = [
        {
          _id: new Types.ObjectId(),
          firstName: "John",
          lastName: "Doe",
          email: "john@example.com",
          nic: "111111111",
          phone: "1111111111",
          role: "student",
          createdAt: new Date(),
        },
      ];

      findStub.returns({
        select: () => ({
          sort: () => Promise.resolve(users),
        }),
      });

      const res = await request(app).get("/api/v1/users?search=john");

      expect(res).to.have.status(200);
      expect(res.body).to.have.property("count", 1);
      expect(res.body.data[0]).to.have.property("firstName", "John");
    });
  });

  describe("GET /api/users/:id", () => {
    it("should return 404 if user not found", async () => {
      findByIdStub.returns({
        select: () => Promise.resolve(null),
      });

      const res = await request(app).get("/api/v1/users/nonexistentid");

      expect(res).to.have.status(404);
      expect(res.body).to.have.property("message", "User not found");
    });

    it("should get user by ID successfully", async () => {
      const userId = new Types.ObjectId();
      const user = {
        _id: userId,
        firstName: "Test",
        lastName: "User",
        email: "test@example.com",
        nic: "123456789",
        phone: "1234567890",
        role: "student",
      };

      findByIdStub.returns({
        select: () => Promise.resolve(user),
      });

      const res = await request(app).get(`/api/v1/users/${userId}`);

      expect(res).to.have.status(200);
      expect(res.body).to.have.property("success", true);
      expect(res.body).to.have.property("data");
      expect(res.body.data).to.have.property("_id", userId.toString());
    });
  });

  describe("PUT /api/v1/users/:id", () => {
    it("should return 404 if user not found", async () => {
      findByIdStub.returns(Promise.resolve(null));

      const res = await request(app)
        .put("/api/users/nonexistentid")
        .send({ firstName: "Updated" });

      expect(res).to.have.status(404);
      expect(res.body).to.have.property("message", "User not found");
    });

    it("should return 400 if no fields provided to update", async () => {
      const userId = new Types.ObjectId();
      findByIdStub.returns(Promise.resolve({ _id: userId }));

      const res = await request(app).put(`/api/v1/users/${userId}`).send({});

      expect(res).to.have.status(400);
      expect(res.body).to.have.property(
        "message",
        "Please provide at least one field to update"
      );
    });

    it("should update user successfully", async () => {
      const userId = new Types.ObjectId();
      const user = {
        _id: userId,
        firstName: "Test",
        lastName: "User",
        email: "test@example.com",
        nic: "123456789",
        phone: "1234567890",
        role: "student",
      };

      findByIdStub.returns(Promise.resolve(user));
      findOneStub.returns(Promise.resolve(null)); // No email or NIC conflicts
      findByIdAndUpdateStub.returns(
        Promise.resolve({
          ...user,
          firstName: "Updated",
          select: () => ({
            ...user,
            firstName: "Updated",
          }),
        })
      );

      const res = await request(app)
        .put(`/api/v1/users/${userId}`)
        .send({ firstName: "Updated" });

      expect(res).to.have.status(200);
      expect(res.body).to.have.property("success", true);
      expect(res.body)
        .to.have.property("message")
        .that.includes("updated successfully");
    });
  });

  describe("DELETE /api/v1/users/:id", () => {
    it("should return 400 if ID is not provided", async () => {
      findByIdStub.returns(Promise.resolve(null));

      const res = await request(app).delete("/api/users/");

      expect(res).to.have.status(404); // Express router will return 404 for this route
    });

    it("should return 404 if user not found", async () => {
      findByIdStub.returns(Promise.resolve(null));

      const res = await request(app).delete("/api/v1/users/nonexistentid");

      expect(res).to.have.status(404);
      expect(res.body).to.have.property("message", "User not found");
    });

    it("should delete user successfully", async () => {
      const userId = new Types.ObjectId();
      const user = {
        _id: userId,
        firstName: "Test",
        lastName: "User",
      };

      findByIdStub.returns(Promise.resolve(user));
      findByIdAndDeleteStub.returns(Promise.resolve(true));

      const res = await request(app).delete(`/api/v1/users/${userId}`);

      expect(res).to.have.status(200);
      expect(res.body).to.have.property("success", true);
      expect(res.body)
        .to.have.property("message")
        .that.includes("deleted successfully");
    });
  });
});
