import { db } from "../config/firebase.js";

/**
 * Auto-generate timetable for a class.
 * Body: { schoolId, classId, className, weekdays: ["Monday","Tuesday"...], periodsPerDay: 6 }
 * Algorithm: Fetch teacherAssignments for classId, get list of subjects, then round-robin assign subjects across periods.
 */
export const autoGenerateTimetable = async (req, res) => {
  try {
    const {
      schoolId,
      classId,
      className,
      weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      periodsPerDay = 6,
    } = req.body;
    if (!schoolId || !classId)
      return res.status(400).json({ message: "schoolId and classId required" });

    // fetch assignments for class
    const snap = await db
      .collection("schools")
      .doc(schoolId)
      .collection("teacherAssignments")
      .where("classId", "==", classId)
      .get();

    const assignments = snap.docs.map((d) => d.data());
    if (assignments.length === 0)
      return res
        .status(400)
        .json({ message: "No teacher assignments found for class" });

    // list of subject slots
    const subjects = assignments.map((a) => ({
      subjectId: a.subjectId,
      subjectName: a.subjectName,
      teacherId: a.teacherId,
      teacherName: a.teacherName,
    }));

    // simple round-robin fill
    const timetable = {};
    let idx = 0;
    for (const day of weekdays) {
      timetable[day] = {};
      for (let p = 1; p <= periodsPerDay; p++) {
        const slot = subjects[idx % subjects.length];
        timetable[day][`Period ${p}`] = {
          subjectId: slot.subjectId,
          subjectName: slot.subjectName,
          teacherId: slot.teacherId,
          teacherName: slot.teacherName,
          time: null,
        };
        idx++;
      }
    }

    // save timetable under classId
    const ref = db
      .collection("schools")
      .doc(schoolId)
      .collection("timetables")
      .doc(classId);
    await ref.set(timetable);

    res.json({ message: "Timetable auto-generated", timetable });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Copy timetable from one class to another (useful for similar sections)
 * Body: { schoolId, fromClassId, toClassId }
 */
export const copyTimetable = async (req, res) => {
  try {
    const { schoolId, fromClassId, toClassId } = req.body;
    if (!schoolId || !fromClassId || !toClassId)
      return res.status(400).json({ message: "Missing fields" });

    const fromDoc = await db
      .collection("schools")
      .doc(schoolId)
      .collection("timetables")
      .doc(fromClassId)
      .get();
    if (!fromDoc.exists)
      return res.status(404).json({ message: "Source timetable not found" });

    const data = fromDoc.data();
    await db
      .collection("schools")
      .doc(schoolId)
      .collection("timetables")
      .doc(toClassId)
      .set(data);

    res.json({ message: "Timetable copied" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
