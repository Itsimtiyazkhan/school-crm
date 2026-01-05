import express from "express";
import { setTeacherPassword } from "../controllers/teacherCredentialsController.js";

const router = express.Router();

// ADMIN ONLY endpoint – add adminAuth middleware later
router.post("/set-password", setTeacherPassword);

export default router;
