// server/routes/feedbackRoutes.js (admin-protect get all)
import express from "express";
import {
  submitFeedback,
  getAllFeedback,
  getMyFeedback,
  updateFeedbackStatus
} from "../controllers/feedbackController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, submitFeedback);
router.get("/my", authMiddleware, getMyFeedback);

// Admin
router.get("/", authMiddleware, adminMiddleware, getAllFeedback);
router.patch("/:id/status", authMiddleware, adminMiddleware, updateFeedbackStatus);

export default router;