import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// SIGN IN
export const signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Check fields
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // 2. Check user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // 3. Compare password
    const isMatch = await bcrypt.compare(password.trim(), user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
     const token = jwt.sign({ id: user._id,role:user.role }, process.env.JWT_SECRET, {
      expiresIn: "7d"
    });

    res.json({ token , userId: user._id, role: user.role  });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// SIGN UP

export const signup = async (req, res) => {
  try {
    const {
     firstName,  lastName,  email,  password ,  role ,  address,  city,  state,  pincode,  phone, gender,  dob, country
    } = req.body;

    const profileImage = req.file
      ? req.file.path
      : null;

    // Validate required fields
    if (
      !firstName || !lastName || !email || !password ||
      !address || !city || !state || !pincode ||
      !phone || !gender || !dob || !country
    ) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    // 2️⃣ Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        message: "User already exists"
      });
    }

    // 3️⃣ Hash password
    const hashedPassword = await bcrypt.hash(password.trim(), 10);

    // 4️⃣ Create user
    const user = await User.create({
      firstName,  lastName,  email,  password: hashedPassword,  role,  address,  city,  state,  pincode,  phone, gender,  dob, country, profileImage
    });

    // 5️⃣ Generate JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // 6️⃣ Response (don’t send password)
    res.status(201).json({
      message: "Signup successful",
      token,
    });

  } catch (error) {
    res.status(500).json({
      message: "Signup failed",
      error: error.message
    });
  }
};

/* ===== PERSONAL INFO (PROTECTED) ===== */
export const getProfile = async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  res.json(user);
};


// FORGOT PASSWORD
export const forgotPassword = async (req, res) => {
  try {
    const email= req.body.email;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Email not registered" });
    }
    // Just confirm email exists
    res.status(200).json({
      message: "Email verified",
      email: user.email
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CREATE NEW PASSWORD

export const createNewPassword = async (req, res) => {
  try {
    const { email, password, confirmPassword } = req.body;

    if (!password || !confirmPassword) {
      return res.status(400).json({ message: "All fields required" });
    }

    if (password.trim() !== confirmPassword.trim()) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password.trim(), salt);

    await user.save();

    res.status(200).json({ message: "Password updated successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};




