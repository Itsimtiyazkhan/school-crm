// controllers/examResultController.js
import { db } from "../config/firebase.js";

// ➕ Add or Update Student Marks
export const addOrUpdateMarks = async (req, res) => {
  try {
    const { schoolId, examId, studentId, marks } = req.body;

    if (!schoolId || !examId || !studentId || !marks)
      return res.status(400).json({ message: "Missing required fields" });

    // Fetch exam to get maxMarks
    const examDoc = await db
      .collection("schools")
      .doc(schoolId)
      .collection("exams")
      .doc(examId)
      .get();

    if (!examDoc.exists)
      return res.status(404).json({ message: "Exam not found" });

    const exam = examDoc.data();

    // Create subject max lookup
    const subjectMaxMap = {};
    (exam.subjects || []).forEach((s) => {
      subjectMaxMap[s.name] = Number(s.maxMarks) || 100;
    });

    let totalObtained = 0;
    let totalMaximum = 0;

    // Calculate totals
    Object.entries(marks).forEach(([subject, value]) => {
      if (typeof value === "number") {
        totalObtained += value;
        totalMaximum += subjectMaxMap[subject] || 100;
      } else {
        totalObtained += value.obtained || 0;
        totalMaximum += value.max || subjectMaxMap[subject] || 100;
      }
    });

    const percentage = ((totalObtained / totalMaximum) * 100).toFixed(2);

    // Grade calculation
    let grade = "F";
    if (percentage >= 90) grade = "A+";
    else if (percentage >= 80) grade = "A";
    else if (percentage >= 70) grade = "B+";
    else if (percentage >= 60) grade = "B";
    else if (percentage >= 50) grade = "C";
    else if (percentage >= 40) grade = "D";

    await db
      .collection("schools")
      .doc(schoolId)
      .collection("exams")
      .doc(examId)
      .collection("results")
      .doc(studentId)
      .set({
        studentId,
        marks,
        totalObtained,
        totalMaximum,
        percentage,
        grade,
        updatedAt: new Date().toISOString(),
      });

    res.json({ message: "Marks saved successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getExamResults = async (req, res) => {
  try {
    const { schoolId, examId } = req.params;

    const snap = await db
      .collection("schools")
      .doc(schoolId)
      .collection("exams")
      .doc(examId)
      .collection("results")
      .get();

    res.json(snap.docs.map((d) => d.data()));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Individual Student Report
export const getStudentReportCard = async (req, res) => {
  try {
    const { schoolId, examId, studentId } = req.params;

    const resultDoc = await db
      .collection("schools")
      .doc(schoolId)
      .collection("exams")
      .doc(examId)
      .collection("results")
      .doc(studentId)
      .get();

    if (!resultDoc.exists)
      return res.status(404).json({ message: "Result not found" });

    res.json(resultDoc.data());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Class Performance Summary
export const getGradesSummary = async (req, res) => {
  try {
    const { schoolId, examId } = req.params;

    const snap = await db
      .collection("schools")
      .doc(schoolId)
      .collection("exams")
      .doc(examId)
      .collection("results")
      .get();

    const results = snap.docs.map((d) => d.data());
    if (results.length === 0)
      return res.status(404).json({ message: "No results" });

    const avg = (
      results.reduce((sum, r) => sum + parseFloat(r.percentage), 0) /
      results.length
    ).toFixed(2);

    const topper = results.reduce((max, r) =>
      parseFloat(r.percentage) > parseFloat(max.percentage) ? r : max
    );

    res.json({
      totalStudents: results.length,
      classAverage: avg,
      topper: {
        studentId: topper.studentId,
        percentage: topper.percentage,
        grade: topper.grade,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📊 Get all results for specific class and exam (for analytics)
export const getClassExamAnalytics = async (req, res) => {
  try {
    const { schoolId, examId, classId } = req.params;
    console.log(req.params, "@demo");

    const snap = await db
      .collection("schools")
      .doc(schoolId)
      .collection("exams")
      .doc(examId)
      .collection("results")
      .get();

    const results = snap.docs.map((doc) => doc.data());
    console.log(results, "test");

    if (!results.length) return res.json({ results: [], analytics: {} });

    // Average & Grade Count
    const avg =
      results.reduce((sum, r) => sum + parseFloat(r.percentage), 0) /
      results.length;

    const gradeCount = results.reduce((acc, r) => {
      acc[r.grade] = (acc[r.grade] || 0) + 1;
      return acc;
    }, {});

    res.json({
      classId,
      examId,
      results,
      analytics: {
        average: avg.toFixed(2),
        gradeCount,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
