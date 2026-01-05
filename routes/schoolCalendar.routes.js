import express from "express";
import { getSchoolCalendar } from "../controllers/schoolCalendarController.js";
import {
  updateSchoolSettings,
  getSchoolSettings,
} from "../controllers/schoolSettingsController.js";

const router = express.Router();

router.get("/settings/:schoolId", getSchoolSettings);
router.put("/settings/:schoolId", updateSchoolSettings);
router.get("/:schoolId/:year", getSchoolCalendar);

export default router;
