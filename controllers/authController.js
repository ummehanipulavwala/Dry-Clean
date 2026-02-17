import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendSuccess, sendError } from "../utils/responseHandler.js";

// SIGN IN
export const signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Check fields
    if (!email || !password) {
      return sendError(res, 400, "All fields are required");
    }

    // 2. Check user exists
    const user = await User.findOne({ email });
    if (!user) {
      return sendError(res, 401, "Invalid email or password");
    }

    // 3. Compare password
    const isMatch = await bcrypt.compare(password.trim(), user.password);
    if (!isMatch) {
      return sendError(res, 401, "Invalid email or password");
    }
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "7d"
    });

    sendSuccess(res, 200, "Login successful", { token, userId: user._id, role: user.role });
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

// SIGN UP
export const signup = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Validate input
    if (!email || !password) {
      return sendError(res, 400, "Email and password are required");
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return sendError(res, 400, "User already exists");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // THIS LINE STORES USER IN DATABASE
    const user = await User.create({
      email,
      password: hashedPassword,
      role: role || "User", // Use provided role or default
    });

    // Generate token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    sendSuccess(res, 201, "User created successfully", { userId: user._id, token });


  } catch (error) {
    sendError(res, 500, "Signup failed", error.message);
  }
};

// SAVE USER DETAILS 
export const saveuserdetails = async (req, res) => {
  try {
    const { userId } = req.params;
    const {
      firstName, lastName, role, address, city, state, pincode, phone, gender, dob, country
    } = req.body;

    if (!userId) {
      return sendError(res, 400, "User ID is required");
    }
    const user = await User.findById(userId);


    //Check user exists
    if (!user) {
      return sendError(res, 404, "Invalid user ID");
    }

    const profileImage = req.file
      ? req.file.path
      : null;

    // Validate required fields
    if (
      !firstName || !lastName || !address || !city || !state || !pincode ||
      !phone || !gender || !dob || !country || !role
    ) {
      return sendError(res, 400, "All fields are required...");
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone)) {
      return sendError(res, 400, "Phone number must be exactly 10 digits");
    }

    // Pincode validation (6 digits)
    const pincodeRegex = /^[0-9]{6}$/;
    if (!pincodeRegex.test(pincode)) {
      return sendError(res, 400, "Pincode must be exactly 6 digits");
    }

    //DOB validation (05 Jan 2001)
    const dobRegex =
      /^(0[1-9]|[12][0-9]|3[01]) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) (19|20)\d{2}$/;

    if (!dobRegex.test(dob)) {
      return sendError(res, 400, "Date of birth must be in format: DD Mon YYYY (e.g. 05 Jan 2001)");
    }

    //Convert string DOB to Date
    const parsedDob = new Date(dob);
    if (isNaN(parsedDob)) {
      return sendError(res, 400, "Invalid date of birth");
    }

    // Create user
    user.firstName = firstName;
    user.lastName = lastName;
    user.role = role;
    user.address = address;
    user.city = city;
    user.state = state;
    user.pincode = pincode;
    user.phone = phone;
    user.gender = gender;
    user.dob = parsedDob;
    user.country = country;
    user.profileImage = profileImage;
    user.isVerified = false;
    await user.save();

    //Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    //Format DOB for response
    const formattedDob = parsedDob.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    // Response (don’t send password)
    sendSuccess(res, 201, "User details saved successfully", { user: user.id });

  } catch (error) {
    sendError(res, 500, "Failed to save user details", error.message);
  }
};

/* ===== PERSONAL INFO (PROTECTED) ===== */
export const getProfile = async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  sendSuccess(res, 200, "Profile fetched successfully", user);
};

// FORGOT PASSWORD
export const forgotPassword = async (req, res) => {
  try {
    const email = req.body.email;
    const user = await User.findOne({ email });
    if (!user) {
      return sendError(res, 404, "Email not registered");
    }
    // Just confirm email exists
    sendSuccess(res, 200, "Email verified", { email: user.email });

  } catch (error) {
    sendError(res, 500, error.message);
  }
};

// CREATE NEW PASSWORD
export const createNewPassword = async (req, res) => {
  try {
    const { email, password, confirmPassword } = req.body;

    if (!password || !confirmPassword) {
      return sendError(res, 400, "All fields required");
    }

    if (password.trim() !== confirmPassword.trim()) {
      return sendError(res, 400, "Passwords do not match");
    }

    const user = await User.findOne({ email });
    if (!user) {
      return sendError(res, 404, "User not found");
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password.trim(), salt);

    await user.save();

    sendSuccess(res, 200, "Password updated successfully");

  } catch (error) {
    sendError(res, 500, error.message);
  }
};