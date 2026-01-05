import express from "express";
import {
  addExpense,
  getExpenses,
  getExpenseTrend,
  addReimbursement,
  getReimbursements,
  updateReimbursement,
} from "../controllers/expenseController.js";
const router = express.Router();
// EXPENSES
router.post("/add", addExpense);
router.get("/", getExpenses);
router.get("/trend/monthly", getExpenseTrend);

// REIMBURSEMENTS
router.post("/reimbursements/add", addReimbursement);
router.get("/reimbursements", getReimbursements);
router.put("/reimbursements/:schoolId/:reimbursementId", updateReimbursement);
export default router;
