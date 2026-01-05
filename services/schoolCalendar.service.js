import { db } from "../config/firebase.js";
import holidayStore from "../data/holidayStore.js";

const getDayName = (date) =>
  new Date(date).toLocaleDateString("en-US", { weekday: "long" });

const generateSchoolCalendar = async (schoolId, year, role) => {
  /* ================== SCHOOL ================== */
  const schoolDoc = await db.collection("schools").doc(schoolId).get();
  if (!schoolDoc.exists) throw new Error("School not found");
  const school = schoolDoc.data();

  /* ================== GOVT HOLIDAYS ================== */
  const govtHolidays = holidayStore.years?.[year] || [];

  /* ================== OVERRIDES ================== */
  const overrideSnap = await db
    .collection("schoolHolidayOverrides")
    .where("schoolId", "==", schoolId)
    .where("year", "==", year)
    .get();

  const overrides = overrideSnap.docs.map((d) => d.data());

  /* ================== EVENTS ================== */
  const eventsSnap = await db
    .collection("schools")
    .doc(schoolId)
    .collection("events")
    .get();

  const events = eventsSnap.docs.map((d) => d.data());

  /* ================== NOTICES ================== */
  const noticesSnap = await db
    .collection("schools")
    .doc(schoolId)
    .collection("notices")
    .get();

  const allNotices = noticesSnap.docs.map((d) => d.data());

  const notices = allNotices.filter((n) => {
    if (role === "admin") return true;

    if (role === "student") {
      return (
        n.visibility === "all" ||
        n.visibility === "students" ||
        n.visibility === "class"
      );
    }

    if (role === "teacher") {
      return (
        n.visibility === "all" ||
        n.visibility === "teachers" ||
        n.visibility === "class"
      );
    }

    return false;
  });

  /* ================== CALENDAR ================== */
  const months = [];

  for (let m = 0; m < 12; m++) {
    const totalDays = new Date(year, m + 1, 0).getDate();
    const days = [];

    for (let d = 1; d <= totalDays; d++) {
      const date = `${year}-${String(m + 1).padStart(2, "0")}-${String(
        d
      ).padStart(2, "0")}`;

      const dayName = getDayName(date);

      const govt = govtHolidays.find((h) => h.date === date);
      const override = overrides.find((o) => o.date === date);
      const dayEvents = events.filter((e) => e.startDate === date);
      const dayNotices = notices.filter((n) => n.startDate === date);

      /* ===== FINAL LOGIC (IMPORTANT) ===== */
      let isHoliday = false;
      let reason = "Working Day";

      // 1️⃣ REMOVE override (HIGHEST)
      if (override?.action === "REMOVE") {
        isHoliday = false;
        reason = "Working Day (Override)";
      }
      // 2️⃣ ADD override
      else if (override?.action === "ADD") {
        isHoliday = true;
        reason = override.name;
      }
      // 3️⃣ Govt Holiday
      else if (govt) {
        isHoliday = true;
        reason = govt.name;
      }

      days.push({
        date,
        day: dayName,
        isHoliday,
        reason,
        timing: school.timing || null,
        events: dayEvents,
        notices: dayNotices,
      });
    }

    months.push({
      monthIndex: m,
      monthName: new Date(year, m).toLocaleString("en-US", { month: "long" }),
      days,
    });
  }

  return {
    schoolId,
    schoolName: school.name || "",
    year,
    months,
  };
};

export default {
  generateSchoolCalendar,
};
