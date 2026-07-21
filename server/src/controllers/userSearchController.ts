import { Response } from 'express';
import { Op } from 'sequelize';
import { AuthRequest } from '../middleware/auth';
import User from '../models/userModel';
import FriendRequest from '../models/FriendRequest';

export const searchUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { q } = req.query;
    if (!q || typeof q !== 'string' || q.trim().length === 0) {
      res.status(400).json({ message: 'Search query is required' });
      return;
    }

    const users = await User.findAll({
      where: {
        id: { [Op.ne]: req.user!.id },
        [Op.or]: [
          { name: { [Op.like]: `%${q}%` } },
          { email: { [Op.like]: `%${q}%` } },
        ],
      },
      attributes: ['id', 'name', 'email', 'profilePicture'],
      limit: 40,
      group: ['User.id'],
    });

    const friendRequests = await FriendRequest.findAll({
      where: {
        [Op.or]: [
          { senderId: req.user!.id },
          { receiverId: req.user!.id },
        ],
      },
    });

    const usersWithStatus = users.map((u) => {
      const sent = friendRequests.find((fr) => fr.senderId === req.user!.id && fr.receiverId === u.id);
      const received = friendRequests.find((fr) => fr.receiverId === req.user!.id && fr.senderId === u.id);
      let friendshipStatus: 'none' | 'pending_sent' | 'pending_received' | 'friends' = 'none';
      if (sent?.status === 'accepted' || received?.status === 'accepted') {
        friendshipStatus = 'friends';
      } else if (sent?.status === 'pending') {
        friendshipStatus = 'pending_sent';
      } else if (received?.status === 'pending') {
        friendshipStatus = 'pending_received';
      }
      return { ...u.toJSON(), friendshipStatus };
    });

    res.json(usersWithStatus);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: 'Error searching users' });
  }
};
