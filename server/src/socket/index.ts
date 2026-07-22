import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { getAuth } from 'firebase-admin/auth';
import { ensureFirebaseInitialized } from '../config/firebaseAdmin';
import User from '../models/userModel';
import Message from '../models/Message';
import FriendRequest from '../models/FriendRequest';
import CallLog from '../models/CallLog';
import { Op } from 'sequelize';

interface AuthSocket extends Socket {
  userId?: number;
}

const activeCalls = new Map<string, { callerId: number; receiverId: number; type: 'audio' | 'video'; callLogId: number; startedAt?: Date }>();

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

    socket.on('edit_message', async (data: { messageId: number; content: string }) => {
      try {
        const message = await Message.findByPk(data.messageId);
        if (!message || message.senderId !== userId) return;

        const now = new Date();
        await message.update({ content: data.content, editedAt: now });

        io.to(`user:${message.senderId}`).emit('message_edited', { messageId: data.messageId, content: data.content, editedAt: now.toISOString() });
        io.to(`user:${message.receiverId}`).emit('message_edited', { messageId: data.messageId, content: data.content, editedAt: now.toISOString() });
      } catch (error) {
        console.error('Socket edit_message error:', error);
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

    socket.on('call_user', async (data: { receiverId: number; type: 'audio' | 'video' }) => {
      const user = await User.findByPk(userId, { attributes: ['id', 'name'] });
      const callerName = user?.name ?? `User ${userId}`;
      io.to(`user:${data.receiverId}`).emit('incoming_call', { callerId: userId, callerName, type: data.type });

      try {
        const callLog = await CallLog.create({
          callerId: userId,
          receiverId: data.receiverId,
          type: data.type,
          status: 'missed',
        });
        const key = `${userId}-${data.receiverId}`;
        activeCalls.set(key, { callerId: userId, receiverId: data.receiverId, type: data.type, callLogId: callLog.id });
      } catch (error) {
        console.error('Socket call_user create error:', error);
      }
    });

    socket.on('accept_call', async (data: { callerId: number }) => {
      io.to(`user:${data.callerId}`).emit('call_accepted', { calleeId: userId });

      try {
        const key1 = `${data.callerId}-${userId}`;
        const key2 = `${userId}-${data.callerId}`;
        const active = activeCalls.get(key1) || activeCalls.get(key2);
        if (active) {
          await CallLog.update({ status: 'answered', startedAt: new Date() }, { where: { id: active.callLogId } });
          active.startedAt = new Date();
          activeCalls.set(key2, active);
        }
      } catch (error) {
        console.error('Socket accept_call update error:', error);
      }
    });

    socket.on('reject_call', async (data: { callerId: number }) => {
      io.to(`user:${data.callerId}`).emit('call_rejected', { calleeId: userId });

      try {
        const key = `${data.callerId}-${userId}`;
        const active = activeCalls.get(key);
        if (active) {
          await CallLog.update({ status: 'rejected' }, { where: { id: active.callLogId } });
          activeCalls.delete(key);
        }
      } catch (error) {
        console.error('Socket reject_call update error:', error);
      }
    });

    socket.on('offer', (data: { receiverId: number; offer: any }) => {
      io.to(`user:${data.receiverId}`).emit('offer', { offer: data.offer, senderId: userId });
    });

    socket.on('answer', (data: { receiverId: number; answer: any }) => {
      io.to(`user:${data.receiverId}`).emit('answer', { answer: data.answer, senderId: userId });
    });

    socket.on('ice_candidate', (data: { receiverId: number; candidate: any }) => {
      io.to(`user:${data.receiverId}`).emit('ice_candidate', { candidate: data.candidate, senderId: userId });
    });

    socket.on('end_call', async (data: { receiverId: number }) => {
      io.to(`user:${data.receiverId}`).emit('call_ended', { senderId: userId });

      try {
        const key1 = `${userId}-${data.receiverId}`;
        const key2 = `${data.receiverId}-${userId}`;
        const active = activeCalls.get(key1) || activeCalls.get(key2);
        if (active) {
          const endedAt = new Date();
          const duration = active.startedAt ? Math.round((endedAt.getTime() - active.startedAt.getTime()) / 1000) : null;
          await CallLog.update({ status: 'answered', endedAt, duration }, { where: { id: active.callLogId } });
          activeCalls.delete(key1);
          activeCalls.delete(key2);
        }
      } catch (error) {
        console.error('Socket end_call update error:', error);
      }
    });

    socket.on('toggle_screen_share', (data: { receiverId: number; active: boolean }) => {
      io.to(`user:${data.receiverId}`).emit('screen_share_toggled', { senderId: userId, active: data.active });
    });

    socket.on('toggle_mute', (data: { receiverId: number; kind: 'audio' | 'video'; muted: boolean }) => {
      io.to(`user:${data.receiverId}`).emit('mute_toggled', { senderId: userId, kind: data.kind, muted: data.muted });
    });

    socket.on('disconnect', () => {
      console.log(`User ${userId} disconnected`);
      activeCalls.forEach((active, key) => {
        if (key.startsWith(`${userId}-`) || key.endsWith(`-${userId}`)) {
          const peerId = key.startsWith(`${userId}-`)
            ? parseInt(key.split('-')[1])
            : parseInt(key.split('-')[0]);
          io.to(`user:${peerId}`).emit('call_ended', { senderId: userId });
          activeCalls.delete(key);
        }
      });
    });
  });

  return io;
}
