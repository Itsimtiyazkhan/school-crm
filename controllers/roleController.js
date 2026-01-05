import { db } from '../config/firebase.js';
import { roleCollection } from '../models/roleModel.js';

export const addUser = async (req, res) => {
  try {
    const data = req.body;
    const ref = db.collection(roleCollection).doc();
    await ref.set({ ...data, createdAt: new Date().toISOString() });
    res.json({ id: ref.id, ...data });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

export const getUsers = async (req, res) => {
  try {
    const snap = await db.collection(roleCollection).get();
    res.json(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  } catch (err) { res.status(500).json({ error: err.message }); }
};

export const assignRole = async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection(roleCollection).doc(id).update(req.body);
    res.json({ message: 'Role updated' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

