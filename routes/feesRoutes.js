import express from "express";
import {
  createFeeStructure,
  getFeeStructure,
  assignCustomFee,
  getStudentFee,
  getStudentFeeSummary,
  getStudentPaymentHistory,
  generateFeeReceipt,
  getFeesList,
  generateFeePDF,
  updateFeeStructure,
  deleteFeeStructure,
} from "../controllers/feesController.js";

const router = express.Router();

// CLASS FEE STRUCTURE
router.post("/structure/create", createFeeStructure);
router.get("/structure/:schoolId/:classId", getFeeStructure);
//edit & delete
router.put("/structure/update", updateFeeStructure);
router.delete("/structure/delete/:schoolId/:classId", deleteFeeStructure);

// CUSTOM STUDENT FEE
router.post("/custom/assign", assignCustomFee);
router.get("/student/:schoolId/:studentId", getStudentFee);
router.get("/list/:schoolId", getFeesList);

// NEW :
router.get("/student/summary", getStudentFeeSummary);
router.get("/student/history", getStudentPaymentHistory);
router.get("/receipt/:schoolId/:paymentId", generateFeeReceipt);

//PDF
router.get("/:schoolId/:studentId/:type", generateFeePDF);

export default router;
