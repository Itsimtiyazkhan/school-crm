import express from "express";
import {
  addEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  getEventSummary,
} from "../controllers/calendarController.js";
const router = express.Router();
// Events
router.post("/add", addEvent);
router.get("/", getEvents);
router.get("/summary", getEventSummary);
router.get("/:schoolId/:eventId", getEventById);
router.put("/:schoolId/:eventId", updateEvent);
router.delete("/:schoolId/:eventId", deleteEvent);
export default router;
