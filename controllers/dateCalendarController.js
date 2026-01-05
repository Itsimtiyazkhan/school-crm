// import calendarService from "../services/calendar.service.js";

// /**
//  * GET /api/dateCalendar/calendar/:year
//  */
// export const getCalendar = (req, res) => {
//   try {
//     const year = Number(req.params.year);
//     const { month } = req.query;

//     if (!year || year < 1900) {
//       return res.status(400).json({ message: "Invalid year" });
//     }

//     const calendar = calendarService.generateCalendar(year);

//     if (month !== undefined) {
//       if (month < 0 || month > 11) {
//         return res.status(400).json({ message: "Invalid month index" });
//       }
//       return res.json(calendar.months[month]);
//     }

//     res.json(calendar);
//   } catch (error) {
//     res.status(500).json({
//       message: "Server Error",
//       error: error.message,
//     });
//   }
// };

// /**
//  * GET /api/dateCalendar/holidays/:year
//  * Optional query: ?type=GAZETTED | RESTRICTED | OBSERVANCE
//  */
// export const getHolidays = (req, res) => {
//   try {
//     const year = Number(req.params.year);

//     const holidays = calendarService.getHolidays(year);

//     res.json({
//       country: "India",
//       year,
//       count: holidays.length,
//       holidays,
//     });
//   } catch (error) {
//     res.status(500).json({
//       message: "Server Error",
//       error: error.message,
//     });
//   }
// };

import calendarService from "../services/calendar.service.js";

// 📅 Full calendar
export const getCalendar = (req, res) => {
  try {
    const year = Number(req.params.year);

    if (!year) {
      return res.status(400).json({ message: "Invalid year" });
    }

    const calendar = calendarService.generateCalendar(year);
    res.json(calendar);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🎉 Holidays list (with filters)
export const getHolidays = (req, res) => {
  try {
    const year = Number(req.params.year);
    const { type, month } = req.query;

    let holidays = calendarService.getHolidaysByYear(year);

    // Filter by type
    if (type) {
      holidays = holidays.filter((h) => h.holidayType === type.toUpperCase());
    }

    // Filter by month
    if (month !== undefined) {
      const m = Number(month) + 1;
      holidays = holidays.filter((h) => Number(h.date.split("-")[1]) === m);
    }

    res.json({
      country: "India",
      year,
      count: holidays.length,
      holidays,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
