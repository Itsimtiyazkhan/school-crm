import express from 'express';
import { sendMessage, getInbox, getMessageById, moveMessage, toggleStar, deleteMessage, getCategorySummary } from '../controllers/inboxController.js';
const router = express.Router();
router.post('/send', sendMessage);
router.get('/', getInbox);
router.get('/summary', getCategorySummary);
router.get('/:id', getMessageById);
router.put('/:id/move', moveMessage);
router.put('/:id/star', toggleStar);
router.delete('/:id', deleteMessage);
export default router;

