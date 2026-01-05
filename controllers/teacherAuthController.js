// controllers/teacherAuthController.js
import bcrypt from "bcryptjs"; // optionally if you store hashed passwords
import jwt from "jsonwebtoken";
import { db } from "../config/firebase.js";

// export const teacherLogin = async (req, res) => {
//   try {
//     const { email, password, schoolId } = req.body;
//     if (!email || !password || !schoolId)
//       return res
//         .status(400)
//         .json({ message: "email, password, schoolId required" });

//     const teacherSnap = await db
//       .collection("schools")
//       .doc(schoolId)
//       .collection("teachers")
//       .where("email", "==", email)
//       .limit(1)
//       .get();

//     if (teacherSnap.empty)
//       return res.status(404).json({ message: "Teacher not found" });

//     const teacherDoc = teacherSnap.docs[0];
//     const teacher = teacherDoc.data();
//     // If you stored passwordHash:
//     if (!teacher.passwordHash) {
//       return res.status(400).json({
//         message:
//           "Password not set for teacher. Ask admin to create credentials.",
//       });
//     }
//     const match = await bcrypt.compare(password, teacher.passwordHash);
//     if (!match) return res.status(400).json({ message: "Invalid credentials" });

//     const token = jwt.sign(
//       {
//         uid: teacher.email,
//         role: "teacher",
//         schoolId,
//         teacherId: teacher.teacherId,
//         name: teacher.name,
//       },
//       process.env.JWT_SECRET || "secret",
//       { expiresIn: "12h" }
//     );

//     // optional: update lastLogin
//     await teacherDoc.ref.update({ lastLogin: new Date().toISOString() });

//     res.json({
//       message: "Login success",
//       token,
//       role: "teacher",
//       teacherId: teacher.teacherId,
//       name: teacher.name,
//       schoolId: schoolId,
//       assignedClass: teacher.assignedClass || null, // 👈 ADD THIS
//     });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

export const teacherLogin = async (req, res) => {
  try {
    const { email, password, schoolId } = req.body;
    if (!email || !password || !schoolId)
      return res.status(400).json({ message: "email, password, schoolId required" });

    // 🔍 Check teacher exists
    const teacherSnap = await db
      .collection("schools")
      .doc(schoolId)
      .collection("teachers")
      .where("email", "==", email)
      .limit(1)
      .get();

    if (teacherSnap.empty)
      return res.status(404).json({ message: "Teacher not found" });

    const teacherDoc = teacherSnap.docs[0];
    const teacher = teacherDoc.data();

    // 🔐 Check password
    if (!teacher.passwordHash)
      return res.status(400).json({ message: "Password not set for teacher" });

    const match = await bcrypt.compare(password, teacher.passwordHash);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });

    // 🔐 JWT Token
    const token = jwt.sign(
      {
        uid: teacher.email,
        role: "teacher",
        schoolId,
        teacherId: teacher.teacherId,
        name: teacher.name,
      },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "12h" }
    );

    // 🔄 Update last login
    await teacherDoc.ref.update({ lastLogin: new Date().toISOString() });

    /* ⭐⭐ NEW: Fetch Assigned Class Details ⭐⭐ */
    let assignedClassDetails = null;
    if (teacher.assignedClass) {
      const classDoc = await db
        .collection("schools")
        .doc(schoolId)
        .collection("classes")
        .doc(teacher.assignedClass)
        .get();

      if (classDoc.exists) {
        assignedClassDetails = classDoc.data();
      }
    }

    // 🟢 Final Response
    res.json({
      message: "Login success",
      token,
      role: "teacher",
      teacherId: teacher.teacherId,
      name: teacher.name,
      schoolId,
      assignedClass: teacher.assignedClass || null,
      assignedClassDetails, // 👈 FULL CLASS DETAILS HERE
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const listTeachers = async (req, res) => {
  try {
    const { schoolId } = req.params;

    if (!schoolId)
      return res.status(400).json({ message: "schoolId required" });

    const snap = await db
      .collection("schools")
      .doc(schoolId)
      .collection("teachers")
      .orderBy("createdAt", "desc")
      .get();

    const teachers = snap.docs.map((d) => d.data());

    res.json(teachers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
