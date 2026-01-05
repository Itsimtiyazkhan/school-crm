import express from "express";
import {
  addTeacher,
  getTeachers,
  getTeacherById,
  updateTeacher,
  deleteTeacher,
} from "../controllers/teacherController.js";
import { getTeacherDashboard } from "../controllers/teacherDashboardController.js";

import {
  requestLeave,
  listTeacherLeaves,
  adminLeaveList,
  approveLeave,
  rejectLeave,
} from "../controllers/teacherLeaveController.js";

import { listTeachers } from "../controllers/teacherAuthController.js";

const router = express.Router();

/* ------------------- LEAVE ROUTES MUST COME FIRST ------------------- */

// Teacher submit leave
router.post("/request", requestLeave);

// Teacher leave history
router.get("/list", listTeacherLeaves);

// Admin leave list
router.get("/admin/list", adminLeaveList);

// Admin approve / reject
router.put("/admin/approve/:schoolId/:leaveId", approveLeave);
router.put("/admin/reject/:schoolId/:leaveId", rejectLeave);

// Teacher list (auth)
router.get("/auth/list/:schoolId", listTeachers);

/* ------------------- TEACHER CRUD ROUTES ------------------- */

router.post("/add", addTeacher);
router.get("/:schoolId/:teacherId", getTeacherById);
router.put("/:schoolId/:teacherId", updateTeacher);
router.delete("/:schoolId/:teacherId", deleteTeacher);

// LAST: get all teachers
router.get("/:schoolId", getTeachers);

// dashboard
router.get("/dashboard/:schoolId/:teacherId", getTeacherDashboard);

export default router;
