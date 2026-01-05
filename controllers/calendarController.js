import { db } from "../config/firebase.js";

export const addEvent = async (req, res) => {
  try {
    const { schoolId, title, category, startDate, endDate, description } =
      req.body;

    if (!schoolId || !title || !startDate)
      return res.status(400).json({ message: "Missing required fields" });

    const eventId = "EVT-" + Math.floor(1000 + Math.random() * 9000);

    const ref = db
      .collection("schools")
      .doc(schoolId)
      .collection("events")
      .doc(eventId);

    await ref.set({
      eventId,
      title,
      category,
      startDate,
      endDate,
      description,
      createdAt: new Date().toISOString(),
    });

    res.status(201).json({ message: "Event created", eventId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getEvents = async (req, res) => {
  try {
    const { schoolId, category, month } = req.query;

    if (!schoolId)
      return res.status(400).json({ message: "schoolId required" });

    let snap = await db
      .collection("schools")
      .doc(schoolId)
      .collection("events")
      .get();

    let events = snap.docs.map((d) => d.data());

    if (category) events = events.filter((e) => e.category === category);

    if (month) {
      events = events.filter((e) => {
        const date = new Date(e.startDate);
        const m = date.toLocaleString("default", {
          month: "long",
          year: "numeric",
        });
        return m === month;
      });
    }

    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getEventById = async (req, res) => {
  try {
    const { schoolId, eventId } = req.params;

    const doc = await db
      .collection("schools")
      .doc(schoolId)
      .collection("events")
      .doc(eventId)
      .get();

    if (!doc.exists)
      return res.status(404).json({ message: "Event not found" });

    res.json(doc.data());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const { schoolId, eventId } = req.params;

    await db
      .collection("schools")
      .doc(schoolId)
      .collection("events")
      .doc(eventId)
      .update(req.body);

    res.json({ message: "Event updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const { schoolId, eventId } = req.params;

    await db
      .collection("schools")
      .doc(schoolId)
      .collection("events")
      .doc(eventId)
      .delete();

    res.json({ message: "Event deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getEventSummary = async (req, res) => {
  try {
    const { schoolId } = req.query;

    if (!schoolId)
      return res.status(400).json({ message: "schoolId required" });

    const snap = await db
      .collection("schools")
      .doc(schoolId)
      .collection("events")
      .get();

    const events = snap.docs.map((d) => d.data());

    const summary = {
      total: events.length,
      academic: events.filter((e) => e.category === "Academic").length,
      events: events.filter((e) => e.category === "Events").length,
      holiday: events.filter((e) => e.category === "Holiday").length,
      administration: events.filter((e) => e.category === "Administration")
        .length,
    };

    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
