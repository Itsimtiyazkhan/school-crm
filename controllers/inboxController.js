import { db } from '../config/firebase.js';
import { messageCollection } from '../models/inboxModel.js';

export const sendMessage = async (req, res) => {
  try {
    const msg = req.body;
    const sentRef = db.collection(messageCollection).doc();
    await sentRef.set({ ...msg, folder: 'Sent', read: true, createdAt: new Date().toISOString() });

    // create inbox copies for recipients
    if (Array.isArray(msg.recipients)) {
      for (const r of msg.recipients) {
        const inboxRef = db.collection(messageCollection).doc();
        await inboxRef.set({ ...msg, folder: 'Inbox', recipientEmail: r.email, read: false, createdAt: new Date().toISOString() });
      }
    }
    res.json({ message: 'Message sent' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

export const getInbox = async (req, res) => {
  try {
    const { email, folder, category } = req.query;
    let q = db.collection(messageCollection);
    if (email) q = q.where('recipientEmail','==', email);
    if (folder) q = q.where('folder','==', folder);
    if (category) q = q.where('category','==', category);
    const snap = await q.orderBy('createdAt','desc').get();
    res.json(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  } catch (err) { res.status(500).json({ error: err.message }); }
};

export const getMessageById = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await db.collection(messageCollection).doc(id).get();
    if (!doc.exists) return res.status(404).json({ message: 'Message not found' });
    await db.collection(messageCollection).doc(id).update({ read: true });
    res.json({ id: doc.id, ...doc.data() });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

export const moveMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { folder } = req.body;
    await db.collection(messageCollection).doc(id).update({ folder });
    res.json({ message: `Moved to ${folder}` });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

export const toggleStar = async (req, res) => {
  try {
    const { id } = req.params;
    const { starred } = req.body;
    await db.collection(messageCollection).doc(id).update({ starred });
    res.json({ message: starred ? 'Starred' : 'Unstarred' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

export const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection(messageCollection).doc(id).delete();
    res.json({ message: 'Message deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

export const getCategorySummary = async (req, res) => {
  try {
    const snap = await db.collection(messageCollection).get();
    const msgs = snap.docs.map(d => d.data());
    const summary = {
      total: msgs.length,
      academic: msgs.filter(m => m.category === 'Academic').length,
      events: msgs.filter(m => m.category === 'Events').length,
      finance: msgs.filter(m => m.category === 'Finance').length,
      administration: msgs.filter(m => m.category === 'Administration').length,
      starred: msgs.filter(m => m.starred).length,
      drafts: msgs.filter(m => m.folder === 'Drafts').length,
      trash: msgs.filter(m => m.folder === 'Trash').length
    };
    res.json(summary);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

