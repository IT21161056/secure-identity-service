import {
  createUser,
  getAllUsers,
  getUserById,
  deleteUser,
} from "../../controllers/user.controller.js";
import User from "../../models/user.model.js";

// Mock dependencies
jest.mock("../../models/user.model.js");

describe("User Controller", () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      query: {},
      user: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();

    // Clear all mocks
    jest.clearAllMocks();
  });

  describe("createUser", () => {
    test("should return 400 if required fields are missing", async () => {
      // Arrange
      req.body = { firstName: "John", lastName: "Doe" }; // Missing other required fields

      // Act & Assert
      await expect(createUser(req, res)).rejects.toThrow(
        "All fields are required"
      );
      expect(res.status).toHaveBeenCalledWith(400);
    });

    test("should return 400 if invalid role is provided", async () => {
      // Arrange
      req.body = {
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        nic: "123456789",
        phone: "1234567890",
        password: "password123",
        role: "invalid-role",
      };

      // Act & Assert
      await expect(createUser(req, res)).rejects.toThrow(
        "Invalid role provided"
      );
      expect(res.status).toHaveBeenCalledWith(400);
    });

    test("should return 400 if email already exists", async () => {
      // Arrange
      req.body = {
        firstName: "John",
        lastName: "Doe",
        email: "existing@example.com",
        nic: "123456789",
        phone: "1234567890",
        password: "password123",
      };

      User.findOne.mockResolvedValueOnce({ email: "existing@example.com" });

      // Act & Assert
      await expect(createUser(req, res)).rejects.toThrow(
        "Email already exists"
      );
      expect(res.status).toHaveBeenCalledWith(400);
    });

    test("should return 400 if NIC already exists", async () => {
      // Arrange
      req.body = {
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        nic: "existing-nic",
        phone: "1234567890",
        password: "password123",
      };

      User.findOne.mockResolvedValueOnce(null); // Email doesn't exist
      User.findOne.mockResolvedValueOnce({ nic: "existing-nic" }); // NIC exists

      // Act & Assert
      await expect(createUser(req, res)).rejects.toThrow("NIC already exists");
      expect(res.status).toHaveBeenCalledWith(400);
    });

    test("should create user successfully with default role", async () => {
      // Arrange
      const userData = {
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        nic: "123456789",
        phone: "1234567890",
        password: "password123",
      };

      req.body = userData;

      User.findOne.mockResolvedValue(null); // No existing user

      const createdUser = {
        _id: "user123",
        ...userData,
        role: "student",
        createdAt: new Date(),
      };

      User.create.mockResolvedValue(createdUser);

      // Act
      await createUser(req, res);

      // Assert
      expect(User.create).toHaveBeenCalledWith({
        ...userData,
        role: "student",
      });

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: `User ${createdUser.firstName} ${createdUser.lastName} created successfully`,
        data: {
          id: createdUser._id,
          firstName: createdUser.firstName,
          lastName: createdUser.lastName,
          email: createdUser.email,
          nic: createdUser.nic,
          phone: createdUser.phone,
          role: createdUser.role,
          createdAt: createdUser.createdAt,
        },
      });
    });

    test("should create user successfully with provided role", async () => {
      // Arrange
      const userData = {
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        nic: "123456789",
        phone: "1234567890",
        password: "password123",
        role: "admin",
      };

      req.body = userData;

      User.findOne.mockResolvedValue(null); // No existing user

      const createdUser = {
        _id: "user123",
        ...userData,
        createdAt: new Date(),
      };

      User.create.mockResolvedValue(createdUser);

      // Act
      await createUser(req, res);

      // Assert
      expect(User.create).toHaveBeenCalledWith(userData);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: `User ${createdUser.firstName} ${createdUser.lastName} created successfully`,
        data: {
          id: createdUser._id,
          firstName: createdUser.firstName,
          lastName: createdUser.lastName,
          email: createdUser.email,
          nic: createdUser.nic,
          phone: createdUser.phone,
          role: createdUser.role,
          createdAt: createdUser.createdAt,
        },
      });
    });

    test("should return 400 if user creation fails", async () => {
      // Arrange
      const userData = {
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        nic: "123456789",
        phone: "1234567890",
        password: "password123",
      };

      req.body = userData;

      User.findOne.mockResolvedValue(null); // No existing user
      User.create.mockResolvedValue(null); // Creation fails

      // Act & Assert
      await expect(createUser(req, res)).rejects.toThrow("Invalid user data");
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe("getAllUsers", () => {
    test("should return all users without filters", async () => {
      // Arrange
      const mockUsers = [
        { _id: "user1", firstName: "John", lastName: "Doe" },
        { _id: "user2", firstName: "Jane", lastName: "Smith" },
      ];

      const mockFindResult = {
        select: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockUsers),
      };

      User.find.mockReturnValue(mockFindResult);

      // Act
      await getAllUsers(req, res);

      // Assert
      expect(User.find).toHaveBeenCalledWith({});
      expect(mockFindResult.select).toHaveBeenCalledWith("-password -__v");
      expect(mockFindResult.sort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: mockUsers.length,
        data: mockUsers,
      });
    });

    test("should filter users based on query parameters", async () => {
      // Arrange
      req.query = {
        email: "example",
        role: "admin",
        firstName: "Jo",
        lastName: "Do",
        search: "john",
      };

      const mockUsers = [{ _id: "user1", firstName: "John", lastName: "Doe" }];

      const mockFindResult = {
        select: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockUsers),
      };

      User.find.mockReturnValue(mockFindResult);

      // Act
      await getAllUsers(req, res);

      // Assert
      expect(User.find).toHaveBeenCalledWith({
        email: { $regex: /example/i },
        role: "admin",
        firstName: { $regex: /Jo/i },
        lastName: { $regex: /Do/i },
        $or: [
          { firstName: { $regex: /john/i } },
          { lastName: { $regex: /john/i } },
          { email: { $regex: /john/i } },
        ],
      });

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: mockUsers.length,
        data: mockUsers,
      });
    });
  });

  describe("getUserById", () => {
    test("should return 404 if user is not found", async () => {
      // Arrange
      req.params.id = "nonexistent-id";

      const mockSelectResult = null;
      const mockFindByIdResult = {
        select: jest.fn().mockResolvedValue(mockSelectResult),
      };

      User.findById.mockReturnValue(mockFindByIdResult);

      // Act & Assert
      await expect(getUserById(req, res)).rejects.toThrow("User not found");
      expect(res.status).toHaveBeenCalledWith(404);
    });

    test("should return user if found", async () => {
      // Arrange
      req.params.id = "existing-id";

      const mockUser = {
        _id: "existing-id",
        firstName: "John",
        lastName: "Doe",
      };
      const mockFindByIdResult = {
        select: jest.fn().mockResolvedValue(mockUser),
      };

      User.findById.mockReturnValue(mockFindByIdResult);

      // Act
      await getUserById(req, res);

      // Assert
      expect(User.findById).toHaveBeenCalledWith("existing-id");
      expect(mockFindByIdResult.select).toHaveBeenCalledWith("-password");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockUser,
      });
    });
  });

  // describe("updateUser", () => {
  //   test("should return 404 if user is not found", async () => {
  //     // Arrange
  //     req.params.id = "nonexistent-id";
  //     User.findById.mockResolvedValue(null);

  //     // Act & Assert
  //     await expect(updateUser(req, res)).rejects.toThrow("User not found");
  //     expect(res.status).toHaveBeenCalledWith(404);
  //   });

  //   test("should return 400 if no fields are provided for update", async () => {
  //     // Arrange
  //     req.params.id = "existing-id";
  //     req.body = {}; // No fields to update

  //     User.findById.mockResolvedValue({ _id: "existing-id" });

  //     // Act & Assert
  //     await expect(updateUser(req, res)).rejects.toThrow(
  //       "Please provide at least one field to update"
  //     );
  //     expect(res.status).toHaveBeenCalledWith(400);
  //   });

  //   test("should return 400 if email already exists", async () => {
  //     // Arrange
  //     req.params.id = "existing-id";
  //     req.body = { email: "new@example.com" };

  //     const mockUser = {
  //       _id: "existing-id",
  //       email: "old@example.com",
  //     };

  //     User.findById.mockResolvedValue(mockUser);
  //     User.findOne.mockResolvedValue({
  //       _id: "another-id",
  //       email: "new@example.com",
  //     });

  //     // Act & Assert
  //     await expect(updateUser(req, res)).rejects.toThrow(
  //       "Email already exists"
  //     );
  //     expect(res.status).toHaveBeenCalledWith(400);
  //   });

  //   test("should return 400 if NIC already exists", async () => {
  //     // Arrange
  //     req.params.id = "existing-id";
  //     req.body = { nic: "new-nic" };

  //     const mockUser = {
  //       _id: "existing-id",
  //       nic: "old-nic",
  //     };

  //     User.findById.mockResolvedValue(mockUser);
  //     User.findOne.mockResolvedValueOnce(null); // Email check passes
  //     User.findOne.mockResolvedValueOnce({ _id: "another-id", nic: "new-nic" }); // NIC exists

  //     // Act & Assert
  //     await expect(updateUser(req, res)).rejects.toThrow("NIC already exists");
  //     expect(res.status).toHaveBeenCalledWith(400);
  //   });

  //   test("should update user successfully", async () => {
  //     // Arrange
  //     req.params.id = "existing-id";
  //     req.body = {
  //       firstName: "Updated",
  //       lastName: "User",
  //       email: "updated@example.com",
  //       nic: "updated-nic",
  //       phone: "9876543210",
  //       role: "admin",
  //       password: "newpassword",
  //     };

  //     const mockUser = {
  //       _id: "existing-id",
  //       firstName: "Original",
  //       lastName: "User",
  //       email: "original@example.com",
  //       nic: "original-nic",
  //     };

  //     const updatedUser = {
  //       _id: "existing-id",
  //       firstName: "Updated",
  //       lastName: "User",
  //       email: "updated@example.com",
  //       nic: "updated-nic",
  //       phone: "9876543210",
  //       role: "admin",
  //     };

  //     User.findById.mockResolvedValue(mockUser);
  //     User.findOne.mockResolvedValue(null); // No duplicate email or NIC
  //     User.findByIdAndUpdate.mockReturnValue({
  //       select: jest.fn().mockResolvedValue(updatedUser),
  //     });

  //     // Act
  //     await updateUser(req, res);

  //     // Assert
  //     expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
  //       "existing-id",
  //       req.body,
  //       { new: true, runValidators: true }
  //     );

  //     expect(res.status).toHaveBeenCalledWith(200);
  //     expect(res.json).toHaveBeenCalledWith({
  //       success: true,
  //       message: `User ${updatedUser.firstName} ${updatedUser.lastName} updated successfully`,
  //       data: updatedUser,
  //     });
  //   });
  // });

  describe("deleteUser", () => {
    test("should return 400 if user ID is not provided", async () => {
      // Arrange
      req.params = {}; // No ID

      // Act & Assert
      await expect(deleteUser(req, res)).rejects.toThrow("User ID is required");
      expect(res.status).toHaveBeenCalledWith(400);
    });

    test("should return 404 if user is not found", async () => {
      // Arrange
      req.params.id = "nonexistent-id";
      User.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(deleteUser(req, res)).rejects.toThrow("User not found");
      expect(res.status).toHaveBeenCalledWith(404);
    });

    test("should delete user successfully", async () => {
      // Arrange
      req.params.id = "existing-id";

      const mockUser = {
        _id: "existing-id",
        firstName: "John",
        lastName: "Doe",
      };

      User.findById.mockResolvedValue(mockUser);
      User.findByIdAndDelete.mockResolvedValue({});

      // Act
      await deleteUser(req, res);

      // Assert
      expect(User.findById).toHaveBeenCalledWith("existing-id");
      expect(User.findByIdAndDelete).toHaveBeenCalledWith("existing-id");

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: `User ${mockUser.firstName} ${mockUser.lastName} deleted successfully`,
      });
    });
  });

  // describe("getCurrentUserProfile", () => {
  //   test("should return 404 if user is not found", async () => {
  //     // Arrange
  //     req.user = { id: "nonexistent-id" };

  //     const mockSelectResult = null;
  //     const mockFindByIdResult = {
  //       select: jest.fn().mockResolvedValue(mockSelectResult),
  //     };

  //     User.findById.mockReturnValue(mockFindByIdResult);

  //     // Act & Assert
  //     await expect(getCurrentUserProfile(req, res)).rejects.toThrow(
  //       "User not found"
  //     );
  //     expect(res.status).toHaveBeenCalledWith(404);
  //   });

  //   test("should return current user profile", async () => {
  //     // Arrange
  //     req.user = { id: "current-user-id" };

  //     const mockUser = {
  //       _id: "current-user-id",
  //       firstName: "Current",
  //       lastName: "User",
  //     };

  //     const mockFindByIdResult = {
  //       select: jest.fn().mockResolvedValue(mockUser),
  //     };

  //     User.findById.mockReturnValue(mockFindByIdResult);

  //     // Act
  //     await getCurrentUserProfile(req, res);

  //     // Assert
  //     expect(User.findById).toHaveBeenCalledWith("current-user-id");
  //     expect(mockFindByIdResult.select).toHaveBeenCalledWith("-password");

  //     expect(res.status).toHaveBeenCalledWith(200);
  //     expect(res.json).toHaveBeenCalledWith({
  //       success: true,
  //       data: mockUser,
  //     });
  //   });
  // });

  // describe("updateCurrentUserProfile", () => {
  //   test("should return 404 if user is not found", async () => {
  //     // Arrange
  //     req.user = { id: "nonexistent-id" };
  //     User.findById.mockResolvedValue(null);

  //     // Act & Assert
  //     await expect(updateCurrentUserProfile(req, res)).rejects.toThrow(
  //       "User not found"
  //     );
  //     expect(res.status).toHaveBeenCalledWith(404);
  //   });

  //   test("should return 400 if email already exists", async () => {
  //     // Arrange
  //     req.user = { id: "current-user-id" };
  //     req.body = { email: "new@example.com" };

  //     const mockUser = {
  //       _id: "current-user-id",
  //       email: "old@example.com",
  //     };

  //     User.findById.mockResolvedValue(mockUser);
  //     User.findOne.mockResolvedValue({
  //       _id: "another-id",
  //       email: "new@example.com",
  //     });

  //     // Act & Assert
  //     await expect(updateCurrentUserProfile(req, res)).rejects.toThrow(
  //       "Email already exists"
  //     );
  //     expect(res.status).toHaveBeenCalledWith(400);
  //   });

  //   test("should return 400 if NIC already exists", async () => {
  //     // Arrange
  //     req.user = { id: "current-user-id" };
  //     req.body = { nic: "new-nic" };

  //     const mockUser = {
  //       _id: "current-user-id",
  //       nic: "old-nic",
  //       save: jest.fn(),
  //     };

  //     User.findById.mockResolvedValue(mockUser);
  //     User.findOne.mockResolvedValueOnce(null); // Email check passes
  //     User.findOne.mockResolvedValueOnce({ _id: "another-id", nic: "new-nic" }); // NIC exists

  //     // Act & Assert
  //     await expect(updateCurrentUserProfile(req, res)).rejects.toThrow(
  //       "NIC already exists"
  //     );
  //     expect(res.status).toHaveBeenCalledWith(400);
  //   });

  //   test("should update current user profile successfully", async () => {
  //     // Arrange
  //     req.user = { id: "current-user-id" };
  //     req.body = {
  //       firstName: "Updated",
  //       lastName: "Profile",
  //       email: "updated@example.com",
  //       nic: "updated-nic",
  //       phone: "9876543210",
  //       password: "newpassword",
  //     };

  //     const mockUser = {
  //       _id: "current-user-id",
  //       firstName: "Original",
  //       lastName: "User",
  //       email: "original@example.com",
  //       nic: "original-nic",
  //       phone: "1234567890",
  //       role: "user",
  //       createdAt: new Date("2023-01-01"),
  //       updatedAt: new Date("2023-01-01"),
  //       save: jest.fn(),
  //     };

  //     const updatedUser = {
  //       _id: "current-user-id",
  //       firstName: "Updated",
  //       lastName: "Profile",
  //       email: "updated@example.com",
  //       nic: "updated-nic",
  //       phone: "9876543210",
  //       role: "user",
  //       createdAt: new Date("2023-01-01"),
  //       updatedAt: new Date("2023-04-01"),
  //     };

  //     User.findById.mockResolvedValue(mockUser);
  //     User.findOne.mockResolvedValue(null); // No duplicate email or NIC
  //     mockUser.save.mockResolvedValue(updatedUser);

  //     // Act
  //     await updateCurrentUserProfile(req, res);

  //     // Assert
  //     expect(mockUser.firstName).toBe(req.body.firstName);
  //     expect(mockUser.lastName).toBe(req.body.lastName);
  //     expect(mockUser.email).toBe(req.body.email);
  //     expect(mockUser.nic).toBe(req.body.nic);
  //     expect(mockUser.phone).toBe(req.body.phone);
  //     expect(mockUser.password).toBe(req.body.password);
  //     expect(mockUser.save).toHaveBeenCalled();

  //     expect(res.status).toHaveBeenCalledWith(200);
  //     expect(res.json).toHaveBeenCalledWith({
  //       success: true,
  //       message: "Profile updated successfully",
  //       data: {
  //         id: updatedUser._id,
  //         firstName: updatedUser.firstName,
  //         lastName: updatedUser.lastName,
  //         email: updatedUser.email,
  //         nic: updatedUser.nic,
  //         phone: updatedUser.phone,
  //         role: updatedUser.role,
  //         createdAt: updatedUser.createdAt,
  //         updatedAt: updatedUser.updatedAt,
  //       },
  //     });
  //   });
  // });
});
