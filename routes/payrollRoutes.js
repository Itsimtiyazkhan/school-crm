import express from "express";
import {
  upsertSalaryProfile,
  runPayrollForMonth,
  getPayslip,
} from "../controllers/payrollController.js";
import { teacherAuth } from "../middleware/authMiddleware.js";
const router = express.Router();

router.post("/profile/save", upsertSalaryProfile); // create/update profile
router.post("/run", runPayrollForMonth); // run payroll for month
router.get("/:schoolId/:payslipId", getPayslip); // get payslip

export default router;
