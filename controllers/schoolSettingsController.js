import { db } from "../config/firebase.js";

export const updateSchoolSettings = async (req, res) => {
  const { schoolId } = req.params;
  const { timing, rules } = req.body;

  await db
    .collection("schools")
    .doc(schoolId)
    .set({ timing, rules }, { merge: true });

  res.json({ message: "School settings updated" });
};

export const getSchoolSettings = async (req, res) => {
  const { schoolId } = req.params;
  const doc = await db.collection("schools").doc(schoolId).get();

  if (!doc.exists) return res.status(404).json({ message: "School not found" });

  res.json(doc.data());
};
