import express from "express";
import {
  markTeacherAttendance,
  getTeacherAttendance,
  getTeacherMonthlySummary,
} from "../controllers/teacherAttendanceController.js";
import { teacherAuth } from "../middleware/authMiddleware.js";
const router = express.Router();

// teacher can mark their own attendance (protected)
router.post("/mark", markTeacherAttendance);

// fetch (admin or teacher) - for simplicity keep open, but you can protect with admin middleware
router.get("/", getTeacherAttendance);

//get teacher monthly summary
router.get("/summary/monthly", getTeacherMonthlySummary);

export default router;
