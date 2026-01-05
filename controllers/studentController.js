import { db } from "../config/firebase.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const addStudent = async (req, res) => {
  try {
    const {
      schoolId,
      name,
      email,
      phone,
      classId,
      section,
      rollNo,
      parentName,
      parentPhone,
      address,
      imageUrl,
    } = req.body;

    if (!schoolId || !name || !classId) {
      return res
        .status(400)
        .json({ message: "schoolId, name, classId required" });
    }

    const studentId = "STD-" + Math.floor(1000 + Math.random() * 9000);

    const ref = db
      .collection("schools")
      .doc(schoolId)
      .collection("students")
      .doc(studentId);

    await ref.set({
      studentId,
      name,
      email: email || "",
      phone: phone || "",
      classId, // FIXED
      section: section || "",
      rollNo: rollNo || "",
      parentName: parentName || "",
      parentPhone: parentPhone || "",
      address: address || "",
      imageUrl: imageUrl || "",
      createdAt: new Date().toISOString(),
    });

    // ✅ Update class totalStudents
    const classRef = db
      .collection("schools")
      .doc(schoolId)
      .collection("classes")
      .doc(classId);

    const studentSnap = await db
      .collection("schools")
      .doc(schoolId)
      .collection("students")
      .where("classId", "==", classId)
      .get();

    await classRef.update({
      totalStudents: studentSnap.size,
    });

    res.status(201).json({ message: "Student added successfully", studentId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all students of a school
export const getStudents = async (req, res) => {
  try {
    const { schoolId } = req.params;

    const snap = await db
      .collection("schools")
      .doc(schoolId)
      .collection("students")
      .get();

    const list = snap.docs.map((d) => d.data());
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get students by class
export const getStudentsByClass = async (req, res) => {
  try {
    const { schoolId, classId } = req.params;

    const snap = await db
      .collection("schools")
      .doc(schoolId)
      .collection("students")
      .where("classId", "==", classId)
      .get();

    res.json(snap.docs.map((d) => d.data()));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get single student
export const getStudentById = async (req, res) => {
  try {
    const { schoolId, studentId } = req.params;

    const doc = await db
      .collection("schools")
      .doc(schoolId)
      .collection("students")
      .doc(studentId)
      .get();

    if (!doc.exists)
      return res.status(404).json({ message: "Student not found" });

    res.json(doc.data());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update student
export const updateStudent = async (req, res) => {
  try {
    const { schoolId, studentId } = req.params;

    await db
      .collection("schools")
      .doc(schoolId)
      .collection("students")
      .doc(studentId)
      .update(req.body);

    res.json({ message: "Student updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete student
export const deleteStudent = async (req, res) => {
  try {
    const { schoolId, studentId } = req.params;

    await db
      .collection("schools")
      .doc(schoolId)
      .collection("students")
      .doc(studentId)
      .delete();

    res.json({ message: "Student deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Student login
// export const studentLogin = async (req, res) => {
//   console.log(req, res, 'log');

//   try {
//     const { schoolId, email, password } = req.body;

//     if (!schoolId || !email || !password)
//       return res
//         .status(400)
//         .json({ message: "schoolId, email, password required" });

//     const snap = await db
//       .collection("schools")
//       .doc(schoolId)
//       .collection("students")
//       .where("email", "==", email)
//       .limit(1)
//       .get();

//     if (snap.empty)
//       return res.status(404).json({ message: "Student not found" });

//     const studentDoc = snap.docs[0];
//     const student = studentDoc.data();

//     if (!student.passwordHash)
//       return res.status(400).json({
//         message: "Password not set. Contact admin.",
//       });

//     const match = await bcrypt.compare(password, student.passwordHash);
//     if (!match) return res.status(400).json({ message: "Invalid credentials" });

//     const token = jwt.sign(
//       {
//         studentId: student.studentId,
//         schoolId,
//         name: student.name,
//         role: "student",
//       },
//       process.env.JWT_SECRET || "secret",
//       { expiresIn: "12h" }
//     );

//     await studentDoc.ref.update({ lastLogin: new Date().toISOString() });

//     res.json({
//       message: "Login success",
//       token,
//       role: "student",
//       studentId: student.studentId,
//       name: student.name,
//       classId: student.classId,
//       schoolId,
//     });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

export const studentLogin = async (req, res) => {
  try {
    const { schoolId, email, studentId, password } = req.body;

    if (!schoolId || !password)
      return res.status(400).json({
        message: "schoolId and password required",
      });

    if (!email && !studentId)
      return res.status(400).json({
        message: "Either email or studentId is required",
      });

    // Build query based on what user provided
    let queryField = email ? "email" : "studentId";
    let queryValue = email || studentId;

    const snap = await db
      .collection("schools")
      .doc(schoolId)
      .collection("students")
      .where(queryField, "==", queryValue)
      .limit(1)
      .get();

    if (snap.empty)
      return res.status(404).json({ message: "Student not found" });

    const studentDoc = snap.docs[0];
    const student = studentDoc.data();

    if (!student.passwordHash)
      return res.status(400).json({
        message: "Password not set. Contact admin.",
      });

    const match = await bcrypt.compare(password, student.passwordHash);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      {
        studentId: student.studentId,
        schoolId,
        name: student.name,
        role: "student",
      },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "12h" }
    );

    await studentDoc.ref.update({ lastLogin: new Date().toISOString() });

    res.json({
      message: "Login success",
      token,
      role: "student",
      studentId: student.studentId,
      name: student.name,
      classId: student.classId,
      schoolId,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// set password
export const setStudentPassword = async (req, res) => {
  try {
    const { schoolId, studentId, newPassword } = req.body;

    if (!schoolId || !studentId || !newPassword)
      return res.status(400).json({ message: "Missing required fields" });

    const ref = db
      .collection("schools")
      .doc(schoolId)
      .collection("students")
      .doc(studentId);

    const doc = await ref.get();
    if (!doc.exists)
      return res.status(404).json({ message: "Student not found" });

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await ref.update({
      passwordHash,
      passwordUpdatedAt: new Date().toISOString(),
    });

    res.json({ message: "Password set successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//  GET ALL STUDENTS OF A SCHOOL
export const listStudents = async (req, res) => {
  try {
    const { schoolId } = req.params;

    if (!schoolId)
      return res.status(400).json({ message: "schoolId required" });

    const snap = await db
      .collection("schools")
      .doc(schoolId)
      .collection("students")
      .orderBy("createdAt", "desc")
      .get();

    const list = snap.docs.map((d) => d.data());
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
