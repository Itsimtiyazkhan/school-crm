import express from "express";
import {
  addAssignment,
  getAllAssignments,
  getAssignmentsByClass,
  updateAssignment,
  deleteAssignment,
} from "../controllers/assignmentController.js";

const router = express.Router();

router.post("/add", addAssignment);
router.get("/:schoolId", getAllAssignments);
router.get("/:schoolId/class/:classId", getAssignmentsByClass);
router.put("/:schoolId/:assignmentId", updateAssignment);
router.delete("/:schoolId/:assignmentId", deleteAssignment);

export default router;
