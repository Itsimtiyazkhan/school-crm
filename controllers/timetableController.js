import { db } from "../config/firebase.js";

// 📌 Save full timetable for a class
export const saveTimetable = async (req, res) => {
  try {
    const { schoolId, classId } = req.params;
    const timetable = req.body;

    if (!schoolId || !classId)
      return res.status(400).json({ message: "Missing schoolId or classId" });

    // STEP 1: Load all subjects with teacher mapping
    const subjectsSnap = await db
      .collection("schools")
      .doc(schoolId)
      .collection("subjects")
      .get();

    const subjectMap = {};
    subjectsSnap.docs.forEach((s) => {
      const d = s.data();
      subjectMap[d.subjectId] = {
        teacherId: d.teacherId || null,
        subjectName: d.name,
        classId: d.classId,
      };
    });

    // STEP 2: Load all existing timetables to detect conflicts
    const allTimetablesSnap = await db
      .collection("schools")
      .doc(schoolId)
      .collection("timetables")
      .get();

    const allTimetables = {};
    allTimetablesSnap.docs.forEach((t) => {
      allTimetables[t.id] = t.data();
    });

    // STEP 3: Check each day & period in this new timetable
    for (const day in timetable) {
      for (const period in timetable[day]) {
        const subjectId = timetable[day][period];
        const assignedTeacher = subjectMap[subjectId]?.teacherId;

        if (!assignedTeacher) continue; // subject with no teacher

        // STEP 4: Check across all classes for same day & period
        for (const existingClassId in allTimetables) {
          // Skip same class
          if (existingClassId === classId) continue;

          const classTimetable = allTimetables[existingClassId];

          // If that class has timetable for this day/period
          if (
            classTimetable?.[day]?.[period] &&
            subjectMap[classTimetable[day][period]]?.teacherId ===
              assignedTeacher
          ) {
            const conflictSubjectName = subjectMap[subjectId]?.subjectName;
            const conflictClass =
              subjectMap[classTimetable[day][period]]?.classId;

            return res.status(400).json({
              message: "Teacher Double Booking Detected!",
              conflict: {
                teacherId: assignedTeacher,
                day,
                period,
                subjectName: conflictSubjectName,
                class1: classId,
                class2: existingClassId,
              },
            });
          }
        }
      }
    }

    // STEP 5: Save timetable if no conflict
    await db
      .collection("schools")
      .doc(schoolId)
      .collection("timetables")
      .doc(classId)
      .set(timetable, { merge: true });

    res.json({ message: "Timetable saved successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📌 Load a full timetable for class
export const getTimetableByClass = async (req, res) => {
  try {
    const { schoolId, classId } = req.params;

    const doc = await db
      .collection("schools")
      .doc(schoolId)
      .collection("timetables")
      .doc(classId)
      .get();

    res.json(doc.exists ? doc.data() : {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📌 Delete a specific period
export const deletePeriod = async (req, res) => {
  try {
    const { schoolId, classId, day, period } = req.params;

    const docRef = db
      .collection("schools")
      .doc(schoolId)
      .collection("timetables")
      .doc(classId);

    const doc = await docRef.get();
    if (!doc.exists) return res.json({ message: "Nothing to delete" });

    const timetable = doc.data();
    if (timetable[day]) delete timetable[day][period];

    await docRef.set(timetable);

    res.json({ message: "Period deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
