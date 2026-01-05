// controllers/classController.js
import { db } from "../config/firebase.js";

// ➕ Add class
export const addClass = async (req, res) => {
  try {
    const { schoolId, name, section, classTeacher } = req.body;
    const classId = "CLS-" + Math.floor(1000 + Math.random() * 9000);

    const ref = db
      .collection("schools")
      .doc(schoolId)
      .collection("classes")
      .doc(classId);
    await ref.set({
      classId,
      name,
      section: section || "",
      classTeacher: classTeacher || null,
      totalStudents: 0,
      createdAt: new Date().toISOString(),
    });

    res.status(201).json({ message: "Class added successfully", classId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📋 Get all classes
export const getAllClasses = async (req, res) => {
  try {
    const { schoolId } = req.params;
    const snap = await db
      .collection("schools")
      .doc(schoolId)
      .collection("classes")
      .get();
    console.log(snap.docs.map((d) => d.data(), "spn"));

    const classes = snap.docs.map((d) => d.data());

    res.json(classes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✏️ Update class info
export const updateClass = async (req, res) => {
  try {
    const { schoolId, classId } = req.params;
    const data = req.body;
    await db
      .collection("schools")
      .doc(schoolId)
      .collection("classes")
      .doc(classId)
      .update({
        ...data,
        updatedAt: new Date().toISOString(),
      });
    res.json({ message: "Class updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ❌ Delete class
export const deleteClass = async (req, res) => {
  try {
    const { schoolId, classId } = req.params;
    await db
      .collection("schools")
      .doc(schoolId)
      .collection("classes")
      .doc(classId)
      .delete();
    res.json({ message: "Class deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getStudentsOfClassTeacher = async (req, res) => {
  try {
    const { schoolId, teacherId } = req.params;
    console.log(schoolId, teacherId);

    // Find class assigned to teacher
    const classSnap = await db
      .collection("schools")
      .doc(schoolId)
      .collection("classes")
      // .where("classTeacher", "==", teacherId)
      .where("classTeacher.teacherId", "==", teacherId)
      .limit(1)
      .get();

    if (classSnap.empty)
      return res.json({ message: "This teacher has no class assigned" });

    const classId = classSnap.docs[0].data().classId;

    // Get all students in this class
    const studentsSnap = await db
      .collection("schools")
      .doc(schoolId)
      .collection("students")
      .where("classId", "==", classId)
      .get();

    const students = studentsSnap.docs.map((d) => d.data());

    res.json({
      classId,
      totalStudents: students.length,
      students,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔵 Assign or Update Class Teacher
export const assignClassTeacher = async (req, res) => {
  try {
    const { schoolId, classId, teacherId, teacherName } = req.body;

    if (!schoolId || !classId || !teacherId)
      return res.status(400).json({ message: "Missing fields" });

    const classRef = db
      .collection("schools")
      .doc(schoolId)
      .collection("classes")
      .doc(classId);

    // 1️⃣ Update class with teacher info
    await classRef.update({
      classTeacher: {
        teacherId,
        teacherName,
      },
      updatedAt: new Date().toISOString(),
    });

    // 2️⃣ Update teacher record with assigned class
    const teacherRef = db
      .collection("schools")
      .doc(schoolId)
      .collection("teachers")
      .doc(teacherId);

    await teacherRef.update({
      assignedClass: classId,
      classTeacher: true,
      updatedAt: new Date().toISOString(),
    });

    res.json({
      message: "Class teacher assigned & teacher updated successfully",
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

export const getClassByTeacher = async (req, res) => {
  try {
    const { schoolId, teacherId } = req.params;

    const classesSnap = await db
      .collection("schools")
      .doc(schoolId)
      .collection("classes")
      .get();

    const classes = classesSnap.docs.map((d) => d.data());

    const assignedClass = classes.find(
      (cls) => cls.classTeacher?.teacherId === teacherId
    );

    if (!assignedClass)
      return res.json({ message: "This teacher has no class assigned" });

    const studentSnap = await db
      .collection("schools")
      .doc(schoolId)
      .collection("students")
      .where("classId", "==", assignedClass.classId)
      .get();

    const students = studentSnap.docs.map((d) => d.data());

    res.json({
      classId: assignedClass.classId,
      className: assignedClass.name,
      section: assignedClass.section,
      totalStudents: students.length,
      students,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
