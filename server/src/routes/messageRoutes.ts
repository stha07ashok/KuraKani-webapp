import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { sendMessage, getConversation, getMessageRequests, getUnreadCounts } from '../controllers/messageController';

const router = Router();
router.post('/', authenticate, sendMessage);
router.get('/unread/counts', authenticate, getUnreadCounts);
router.get('/requests', authenticate, getMessageRequests);
router.get('/:userId', authenticate, getConversation);

export default router;
