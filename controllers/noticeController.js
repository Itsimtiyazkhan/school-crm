import { db } from "../config/firebase.js";

// ADD NOTICE (Admin or Teacher)
// Helper to clean undefined values
const clean = (v) => (v === undefined ? "" : v);

// export const addNotice = async (req, res) => {
//   try {
//     const {
//       schoolId,
//       title,
//       description,
//       category,
//       visibility, // all | students | teachers | class
//       classId,
//       status, // Active | Important | Urgent
//       createdBy, // admin | teacher
//       createdById,
//       createdByName,
//     } = req.body;

//     if (!schoolId || !title)
//       return res.status(400).json({ message: "Missing required fields" });

//     // ----- VALIDATE TEACHER POST -----
//     if (createdBy === "teacher") {
//       if (!createdById)
//         return res.status(400).json({ message: "Teacher ID required" });

//       if (visibility !== "class")
//         return res
//           .status(403)
//           .json({ message: "Teacher can only post class notice" });

//       if (!classId)
//         return res
//           .status(400)
//           .json({ message: "classId required for teacher notice" });
//     }

//     const noticeId = "NT-" + Math.floor(1000 + Math.random() * 9000);

//     await db
//       .collection("schools")
//       .doc(schoolId)
//       .collection("notices")
//       .doc(noticeId)
//       .set({
//         noticeId,
//         title: clean(title),
//         description: clean(description),
//         category: clean(category),
//         visibility: clean(visibility),
//         classId: visibility === "class" ? classId : null,
//         status: clean(status),
//         views: 0,
//         archived: false,
//         createdBy: clean(createdBy),
//         createdById: clean(createdById),
//         createdByName: clean(createdByName),
//         createdAt: new Date().toISOString(),
//       });

//     res.status(201).json({ message: "Notice created", noticeId });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

