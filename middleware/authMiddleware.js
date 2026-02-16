import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Check header exists
    if (!authHeader) {
      return res.status(401).json({ message: "Authorization header missing" });
    }

    // Must start with Bearer
    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Invalid token format" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    console.log("Authenticated user:", req.user);

    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      console.log("User role:", req.user);
      return res.status(403).json({
        message: "Access denied: insufficient permissions"
      });
    }
    next();
  };
};


