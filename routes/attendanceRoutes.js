import express from "express";
import {
  markAttendance,
  getAttendance,
  updateAttendance,
  getMonthlySummary,
  getStudentAttendanceHistory,
  getStudentMonthlySummary
} from "../controllers/attendanceController.js";

const router = express.Router();

router.post("/mark", markAttendance);
router.get("/", getAttendance); // ?schoolId=&date=&classId=
router.put("/:schoolId/:date/:classId/:studentId", updateAttendance);
router.get("/summary/month", getMonthlySummary); // ?schoolId=&classId=&month=

router.get("/student/history", getStudentAttendanceHistory);
router.get("/student/summary", getStudentMonthlySummary);

export default router;
