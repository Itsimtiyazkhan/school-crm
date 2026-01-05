import { db } from "../config/firebase.js";
import XLSX from "xlsx";
import fs from "fs";

/* ----------------------------------------------------
   ADD SUBJECT
---------------------------------------------------- */
export const addSubject = async (req, res) => {
  try {
    const { schoolId, name, classId, teacherId, code } = req.body;

    console.log("ADD SUBJECT BODY:", req.body);

    if (!schoolId || !name || !classId) {
      return res.status(400).json({
        message: "schoolId, name, and classId are required",
      });
    }

    const subjectId = "SUB-" + Math.floor(1000 + Math.random() * 9000);

    await db
      .collection("schools")
      .doc(schoolId)
      .collection("subjects")
      .doc(subjectId)
      .set({
        subjectId,
        name,
        classId,
        teacherId: teacherId || null,
        code: code || name.substring(0, 4).toUpperCase(),
        createdAt: new Date().toISOString(),
      });

    res.json({ message: "Subject added successfully", subjectId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ----------------------------------------------------
   GET ALL SUBJECTS
---------------------------------------------------- */
export const getAllSubjects = async (req, res) => {
  try {
    const { schoolId } = req.params;

    const snap = await db
      .collection("schools")
      .doc(schoolId)
      .collection("subjects")
      .orderBy("createdAt", "desc")
      .get();

    res.json(snap.docs.map((d) => d.data()));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ----------------------------------------------------
   GET SUBJECTS BY CLASS ID
---------------------------------------------------- */
export const getSubjectsByClass = async (req, res) => {
  try {
    const { schoolId, classId } = req.params;

    const snap = await db
      .collection("schools")
      .doc(schoolId)
      .collection("subjects")
      .where("classId", "==", classId)
      .get();

    res.json(snap.docs.map((d) => d.data()));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ----------------------------------------------------
   UPDATE SUBJECT
---------------------------------------------------- */
export const updateSubject = async (req, res) => {
  try {
    const { schoolId, subjectId } = req.params;

    await db
      .collection("schools")
      .doc(schoolId)
      .collection("subjects")
      .doc(subjectId)
      .update({
        ...req.body,
        updatedAt: new Date().toISOString(),
      });

    res.json({ message: "Subject updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ----------------------------------------------------
   DELETE SUBJECT
---------------------------------------------------- */
export const deleteSubject = async (req, res) => {
  try {
    const { schoolId, subjectId } = req.params;

    await db
      .collection("schools")
      .doc(schoolId)
      .collection("subjects")
      .doc(subjectId)
      .delete();

    res.json({ message: "Subject deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ----------------------------------------------------
   BULK ADD SUBJECTS (Excel / CSV)
---------------------------------------------------- */
export const bulkAddSubjects = async (req, res) => {
  try {
    const { schoolId } = req.params;

    if (!req.file) {
      return res.status(400).json({ message: "Please upload a file" });
    }

    const workbook = XLSX.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);

    if (!rows.length) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: "Empty file" });
    }

    let added = 0;
    const batch = db.batch();

    for (const r of rows) {
      const name = r["Subject Name"] || r["name"];
      const classId = r["Class ID"] || r["classId"];
      const code = r["Code"] || name.substring(0, 4).toUpperCase();

      if (!name || !classId) continue;

      const subjectId = "SUB-" + Math.floor(1000 + Math.random() * 9000);

      const ref = db
        .collection("schools")
        .doc(schoolId)
        .collection("subjects")
        .doc(subjectId);

      batch.set(ref, {
        subjectId,
        name,
        classId,
        teacherId: null,
        code,
        createdAt: new Date().toISOString(),
      });

      added++;
    }

    await batch.commit();
    fs.unlinkSync(req.file.path);

    res.json({ message: "Bulk upload completed", totalAdded: added });
  } catch (error) {
    console.error("Bulk Add Error:", error);
    res.status(500).json({ error: error.message });
  }
};

/* ----------------------------------------------------
   DOWNLOAD SUBJECT TEMPLATE
---------------------------------------------------- */
export const downloadTemplate = async (req, res) => {
  try {
    const data = [
      ["Subject Name", "Class ID", "Code"],
      ["Mathematics", "CLS-1001", "MATH"],
      ["Science", "CLS-1001", "SCIE"],
      ["English", "CLS-1001", "ENGL"],
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");

    const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    res.setHeader(
      "Content-Disposition",
      'attachment; filename="subjects_template.xlsx"'
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.end(buffer);
  } catch (error) {
    console.error("Template Download Error:", error);
    res.status(500).json({ error: error.message });
  }
};
