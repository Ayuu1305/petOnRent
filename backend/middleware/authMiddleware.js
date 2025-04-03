import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

// Middleware to verify admin access
const adminAuth = (req, res, next) => {
  const authHeader = req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  const token = authHeader.split(" ")[1]; // Extract the token after "Bearer"

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    if (verified.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    req.admin = verified; // Attach admin details to request
    next();
  } catch (err) {
    return res.status(400).json({ message: "Invalid token" });
  }
};

export default adminAuth;
