// routes/classRoutes.js
import express from "express";
import {
  addClass,
  getAllClasses,
  updateClass,
  deleteClass,
  getStudentsOfClassTeacher,
  assignClassTeacher,
  getClassByTeacher,
} from "../controllers/classController.js";

const router = express.Router();
router.post("/add", addClass);
router.put("/assign-teacher", assignClassTeacher);
router.get("/:schoolId", getAllClasses);
router.put("/:schoolId/:classId", updateClass);
router.delete("/:schoolId/:classId", deleteClass);

router.get("/teacher/:schoolId/:teacherId", getStudentsOfClassTeacher);

router.get("/teacher/:schoolId/:teacherId", getClassByTeacher);

export default router;
