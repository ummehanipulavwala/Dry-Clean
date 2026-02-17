import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
<<<<<<< HEAD
import { sendSuccess, sendError } from "../utils/responseHandler.js";
=======
>>>>>>> 30942aec6a614d58d068ec75d3d899063eeabd0e

// SIGN IN
export const signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Check fields
    if (!email || !password) {
<<<<<<< HEAD
      return sendError(res, 400, "All fields are required");
=======
      return res.status(400).json({ message: "All fields are required" });
>>>>>>> 30942aec6a614d58d068ec75d3d899063eeabd0e
    }

    // 2. Check user exists
    const user = await User.findOne({ email });
    if (!user) {
<<<<<<< HEAD
      return sendError(res, 401, "Invalid email or password");
=======
      return res.status(401).json({ message: "Invalid email or password" });
>>>>>>> 30942aec6a614d58d068ec75d3d899063eeabd0e
    }

    // 3. Compare password
    const isMatch = await bcrypt.compare(password.trim(), user.password);
    if (!isMatch) {
<<<<<<< HEAD
      return sendError(res, 401, "Invalid email or password");
=======
      return res.status(401).json({ message: "Invalid email or password" });
>>>>>>> 30942aec6a614d58d068ec75d3d899063eeabd0e
    }
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "7d"
    });

<<<<<<< HEAD
    sendSuccess(res, 200, "Login successful", { token, userId: user._id, role: user.role });
  } catch (error) {
    sendError(res, 500, error.message);
=======
    res.json({ token, userId: user._id, role: user.role });
  } catch (error) {
    res.status(500).json({ error: error.message });
>>>>>>> 30942aec6a614d58d068ec75d3d899063eeabd0e
  }
};

// SIGN UP
export const signup = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Validate input
    if (!email || !password) {
<<<<<<< HEAD
      return sendError(res, 400, "Email and password are required");
=======
      return res.status(400).json({
        message: "Email and password are required",
      });
>>>>>>> 30942aec6a614d58d068ec75d3d899063eeabd0e
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
<<<<<<< HEAD
      return sendError(res, 400, "User already exists");
=======
      return res.status(400).json({
        message: "User already exists",
      });
>>>>>>> 30942aec6a614d58d068ec75d3d899063eeabd0e
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

<<<<<<< HEAD
    sendSuccess(res, 201, "User created successfully", { userId: user._id, token });


  } catch (error) {
    sendError(res, 500, "Signup failed", error.message);
=======
    res.status(201).json({
      message: "User created successfully",
      userId: user._id,
      token,
    });

  } catch (error) {
    res.status(500).json({
      message: "Signup failed",
      error: error.message,
    });
>>>>>>> 30942aec6a614d58d068ec75d3d899063eeabd0e
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
<<<<<<< HEAD
      return sendError(res, 400, "User ID is required");
=======
      return res.status(400).json({ message: "User ID is required" });
>>>>>>> 30942aec6a614d58d068ec75d3d899063eeabd0e
    }
    const user = await User.findById(userId);


    //Check user exists
    if (!user) {
<<<<<<< HEAD
      return sendError(res, 404, "Invalid user ID");
=======
      return res.status(404).json({
        message: "Invalid user ID",
      });
>>>>>>> 30942aec6a614d58d068ec75d3d899063eeabd0e
    }

    const profileImage = req.file
      ? req.file.path
      : null;

    // Validate required fields
    if (
      !firstName || !lastName || !address || !city || !state || !pincode ||
      !phone || !gender || !dob || !country || !role
    ) {
<<<<<<< HEAD
      return sendError(res, 400, "All fields are required...");
=======
      return res.status(400).json({
        message: "All fields are required..."
      });
>>>>>>> 30942aec6a614d58d068ec75d3d899063eeabd0e
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone)) {
<<<<<<< HEAD
      return sendError(res, 400, "Phone number must be exactly 10 digits");
=======
      return res.status(400).json({
        message: "Phone number must be exactly 10 digits",
      });
>>>>>>> 30942aec6a614d58d068ec75d3d899063eeabd0e
    }

    // Pincode validation (6 digits)
    const pincodeRegex = /^[0-9]{6}$/;
    if (!pincodeRegex.test(pincode)) {
<<<<<<< HEAD
      return sendError(res, 400, "Pincode must be exactly 6 digits");
=======
      return res.status(400).json({
        message: "Pincode must be exactly 6 digits",
      });
>>>>>>> 30942aec6a614d58d068ec75d3d899063eeabd0e
    }

    //DOB validation (05 Jan 2001)
    const dobRegex =
      /^(0[1-9]|[12][0-9]|3[01]) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) (19|20)\d{2}$/;

    if (!dobRegex.test(dob)) {
<<<<<<< HEAD
      return sendError(res, 400, "Date of birth must be in format: DD Mon YYYY (e.g. 05 Jan 2001)");
=======
      return res.status(400).json({
        message: "Date of birth must be in format: DD Mon YYYY (e.g. 05 Jan 2001)",
      });
>>>>>>> 30942aec6a614d58d068ec75d3d899063eeabd0e
    }

    //Convert string DOB to Date
    const parsedDob = new Date(dob);
    if (isNaN(parsedDob)) {
<<<<<<< HEAD
      return sendError(res, 400, "Invalid date of birth");
=======
      return res.status(400).json({
        message: "Invalid date of birth",
      });
>>>>>>> 30942aec6a614d58d068ec75d3d899063eeabd0e
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
<<<<<<< HEAD
    sendSuccess(res, 201, "User details saved successfully", { user: user.id });

  } catch (error) {
    sendError(res, 500, "Failed to save user details", error.message);
=======
    res.status(201).json({
      message: "User details saved successfully",
      user: user.id,
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to save user details",
      error: error.message
    });
>>>>>>> 30942aec6a614d58d068ec75d3d899063eeabd0e
  }
};

