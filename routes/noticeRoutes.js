import express from "express";
import {
  addNotice,
  getNotices,
  getNoticeById,
  updateNotice,
  deleteNotice,
  archiveNotice,
} from "../controllers/noticeController.js";
const router = express.Router();

router.post("/add", addNotice);

// Filters: category, status, visibility, classId
router.get("/", getNotices);

// Read single
router.get("/:schoolId/:noticeId", getNoticeById);

// Update
router.put("/:schoolId/:noticeId", updateNotice);

// Delete
router.delete("/:schoolId/:noticeId", deleteNotice);

// Archive
router.put("/:schoolId/:noticeId/archive", archiveNotice);
export default router;
