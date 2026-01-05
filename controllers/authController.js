import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../config/firebase.js";
import { schoolCollection } from "../models/authModel.js";
import dotenv from "dotenv";
dotenv.config();

/**
 * 🏫 Register a new school
 * - Sets approved: false (requires superadmin approval)
 * - Sets disabled: false (school active after approval)
 */
export const registerSchool = async (req, res) => {
  try {
    const { schoolName, fullName, email, password, phone, plan } = req.body;

    // 🔍 Check if email already exists
    const existing = await db
      .collection(schoolCollection)
      .where("email", "==", email)
      .get();

    if (!existing.empty)
      return res.status(400).json({ message: "Email already registered" });

    // Generate school ID
    const schoolId = "SCH-" + Math.floor(1000 + Math.random() * 9000);

    const passwordHash = await bcrypt.hash(password, 10);

    // Set up initial plan
    const selectedPlan = plan || "Free";
    let planExpiry = null;
    if (selectedPlan !== "Free") {
      const expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + 1); // 1 month plan by default
      planExpiry = expiryDate.toISOString();
    }

    const schoolRef = db.collection(schoolCollection).doc(schoolId);

    // 🔹 Save main school document
    await schoolRef.set({
      schoolId,
      name: schoolName,
      email,
      phone,
      plan: selectedPlan,
      planExpiry,
      approved: false, // Needs superadmin approval
      disabled: false,
      createdAt: new Date().toISOString(),
    });

    // 🔹 Create default admin user under school
    await schoolRef
      .collection("users")
      .doc(email)
      .set({
        uid: email,
        name: fullName,
        email,
        phone: phone || "",
        role: "admin",
        passwordHash,
        active: true,
        createdAt: new Date().toISOString(),
      });

    res.status(201).json({
      message: "School registered successfully, pending approval",
      schoolId,
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * 🔐 Login (School Admin or Teacher)
 * - Checks if school is approved
 * - Checks if school is disabled (e.g., expired plan)
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Search all schools for the user
    const schoolsSnap = await db.collection(schoolCollection).get();

    let foundUser = null,
      schoolId = null,
      schoolData = null;

    for (const doc of schoolsSnap.docs) {
      const userRef = doc.ref.collection("users").doc(email);
      const userDoc = await userRef.get();
      if (userDoc.exists) {
        foundUser = userDoc.data();
        schoolId = doc.id;
        schoolData = doc.data();
        break;
      }
    }

    if (!foundUser) return res.status(404).json({ message: "User not found" });

    // 🔍 Check school approval status
    if (!schoolData.approved)
      return res
        .status(403)
        .json({ message: "School is pending superadmin approval" });

    // 🔍 Check if disabled (expired or suspended)
    if (schoolData.disabled)
      return res
        .status(403)
        .json({ message: "School is disabled or subscription expired" });

    // 🔍 Check plan expiry
    if (schoolData.planExpiry && new Date(schoolData.planExpiry) < new Date()) {
      await db
        .collection(schoolCollection)
        .doc(schoolId)
        .update({ disabled: true });
      return res
        .status(403)
        .json({ message: "Plan expired. Please renew to continue." });
    }

    // Verify password
    const match = await bcrypt.compare(password, foundUser.passwordHash);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });

    // Generate JWT
    const token = jwt.sign(
      { uid: foundUser.uid, role: foundUser.role, schoolId },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "12h" }
    );

    // Update last login
    await db
      .collection(schoolCollection)
      .doc(schoolId)
      .collection("users")
      .doc(email)
      .update({ lastLogin: new Date().toISOString() });

    res.json({
      message: "Login success",
      token,
      role: foundUser.role,
      schoolId,
      name: foundUser.name,
      schoolName: schoolData.name,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * 🔑 Forgot Password
 */
export const forgotPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    const schoolsSnap = await db.collection(schoolCollection).get();
    let foundDoc = null;

    for (const doc of schoolsSnap.docs) {
      const userRef = doc.ref.collection("users").doc(email);
      const userDoc = await userRef.get();
      if (userDoc.exists) {
        foundDoc = userRef;
        break;
      }
    }

    if (!foundDoc) return res.status(404).json({ message: "Email not found" });

    const newHash = await bcrypt.hash(newPassword, 10);
    await foundDoc.update({ passwordHash: newHash });

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ error: err.message });
  }
};

export const forgotCommon = async (req, res) => {
  try {
    const { mode, email, studentId, schoolId } = req.body;

    let message = "";

    if (mode === "school") {
      message =
        "School password resets are managed by Schola system support. Please contact your system administrator.";
    } else if (mode === "teacher") {
      message =
        "Teachers cannot reset passwords online. Please contact your School Administrator.";
    } else if (mode === "student") {
      message =
        "Students cannot reset passwords online. Please contact your Class Teacher or School Administrator.";
    } else {
      return res.status(400).json({ message: "Invalid mode" });
    }

    // Save request
    await db.collection("password_requests").add({
      mode,
      email: email || null,
      studentId: studentId || null,
      schoolId: schoolId || null,
      timestamp: new Date().toISOString(),
    });

    res.json({ message });
  } catch (err) {
    console.error("forgotCommon error:", err);
    res.status(500).json({ error: err.message });
  }
};
