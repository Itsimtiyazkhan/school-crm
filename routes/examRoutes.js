import express from "express";
import {
  createExam,
  getAllExams,
  getExamsByClass,
  getExamDetails,
  deleteExam,
} from "../controllers/examController.js";

const router = express.Router();

router.post("/create", createExam);
router.get("/:schoolId", getAllExams);
router.get("/:schoolId/class/:classId", getExamsByClass);
router.get("/:schoolId/exam/:examId", getExamDetails);
router.delete("/:schoolId/exam/:examId", deleteExam);

export default router;
