import express from "express";
import {
  addStudent,
  getStudents,
  getStudentsByClass,
  getStudentById,
  updateStudent,
  deleteStudent,
  studentLogin,
  setStudentPassword,
  listStudents,
} from "../controllers/studentController.js";

const router = express.Router();

router.post("/login", studentLogin);
router.post("/set-password", setStudentPassword);
router.get("/list/:schoolId", listStudents);

router.post("/add", addStudent); // add
router.get("/:schoolId", getStudents); // get all
router.get("/:schoolId/class/:classId", getStudentsByClass); // class-wise
router.get("/:schoolId/:studentId", getStudentById); // single
router.put("/:schoolId/:studentId", updateStudent); // update
router.delete("/:schoolId/:studentId", deleteStudent); // delete

export default router;
