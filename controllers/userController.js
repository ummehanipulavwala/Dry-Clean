import User from "../models/User.js";
import { sendSuccess, sendError } from "../utils/responseHandler.js";

// Get my profile
export const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password").lean();

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    sendSuccess(res, 200, "User profile fetched successfully", user);
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

// Get user by ID (Admin only)
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password").lean();

    if (!user) {
      return sendError(res, 404, "User not found");
    }

    sendSuccess(res, 200, "User details fetched", user);
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

// Delete user (self or admin)
export const deleteUser = async (req, res) => {
  try {
    // Only self or admin
    if (req.user.id !== req.params.id && req.user.role !== "Admin") {
      return sendError(res, 403, "Access denied");
    }

    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return sendError(res, 404, "User not found");
    }

    sendSuccess(res, 200, "User deleted successfully");
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

// Update user (self or admin)
export const updateUser = async (req, res) => {
  try {
    if (req.user.id !== req.params.id && req.user.role !== "Admin") {
      return sendError(res, 403, "Access denied");
    }

    const { firstName, lastName, email, password, role, address, city, state, pincode, phone, gender, dob, country, profileImage, status } = req.body;

    // DOB validation if provided
    if (dob) {
      const dobRegex = /^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-(19|20)\d{2}$/;
      if (!dobRegex.test(dob)) {
        return sendError(res, 400, "Date of birth must be in format: DD-MM-YYYY (e.g. 13-02-2003)");
      }
      const [day, month, year] = dob.split("-");
      const parsedDob = new Date(`${year}-${month}-${day}`);
      if (
        isNaN(parsedDob.getTime()) ||
        parsedDob.getDate() !== parseInt(day) ||
        parsedDob.getMonth() + 1 !== parseInt(month) ||
        parsedDob.getFullYear() !== parseInt(year)
      ) {
        return sendError(res, 400, "Invalid date of birth (e.g. 31-02-2003 is not valid)");
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          ...(firstName && { firstName }),
          ...(lastName && { lastName }),
          ...(email && { email }),
          ...(password && { password }),
          ...(role && { role }),
          ...(address && { address }),
          ...(city && { city }),
          ...(state && { state }),
          ...(pincode && { pincode }),
          ...(phone && { phone }),
          ...(gender && { gender }),
          ...(dob && { dob }),
          ...(country && { country }),
          ...(status && { status }),
          ...((req.file ? req.file.path : profileImage) && { profileImage: req.file ? req.file.path : profileImage }),
        },
      },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return sendError(res, 404, "User not found");
    }

    sendSuccess(res, 200, "User updated successfully", updatedUser);
  } catch (error) {
    sendError(res, 500, "Error updating user", error.message);
  }
};