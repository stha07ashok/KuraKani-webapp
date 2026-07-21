import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import FriendRequest from '../models/FriendRequest';
import User from '../models/userModel';
import { Op } from 'sequelize';

export const sendFriendRequest = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { receiverId } = req.body;
    if (!receiverId) {
      res.status(400).json({ message: 'receiverId is required' });
      return;
    }

    if (receiverId === req.user!.id) {
      res.status(400).json({ message: 'Cannot send friend request to yourself' });
      return;
    }

    const receiver = await User.findByPk(receiverId);
    if (!receiver) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const existing = await FriendRequest.findOne({
      where: {
        [Op.or]: [
          { senderId: req.user!.id, receiverId },
          { senderId: receiverId, receiverId: req.user!.id },
        ],
        status: { [Op.ne]: 'rejected' },
      },
    });

    if (existing) {
      res.status(400).json({ message: 'Friend request already exists' });
      return;
    }

    const friendRequest = await FriendRequest.create({
      senderId: req.user!.id,
      receiverId,
      status: 'pending',
    });

    res.status(201).json(friendRequest);
  } catch (error) {
    console.error('Send friend request error:', error);
    res.status(500).json({ message: 'Error sending friend request' });
  }
};

export const acceptFriendRequest = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const friendRequest = await FriendRequest.findOne({
      where: { id, receiverId: req.user!.id, status: 'pending' },
    });

    if (!friendRequest) {
      res.status(404).json({ message: 'Friend request not found' });
      return;
    }

    friendRequest.status = 'accepted';
    await friendRequest.save();

    res.json(friendRequest);
  } catch (error) {
    console.error('Accept friend request error:', error);
    res.status(500).json({ message: 'Error accepting friend request' });
  }
};

export const rejectFriendRequest = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const friendRequest = await FriendRequest.findOne({
      where: { id, receiverId: req.user!.id, status: 'pending' },
    });

    if (!friendRequest) {
      res.status(404).json({ message: 'Friend request not found' });
      return;
    }

    friendRequest.status = 'rejected';
    await friendRequest.save();

    res.json(friendRequest);
  } catch (error) {
    console.error('Reject friend request error:', error);
    res.status(500).json({ message: 'Error rejecting friend request' });
  }
};

export const getPendingRequests = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const requests = await FriendRequest.findAll({
      where: { receiverId: req.user!.id, status: 'pending' },
      include: [{ model: User, as: 'sender', attributes: ['id', 'name', 'email', 'profilePicture'] }],
      order: [['createdAt', 'DESC']],
    });

    res.json(requests);
  } catch (error) {
    console.error('Get pending requests error:', error);
    res.status(500).json({ message: 'Error fetching pending requests' });
  }
};

export const getFriends = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const sentRequests = await FriendRequest.findAll({
      where: { senderId: req.user!.id, status: 'accepted' },
      include: [{ model: User, as: 'receiver', attributes: ['id', 'name', 'email', 'profilePicture'] }],
    });

    const receivedRequests = await FriendRequest.findAll({
      where: { receiverId: req.user!.id, status: 'accepted' },
      include: [{ model: User, as: 'sender', attributes: ['id', 'name', 'email', 'profilePicture'] }],
    });

    const friends = [
      ...sentRequests.map((r: any) => ({ ...r.receiver.toJSON(), friendRequestId: r.id })),
      ...receivedRequests.map((r: any) => ({ ...r.sender.toJSON(), friendRequestId: r.id })),
    ];

    res.json(friends);
  } catch (error) {
    console.error('Get friends error:', error);
    res.status(500).json({ message: 'Error fetching friends' });
  }
};
