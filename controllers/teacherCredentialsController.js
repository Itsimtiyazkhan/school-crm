import bcrypt from "bcryptjs";
import { db } from "../config/firebase.js";

export const setTeacherPassword = async (req, res) => {
  try {
    const { schoolId, teacherId, newPassword } = req.body;

    if (!schoolId || !teacherId || !newPassword)
      return res.status(400).json({ message: "Missing required fields" });

    const teacherRef = db
      .collection("schools")
      .doc(schoolId)
      .collection("teachers")
      .doc(teacherId);

    const doc = await teacherRef.get();
    if (!doc.exists)
      return res.status(404).json({ message: "Teacher not found" });

    const passwordHash = await bcrypt.hash(newPassword, 12);

    await teacherRef.update({
      passwordHash,
      passwordUpdatedAt: new Date().toISOString(),
    });

    res.json({ message: "Password set successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
