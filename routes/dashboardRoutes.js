import express from "express";
import { db } from "../config/firebase.js";

const router = express.Router();

// router.get("/summary", async (req, res) => {
//   try {
//     const { schoolId } = req.query;
//     if (!schoolId)
//       return res.status(400).json({ message: "schoolId required" });

//     // --- STUDENTS ---
//     const studentsSnap = await db
//       .collection("schools")
//       .doc(schoolId)
//       .collection("students")
//       .get();
//     const totalStudents = studentsSnap.size;

//     // --- TEACHERS ---
//     const teachersSnap = await db
//       .collection("schools")
//       .doc(schoolId)
//       .collection("teachers")
//       .get();
//     const totalTeachers = teachersSnap.size;

//     // --- STAFF (Optional) ---
//     const staffSnap = await db
//       .collection("schools")
//       .doc(schoolId)
//       .collection("staff")
//       .get();
//     const totalStaff = staffSnap.size;

//     // --- NOTICES ---
//     const noticesSnap = await db
//       .collection("schools")
//       .doc(schoolId)
//       .collection("notices")
//       .get();
//     const activeNotices = noticesSnap.docs.filter(
//       (n) => n.data().status !== "Archived"
//     ).length;

//     // --- EVENTS / CALENDAR ---
//     const eventsSnap = await db
//       .collection("schools")
//       .doc(schoolId)
//       .collection("calendarEvents")
//       .get();
//     const events = eventsSnap.docs.map((e) => e.data());
//     const upcomingEvents = events.filter(
//       (e) => new Date(e.startDate) > new Date()
//     ).length;

//     res.json({
//       schoolId,
//       totalStudents,
//       totalTeachers,
//       totalStaff,
//       activeNotices,
//       upcomingEvents,
//       generatedAt: new Date().toISOString(),
//     });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

router.get("/summary", async (req, res) => {
  try {
    const { schoolId } = req.query;
    if (!schoolId)
      return res.status(400).json({ message: "schoolId required" });

    /* ---------------- STUDENTS ---------------- */
    const studentsSnap = await db
      .collection("schools")
      .doc(schoolId)
      .collection("students")
      .get();
    const totalStudents = studentsSnap.size;

    /* ---------------- TEACHERS ---------------- */
    const teachersSnap = await db
      .collection("schools")
      .doc(schoolId)
      .collection("teachers")
      .get();
    const totalTeachers = teachersSnap.size;

    /* ---------------- STAFF ---------------- */
    const staffSnap = await db
      .collection("schools")
      .doc(schoolId)
      .collection("staff")
      .get();
    const totalStaff = staffSnap.size;

    /* ---------------- NOTICES ---------------- */
    const noticesSnap = await db
      .collection("schools")
      .doc(schoolId)
      .collection("notices")
      .get();
    const activeNotices = noticesSnap.docs.filter(
      (n) => n.data().status !== "Archived"
    ).length;

    /* ---------------- CALENDAR EVENTS ---------------- */
    const eventsSnap = await db
      .collection("schools")
      .doc(schoolId)
      .collection("events") // ✅ FIXED
      .get();

    const events = eventsSnap.docs.map((d) => d.data());
    const today = new Date();

    const upcomingEvents = events.filter(
      (e) => new Date(e.startDate) >= today
    ).length;

    const totalEvents = events.length;

    /* ---------------- STUDENT FEES SUMMARY ---------------- */
    const feesSnap = await db
      .collection("schools")
      .doc(schoolId)
      .collection("studentFees")
      .get();

    let totalFees = 0;
    let totalPayable = 0;

    feesSnap.docs.forEach((doc) => {
      const f = doc.data();
      totalFees += Number(f.baseFees || 0);
      totalPayable += Number(f.payableAmount || 0);
    });

    const totalDiscount = totalFees - totalPayable;

    /* ---------------- ATTENDANCE (TODAY) ---------------- */
    const todayKey = new Date().toISOString().split("T")[0];

    const attendanceSnap = await db
      .collection("schools")
      .doc(schoolId)
      .collection("attendance")
      .where("date", "==", todayKey)
      .get();

    let present = 0;
    let absent = 0;

    attendanceSnap.docs.forEach((d) => {
      if (d.data().status === "Present") present++;
      else absent++;
    });

    /* ---------------- FINAL RESPONSE ---------------- */
    res.json({
      schoolId,

      counts: {
        students: totalStudents,
        teachers: totalTeachers,
        staff: totalStaff,
      },

      notices: {
        active: activeNotices,
      },

      calendar: {
        totalEvents,
        upcomingEvents,
      },

      fees: {
        totalFees,
        payableAfterDiscount: totalPayable,
        discountGiven: totalDiscount,
      },

      attendanceToday: {
        present,
        absent,
        totalMarked: present + absent,
      },

      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Dashboard summary error:", error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/all-schools", async (req, res) => {
  try {
    // Fetch all school documents (assuming "schools" collection exists)
    const schoolsSnap = await db.collection("schools").get();

    if (schoolsSnap.empty) {
      return res.status(404).json({ message: "No schools found" });
    }

    const allSchoolsData = [];

    for (const doc of schoolsSnap.docs) {
      const schoolData = doc.data();
      const schoolId = doc.id;
      const schoolName = schoolData.name || "Unnamed School";

      // --- Teachers count ---
      const teachersSnap = await db
        .collection("teachers")
        .where("schoolId", "==", schoolId)
        .get();
      const totalTeachers = teachersSnap.size;

      // --- Students count ---
      const studentsSnap = await db
        .collection("students")
        .where("schoolId", "==", schoolId)
        .get();
      const totalStudents = studentsSnap.size;

      // --- Fees summary ---
      const feesSnap = await db
        .collection("feesCollection")
        .where("schoolId", "==", schoolId)
        .get();
      const feesData = feesSnap.docs.map((d) => d.data());
      const totalFees = feesData.reduce((sum, f) => sum + (f.amount || 0), 0);
      const paidFees = feesData
        .filter((f) => f.status === "Paid")
        .reduce((sum, f) => sum + (f.paidAmount || 0), 0);

      // --- Expenses summary ---
      const expensesSnap = await db
        .collection("expenses")
        .where("schoolId", "==", schoolId)
        .get();
      const expensesData = expensesSnap.docs.map((d) => d.data());
      const totalExpenses = expensesData.reduce(
        (sum, e) => sum + (e.amount || 0),
        0
      );

      // --- Net Balance ---
      const netBalance = paidFees - totalExpenses;

      // ✅ Push summary for this school
      allSchoolsData.push({
        schoolId,
        schoolName,
        totalTeachers,
        totalStudents,
        feesCollected: paidFees,
        expenses: totalExpenses,
        netBalance,
      });
    }

    res.status(200).json(allSchoolsData);
  } catch (error) {
    console.error("All schools dashboard error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