/* ===== PERSONAL INFO (PROTECTED) ===== */
export const getProfile = async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
<<<<<<< HEAD
  sendSuccess(res, 200, "Profile fetched successfully", user);
=======
  res.json(user);
>>>>>>> 30942aec6a614d58d068ec75d3d899063eeabd0e
};

// FORGOT PASSWORD
export const forgotPassword = async (req, res) => {
  try {
    const email = req.body.email;
    const user = await User.findOne({ email });
    if (!user) {
<<<<<<< HEAD
      return sendError(res, 404, "Email not registered");
    }
    // Just confirm email exists
    sendSuccess(res, 200, "Email verified", { email: user.email });

  } catch (error) {
    sendError(res, 500, error.message);
=======
      return res.status(404).json({ message: "Email not registered" });
    }
    // Just confirm email exists
    res.status(200).json({
      message: "Email verified",
      email: user.email
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
>>>>>>> 30942aec6a614d58d068ec75d3d899063eeabd0e
  }
};

// CREATE NEW PASSWORD
export const createNewPassword = async (req, res) => {
  try {
    const { email, password, confirmPassword } = req.body;

    if (!password || !confirmPassword) {
<<<<<<< HEAD
      return sendError(res, 400, "All fields required");
    }

    if (password.trim() !== confirmPassword.trim()) {
      return sendError(res, 400, "Passwords do not match");
=======
      return res.status(400).json({ message: "All fields required" });
    }

    if (password.trim() !== confirmPassword.trim()) {
      return res.status(400).json({ message: "Passwords do not match" });
>>>>>>> 30942aec6a614d58d068ec75d3d899063eeabd0e
    }

    const user = await User.findOne({ email });
    if (!user) {
<<<<<<< HEAD
      return sendError(res, 404, "User not found");
=======
      return res.status(404).json({ message: "User not found" });
>>>>>>> 30942aec6a614d58d068ec75d3d899063eeabd0e
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password.trim(), salt);

    await user.save();

<<<<<<< HEAD
    sendSuccess(res, 200, "Password updated successfully");

  } catch (error) {
    sendError(res, 500, error.message);
=======
    res.status(200).json({ message: "Password updated successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
>>>>>>> 30942aec6a614d58d068ec75d3d899063eeabd0e
  }
};