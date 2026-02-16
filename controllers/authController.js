import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// SIGN IN
export const signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Check fields
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    // 2. Check user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    // 3. Compare password
    const isMatch = await bcrypt.compare(password.trim(), user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "7d"
    });

    res.json({ success: true, data: { token, userId: user._id, role: user.role } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// SIGN UP
export const signup = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
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

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: { userId: user._id, token },
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Signup failed",
      error: error.message,
    });
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
      return res.status(400).json({ success: false, message: "User ID is required" });
    }
    const user = await User.findById(userId);


    //Check user exists
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const profileImage = req.file
      ? req.file.path
      : null;

    // Validate required fields
    if (
      !firstName || !lastName || !address || !city || !state || !pincode ||
      !phone || !gender || !dob || !country || !role
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required..."
      });
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        success: false,
        message: "Phone number must be exactly 10 digits",
      });
    }

    // Pincode validation (6 digits)
    const pincodeRegex = /^[0-9]{6}$/;
    if (!pincodeRegex.test(pincode)) {
      return res.status(400).json({
        success: false,
        message: "Pincode must be exactly 6 digits",
      });
    }

    //DOB validation (05 Jan 2001)
    const dobRegex =
      /^(0[1-9]|[12][0-9]|3[01]) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) (19|20)\d{2}$/;

    if (!dobRegex.test(dob)) {
      return res.status(400).json({
        success: false,
        message: "Date of birth must be in format: DD Mon YYYY (e.g. 05 Jan 2001)",
      });
    }

    //Convert string DOB to Date
    const parsedDob = new Date(dob);
    if (isNaN(parsedDob)) {
      return res.status(400).json({
        success: false,
        message: "Invalid date of birth",
      });
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
    res.status(201).json({
      success: true,
      message: "User details saved successfully",
      data: { user: user.id },
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to save user details",
      error: error.message
    });
  }
};

/* ===== PERSONAL INFO (PROTECTED) ===== */
export const getProfile = async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  res.json({ success: true, message: "Profile fetched successfully", data: user });
};

// FORGOT PASSWORD
export const forgotPassword = async (req, res) => {
  try {
    const email = req.body.email;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "Email not registered" });
    }
    // Just confirm email exists
    res.status(200).json({
      success: true,
      message: "Email verified",
      data: { email: user.email }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// CREATE NEW PASSWORD
export const createNewPassword = async (req, res) => {
  try {
    const { email, password, confirmPassword } = req.body;

    if (!password || !confirmPassword) {
      return res.status(400).json({ success: false, message: "All fields required" });
    }

    if (password.trim() !== confirmPassword.trim()) {
      return res.status(400).json({ success: false, message: "Passwords do not match" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password.trim(), salt);

    await user.save();

    res.status(200).json({ success: true, message: "Password updated successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};