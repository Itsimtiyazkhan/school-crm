import express from "express";
import {
  autoGenerateTimetable,
  copyTimetable,
} from "../controllers/timetableAutoController.js";
import { teacherAuth } from "../middleware/authMiddleware.js";
const router = express.Router();

// Only admin or authorized user should run auto-generation; protect later with admin middleware.
// For now, require teacherAuth (replace with admin check as needed)
router.post("/auto-generate", autoGenerateTimetable);
router.post("/copy", teacherAuth, copyTimetable);

export default router;
