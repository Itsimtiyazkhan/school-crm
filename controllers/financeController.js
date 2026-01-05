import { db } from "../config/firebase.js";

// Add Fee Type
export const addFeeType = async (req, res) => {
  try {
    const { schoolId, name, amount } = req.body;

    if (!schoolId || !name || !amount)
      return res.status(400).json({ message: "Missing required fields" });

    const feeTypeId = "FT-" + Math.floor(1000 + Math.random() * 9000);

    await db
      .collection("schools")
      .doc(schoolId)
      .collection("feeTypes")
      .doc(feeTypeId)
      .set({
        feeTypeId,
        name,
        amount,
        createdAt: new Date().toISOString(),
      });

    res.json({ message: "Fee type created", feeTypeId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get All Fee Types
export const getFeeTypes = async (req, res) => {
  try {
    const { schoolId } = req.params;

    const snap = await db
      .collection("schools")
      .doc(schoolId)
      .collection("feeTypes")
      .get();

    res.json(snap.docs.map((d) => d.data()));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Pay Fee (Generate Payment Record)
export const payFee = async (req, res) => {
  try {
    const {
      schoolId,
      studentId,
      classId,
      className,
      feeTypeId,
      feeTypeName,
      amount,
      month,
      paymentMethod,
    } = req.body;

    if (!schoolId || !studentId || !feeTypeId)
      return res.status(400).json({ message: "Missing required fields" });

    const paymentId = "PAY-" + Math.floor(100000 + Math.random() * 900000);

    const paymentData = {
      paymentId,
      studentId,
      classId,
      className,
      feeTypeId,
      feeTypeName,
      amount,
      month,
      paymentMethod,
      date: new Date().toISOString(),
    };

    // Save in main fees collection
    await db
      .collection("schools")
      .doc(schoolId)
      .collection("fees")
      .doc(paymentId)
      .set(paymentData);

    // Save in student → fees history
    await db
      .collection("schools")
      .doc(schoolId)
      .collection("students")
      .doc(studentId)
      .collection("fees")
      .doc(paymentId)
      .set(paymentData);

    res.json({ message: "Fee paid successfully", paymentId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get Fee History for Student
export const getFeeHistory = async (req, res) => {
  try {
    const { schoolId, studentId } = req.params;

    const snap = await db
      .collection("schools")
      .doc(schoolId)
      .collection("students")
      .doc(studentId)
      .collection("fees")
      .orderBy("date", "desc")
      .get();

    res.json(snap.docs.map((d) => d.data()));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Monthly Summary
export const getMonthlySummary = async (req, res) => {
  try {
    const { schoolId, month } = req.query;

    const snap = await db
      .collection("schools")
      .doc(schoolId)
      .collection("fees")
      .where("month", "==", month)
      .get();

    const data = snap.docs.map((d) => d.data());

    const total = data.reduce((sum, f) => sum + f.amount, 0);

    res.json({ month, totalCollected: total, records: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
