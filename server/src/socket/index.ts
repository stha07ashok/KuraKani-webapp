import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { getAuth } from 'firebase-admin/auth';
import { ensureFirebaseInitialized } from '../config/firebaseAdmin';
import User from '../models/userModel';
import Message from '../models/Message';
import FriendRequest from '../models/FriendRequest';
import { Op } from 'sequelize';

interface AuthSocket extends Socket {
  userId?: number;
}

export function setupSocket(httpServer: HTTPServer): SocketIOServer {
  const io = new SocketIOServer(httpServer, {
    cors: { origin: ['http://localhost:3000'], credentials: true },
  });

  io.use(async (socket: AuthSocket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('No token provided'));
      }
      ensureFirebaseInitialized();
      const decoded = await getAuth().verifyIdToken(token);
      const user = await User.findOne({ where: { firebaseUid: decoded.uid } });
      if (!user) {
        return next(new Error('User not found'));
      }
      socket.userId = user.id;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: AuthSocket) => {
    const userId = socket.userId!;
    socket.join(`user:${userId}`);
    console.log(`User ${userId} connected`);

    socket.on('send_message', async (data: { receiverId: number; content: string; replyToMessageId?: number | null }) => {
      try {
        const areFriends = await FriendRequest.findOne({
          where: {
            [Op.or]: [
              { senderId: userId, receiverId: data.receiverId, status: 'accepted' },
              { senderId: data.receiverId, receiverId: userId, status: 'accepted' },
            ],
          },
        });

        const message = await Message.create({
          senderId: userId,
          receiverId: data.receiverId,
          content: data.content,
          isMessageRequest: !areFriends,
          replyToId: data.replyToMessageId || null,
        });

        const messageWithSender = await Message.findByPk(message.id, {
          include: [
            { model: User, as: 'sender', attributes: ['id', 'name', 'email', 'profilePicture'] },
            { model: User, as: 'receiver', attributes: ['id', 'name', 'email', 'profilePicture'] },
            { model: Message, as: 'replyTo', include: [{ model: User, as: 'sender', attributes: ['id', 'name', 'profilePicture'] }] },
          ],
        });

        if (messageWithSender) {
          io.to(`user:${data.receiverId}`).emit('new_message', messageWithSender);
          socket.emit('message_sent', messageWithSender);
        }
      } catch (error) {
        console.error('Socket send_message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    socket.on('mark_as_read', async (data: { friendId: number }) => {
      try {
        const [updated] = await Message.update(
          { readAt: new Date() },
          { where: { senderId: data.friendId, receiverId: userId, readAt: null } }
        );

        if (updated > 0) {
          io.to(`user:${data.friendId}`).emit('messages_read', { readerId: userId });
        }
      } catch (error) {
        console.error('Socket mark_as_read error:', error);
      }
    });

    socket.on('unsend_message', async (data: { messageId: number; mode: 'me' | 'everyone' }) => {
      try {
        const message = await Message.findByPk(data.messageId);
        if (!message) return;

        if (data.mode === 'everyone') {
          await message.update({
            deletedAt: new Date(),
            content: 'This message was unsent',
          });
        } else if (message.senderId === userId) {
          await message.update({ deletedForSenderAt: new Date() });
        } else {
          await message.update({ deletedForReceiverAt: new Date() });
        }

        const targetRooms = data.mode === 'everyone'
          ? [`user:${message.senderId}`, `user:${message.receiverId}`]
          : [`user:${userId}`];

        io.to(targetRooms).emit('message_unsent', { messageId: data.messageId, mode: data.mode });
      } catch (error) {
        console.error('Socket unsend_message error:', error);
        socket.emit('error', { message: 'Failed to unsend message' });
      }
    });

    socket.on('hide_unsent_message', async (data: { messageId: number }) => {
      try {
        const message = await Message.findByPk(data.messageId);
        if (!message) return;

        if (message.senderId === userId) {
          await message.update({ deletedForSenderAt: new Date() });
        } else {
          await message.update({ deletedForReceiverAt: new Date() });
        }

        io.to(`user:${userId}`).emit('message_unsent_hidden', { messageId: data.messageId });
      } catch (error) {
        console.error('Socket hide_unsent_message error:', error);
      }
    });

    socket.on('delete_message', async (data: { messageId: number }) => {
      try {
        const message = await Message.findByPk(data.messageId);
        if (!message) return;
        if (message.senderId !== userId) return;

        await Message.destroy({ where: { id: data.messageId } });

        io.to(`user:${message.senderId}`).emit('message_deleted', { messageId: data.messageId });
        io.to(`user:${message.receiverId}`).emit('message_deleted', { messageId: data.messageId });
      } catch (error) {
        console.error('Socket delete_message error:', error);
        socket.emit('error', { message: 'Failed to delete message' });
      }
    });

    socket.on('disconnect', () => {
      console.log(`User ${userId} disconnected`);
    });
  });

  return io;
}
