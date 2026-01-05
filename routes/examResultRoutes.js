import express from "express";
import {
  addOrUpdateMarks,
  getExamResults,
  getStudentReportCard,
  getGradesSummary,
  getClassExamAnalytics,
} from "../controllers/examResultController.js";

import { generateReportPDF } from "../controllers/examPdfController.js";

const router = express.Router();

router.post("/add-marks", addOrUpdateMarks);
router.get("/:schoolId/:examId/results", getExamResults);
router.get("/:schoolId/:examId/student/:studentId", getStudentReportCard);
router.get("/:schoolId/:examId/grades-summary", getGradesSummary);
router.get(
  "/:schoolId/:examId/student/:studentId/report-pdf",
  generateReportPDF
);

router.get(
  "/:schoolId/:examId/class/:classId/analytics",
  getClassExamAnalytics
);

export default router;
