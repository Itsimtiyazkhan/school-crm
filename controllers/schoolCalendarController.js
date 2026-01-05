import schoolCalendarService from "../services/schoolCalendar.service.js";

const { generateSchoolCalendar } = schoolCalendarService;

export const getSchoolCalendar = async (req, res) => {
  try {
    const { schoolId, year } = req.params;
    const role = req.query.role || "STUDENT";

    const calendar = await generateSchoolCalendar(schoolId, Number(year), role);

    res.json(calendar);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
