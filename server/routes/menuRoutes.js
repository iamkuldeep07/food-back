// server/routes/menuRoutes.js
import express from "express";
import { addOrUpdateMenu, getWeeklyMenu, getTodayMenu } from "../controllers/menuController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";

const router = express.Router();

router.get("/week", getWeeklyMenu);
router.get("/today", getTodayMenu);

// Admin-only
router.post("/", authMiddleware, adminMiddleware, addOrUpdateMenu);

export default router;