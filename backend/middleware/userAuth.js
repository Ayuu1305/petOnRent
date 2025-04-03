import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const userAuth = (req, res, next) => {
  const authHeader = req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);

    // Check token expiry (15 days)
    const tokenAge = Date.now() / 1000 - verified.iat;
    if (tokenAge > 15 * 24 * 60 * 60) {
      // 15 days in seconds
      return res
        .status(401)
        .json({ message: "Session expired. Please login again." });
    }

    req.user = verified;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

export default userAuth;