import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import teacherRoutes from "./routes/teacherRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import financeRoutes from "./routes/financeRoutes.js";
import expenseRoutes from "./routes/expenseRoutes.js";
import calendarRoutes from "./routes/calendarRoutes.js";
import noticeRoutes from "./routes/noticeRoutes.js";
import inboxRoutes from "./routes/inboxRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import roleRoutes from "./routes/roleRoutes.js";
import superAdminRoutes from "./routes/superAdminRoutes.js";
import subjectRoutes from "./routes/subjectRoutes.js";
import classRoutes from "./routes/classRoutes.js";
import assignmentRoutes from "./routes/assignmentRoutes.js";
import timetableRoutes from "./routes/timetableRoutes.js";
import examRoutes from "./routes/examRoutes.js";
import examResultRoutes from "./routes/examResultRoutes.js";

import teacherCredentialsRoutes from "./routes/teacherCredentialsRoutes.js";
import teacherAuthRoutes from "./routes/teacherAuthRoutes.js";
import teacherAttendanceRoutes from "./routes/teacherAttendanceRoutes.js";
import timetableAutoRoutes from "./routes/timetableAutoRoutes.js";
import payrollRoutes from "./routes/payrollRoutes.js";
import teacherApproveRoutes from "./routes/teacherApproveRoutes.js";
import homeworkRoutes from "./routes/homeworkRoutes.js";
import examTeacherRoutes from "./routes/examTeacherRoutes.js";
import feesRoutes from "./routes/feesRoutes.js";

import dateCalendarRoutes from "./routes/dateCalendarRoutes.js";
import schoolCalendarRoutes from "./routes/schoolCalendar.routes.js";

import schoolHolidayRoutes from "./routes/schoolHoliday.routes.js";
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/teachers", teacherRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/finance", financeRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/calendar", calendarRoutes);
app.use("/api/notices", noticeRoutes);
app.use("/api/inbox", inboxRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/timetable", timetableRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/exams", examResultRoutes);

app.use("/api/teachers", teacherCredentialsRoutes);
app.use("/api/teacher-auth", teacherAuthRoutes);
app.use("/api/teacher-attendance", teacherAttendanceRoutes);
app.use("/api/timetable-auto", timetableAutoRoutes);
app.use("/api/payroll", payrollRoutes);
app.use("/api/teachers", teacherApproveRoutes);
app.use("/api/homework", homeworkRoutes);
app.use("/api/fees", feesRoutes);

app.use("/api/exam-teacher", examTeacherRoutes);
app.use("/api/superadmin", superAdminRoutes);

app.use("/api/dateCalendar", dateCalendarRoutes);
app.use("/api/school-calendar", schoolCalendarRoutes);
app.use("/api/school-calendar", schoolHolidayRoutes);

app.get("/", (req, res) => res.send("Schola MVC Backend is running."));

// add this at the bottom ONLY for local dev
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () =>
    console.log(`Server running on http://localhost:${PORT}`)
  );
}

export default app;
