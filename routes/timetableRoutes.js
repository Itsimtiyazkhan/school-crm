import express from "express";
import {
  saveTimetable,
  getTimetableByClass,
  deletePeriod,
} from "../controllers/timetableController.js";
import { getTeacherTimetable } from "../controllers/teacherTimetableController.js";

const router = express.Router();

// Save full timetable
router.post("/:schoolId/:classId", saveTimetable);

// Get full timetable
router.get("/:schoolId/:classId", getTimetableByClass);

// Delete period
router.delete("/:schoolId/:classId/:day/:period", deletePeriod);

router.get("/teacher/:schoolId/:teacherId", getTeacherTimetable);

export default router;
