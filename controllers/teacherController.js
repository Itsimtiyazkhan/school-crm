import { db } from "../config/firebase.js";

/* -------------------------------------------------
   ADD TEACHER
-------------------------------------------------- */
export const addTeacher = async (req, res) => {
  try {
    const {
      schoolId,
      name,
      email,
      phone,
      gender,
      qualification,
      experience,
      designation,
      imageUrl,
    } = req.body;

    if (!schoolId || !name)
      return res.status(400).json({ message: "Missing required fields" });

    const teacherId = "TCH-" + Math.floor(1000 + Math.random() * 9000);

    const teacherRef = db
      .collection("schools")
      .doc(schoolId)
      .collection("teachers")
      .doc(teacherId);

    await teacherRef.set({
      teacherId,
      name,
      email: email || "",
      phone: phone || "",
      gender: gender || "",
      qualification: qualification || "",
      experience: experience || "",
      designation: designation || "",
      imageUrl: imageUrl || "",
      active: true,
      createdAt: new Date().toISOString(),
    });

    res.status(201).json({ message: "Teacher added", teacherId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* -------------------------------------------------
   GET ALL TEACHERS OF SCHOOL
-------------------------------------------------- */
export const getTeachers = async (req, res) => {
  try {
    const { schoolId } = req.params;

    const snap = await db
      .collection("schools")
      .doc(schoolId)
      .collection("teachers")
      .get();

    const teachers = snap.docs.map((d) => d.data());

    res.json(teachers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* -------------------------------------------------
   GET SINGLE TEACHER
-------------------------------------------------- */
export const getTeacherById = async (req, res) => {
  try {
    const { schoolId, teacherId } = req.params;

    const doc = await db
      .collection("schools")
      .doc(schoolId)
      .collection("teachers")
      .doc(teacherId)
      .get();

    if (!doc.exists)
      return res.status(404).json({ message: "Teacher not found" });

    res.json(doc.data());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* -------------------------------------------------
   UPDATE TEACHER
-------------------------------------------------- */
export const updateTeacher = async (req, res) => {
  try {
    const { schoolId, teacherId } = req.params;

    await db
      .collection("schools")
      .doc(schoolId)
      .collection("teachers")
      .doc(teacherId)
      .update(req.body);

    res.json({ message: "Teacher updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* -------------------------------------------------
   DELETE TEACHER
-------------------------------------------------- */
export const deleteTeacher = async (req, res) => {
  try {
    const { schoolId, teacherId } = req.params;

    await db
      .collection("schools")
      .doc(schoolId)
      .collection("teachers")
      .doc(teacherId)
      .delete();

    res.json({ message: "Teacher deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
