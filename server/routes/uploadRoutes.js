import express from "express";
import { upload } from "../middleware/multer.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post(
  "/photo",
  authMiddleware,
  upload.single("photo"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const result = await uploadOnCloudinary(req.file.path);

      if (!result) {
        return res.status(500).json({ message: "Cloudinary upload failed" });
      }

      return res.json({ url: result.secure_url });

    } catch (error) {
      console.error("UPLOAD ERROR:", error);
      return res.status(500).json({
        message: "Upload failed",
        error: error.message,
      });
    }
  }
);

export default router; 