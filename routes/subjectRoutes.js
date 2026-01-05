import express from "express";
import multer from "multer";
import {
  addSubject,
  getAllSubjects,
  getSubjectsByClass,
  updateSubject,
  deleteSubject,
  bulkAddSubjects,
  downloadTemplate,
} from "../controllers/subjectController.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/add", addSubject);
router.get("/:schoolId", getAllSubjects);
router.get("/:schoolId/by-class/:classId", getSubjectsByClass);
router.put("/:schoolId/:subjectId", updateSubject);
router.delete("/:schoolId/:subjectId", deleteSubject);

// Bulk & Template
router.post("/bulk-add/:schoolId", upload.single("file"), bulkAddSubjects);
router.get("/template/download", downloadTemplate);

export default router;
