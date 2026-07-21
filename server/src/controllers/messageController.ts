import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Message from '../models/Message';
import FriendRequest from '../models/FriendRequest';
import User from '../models/userModel';
import { Op } from 'sequelize';

export const sendMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { receiverId, content, replyToMessageId } = req.body;
    if (!receiverId || !content) {
      res.status(400).json({ message: 'receiverId and content are required' });
      return;
    }

    const areFriends = await FriendRequest.findOne({
      where: {
        [Op.or]: [
          { senderId: req.user!.id, receiverId, status: 'accepted' },
          { senderId: receiverId, receiverId: req.user!.id, status: 'accepted' },
        ],
      },
    });

    const message = await Message.create({
      senderId: req.user!.id,
      receiverId,
      content,
      isMessageRequest: !areFriends,
      replyToId: replyToMessageId || null,
    });

    const messageWithSender = await Message.findByPk(message.id, {
      include: [
        { model: User, as: 'sender', attributes: ['id', 'name', 'email', 'profilePicture'] },
        { model: Message, as: 'replyTo', include: [{ model: User, as: 'sender', attributes: ['id', 'name', 'profilePicture'] }] },
      ],
    });

    res.status(201).json(messageWithSender);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Error sending message' });
  }
};

export const getConversation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const messages = await Message.findAll({
      where: {
        isMessageRequest: false,
        [Op.or]: [
          { senderId: req.user!.id, receiverId: userId },
          { senderId: userId, receiverId: req.user!.id },
        ],
      },
      include: [
        { model: User, as: 'sender', attributes: ['id', 'name', 'email', 'profilePicture'] },
        { model: User, as: 'receiver', attributes: ['id', 'name', 'email', 'profilePicture'] },
        { model: Message, as: 'replyTo', include: [{ model: User, as: 'sender', attributes: ['id', 'name', 'profilePicture'] }] },
      ],
      order: [['createdAt', 'ASC']],
    });

    await Message.update(
      { readAt: new Date() },
      {
        where: { senderId: userId, receiverId: req.user!.id, readAt: null },
      }
    );

    res.json(messages);
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ message: 'Error fetching conversation' });
  }
};

export const getMessageRequests = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const messages = await Message.findAll({
      where: { receiverId: req.user!.id, isMessageRequest: true },
      include: [
        { model: User, as: 'sender', attributes: ['id', 'name', 'email', 'profilePicture'] },
      ],
      order: [['createdAt', 'DESC']],
    });

    const grouped = messages.reduce((acc: any[], msg) => {
      const m = msg as any;
      const existing = acc.find((g: any) => g.sender.id === m.senderId);
      if (existing) {
        existing.messages.push(m);
      } else {
        acc.push({ sender: m.sender, messages: [m] });
      }
      return acc;
    }, []);

    res.json(grouped);
  } catch (error) {
    console.error('Get message requests error:', error);
    res.status(500).json({ message: 'Error fetching message requests' });
  }
};
