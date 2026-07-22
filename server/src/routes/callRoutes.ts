import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import User from '../models/userModel';
import CallLog from '../models/CallLog';
import { Op } from 'sequelize';

const router = Router();

router.get('/:userId', authenticate, async (req: Request, res: Response) => {
  try {
    const currentUserId = (req as any).user.id;
    const { userId } = req.params;

    const callLogs = await CallLog.findAll({
      where: {
        [Op.or]: [
          { callerId: currentUserId, receiverId: userId },
          { callerId: userId, receiverId: currentUserId },
        ],
      },
      include: [
        { model: User, as: 'caller', attributes: ['id', 'name', 'profilePicture'] },
        { model: User, as: 'receiver', attributes: ['id', 'name', 'profilePicture'] },
      ],
      order: [['createdAt', 'DESC']],
      limit: 50,
    });

    res.json(callLogs);
  } catch (error) {
    console.error('Error fetching call logs:', error);
    res.status(500).json({ error: 'Failed to fetch call logs' });
  }
});

export default router;
