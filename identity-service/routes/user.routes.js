const express = require("express");
const router = express.Router();
const {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  getCurrentUserProfile,
  updateCurrentUserProfile,
  deleteUser,
} = require("../controllers/user.controller");
const { protect, authorizeRoles } = require("../middleware/authmiddleware");

// Public routes
// None for users - registration should be handled elsewhere or by admin

// Protected routes - profile management
router
  .route("/profile")
  .get(protect, getCurrentUserProfile)
  .put(protect, updateCurrentUserProfile);

// Admin only routes
router
  .route("/")
  .post(createUser)
  .get(protect, authorizeRoles("admin"), getAllUsers);

router
  .route("/:id")
  .get(protect, authorizeRoles("admin"), getUserById)
  .put(protect, authorizeRoles("admin"), updateUser)
  .delete(protect, authorizeRoles("admin"), deleteUser);

module.exports = router;
