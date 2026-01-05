// controllers/teacherApproveController.js
import { db } from "../config/firebase.js";

export const approveTeacher = async (req, res) => {
  try {
    const { schoolId, teacherId } = req.params;
    const { approved } = req.body; // true / false

    if (approved === undefined)
      return res
        .status(400)
        .json({ message: "approved (true/false) required" });

    const ref = db
      .collection("schools")
      .doc(schoolId)
      .collection("teachers")
      .doc(teacherId);

    const doc = await ref.get();
    if (!doc.exists)
      return res.status(404).json({ message: "Teacher not found" });

    await ref.update({
      approved,
      approvedAt: approved ? new Date().toISOString() : null,
    });

    res.json({ message: `Teacher ${approved ? "approved" : "unapproved"}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
