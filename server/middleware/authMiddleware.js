// server/middleware/authMiddleware.js (update)
import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // decoded should contain id and role
    req.user = { id: decoded.id || decoded._id, role: decoded.role || decoded.r };
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};