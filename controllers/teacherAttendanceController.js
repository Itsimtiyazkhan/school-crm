import { db } from "../config/firebase.js";

/**
 * Teacher marks attendance for a period (self sign-in or admin can mark)
 * Expected body:
 * { schoolId, teacherId, teacherName, date: "YYYY-MM-DD", period: "Period 1", status: "present"|"absent"|"on-leave", note }
 */

export const markTeacherAttendance = async (req, res) => {
  try {
    const {
      schoolId,
      teacherId,
      teacherName,
      date,
      period,
      status,
      note,
      markedBy,
    } = req.body;

    if (!schoolId || !teacherId || !date || !period || !status)
      return res.status(400).json({ message: "Missing required fields" });

    const ref = db
      .collection("schools")
      .doc(schoolId)
      .collection("teacherAttendance")
      .doc(date)
      .collection("periods")
      .doc(`${period}_${teacherId}`);

    await ref.set({
      teacherId,
      teacherName,
      date,
      period,
      status,
      note: note || "",
      markedBy: markedBy || "self",
      timestamp: new Date().toISOString(),
    });

    // ---------- SUMMARY ----------
    const month = date.substring(0, 7); // YYYY-MM

    const summaryRef = db
      .collection("schools")
      .doc(schoolId)
      .collection("teacherAttendanceSummary")
      .doc(`${teacherId}_${month}`);

    const dailyRef = db
      .collection("schools")
      .doc(schoolId)
      .collection("teacherAttendanceDaily")
      .doc(`${date}_${teacherId}`);

    const dailySnap = await dailyRef.get();
    let presentDays = 0,
      absentDays = 0,
      leaveDays = 0;

    // load existing summary
    const summarySnap = await summaryRef.get();
    if (summarySnap.exists) {
      const s = summarySnap.data();
      presentDays = s.presentDays || 0;
      absentDays = s.absentDays || 0;
      leaveDays = s.leaveDays || 0;
    }

    if (!dailySnap.exists) {
      await dailyRef.set({ status });

      if (status === "present") presentDays++;
      if (status === "absent") absentDays++;
      if (status === "on-leave") leaveDays++;
    }

    await summaryRef.set({
      teacherId,
      month,
      presentDays,
      absentDays,
      leaveDays,
      updatedAt: new Date().toISOString(),
    });

    res.json({ message: "Attendance marked successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Admin/Teacher fetch attendance for teacher or period:
 * Query params: ?schoolId=&date=&teacherId=&period=
 */
export const getTeacherAttendance = async (req, res) => {
  try {
    const { schoolId, date, teacherId, period } = req.query;
    if (!schoolId || !date)
      return res.status(400).json({ message: "schoolId and date required" });

    let ref = db
      .collection("schools")
      .doc(schoolId)
      .collection("teacherAttendance")
      .doc(date)
      .collection("periods");

    if (teacherId) {
      const doc = await ref.doc(`${period || "Period 1"}_${teacherId}`).get();
      if (!doc.exists) return res.json({});
      return res.json(doc.data());
    }

    // get all for date (and optional period filter)
    const snap = await ref.get();
    let items = snap.docs.map((d) => d.data());
    if (period) items = items.filter((i) => i.period === period);
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getTeacherMonthlySummary = async (req, res) => {
  try {
    const { schoolId, teacherId, month } = req.query;
    const doc = await db
      .collection("schools")
      .doc(schoolId)
      .collection("teacherAttendanceSummary")
      .doc(`${teacherId}_${month}`)
      .get();

    if (!doc.exists)
      return res.json({ presentDays: 0, absentDays: 0, leaveDays: 0 });

    res.json(doc.data());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
