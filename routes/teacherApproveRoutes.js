// routes/teacherApproveRoutes.js
import express from "express";
import { approveTeacher } from "../controllers/teacherApproveController.js";

const router = express.Router();

router.put("/approve/:schoolId/:teacherId", approveTeacher);

export default router;
