import express from "express";
import {
  createHomework,
  getHomeworkByClass,
  submitHomework,
  updateSubmission,
  getSubmissions,
  gradeHomework,
  getHomeworkList,
  getHomeworkByTeacher,
  getHomeworkListForAdmin,
} from "../controllers/homeworkController.js";

const router = express.Router();

// Teacher creates homework
router.post("/create", createHomework);

// Student list page → ?schoolId=&classId=
router.get("/list", getHomeworkList);

// Homework by class
router.get("/:schoolId/class/:classId", getHomeworkByClass);

// Student submit & update
router.post("/submit", submitHomework);
router.put("/submit", updateSubmission);

// All submissions for a homework
router.get("/:schoolId/submissions/:homeworkId", getSubmissions);

// Teacher grades
router.put("/:schoolId/grade/:homeworkId/:studentId", gradeHomework);

// Teacher view his created homework
router.get("/:schoolId/teacher/:teacherId", getHomeworkByTeacher);
router.get("/list/admin", getHomeworkListForAdmin);

export default router;
