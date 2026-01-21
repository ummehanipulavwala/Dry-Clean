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
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
     const token = jwt.sign({ id: user._id,role:user.role }, process.env.JWT_SECRET, {
      expiresIn: "1d"
    });

    res.json({ token, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

    // 4. Success response
    // res.status(200).json({
    //   message: "Login successful",
    //   user: {
    //     id: user._id,
    //     name: user.name,
    //     email: user.email,
    //   },
    // });

//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

//signup
export const signup = async (req, res) => {
  try {
    const {
      firstName,lastName,email,password,role,address,city,state,pincode,phone, gender,dob, country
    } = req.body;

    if (
      !firstName || !lastName || !email || !password ||
      !address || !city || !state || !pincode ||
      !phone || !gender || !dob || !country
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      firstName,lastName,email,password: hashedPassword,role,address,city,state,pincode,phone, gender,dob, country,
});

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
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
    const { email } = req.body;

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

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    res.status(200).json({ message: "Password updated successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};




