import express from "express";
import { db } from "../config/firebase.js";
const router = express.Router();
const collection = "schools";

// ✅ Get all schools (for super admin dashboard)
router.get("/schools", async (req, res) => {
  try {
    const snap = await db.collection(collection).get();
    const schools = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(schools);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Approve / Unapprove school
router.put("/schools/:id/approve", async (req, res) => {
  try {
    const { approved } = req.body; // true or false
    await db.collection(collection).doc(req.params.id).update({ approved });
    res.json({ message: `School ${approved ? "approved" : "unapproved"}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Disable or enable school (e.g. after plan expiry)
router.put("/schools/:id/disable", async (req, res) => {
  try {
    const { disabled } = req.body; // true or false
    await db.collection(collection).doc(req.params.id).update({ disabled });
    res.json({ message: `School ${disabled ? "disabled" : "enabled"}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Extend or update plan
router.put("/schools/:id/plan", async (req, res) => {
  try {
    const { plan, planExpiry } = req.body;
    await db.collection(collection).doc(req.params.id).update({
      plan,
      planExpiry,
    });
    res.json({ message: "Plan updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Run this route manually or schedule it (with node-cron or a cloud scheduler).
router.post("/schools/check-expiry", async (req, res) => {
  try {
    const snap = await db.collection(collection).get();
    const now = new Date();
    let updated = 0;
    for (const doc of snap.docs) {
      const data = doc.data();
      if (
        data.planExpiry &&
        new Date(data.planExpiry) < now &&
        !data.disabled
      ) {
        await doc.ref.update({ disabled: true });
        updated++;
      }
    }
    res.json({ message: `Disabled ${updated} expired schools` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
