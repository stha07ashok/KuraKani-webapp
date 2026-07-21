import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  getPendingRequests,
  getFriends,
} from '../controllers/friendRequestController';

const router = Router();
router.post('/', authenticate, sendFriendRequest);
router.put('/:id/accept', authenticate, acceptFriendRequest);
router.put('/:id/reject', authenticate, rejectFriendRequest);
router.get('/pending', authenticate, getPendingRequests);
router.get('/friends', authenticate, getFriends);

export default router;
