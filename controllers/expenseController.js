import { db } from "../config/firebase.js";

// ADD EXPENSE
export const addExpense = async (req, res) => {
  try {
    const { schoolId, title, amount, category, date, month } = req.body;

    if (!schoolId || !title || !amount)
      return res.status(400).json({ message: "Missing required fields" });

    const expenseId = "EXP-" + Math.floor(100000 + Math.random() * 900000);

    const expenseRef = db
      .collection("schools")
      .doc(schoolId)
      .collection("expenses")
      .doc(expenseId);

    await expenseRef.set({
      expenseId,
      title,
      amount,
      category,
      date,
      month,
      createdAt: new Date().toISOString(),
    });

    res.status(201).json({ message: "Expense added", expenseId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getExpenses = async (req, res) => {
  try {
    const { schoolId, category, month } = req.query;

    if (!schoolId) return res.status(400).json({ message: "schoolId required" });

    let q = db
      .collection("schools")
      .doc(schoolId)
      .collection("expenses");

    if (category) q = q.where("category", "==", category);
    if (month) q = q.where("month", "==", month);

    const snap = await q.get();
    res.json(snap.docs.map((d) => d.data()));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getExpenseTrend = async (req, res) => {
  try {
    const { schoolId } = req.query;

    if (!schoolId) return res.status(400).json({ message: "schoolId required" });

    const snap = await db
      .collection("schools")
      .doc(schoolId)
      .collection("expenses")
      .get();

    const byMonth = {};

    snap.docs.forEach((doc) => {
      const data = doc.data();
      if (!byMonth[data.month]) byMonth[data.month] = 0;
      byMonth[data.month] += data.amount;
    });

    res.json(byMonth);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const addReimbursement = async (req, res) => {
  try {
    const { schoolId, employeeId, employeeName, amount, reason } = req.body;

    if (!schoolId || !employeeId || !amount)
      return res.status(400).json({ message: "Missing required fields" });

    const reimbursementId = "RB-" + Math.floor(100000 + Math.random() * 900000);

    const rbRef = db
      .collection("schools")
      .doc(schoolId)
      .collection("reimbursements")
      .doc(reimbursementId);

    await rbRef.set({
      reimbursementId,
      employeeId,
      employeeName,
      amount,
      reason,
      status: "Pending",
      dateSubmitted: new Date().toISOString(),
    });

    res.status(201).json({ message: "Reimbursement created", reimbursementId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getReimbursements = async (req, res) => {
  try {
    const { schoolId, status } = req.query;

    if (!schoolId) return res.status(400).json({ message: "schoolId required" });

    let q = db
      .collection("schools")
      .doc(schoolId)
      .collection("reimbursements");

    if (status) q = q.where("status", "==", status);

    const snap = await q.get();
    res.json(snap.docs.map((d) => d.data()));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateReimbursement = async (req, res) => {
  try {
    const { schoolId, reimbursementId } = req.params;

    await db
      .collection("schools")
      .doc(schoolId)
      .collection("reimbursements")
      .doc(reimbursementId)
      .update(req.body);

    res.json({ message: "Reimbursement updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
