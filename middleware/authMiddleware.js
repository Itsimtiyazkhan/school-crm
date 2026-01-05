import jwt from "jsonwebtoken";

export const teacherAuth = (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const token = header.replace("Bearer ", "");
    if (!token) return res.status(401).json({ message: "No token" });

    const payload = jwt.verify(token, process.env.JWT_SECRET || "secret");
    if (!payload || payload.role !== "teacher")
      return res.status(403).json({ message: "Forbidden" });

    req.user = payload; // { uid, role, schoolId, teacherId? }
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token", error: err.message });
  }
};
