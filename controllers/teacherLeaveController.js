import { db } from "../config/firebase.js";

// 🟢 Teacher submits leave request
export const requestLeave = async (req, res) => {
  try {
    const { schoolId, teacherId, teacherName, date, reason } = req.body;

    if (!schoolId || !teacherId || !date || !reason)
      return res.status(400).json({ message: "Missing required fields" });

    const leaveId = "LEAVE-" + Math.floor(1000 + Math.random() * 9000);

    const ref = db
      .collection("schools")
      .doc(schoolId)
      .collection("teacherLeaves")
      .doc(leaveId);

    await ref.set({
      leaveId,
      teacherId,
      teacherName,
      date,
      reason,
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    res.json({ message: "Leave request submitted", leaveId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🟡 Teacher sees their leave history
export const listTeacherLeaves = async (req, res) => {
  try {
    const { schoolId, teacherId } = req.query;
    if (!schoolId || !teacherId)
      return res.status(400).json({ message: "schoolId & teacherId required" });
    const snap = await db
      .collection("schools")
      .doc(schoolId)
      .collection("teacherLeaves")
      .where("teacherId", "==", teacherId)
      .get();

    res.json(snap.docs.map((d) => d.data()));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔵 Admin sees ALL leave requests
export const adminLeaveList = async (req, res) => {
  try {
    const { schoolId } = req.query;

    const snap = await db
      .collection("schools")
      .doc(schoolId)
      .collection("teacherLeaves")
      .get();

    res.json(snap.docs.map((d) => d.data()));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔵 Admin approves a leave request
export const approveLeave = async (req, res) => {
  try {
    const { schoolId, leaveId } = req.params;

    const ref = db
      .collection("schools")
      .doc(schoolId)
      .collection("teacherLeaves")
      .doc(leaveId);

    await ref.update({
      status: "approved",
      updatedAt: new Date().toISOString(),
    });

    res.json({ message: "Leave approved" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔴 Admin rejects leave request
export const rejectLeave = async (req, res) => {
  try {
    const { schoolId, leaveId } = req.params;

    const ref = db
      .collection("schools")
      .doc(schoolId)
      .collection("teacherLeaves")
      .doc(leaveId);

    await ref.update({
      status: "rejected",
      updatedAt: new Date().toISOString(),
    });

    res.json({ message: "Leave rejected" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
