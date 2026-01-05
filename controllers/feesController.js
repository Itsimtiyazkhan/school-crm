import { db } from "../config/firebase.js";
import PDFDocument from "pdfkit";

// 🏫 Create / Update Fee Structure (Class-wise)
export const createFeeStructure = async (req, res) => {
  try {
    const { schoolId, classId, className, frequency, feeType } = req.body;

    if (!schoolId || !classId || !feeType)
      return res.status(400).json({ message: "Missing required fields" });

    await db
      .collection("schools")
      .doc(schoolId)
      .collection("feesStructure")
      .doc(classId)
      .set({
        classId,
        className,
        frequency,
        feeType, // Array of {category, amount}
        updatedAt: new Date().toISOString(),
      });

    res.json({ message: "Fee structure saved successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✏️ Update Fee Structure
export const updateFeeStructure = async (req, res) => {
  try {
    const { schoolId, classId, className, frequency, feeType } = req.body;

    if (!schoolId || !classId)
      return res.status(400).json({ message: "Missing required fields" });

    await db
      .collection("schools")
      .doc(schoolId)
      .collection("feesStructure")
      .doc(classId)
      .update({
        className,
        frequency,
        feeType,
        updatedAt: new Date().toISOString(),
      });

    res.json({ message: "Fee structure updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🗑 Delete Fee Structure
export const deleteFeeStructure = async (req, res) => {
  try {
    const { schoolId, classId } = req.params;

    await db
      .collection("schools")
      .doc(schoolId)
      .collection("feesStructure")
      .doc(classId)
      .delete();

    res.json({ message: "Fee structure deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🧾 Get Fee Structure For Class
export const getFeeStructure = async (req, res) => {
  try {
    const { schoolId, classId } = req.params;

    const doc = await db
      .collection("schools")
      .doc(schoolId)
      .collection("feesStructure")
      .doc(classId)
      .get();

    if (!doc.exists)
      return res.status(404).json({ message: "No fee structure found" });

    res.json(doc.data());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🎓 Assign Custom Fee to Student
export const assignCustomFee = async (req, res) => {
  try {
    const { schoolId, studentId, discountType, discount, finalAmount } =
      req.body;

    // Fetch Student
    const studentDoc = await db
      .collection("schools")
      .doc(schoolId)
      .collection("students")
      .doc(studentId)
      .get();

    if (!studentDoc.exists)
      return res.status(404).json({ message: "Student not found" });

    const student = studentDoc.data();

    // Fetch Class Fee Structure
    const feeDoc = await db
      .collection("schools")
      .doc(schoolId)
      .collection("feesStructure")
      .doc(student.classId)
      .get();

    if (!feeDoc.exists)
      return res.status(404).json({ message: "Class fee not found" });

    const fee = feeDoc.data();

    // Fetch Class Name
    const classDoc = await db
      .collection("schools")
      .doc(schoolId)
      .collection("classes")
      .doc(student.classId)
      .get();

    const classData = classDoc.exists ? classDoc.data() : {};
    const className = `${classData.name || ""} ${
      classData.section || ""
    }`.trim();

    // Calculate base fee
    const baseFees = fee.feeType.reduce(
      (sum, f) => sum + parseInt(f.amount),
      0
    );

    // Save into studentFees collection
    await db
      .collection("schools")
      .doc(schoolId)
      .collection("studentFees")
      .doc(studentId)
      .set({
        studentId,
        studentName: student.name,
        classId: student.classId,
        className,
        baseFees,
        discountType,
        discount,
        payableAmount: finalAmount,
        paid: 0,
        pending: finalAmount,
        nextDueDate:
          fee.frequency === "Monthly" ? "Next Month" : "To Be Assigned",
        updatedAt: new Date().toISOString(),
      });

    res.json({ message: "Custom fee applied to student successfully!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔍 Get Student Fee Details
// Get Student Fee (with discount & class fees calculated)
export const getStudentFee = async (req, res) => {
  try {
    const { schoolId, studentId } = req.params;
    console.log(req, "res");

    // Get Custom Fee
    const custom = await db
      .collection("schools")
      .doc(schoolId)
      .collection("studentFees")
      .doc(studentId)
      .get();

    if (custom.exists) {
      return res.json(custom.data()); // return discounted fee
    }

    // If no custom fee, return class fee structure
    const student = await db
      .collection("schools")
      .doc(schoolId)
      .collection("students")
      .doc(studentId)
      .get();

    const data = student.data();

    const classFee = await db
      .collection("schools")
      .doc(schoolId)
      .collection("feesStructure")
      .doc(data.classId)
      .get();

    if (!classFee.exists)
      return res.status(404).json({ message: "No fee structure found" });

    const fee = classFee.data();

    const total = (fee.feeType || []).reduce(
      (sum, f) => sum + parseInt(f.amount),
      0
    );

    res.json({
      studentId,
      studentName: data.name,
      classId: data.classId,
      className: data.className,
      baseFees: total,
      discountType: null,
      discount: 0,
      payableAmount: total,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getStudentFeeSummary = async (req, res) => {
  try {
    const { schoolId, studentId } = req.query;

    const doc = await db
      .collection("schools")
      .doc(schoolId)
      .collection("studentFees")
      .doc(studentId)
      .get();

    if (!doc.exists)
      return res.status(404).json({ message: "No fee record found" });

    const d = doc.data();

    res.json({
      total: d.baseFees,
      paid: d.paid ?? 0,
      pending: (d.baseFees ?? 0) - (d.paid ?? 0),
      nextDueDate: d.nextDueDate ?? "-",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getStudentPaymentHistory = async (req, res) => {
  try {
    const { schoolId, studentId } = req.query;

    const snap = await db
      .collection("schools")
      .doc(schoolId)
      .collection("paymentHistory")
      .where("studentId", "==", studentId)
      .get();

    const list = snap.docs.map((d) => d.data());
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const generateFeeReceipt = async (req, res) => {
  try {
    const { schoolId, paymentId } = req.params;

    // Here you generate PDF (like exam receipt)
    res.json({ message: "Coming soon: PDF Receipt" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📋 Get list of all student fees for a school
export const getFeesList = async (req, res) => {
  try {
    const { schoolId } = req.params;

    const snap = await db
      .collection("schools")
      .doc(schoolId)
      .collection("studentFees")
      .get();

    const list = snap.docs.map((d) => d.data());

    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const generateFeePDF = async (req, res) => {
  try {
    const { schoolId, studentId, type } = req.params;

    // Fetch Student Info
    const studentDoc = await db
      .collection("schools")
      .doc(schoolId)
      .collection("students")
      .doc(studentId)
      .get();

    if (!studentDoc.exists)
      return res.status(404).json({ message: "Student not found" });

    const student = studentDoc.data();

    // Fetch Fee Structure
    const feeStructureDoc = await db
      .collection("schools")
      .doc(schoolId)
      .collection("feesStructure")
      .doc(student.classId)
      .get();

    // Fetch Custom Applied Fee
    const customFeeDoc = await db
      .collection("schools")
      .doc(schoolId)
      .collection("studentFees")
      .doc(studentId)
      .get();

    const feeStructure = feeStructureDoc.exists ? feeStructureDoc.data() : null;
    const customFee = customFeeDoc.exists ? customFeeDoc.data() : null;

    // Fetch Payment History
    const historySnap = await db
      .collection("schools")
      .doc(schoolId)
      .collection("payments")
      .where("studentId", "==", studentId)
      .get();

    const history = historySnap.docs.map((d) => d.data());
    const paid = history.reduce((a, b) => a + Number(b.amount), 0);

    const baseTotal = feeStructure
      ? feeStructure.feeType.reduce((s, f) => s + Number(f.amount), 0)
      : 0;

    const finalPayable = customFee?.payableAmount ?? baseTotal;
    const pending = finalPayable - paid;

    // PDF Start
    const doc = new PDFDocument({ margin: 40 });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename=fee-${studentId}-${type}.pdf`
    );
    doc.pipe(res);

    doc.fontSize(20).text("Fee Receipt", { align: "center" });
    doc.moveDown();

    doc.fontSize(12);
    doc.text(`Student Name: ${student.name}`);
    doc.text(`Student ID: ${student.studentId}`);
    doc.text(`Class: ${student.className}`);
    doc.text(`Billing Cycle: ${feeStructure?.frequency || "-"}`);
    doc.moveDown();

    doc.fontSize(14).text("Fee Summary", { underline: true });
    doc.moveDown(0.5);

    doc.fontSize(12);
    doc.text(`Base Total: ₹${baseTotal}`);
    doc.text(`Final Payable: ₹${finalPayable}`);
    doc.text(`Paid: ₹${paid}`);
    doc.text(`Pending: ₹${pending}`);
    doc.moveDown();

    // ==================== FULL RECEIPT (with breakdown + history) ====================
    if (type === "full") {
      doc.fontSize(14).text("Fee Breakdown", { underline: true });
      doc.moveDown(0.5);

      feeStructure?.feeType?.forEach((f) => {
        doc.text(`${f.category}: ₹${f.amount}`, { indent: 20 });
      });
      doc.moveDown();

      doc.fontSize(14).text("Payment History", { underline: true });
      doc.moveDown(0.5);

      history.forEach((p) => {
        doc.text(`${p.date} - ₹${p.amount} (${p.mode})`, { indent: 20 });
      });
    }

    doc.moveDown(2);
    doc.text("____________________        ____________________", {
      align: "center",
    });
    doc.text("Student Signature             School Signature", {
      align: "center",
    });

    doc.end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
