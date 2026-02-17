import User from "../models/User.js";
<<<<<<< HEAD
import { sendSuccess, sendError } from "../utils/responseHandler.js";
=======
>>>>>>> 30942aec6a614d58d068ec75d3d899063eeabd0e

// Get my profile
export const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
<<<<<<< HEAD
      return res.status(404).json({ success: false, message: "User not found" });
    }

    sendSuccess(res, 200, "User profile fetched successfully", user);
  } catch (error) {
    sendError(res, 500, error.message);
=======
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
>>>>>>> 30942aec6a614d58d068ec75d3d899063eeabd0e
  }
};

// Get user by ID (Admin only)
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
<<<<<<< HEAD
      return sendError(res, 404, "User not found");
    }

    sendSuccess(res, 200, "User details fetched", user);
  } catch (error) {
    sendError(res, 500, error.message);
=======
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
>>>>>>> 30942aec6a614d58d068ec75d3d899063eeabd0e
  }
};

// Delete user (self or admin)
export const deleteUser = async (req, res) => {
  try {
    // Only self or admin
    if (req.user.id !== req.params.id && req.user.role !== "Admin") {
<<<<<<< HEAD
      return sendError(res, 403, "Access denied");
=======
      return res.status(403).json({ message: "Access denied" });
>>>>>>> 30942aec6a614d58d068ec75d3d899063eeabd0e
    }

    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
<<<<<<< HEAD
      return sendError(res, 404, "User not found");
    }

    sendSuccess(res, 200, "User deleted successfully");
  } catch (error) {
    sendError(res, 500, error.message);
=======
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
>>>>>>> 30942aec6a614d58d068ec75d3d899063eeabd0e
  }
};

// Update user (self or admin)
export const updateUser = async (req, res) => {
  try {
    if (req.user.id !== req.params.id && req.user.role !== "Admin") {
<<<<<<< HEAD
      return sendError(res, 403, "Access denied");
=======
      return res.status(403).json({
        message: "Access denied",
      });
>>>>>>> 30942aec6a614d58d068ec75d3d899063eeabd0e
    }

    const { firstName, lastName, email, password, role, address, city, state, pincode, phone, gender, dob, country, profileImage } = req.body;

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
<<<<<<< HEAD
          ...((req.file ? req.file.path : profileImage) && { profileImage: req.file ? req.file.path : profileImage }),
=======
          ...(profileImage && { profileImage }),
>>>>>>> 30942aec6a614d58d068ec75d3d899063eeabd0e
        },
      },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
<<<<<<< HEAD
      return sendError(res, 404, "User not found");
    }

    sendSuccess(res, 200, "User updated successfully", updatedUser);
  } catch (error) {
    sendError(res, 500, "Error updating user", error.message);
=======
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating user",
      error: error.message,
    });
>>>>>>> 30942aec6a614d58d068ec75d3d899063eeabd0e
  }
};