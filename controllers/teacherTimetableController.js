import { db } from "../config/firebase.js";

// AUTO GENERATE teacher timetable
export const getTeacherTimetable = async (req, res) => {
  try {
    const { schoolId, teacherId } = req.params;

    // 1: Load all subjects taught by this teacher
    const subjectSnap = await db
      .collection("schools")
      .doc(schoolId)
      .collection("subjects")
      .where("teacherId", "==", teacherId)
      .get();

    if (subjectSnap.empty)
      return res.json({
        message: "Teacher has no assigned subjects",
        timetable: {},
      });

    const subjects = subjectSnap.docs.map((d) => d.data());

    // Build map: subjectId → classId + subjectName
    const subjectMap = {};
    subjects.forEach((s) => {
      subjectMap[s.subjectId] = {
        classId: s.classId,
        subjectName: s.name,
      };
    });

    // 2: Load all class timetables
    const ttSnap = await db
      .collection("schools")
      .doc(schoolId)
      .collection("timetables")
      .get();

    let teacherTimetable = {};

    // 3: Loop over all class timetables
    for (const doc of ttSnap.docs) {
      const classId = doc.id;
      const classTT = doc.data();

      for (const day in classTT) {
        for (const period in classTT[day]) {
          const subjectId = classTT[day][period];

          // Check if this subject belongs to teacher
          if (subjectMap[subjectId]) {
            if (!teacherTimetable[day]) teacherTimetable[day] = {};

            teacherTimetable[day][period] = {
              classId,
              subjectId,
              subjectName: subjectMap[subjectId].subjectName,
            };
          }
        }
      }
    }

    res.json({
      teacherId,
      timetable: teacherTimetable,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
