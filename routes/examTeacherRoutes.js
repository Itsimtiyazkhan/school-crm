import express from "express";
import { getTodayExamsForTeacher } from "../controllers/examTeacherController.js";

const router = express.Router();

router.get("/:schoolId/:teacherId/today", getTodayExamsForTeacher);

export default router;
