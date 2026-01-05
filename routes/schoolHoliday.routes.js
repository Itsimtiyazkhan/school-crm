import express from "express";
import {
  addHolidayOverride,
  getHolidayOverrides,
  deleteHolidayOverride,
} from "../controllers/schoolHoliday.controller.js";

const router = express.Router();

router.post("/holiday", addHolidayOverride);
router.get("/holiday", getHolidayOverrides);
router.delete("/holiday/:id", deleteHolidayOverride);

export default router;
