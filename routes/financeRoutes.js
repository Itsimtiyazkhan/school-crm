import express from "express";
import {
  addFeeType,
  getFeeTypes,
  payFee,
  getFeeHistory,
  getMonthlySummary,
} from "../controllers/financeController.js";
const router = express.Router();
// Fee Types
router.post("/type/add", addFeeType);
router.get("/type/:schoolId", getFeeTypes);
// Fee Payments
router.post("/pay", payFee);
router.get("/history/:schoolId/:studentId", getFeeHistory);
// Summary
router.get("/summary/month", getMonthlySummary);

export default router;
