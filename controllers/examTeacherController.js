import { db } from "../config/firebase.js";
import moment from "moment";

export const getTodayExamsForTeacher = async (req, res) => {
  try {
    const { schoolId, teacherId } = req.params;
    console.log(schoolId, teacherId, "details about exam");

    const today = moment().format("YYYY-MM-DD"); // exam.subjects[].date format

    const snap = await db
      .collection("schools")
      .doc(schoolId)
      .collection("exams")
      .get();

    const allExams = snap.docs.map((d) => d.data());
    console.log(allExams, "check");

    const filtered = [];

    allExams.forEach((exam) => {
      exam.subjects.forEach((sub) => {
        if (sub.teacherId === teacherId && sub.date === today) {
          filtered.push({
            examId: exam.examId,
            classId: exam.classId,
            className: exam.className,
            examType: exam.examType,
            subjectName: sub.name,
            subjectId: sub.subjectId,
            maxMarks: sub.maxMarks,
            date: sub.date,
          });
        }
      });
    });

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
