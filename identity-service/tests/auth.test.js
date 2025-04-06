import { login, refresh, logout } from "../controllers/auth.controller.js";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import * as generateToken from "../utils/generateToken.js";

// Mock dependencies
jest.mock("../../models/user.model.js");
jest.mock("jsonwebtoken");
jest.mock("../../utils/generateToken.js");

describe("Auth Controller", () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {
      body: {},
      cookies: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      cookie: jest.fn(),
      clearCookie: jest.fn(),
    };
    next = jest.fn();

    // Clear all mocks
    jest.clearAllMocks();
  });

  describe("login", () => {
    test("should return 400 if email or password is missing", async () => {
      // Arrange
      req.body = { email: "test@example.com" }; // Missing password

      // Act & Assert
      await expect(login(req, res)).rejects.toThrow(
        "Email and password are required"
      );
      expect(res.status).toHaveBeenCalledWith(400);
    });

    test("should return 401 if user not found", async () => {
      // Arrange
      req.body = { email: "test@example.com", password: "password123" };
      User.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

      // Act & Assert
      await expect(login(req, res)).rejects.toThrow(
        "Invalid email or password"
      );
      expect(res.status).toHaveBeenCalledWith(401);
    });

    test("should return 401 if password is invalid", async () => {
      // Arrange
      req.body = { email: "test@example.com", password: "password123" };
      const mockUser = {
        matchPassword: jest.fn().mockResolvedValue(false),
      };
      User.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      });

      // Act & Assert
      await expect(login(req, res)).rejects.toThrow(
        "Invalid email or password"
      );
      expect(res.status).toHaveBeenCalledWith(401);
    });

    test("should return user data and tokens if login is successful", async () => {
      // Arrange
      req.body = { email: "test@example.com", password: "password123" };
      const mockUser = {
        _id: "user123",
        firstName: "John",
        lastName: "Doe",
        email: "test@example.com",
        nic: "123456789",
        phone: "1234567890",
        role: "user",
        createdAt: new Date(),
        updatedAt: new Date(),
        matchPassword: jest.fn().mockResolvedValue(true),
      };
      User.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      });

      const mockAccessToken = "access-token-123";
      const mockRefreshToken = "refresh-token-123";
      generateToken.createAccessToken.mockReturnValue(mockAccessToken);
      generateToken.createRefreshToken.mockReturnValue(mockRefreshToken);

      // Act
      await login(req, res);

      // Assert
      expect(res.cookie).toHaveBeenCalledWith(
        "refreshToken",
        mockRefreshToken,
        {
          httpOnly: true,
          secure: true,
          sameSite: "None",
          maxAge: 7 * 24 * 60 * 60 * 1000,
        }
      );
      expect(res.json).toHaveBeenCalledWith({
        user: {
          id: mockUser._id,
          firstName: mockUser.firstName,
          lastName: mockUser.lastName,
          email: mockUser.email,
          nic: mockUser.nic,
          phone: mockUser.phone,
          role: mockUser.role,
          createdAt: mockUser.createdAt,
          updatedAt: mockUser.updatedAt,
        },
        accessToken: mockAccessToken,
      });
    });
  });

  // describe("refresh", () => {
  //   test("should return 401 if refresh token is missing", async () => {
  //     // Arrange
  //     req.cookies = {}; // No refreshToken

  //     // Act & Assert
  //     await expect(refresh(req, res)).rejects.toThrow("Refresh token required");
  //     expect(res.status).toHaveBeenCalledWith(401);
  //   });

  //   test("should return 403 if refresh token is invalid", async () => {
  //     // Arrange
  //     req.cookies = { refreshToken: "invalid-token" };
  //     jwt.verify.mockImplementation(() => {
  //       throw new Error("Invalid token");
  //     });

  //     // Act & Assert
  //     await expect(refresh(req, res)).rejects.toThrow("Invalid refresh token");
  //     expect(res.status).toHaveBeenCalledWith(403);
  //   });

  //   test("should return 404 if user not found after token verification", async () => {
  //     // Arrange
  //     req.cookies = { refreshToken: "valid-token" };
  //     jwt.verify.mockReturnValue({ id: "non-existent-user" });
  //     User.findById.mockReturnValue({
  //       exec: jest.fn().mockResolvedValue(null),
  //     });

  //     // Act & Assert
  //     await expect(refresh(req, res)).rejects.toThrow("User not found");
  //     expect(res.status).toHaveBeenCalledWith(404);
  //   });

  //   test("should return new access token if refresh token is valid", async () => {
  //     // Arrange
  //     req.cookies = { refreshToken: "valid-token" };
  //     const userId = "user123";
  //     jwt.verify.mockReturnValue({ id: userId });

  //     const mockUser = { _id: userId };
  //     User.findById.mockReturnValue({
  //       exec: jest.fn().mockResolvedValue(mockUser),
  //     });

  //     const newAccessToken = "new-access-token";
  //     generateToken.createAccessToken.mockReturnValue(newAccessToken);

  //     // Act
  //     await refresh(req, res);

  //     // Assert
  //     expect(jwt.verify).toHaveBeenCalledWith(
  //       "valid-token",
  //       process.env.REFRESH_TOKEN_SECRET
  //     );
  //     expect(User.findById).toHaveBeenCalledWith(userId);
  //     expect(generateToken.createAccessToken).toHaveBeenCalledWith(
  //       mockUser,
  //       process.env.ACCESS_TOKEN_SECRET
  //     );
  //     expect(res.status).toHaveBeenCalledWith(200);
  //     expect(res.json).toHaveBeenCalledWith({
  //       accessToken: newAccessToken,
  //     });
  //   });
  // });

  describe("logout", () => {
    test("should return 204 if no refresh token cookie exists", async () => {
      // Arrange
      req.cookies = {};

      // Act
      await logout(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "No content",
      });
      expect(res.clearCookie).not.toHaveBeenCalled();
    });

    test("should clear cookie and return success message on logout", async () => {
      // Arrange
      req.cookies = { refreshToken: "token-to-clear" };

      // Act
      await logout(req, res);

      // Assert
      expect(res.clearCookie).toHaveBeenCalledWith("refreshToken", {
        httpOnly: true,
        sameSite: "None",
        secure: true,
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Logged out successfully",
      });
    });
  });
});
