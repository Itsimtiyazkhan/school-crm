import express from "express";
import {
  teacherLogin,
  listTeachers,
} from "../controllers/teacherAuthController.js";

const router = express.Router();

router.post("/login", teacherLogin);
router.get("/list/:schoolId", listTeachers);

export default router;
