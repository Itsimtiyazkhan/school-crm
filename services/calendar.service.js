// import holidayMap from "../data/holidayMap.js";

// const getDayName = (date) =>
//   new Date(date).toLocaleDateString("en-US", { weekday: "long" });

// const getHolidaysByYear = (year) => {
//   return holidayMap[year] || [];
// };

// const generateCalendar = (year) => {
//   const months = [];
//   const holidays = getHolidaysByYear(year);

//   for (let month = 0; month < 12; month++) {
//     const totalDays = new Date(year, month + 1, 0).getDate();
//     const days = [];

//     for (let d = 1; d <= totalDays; d++) {
//       const date = `${year}-${String(month + 1).padStart(2, "0")}-${String(
//         d
//       ).padStart(2, "0")}`;
//       const holiday = holidays.find((h) => h.date === date);

//       days.push({
//         date,
//         day: getDayName(date),
//         isHoliday: !!holiday,
//         holiday: holiday || null,
//       });
//     }

//     months.push({
//       month: new Date(year, month).toLocaleString("en-US", { month: "long" }),
//       monthIndex: month,
//       days,
//     });
//   }

//   return {
//     country: "India",
//     year,
//     months,
//   };
// };

// const getHolidays = (year) => getHolidaysByYear(year);

// export default {
//   generateCalendar,
//   getHolidays,
// };

import holidayStore from "../data/holidayStore.js";

const getDayName = (date) =>
  new Date(date).toLocaleDateString("en-US", { weekday: "long" });

// ✅ Get holidays by year
const getHolidaysByYear = (year) => {
  return holidayStore.years?.[year] || [];
};

// ✅ Calendar generator (year dynamic)
const generateCalendar = (year) => {
  const months = [];
  const holidays = getHolidaysByYear(year);

  for (let month = 0; month < 12; month++) {
    const totalDays = new Date(year, month + 1, 0).getDate();
    const days = [];

    for (let d = 1; d <= totalDays; d++) {
      const date = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const holiday = holidays.find((h) => h.date === date);

      days.push({
        date,
        day: getDayName(date),
        isHoliday: !!holiday,
        holiday: holiday || null
      });
    }

    months.push({
      month: new Date(year, month).toLocaleString("en-US", { month: "long" }),
      monthIndex: month,
      days
    });
  }

  return {
    country: holidayStore.country,
    year,
    months
  };
};

export default {
  generateCalendar,
  getHolidaysByYear
};
