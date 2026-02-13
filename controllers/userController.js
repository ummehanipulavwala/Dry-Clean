import User from "../models/User.js";

// Get my profile
export const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user by ID (Admin only)
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete user (self or admin)
export const deleteUser = async (req, res) => {
  try {
    // Only self or admin
    if (req.user.id !== req.params.id && req.user.role !== "Admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update user (self or admin)
export const updateUser = async (req, res) => {
  try {
    if (req.user.id !== req.params.id && req.user.role !== "Admin") {
      return res.status(403).json({
        message: "Access denied",
      });
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
          ...(profileImage && { profileImage }),
        },
      },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
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
  }
};