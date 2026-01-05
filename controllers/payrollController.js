import { db } from "../config/firebase.js";

// Create / Update salary profile
export const upsertSalaryProfile = async (req, res) => {
  try {
    const {
      schoolId,
      teacherId,
      basic = 0,
      allowances = 0,
      deductions = 0,
    } = req.body;
    if (!schoolId || !teacherId)
      return res.status(400).json({ message: "schoolId & teacherId required" });

    await db
      .collection("schools")
      .doc(schoolId)
      .collection("payrollProfiles")
      .doc(teacherId)
      .set({
        teacherId,
        basic,
        allowances,
        deductions,
        updatedAt: new Date().toISOString(),
      });

    res.json({ message: "Salary profile saved" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Run payroll for a month (month format: "2025-11")
export const runPayrollForMonth = async (req, res) => {
  try {
    const { schoolId, month } = req.body;
    if (!schoolId || !month)
      return res.status(400).json({ message: "schoolId & month required" });

    // fetch all profiles
    const profilesSnap = await db
      .collection("schools")
      .doc(schoolId)
      .collection("payrollProfiles")
      .get();
    const results = [];

    for (const doc of profilesSnap.docs) {
      const p = doc.data();
      const teacherId = p.teacherId;

      // count present days for teacher in month by scanning teacherAttendance docs where date startsWith month
      const attendanceCollectionRef = db
        .collection("schools")
        .doc(schoolId)
        .collection("teacherAttendance");
      const attendanceSnap = await attendanceCollectionRef.get();

      // naive approach: iterate dates and count present entries for teacherId where status === 'present' and date includes month
      let presentDays = 0;
      attendanceSnap.forEach((dateDoc) => {
        if (!dateDoc.id.startsWith(month)) return; // assuming date id "YYYY-MM-DD" and month "YYYY-MM"
        const periodsRef = dateDoc.ref.collection("periods");
        // Note: Firestore does not allow synchronous nested query here; we'll fetch periods for that date
      });

      // Because the above is complicated with nested collections, we'll fetch dates first and then query each date's period doc for teacher
      const datesSnap = await attendanceCollectionRef.get();
      for (const dateDoc of datesSnap.docs) {
        if (!dateDoc.id.startsWith(month)) continue;
        const periodRef = dateDoc.ref.collection("periods");
        const docRef = await periodRef.doc(`Period 1_${teacherId}`).get();
        if (docRef.exists && docRef.data().status === "present") presentDays++;
        // This only checks Period 1; better approach: count distinct dates where teacher has any present period
        // Improved approach below: query all period docs for teacherId in that date
        const allPeriodsSnap = await periodRef
          .where("teacherId", "==", teacherId)
          .where("status", "==", "present")
          .get();
        if (!allPeriodsSnap.empty) presentDays++; // counted as present for that day
      }

      // compute salary (pro-rate using days present; assume monthDays = 30)
      const monthDays = 30;
      const basic = p.basic || 0;
      const allowances = p.allowances || 0;
      const deductions = p.deductions || 0;
      const perDay = basic / monthDays;
      const payableBasic = perDay * presentDays;
      const net = payableBasic + allowances - deductions;

      // create payslip
      const payslipId = `PS-${teacherId}-${month}`;
      const payslipData = {
        payslipId,
        teacherId,
        month,
        presentDays,
        basic,
        payableBasic,
        allowances,
        deductions,
        net,
        generatedAt: new Date().toISOString(),
      };

      // save under payroll collection
      await db
        .collection("schools")
        .doc(schoolId)
        .collection("payroll")
        .doc(payslipId)
        .set(payslipData);
      // also save under teacher doc
      await db
        .collection("schools")
        .doc(schoolId)
        .collection("teachers")
        .doc(teacherId)
        .collection("payslips")
        .doc(payslipId)
        .set(payslipData);

      results.push(payslipData);
    }

    res.json({ message: "Payroll run complete", results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get payslip
export const getPayslip = async (req, res) => {
  try {
    const { schoolId, payslipId } = req.params;
    const doc = await db
      .collection("schools")
      .doc(schoolId)
      .collection("payroll")
      .doc(payslipId)
      .get();
    if (!doc.exists)
      return res.status(404).json({ message: "Payslip not found" });
    res.json(doc.data());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
