import { db } from "../config/firebase.js";

/**
 * POST /api/school-calendar/holiday
 * Add / Remove holiday override
 */
export const addHolidayOverride = async (req, res) => {
  try {
    const { schoolId, date, name, action } = req.body;

    if (!schoolId || !date || !name || !action) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (!["ADD", "REMOVE"].includes(action)) {
      return res.status(400).json({ message: "Invalid action" });
    }

    const year = new Date(date).getFullYear();

    const ref = db.collection("schoolHolidayOverrides").doc();

    await ref.set({
      id: ref.id,
      schoolId,
      date,
      name,
      action,
      year,
      createdAt: new Date().toISOString(),
    });

    res.status(201).json({
      message: "Holiday override saved",
      id: ref.id,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * GET /api/school-calendar/holiday?schoolId=&year=
 */
export const getHolidayOverrides = async (req, res) => {
  try {
    const { schoolId, year } = req.query;

    if (!schoolId || !year) {
      return res
        .status(400)
        .json({ message: "schoolId and year are required" });
    }

    const snap = await db
      .collection("schoolHolidayOverrides")
      .where("schoolId", "==", schoolId)
      .where("year", "==", Number(year))
      .get();

    const holidays = snap.docs.map((d) => d.data());

    res.json(holidays);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * DELETE /api/school-calendar/holiday/:id
 */
export const deleteHolidayOverride = async (req, res) => {
  try {
    const { id } = req.params;

    await db.collection("schoolHolidayOverrides").doc(id).delete();

    res.json({ message: "Holiday override deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
