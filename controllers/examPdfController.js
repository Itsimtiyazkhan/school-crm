// controllers/examPdfController.js
import PDFDocument from "pdfkit";
import { db } from "../config/firebase.js";

export const generateReportPDF = async (req, res) => {
  try {
    const { schoolId, examId, studentId } = req.params;

    // Fetch Exam
    const examDoc = await db
      .collection("schools")
      .doc(schoolId)
      .collection("exams")
      .doc(examId)
      .get();

    if (!examDoc.exists)
      return res.status(404).json({ message: "Exam not found" });

    const exam = examDoc.data();

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

    const result = resultDoc.data();

    const studentDoc = await db
      .collection("schools")
      .doc(schoolId)
      .collection("students")
      .doc(studentId)
      .get();

    const student = studentDoc.exists ? studentDoc.data() : { name: "Unknown" };

    // PDF
    const doc = new PDFDocument({ margin: 40 });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename=${studentId}-report.pdf`
    );

    doc.pipe(res);

    doc.fontSize(20).text("Report Card", { align: "center" });
    doc.moveDown();

    doc.text(`Exam: ${exam.examType}`);
    doc.text(`Class: ${exam.className}`);
    doc.text(`Student: ${student.name} (${studentId})`);
    doc.moveDown();

    doc.fontSize(14).text("Subject Marks", { underline: true });
    doc.moveDown();

    Object.entries(result.marks).forEach(([sub, m]) => {
      doc.fontSize(12).text(`${sub}: ${m.obtained} / ${m.max}`);
    });

    doc.moveDown();

    doc.fontSize(14).text("Summary", { underline: true });
    doc.text(`Total: ${result.totalObtained} / ${result.totalMaximum}`);
    doc.text(`Percentage: ${result.percentage}%`);
    doc.text(`Grade: ${result.grade}`);

    doc.end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
