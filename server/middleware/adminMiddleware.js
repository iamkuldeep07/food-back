// server/middleware/adminMiddleware.js
export const adminMiddleware = (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Not authenticated" });
    if (req.user.role !== "admin")
      return res.status(403).json({ message: "Admin access required" });

    next();
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};