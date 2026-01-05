// controllers/teacherDashboardController.js
import { db } from "../config/firebase.js";
import moment from "moment";

// Utility
const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export const getTeacherDashboard = async (req, res) => {
  try {
    const { schoolId, teacherId } = req.params;

    const today = moment().format("dddd");
    const todayDate = moment().format("YYYY-MM-DD");

    // ---------------------------
    // 1️⃣ Get timetable for teacher
    // ---------------------------
    const ttSnap = await db
      .collection("schools")
      .doc(schoolId)
      .collection("teacherTimetables")
      .doc(teacherId)
      .get();

    const tt = ttSnap.exists ? ttSnap.data() : {};

    const todaysPeriods = tt[today] || {};

    // ---------------------------
    // 2️⃣ Upcoming 3 days
    // ---------------------------
    let upcoming = [];

    for (let i = 1; i <= 3; i++) {
      let day = moment().add(i, "days").format("dddd");
      if (tt[day]) {
        upcoming.push({ day, periods: tt[day] });
      }
    }

    // ---------------------------
    // 3️⃣ Attendance Summary (Monthly)
    // ---------------------------
    const attSnap = await db
      .collection("schools")
      .doc(schoolId)
      .collection("attendance")
      .where("teacherId", "==", teacherId)
      .get();

    let total = attSnap.size;
    let presents = attSnap.docs.filter(
      (d) => d.data().status === "Present"
    ).length;

    // ---------------------------
    // 4️⃣ Leaves Summary
    // ---------------------------
    const leaveSnap = await db
      .collection("schools")
      .doc(schoolId)
      .collection("leaves")
      .where("teacherId", "==", teacherId)
      .get(); // no orderBy

    const leaves = leaveSnap.docs.map((d) => d.data());

    return res.json({
      today: todaysPeriods,
      upcoming,
      attendance: {
        total,
        presents,
        percentage: total ? (presents / total) * 100 : 0,
      },
      leaves,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
