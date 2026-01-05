import { db } from "../config/firebase.js";

/* -------------------------------------------------
   MARK ATTENDANCE
-------------------------------------------------- */
export const markAttendance = async (req, res) => {
  try {
    const { schoolId, classId, className, date, attendance, markedBy } =
      req.body;

    if (!schoolId || !classId || !date || !attendance)
      return res.status(400).json({ message: "Missing required fields" });

    const dayRef = db
      .collection("schools")
      .doc(schoolId)
      .collection("attendance")
      .doc(date)
      .collection(classId);

    const batch = db.batch();

    attendance.forEach((item) => {
      const studRef = dayRef.doc(item.studentId);
      batch.set(studRef, {
        studentId: item.studentId,
        studentName: item.studentName,
        present: item.present,
        classId,
        className,
        date,
        markedBy,
        timestamp: new Date().toISOString(),
      });
    });

    await batch.commit();

    res.json({ message: "Attendance marked successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* -------------------------------------------------
   GET ATTENDANCE FOR A SPECIFIC DATE + CLASS
-------------------------------------------------- */
export const getAttendance = async (req, res) => {
  try {
    const { schoolId, date, classId } = req.query;

    if (!schoolId || !date || !classId)
      return res
        .status(400)
        .json({ message: "schoolId, date, classId required" });

    const snap = await db
      .collection("schools")
      .doc(schoolId)
      .collection("attendance")
      .doc(date)
      .collection(classId)
      .get();

    const list = snap.docs.map((d) => d.data());
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* -------------------------------------------------
   UPDATE ATTENDANCE
-------------------------------------------------- */
export const updateAttendance = async (req, res) => {
  try {
    const { schoolId, date, classId, studentId } = req.params;

    const ref = db
      .collection("schools")
      .doc(schoolId)
      .collection("attendance")
      .doc(date)
      .collection(classId)
      .doc(studentId);

    await ref.update(req.body);

    res.json({ message: "Attendance updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* -------------------------------------------------
   GET MONTHLY SUMMARY
-------------------------------------------------- */
export const getMonthlySummary = async (req, res) => {
  try {
    const { schoolId, classId, month } = req.query;

    if (!schoolId || !classId || !month)
      return res
        .status(400)
        .json({ message: "schoolId, classId, month required" });

    const attendanceRef = db
      .collection("schools")
      .doc(schoolId)
      .collection("attendance");

    const snap = await attendanceRef.get();

    let summary = [];

    snap.forEach((doc) => {
      if (doc.id.startsWith(month)) {
        summary.push({ date: doc.id });
      }
    });

    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const getStudentMonthlySummary = async (req, res) => {
  try {
    const { schoolId, studentId, month } = req.query;

    if (!schoolId || !studentId || !month)
      return res.status(400).json({ message: "Missing fields" });

    const attRef = db
      .collection("schools")
      .doc(schoolId)
      .collection("attendance");

    const snap = await attRef.get();

    let presentDays = 0;
    let absentDays = 0;

    for (const day of snap.docs) {
      if (day.id.startsWith(month)) {
        const classesSnap = await attRef.doc(day.id).listCollections();

        for (const classCol of classesSnap) {
          const doc = await classCol.doc(studentId).get();
          if (doc.exists) {
            if (doc.data().present) presentDays++;
            else absentDays++;
          }
        }
      }
    }

    const total = presentDays + absentDays;
    const percentage = total ? Math.round((presentDays / total) * 100) : 0;

    res.json({ presentDays, absentDays, total, percentage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const getStudentAttendanceHistory = async (req, res) => {
  try {
    const { schoolId, studentId } = req.query;

    if (!schoolId || !studentId)
      return res.status(400).json({ message: "schoolId & studentId required" });

    const attRef = db
      .collection("schools")
      .doc(schoolId)
      .collection("attendance");

    const snap = await attRef.get();

    let history = [];

    for (const day of snap.docs) {
      const date = day.id;

      const classesSnap = await attRef.doc(date).listCollections();

      for (const classCol of classesSnap) {
        const doc = await classCol.doc(studentId).get();
        if (doc.exists) {
          history.push({
            date,
            present: doc.data().present,
            classId: doc.data().classId,
          });
        }
      }
    }

    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
