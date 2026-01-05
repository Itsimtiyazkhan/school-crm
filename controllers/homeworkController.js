import { db } from "../config/firebase.js";

/* ---------------------------------------------
   1. CREATE HOMEWORK
---------------------------------------------- */
export const createHomework = async (req, res) => {
  try {
    const {
      schoolId,
      classId,
      subjectId,
      subjectName,
      teacherId,
      teacherName,
      title,
      description,
      dueDate,
      attachments,
    } = req.body;

    if (!schoolId || !classId || !subjectId || !teacherId || !title)
      return res.status(400).json({ message: "Missing required fields" });

    const homeworkId = "HW-" + Math.floor(1000 + Math.random() * 9000);

    await db
      .collection("schools")
      .doc(schoolId)
      .collection("homework")
      .doc(homeworkId)
      .set({
        homeworkId,
        classId,
        subjectId,
        subjectName,
        teacherId,
        teacherName,
        title,
        description,
        dueDate,
        attachments: attachments || [],
        createdAt: new Date().toISOString(),
      });

    res.json({ message: "Homework created", homeworkId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ---------------------------------------------
   2. GET HOMEWORK (By Class)
---------------------------------------------- */
export const getHomeworkByClass = async (req, res) => {
  try {
    const { schoolId, classId } = req.params;

    const snap = await db
      .collection("schools")
      .doc(schoolId)
      .collection("homework")
      .where("classId", "==", classId)
      .get();

    res.json(snap.docs.map((d) => d.data()));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ---------------------------------------------
   3. GET HOMEWORK LIST (Student)
---------------------------------------------- */
export const getHomeworkList = async (req, res) => {
  try {
    const { schoolId, classId } = req.query;

    if (!schoolId || !classId)
      return res.status(400).json({ message: "schoolId & classId required" });

    const snap = await db
      .collection("schools")
      .doc(schoolId)
      .collection("homework")
      .where("classId", "==", classId)
      .get();

    res.json(snap.docs.map((d) => d.data()));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ---------------------------------------------
   4. STUDENT SUBMIT HOMEWORK
---------------------------------------------- */
export const submitHomework = async (req, res) => {
  try {
    const {
      schoolId,
      homeworkId,
      studentId,
      studentName,
      answerText,
      attachments,
    } = req.body;

    if (!schoolId || !homeworkId || !studentId)
      return res.status(400).json({ message: "Missing fields" });

    const ref = db
      .collection("schools")
      .doc(schoolId)
      .collection("homeworkSubmissions")
      .doc(homeworkId)
      .collection("students")
      .doc(studentId);

    const snap = await ref.get();

    // ⛔ Prevent update if checked
    if (snap.exists && snap.data().status === "checked") {
      return res.status(400).json({
        message: "Teacher already checked this submission. You cannot update.",
      });
    }

    await ref.set(
      {
        studentId,
        studentName,
        answerText: answerText || "",
        attachments: attachments || [],
        submittedAt: new Date().toISOString(),
        status: "submitted",
      },
      { merge: true }
    );

    res.json({ message: "Homework submitted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ---------------------------------------------
   5. UPDATE SUBMISSION (Student)
---------------------------------------------- */
export const updateSubmission = async (req, res) => {
  try {
    const { schoolId, homeworkId, studentId, answerText, attachments } =
      req.body;

    const ref = db
      .collection("schools")
      .doc(schoolId)
      .collection("homeworkSubmissions")
      .doc(homeworkId)
      .collection("students")
      .doc(studentId);

    const snap = await ref.get();

    if (!snap.exists)
      return res.status(404).json({ message: "Submission not found" });

    // ⛔ prevent editing if checked
    if (snap.data().status === "checked")
      return res.status(400).json({
        message: "Teacher already checked this submission. Cannot edit.",
      });

    await ref.update({
      answerText,
      attachments: attachments || [],
      updatedAt: new Date().toISOString(),
      status: "updated",
    });

    res.json({ message: "Submission updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ---------------------------------------------
   6. GET ALL SUBMISSIONS OF HOMEWORK
---------------------------------------------- */
export const getSubmissions = async (req, res) => {
  try {
    const { schoolId, homeworkId } = req.params;

    const snap = await db
      .collection("schools")
      .doc(schoolId)
      .collection("homeworkSubmissions")
      .doc(homeworkId)
      .collection("students")
      .get();

    res.json(snap.docs.map((d) => d.data()));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ---------------------------------------------
   7. TEACHER GRADES HOMEWORK
---------------------------------------------- */
export const gradeHomework = async (req, res) => {
  try {
    const { schoolId, homeworkId, studentId } = req.params;
    const { marks, remark } = req.body;

    const ref = db
      .collection("schools")
      .doc(schoolId)
      .collection("homeworkSubmissions")
      .doc(homeworkId)
      .collection("students")
      .doc(studentId);

    await ref.update({
      marks,
      remark,
      checkedAt: new Date().toISOString(),
      status: "checked",
    });

    res.json({ message: "Homework graded" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ---------------------------------------------
   8. HOMEWORK CREATED BY TEACHER
---------------------------------------------- */
export const getHomeworkByTeacher = async (req, res) => {
  try {
    const { schoolId, teacherId } = req.params;

    const snap = await db
      .collection("schools")
      .doc(schoolId)
      .collection("homework")
      .where("teacherId", "==", teacherId)
      .get();

    res.json(snap.docs.map((d) => d.data()));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ==================
export const getHomeworkListForAdmin = async (req, res) => {
  try {
    const { schoolId, classId } = req.query;

    if (!schoolId)
      return res.status(400).json({ message: "schoolId required" });

    let ref = db.collection("schools").doc(schoolId).collection("homework");

    let snap;

    // If admin gives classId → filter only that class
    if (classId) {
      snap = await ref.where("classId", "==", classId).get();
    } else {
      // Admin: fetch all homework in school
      snap = await ref.get();
    }

    const list = snap.docs.map((d) => d.data());

    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
