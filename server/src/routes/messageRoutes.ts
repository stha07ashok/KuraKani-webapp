import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { sendMessage, getConversation, getMessageRequests } from '../controllers/messageController';

const router = Router();
router.post('/', authenticate, sendMessage);
router.get('/requests', authenticate, getMessageRequests);
router.get('/:userId', authenticate, getConversation);

export default router;