export const addNotice = async (req, res) => {
  try {
    const {
      schoolId,
      title,
      description,
      category,
      visibility, // all | students | teachers | class
      classId,
      status, // Active | Important | Urgent
      createdBy, // admin | teacher
      createdById,
      createdByName,

      // 🔥 calendar fields (MANDATORY)
      startDate, // "YYYY-MM-DD"
      endDate, // optional
    } = req.body;

    if (!schoolId || !title || !startDate) {
      return res
        .status(400)
        .json({ message: "schoolId, title, startDate required" });
    }

    // Teacher validation
    if (createdBy === "teacher") {
      if (!createdById)
        return res.status(400).json({ message: "Teacher ID required" });

      if (visibility !== "class")
        return res
          .status(403)
          .json({ message: "Teacher can only post class notice" });

      if (!classId)
        return res
          .status(400)
          .json({ message: "classId required for teacher notice" });
    }

    const noticeId = "NT-" + Math.floor(1000 + Math.random() * 9000);

    await db
      .collection("schools")
      .doc(schoolId)
      .collection("notices")
      .doc(noticeId)
      .set({
        noticeId,
        title: clean(title),
        description: clean(description),

        // 🔥 calendar fields
        startDate,
        endDate: endDate || startDate,

        category: clean(category),
        visibility: clean(visibility),
        classId: visibility === "class" ? classId : null,

        status: clean(status),
        views: 0,
        archived: false,

        createdBy: clean(createdBy),
        createdById: clean(createdById),
        createdByName: clean(createdByName),

        createdAt: new Date().toISOString(),
      });

    res.status(201).json({ message: "Notice created", noticeId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// GET FILTERED NOTICES (Admin/Student/Teacher)

// export const getNotices = async (req, res) => {
//   try {
//     const { schoolId, role, classId, teacherId } = req.query;

//     if (!schoolId)
//       return res.status(400).json({ message: "schoolId required" });

//     const snap = await db
//       .collection("schools")
//       .doc(schoolId)
//       .collection("notices")
//       .orderBy("createdAt", "desc")
//       .get();

//     let notices = snap.docs.map((d) => d.data());

//     // ------------------------
//     // ROLE BASED FILTERS
//     // ------------------------

//     if (role === "admin") {
//       // Admin can see everything (no filter)
//     } else if (role === "teacher") {
//       notices = notices.filter(
//         (n) =>
//           n.visibility === "all" ||
//           n.visibility === "teachers" ||
//           (n.visibility === "class" && n.classId === classId) ||
//           (n.visibility === "teacher" && n.teacherId === teacherId)
//       );
//     } else if (role === "student") {
//       notices = notices.filter(
//         (n) =>
//           n.visibility === "all" ||
//           n.visibility === "students" ||
//           (n.visibility === "class" && n.classId === classId)
//       );
//     }

//     res.json(notices);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

export const getNotices = async (req, res) => {
  try {
    const { schoolId, role, classId, teacherId } = req.query;

    if (!schoolId)
      return res.status(400).json({ message: "schoolId required" });

    const snap = await db
      .collection("schools")
      .doc(schoolId)
      .collection("notices")
      .orderBy("createdAt", "desc")
      .get();

    let notices = snap.docs.map((d) => d.data());

    if (role === "admin") {
      // see all
    } else if (role === "teacher") {
      notices = notices.filter(
        (n) =>
          n.visibility === "all" ||
          n.visibility === "teachers" ||
          (n.visibility === "class" && n.classId === classId) ||
          (n.visibility === "teacher" && n.teacherId === teacherId)
      );
    } else if (role === "student") {
      notices = notices.filter(
        (n) =>
          n.visibility === "all" ||
          n.visibility === "students" ||
          (n.visibility === "class" && n.classId === classId)
      );
    }

    res.json(notices);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// GET SINGLE NOTICE + INCREMENT VIEWS

// export const getNoticeById = async (req, res) => {
//   try {
//     const { schoolId, noticeId } = req.params;

//     const ref = db
//       .collection("schools")
//       .doc(schoolId)
//       .collection("notices")
//       .doc(noticeId);

//     const doc = await ref.get();
//     if (!doc.exists)
//       return res.status(404).json({ message: "Notice not found" });

//     const data = doc.data();
//     await ref.update({ views: (data.views || 0) + 1 });

//     res.json(data);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

export const getNoticeById = async (req, res) => {
  try {
    const { schoolId, noticeId } = req.params;

    const ref = db
      .collection("schools")
      .doc(schoolId)
      .collection("notices")
      .doc(noticeId);

    const doc = await ref.get();
    if (!doc.exists)
      return res.status(404).json({ message: "Notice not found" });

    const data = doc.data();
    await ref.update({ views: (data.views || 0) + 1 });

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE NOTICE
export const updateNotice = async (req, res) => {
  try {
    const { schoolId, noticeId } = req.params;

    await db
      .collection("schools")
      .doc(schoolId)
      .collection("notices")
      .doc(noticeId)
      .update({
        ...req.body,
        updatedAt: new Date().toISOString(),
      });

    res.json({ message: "Notice updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE NOTICE
export const deleteNotice = async (req, res) => {
  try {
    const { schoolId, noticeId } = req.params;

    await db
      .collection("schools")
      .doc(schoolId)
      .collection("notices")
      .doc(noticeId)
      .delete();

    res.json({ message: "Notice deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ARCHIVE NOTICE
export const archiveNotice = async (req, res) => {
  try {
    const { schoolId, noticeId } = req.params;

    await db
      .collection("schools")
      .doc(schoolId)
      .collection("notices")
      .doc(noticeId)
      .update({
        archived: true,
        updatedAt: new Date().toISOString(),
      });

    res.json({ message: "Notice archived" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getNoticesForCalendar = async (schoolId, role) => {
  const snap = await db
    .collection("schools")
    .doc(schoolId)
    .collection("notices")
    .get();

  return snap.docs
    .map((d) => d.data())
    .filter((n) => n.audience === role || n.audience === "BOTH");
};
