// controllers/examController.js
import { db } from "../config/firebase.js";

// ➕ Create Exam
export const createExam = async (req, res) => {
  try {
    const {
      schoolId,
      classId,
      className,
      examType,
      startDate,
      endDate,
      subjects,
    } = req.body;

    if (
      !schoolId ||
      !classId ||
      !examType ||
      !subjects ||
      subjects.length === 0
    )
      return res.status(400).json({ message: "Missing required fields" });

    // validate: subjectId → get subject → get teacherId
    const subjectsWithTeacher = await Promise.all(
      subjects.map(async (sub) => {
        if (!sub.subjectId) return { ...sub };

        const subDoc = await db
          .collection("schools")
          .doc(schoolId)
          .collection("subjects")
          .doc(sub.subjectId)
          .get();

        let teacherId = "";

        if (subDoc.exists) {
          teacherId = subDoc.data().teacherId; // 🔥 ADD THIS
        }

        return {
          ...sub,
          teacherId: teacherId || "", // 🔥 attach teacher ID
        };
      })
    );

    const examId = "EXAM-" + Math.floor(1000 + Math.random() * 9000);

    await db
      .collection("schools")
      .doc(schoolId)
      .collection("exams")
      .doc(examId)
      .set({
        examId,
        examType,
        classId,
        className,
        subjects: subjectsWithTeacher, // 🔥 updated data
        startDate,
        endDate,
        createdAt: new Date().toISOString(),
      });

    res.status(201).json({ message: "Exam created successfully", examId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📋 Get all exams
export const getAllExams = async (req, res) => {
  try {
    const { schoolId } = req.params;

    const snap = await db
      .collection("schools")
      .doc(schoolId)
      .collection("exams")
      .get();

    res.json(snap.docs.map((d) => d.data()));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🧮 Class-wise exams
export const getExamsByClass = async (req, res) => {
  try {
    const { schoolId, classId } = req.params;

    const snap = await db
      .collection("schools")
      .doc(schoolId)
      .collection("exams")
      .where("classId", "==", classId)
      .get();

    res.json(snap.docs.map((d) => d.data()));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🧾 Exam details
export const getExamDetails = async (req, res) => {
  try {
    const { schoolId, examId } = req.params;

    const doc = await db
      .collection("schools")
      .doc(schoolId)
      .collection("exams")
      .doc(examId)
      .get();

    if (!doc.exists) return res.status(404).json({ message: "Exam not found" });

    res.json(doc.data());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ❌ Delete exam
export const deleteExam = async (req, res) => {
  try {
    const { schoolId, examId } = req.params;

    await db
      .collection("schools")
      .doc(schoolId)
      .collection("exams")
      .doc(examId)
      .delete();

    res.json({ message: "Exam deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
