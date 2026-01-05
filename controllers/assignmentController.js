import { db } from "../config/firebase.js";

// ➕ Assign teacher to subject and class
export const addAssignment = async (req, res) => {
  try {
    const {
      schoolId,
      classId,
      className,
      subjectId,
      subjectName,
      teacherId,
      teacherName,
    } = req.body;

    if (!schoolId || !classId || !subjectId || !teacherId)
      return res.status(400).json({ message: "Missing required fields" });

    const assignmentId = "TA-" + Math.floor(1000 + Math.random() * 9000);

    const ref = db
      .collection("schools")
      .doc(schoolId)
      .collection("teacherAssignments")
      .doc(assignmentId);
    await ref.set({
      assignmentId,
      classId,
      className,
      subjectId,
      subjectName,
      teacherId,
      teacherName,
      assignedAt: new Date().toISOString(),
    });

    res
      .status(201)
      .json({ message: "Teacher assigned successfully", assignmentId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📋 Get all assignments for a school
export const getAllAssignments = async (req, res) => {
  try {
    const { schoolId } = req.params;
    const snap = await db
      .collection("schools")
      .doc(schoolId)
      .collection("teacherAssignments")
      .get();
    const assignments = snap.docs.map((d) => d.data());
    res.json(assignments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📘 Get all assignments for a specific class
export const getAssignmentsByClass = async (req, res) => {
  try {
    const { schoolId, classId } = req.params;
    const snap = await db
      .collection("schools")
      .doc(schoolId)
      .collection("teacherAssignments")
      .where("classId", "==", classId)
      .get();

    const data = snap.docs.map((d) => d.data());
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✏️ Update teacher assigned to subject
export const updateAssignment = async (req, res) => {
  try {
    const { schoolId, assignmentId } = req.params;
    const { teacherId, teacherName } = req.body;

    const ref = db
      .collection("schools")
      .doc(schoolId)
      .collection("teacherAssignments")
      .doc(assignmentId);

    await ref.update({
      teacherId,
      teacherName,
      updatedAt: new Date().toISOString(),
    });

    res.json({ message: "Assignment updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ❌ Delete assignment
export const deleteAssignment = async (req, res) => {
  try {
    const { schoolId, assignmentId } = req.params;
    await db
      .collection("schools")
      .doc(schoolId)
      .collection("teacherAssignments")
      .doc(assignmentId)
      .delete();
    res.json({ message: "Assignment removed" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
