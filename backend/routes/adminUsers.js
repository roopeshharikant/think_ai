const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const Joi = require("joi");
const User = require("../User");
const requireRole = require("../middleware/requireRole"); // Adjust path if your middleware is located elsewhere
const { successResponse, errorResponse } = require("../utils/response");

// Joi Validation Schemas matching User.js fields
const createUserSchema = Joi.object({
  name: Joi.string().required().messages({
    'string.empty': 'Name is required.',
    'any.required': 'Name is required.'
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Please enter a valid email address.',
    'string.empty': 'Email is required.',
    'any.required': 'Email is required.'
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters.',
    'string.empty': 'Password is required.',
    'any.required': 'Password is required.'
  }),
  role: Joi.string().valid('Learner', 'Instructor', 'TA', 'Admin').default('Learner')
});



const updateUserSchema = Joi.object({
  name: Joi.string().optional(),
  email: Joi.string().email().optional(),
  role: Joi.string().valid('Learner', 'Instructor', 'TA', 'Admin').optional(),
  status: Joi.string().valid('active', 'inactive').optional()
});

/**
 * @route   GET /api/admin/users
 * @desc    Lists every user with their current role
 */
router.get("/users", requireRole(["Admin"]), async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    return successResponse(res, 200, "Users retrieved successfully", users);
  } catch (error) {
    console.error("Fetch Users Error:", error);
    return errorResponse(res, 500, "Internal server error");
  }
});

/**
 * @route   POST /api/admin/users
 * @desc    Admin creates a new user with a specific role
 */
router.post("/users", requireRole(["Admin"]), async (req, res) => {
  try {
    const { error, value } = createUserSchema.validate(req.body);
    if (error) {
      return errorResponse(res, 400, error.details[0].message);
    }

    const { name, email, password, role } = value;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return errorResponse(res, 400, "User with this email already exists.");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: role || "Learner",
    });

    await newUser.save();

    const { password: _, ...userWithoutPassword } = newUser.toObject();

    return successResponse(res, 201, "User created successfully", userWithoutPassword);
  } catch (error) {
    console.error("Create user error:", error);
    return errorResponse(res, 500, error.message || "Failed to create user");
  }
});

/**
 * @route   PATCH /api/admin/users/:id
 * @desc    Update user details (Name, Email, Role)
 */
router.patch("/users/:id", requireRole(["Admin"]), async (req, res) => {
  try {
    const { id } = req.params;
    const { error, value } = updateUserSchema.validate(req.body);
    if (error) {
      return errorResponse(res, 400, error.details[0].message);
    }

    const updateFields = {};
    if (value.name) updateFields.name = value.name;

    if (value.email) {
      const existingEmail = await User.findOne({ email: value.email, _id: { $ne: id } });
      if (existingEmail) {
        return errorResponse(res, 400, "This email is already in use by another account.");
      }
      updateFields.email = value.email;
    }

     if (value.role) {
      // Prevent Admin from demoting themselves
      if (req.user.id === id && value.role !== 'Admin') {
        return errorResponse(res, 400, "You cannot demote yourself from the Admin role.");
      }
      updateFields.role = value.role;
    }

    if (value.status) {
      // Prevent an admin from locking themselves out
      if (req.user.id === id && value.status === 'inactive') {
        return errorResponse(res, 400, "You cannot deactivate your own account.");
      }
      updateFields.status = value.status;
    }

    if (Object.keys(updateFields).length === 0) {
      return errorResponse(res, 400, "No valid fields provided for update.");
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return errorResponse(res, 404, "User not found.");
    }

    return successResponse(res, 200, "User updated successfully", updatedUser);
  } catch (error) {
    console.error("Update User Error:", error);
    if (error.kind === 'ObjectId') {
      return errorResponse(res, 404, "User not found (Invalid ID format).");
    }
    return errorResponse(res, 500, "Internal server error");
  }
});

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Delete a user account
 */
router.delete("/users/:id", requireRole(["Admin"]), async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.id === id) {
      return errorResponse(res, 400, "You cannot delete your own active admin account.");
    }

    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return errorResponse(res, 404, "User not found.");
    }

    return successResponse(res, 200, "User deleted successfully", { userId: id });
  } catch (error) {
    console.error("Delete User Error:", error);
    return errorResponse(res, 500, "Internal server error");
  }
});


/**
 * @route   POST /api/admin/users/:id/reset-password
 * @desc    Generate a new temporary password for a user (returned once, not stored in plain text)
 */
router.post("/users/:id/reset-password", requireRole(["Admin"]), async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return errorResponse(res, 404, "User not found.");
    }

    const tempPassword = crypto.randomBytes(6).toString("base64")
      .replace(/[^a-zA-Z0-9]/g, "")
      .slice(0, 10);

    const hashedPassword = await bcrypt.hash(tempPassword, 10);
    user.password = hashedPassword;
    await user.save();

    return successResponse(res, 200, "Temporary password generated successfully", {
      userId: id,
      tempPassword,
    });
  } catch (error) {
    console.error("Reset Password Error:", error);
    if (error.kind === 'ObjectId') {
      return errorResponse(res, 404, "User not found (Invalid ID format).");
    }
    return errorResponse(res, 500, "Internal server error");
  }
});


module.exports = router;