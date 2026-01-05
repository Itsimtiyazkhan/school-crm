import express from "express";
import {
  registerSchool,
  login,
  forgotPassword,
  forgotCommon,
} from "../controllers/authController.js";
const router = express.Router();
router.post("/register", registerSchool);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/forgot-common", forgotCommon);

export default router;
