import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      console.warn("Auth failed: Authorization header missing");
      return res.status(401).json({ message: "Authorization header missing" });
    }

    if (!authHeader.startsWith("Bearer ")) {
      console.warn("Auth failed: Invalid header format", authHeader.substring(0, 15));
      return res.status(401).json({ message: "Invalid token format (must be Bearer)" });
    }

    const token = authHeader.split(" ")[1];

    if (!token || token === "null" || token === "undefined") {
      console.warn(`Auth failed: Token is missing or invalid string: "${token}"`);
      return res.status(401).json({ message: "Invalid or missing token string" });
    }

    console.log(`Verifying token: length=${token.length}, prefix=${token.substring(0, 10)}...`);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error("JWT Verification Error:", error.message);
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token structure", error: error.message });
    }
    return res.status(401).json({ message: "Invalid or expired token", error: error.message });
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


