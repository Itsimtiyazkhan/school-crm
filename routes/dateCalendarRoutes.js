import express from "express";
import {
  getCalendar,
  getHolidays,
} from "../controllers/dateCalendarController.js";

const router = express.Router();

router.get("/calendar/:year", getCalendar);
router.get("/holidays/:year", getHolidays);

export default router;
