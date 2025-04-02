const asyncHandler = require("express-async-handler");
const User = require("../models/user.model");

/**
 * @desc    Create a new user
 * @route   POST /api/users
 * @access  Private/Admin
 */
const createUser = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, nic, phone, password, role } = req.body;

  // Check if all required fields are provided
  if (!firstName || !lastName || !email || !nic || !phone || !password) {
    res.status(400);
    throw new Error("All fields are required");
  }

  // Validate role if provided
  const validRoles = ["student", "user", "lecturer", "admin"];
  if (role && !validRoles.includes(role)) {
    res.status(400);
    throw new Error("Invalid role provided");
  }

  // Check if email already exists
  const emailExists = await User.findOne({ email });
  if (emailExists) {
    res.status(400);
    throw new Error("Email already exists");
  }

  // Check if NIC already exists
  const nicExists = await User.findOne({ nic });
  if (nicExists) {
    res.status(400);
    throw new Error("NIC already exists");
  }

  // Create user object
  const userObject = {
    firstName,
    lastName,
    email,
    nic,
    phone,
    password,
    role: role || "student", // default to 'student' if role not provided
  };

  // Create new user
  const user = await User.create(userObject);

  if (user) {
    // Return user without password
    res.status(201).json({
      success: true,
      message: `User ${user.firstName} ${user.lastName} created successfully`,
      data: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        nic: user.nic,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

/**
 * @desc    Get all users
 * @route   GET /api/users
 * @access  Private/Admin
 */
const getAllUsers = asyncHandler(async (req, res) => {
  const { email, role } = req.query;
  let query = {};

  // Filter by email if provided
  if (email) {
    query.email = { $regex: new RegExp(email, "i") };
  }

  // Filter by role if provided
  if (role) {
    query.role = role;
  }

  // Get all users with the query
  const users = await User.find(query)
    .select("-password")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: users.length,
    data: users,
  });
});

/**
 * @desc    Get user by ID
 * @route   GET /api/users/:id
 * @access  Private/Admin
 */
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});

/**
 * @desc    Update user
 * @route   PUT /api/users/:id
 * @access  Private/Admin
 */
const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, email, nic, phone, role, password } = req.body;

  // Find user by id
  const user = await User.findById(id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Check if at least one field is provided for update
  if (
    !firstName &&
    !lastName &&
    !email &&
    !nic &&
    !phone &&
    !role &&
    !password
  ) {
    res.status(400);
    throw new Error("Please provide at least one field to update");
  }

  // Check email uniqueness if email is being updated
  if (email && email !== user.email) {
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      res.status(400);
      throw new Error("Email already exists");
    }
  }

  // Check NIC uniqueness if NIC is being updated
  if (nic && nic !== user.nic) {
    const nicExists = await User.findOne({ nic });
    if (nicExists) {
      res.status(400);
      throw new Error("NIC already exists");
    }
  }

  // Prepare update data
  const updateData = {};
  if (firstName) updateData.firstName = firstName;
  if (lastName) updateData.lastName = lastName;
  if (email) updateData.email = email;
  if (nic) updateData.nic = nic;
  if (phone) updateData.phone = phone;
  if (role) updateData.role = role;
  if (password) updateData.password = password;

  // Update user
  const updatedUser = await User.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  }).select("-password");

  res.status(200).json({
    success: true,
    message: `User ${updatedUser.firstName} ${updatedUser.lastName} updated successfully`,
    data: updatedUser,
  });
});

/**
 * @desc    Delete user
 * @route   DELETE /api/users/:id
 * @access  Private/Admin
 */
const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    res.status(400);
    throw new Error("User ID is required");
  }

  const user = await User.findById(id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  await User.findByIdAndDelete(id);

  res.status(200).json({
    success: true,
    message: `User ${user.firstName} ${user.lastName} deleted successfully`,
  });
});

/**
 * @desc    Get current user profile
 * @route   GET /api/users/profile
 * @access  Private
 */
const getCurrentUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});

/**
 * @desc    Update current user profile
 * @route   PUT /api/users/profile
 * @access  Private
 */
const updateCurrentUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const { firstName, lastName, email, nic, phone, password } = req.body;

  // Check if email already exists and it's not the current user's email
  if (email && email !== user.email) {
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      res.status(400);
      throw new Error("Email already exists");
    }
  }

  // Check if NIC already exists and it's not the current user's NIC
  if (nic && nic !== user.nic) {
    const nicExists = await User.findOne({ nic });
    if (nicExists) {
      res.status(400);
      throw new Error("NIC already exists");
    }
  }

  // Update user fields
  if (firstName) user.firstName = firstName;
  if (lastName) user.lastName = lastName;
  if (email) user.email = email;
  if (nic) user.nic = nic;
  if (phone) user.phone = phone;
  if (password) user.password = password;

  const updatedUser = await user.save();

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    data: {
      id: updatedUser._id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      nic: updatedUser.nic,
      phone: updatedUser.phone,
      role: updatedUser.role,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    },
  });
});

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getCurrentUserProfile,
  updateCurrentUserProfile,
};
