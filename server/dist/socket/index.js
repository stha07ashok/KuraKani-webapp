"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSocket = setupSocket;
const socket_io_1 = require("socket.io");
const auth_1 = require("firebase-admin/auth");
const firebaseAdmin_1 = require("../config/firebaseAdmin");
const userModel_1 = __importDefault(require("../models/userModel"));
const Message_1 = __importDefault(require("../models/Message"));
const FriendRequest_1 = __importDefault(require("../models/FriendRequest"));
const sequelize_1 = require("sequelize");
function setupSocket(httpServer) {
    const io = new socket_io_1.Server(httpServer, {
        cors: { origin: ['http://localhost:3000'], credentials: true },
    });
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;
            if (!token) {
                return next(new Error('No token provided'));
            }
            (0, firebaseAdmin_1.ensureFirebaseInitialized)();
            const decoded = await (0, auth_1.getAuth)().verifyIdToken(token);
            const user = await userModel_1.default.findOne({ where: { firebaseUid: decoded.uid } });
            if (!user) {
                return next(new Error('User not found'));
            }
            socket.userId = user.id;
            next();
        }
        catch {
            next(new Error('Invalid token'));
        }
    });
    io.on('connection', (socket) => {
        const userId = socket.userId;
        socket.join(`user:${userId}`);
        console.log(`User ${userId} connected`);
        socket.on('send_message', async (data) => {
            try {
                const areFriends = await FriendRequest_1.default.findOne({
                    where: {
                        [sequelize_1.Op.or]: [
                            { senderId: userId, receiverId: data.receiverId, status: 'accepted' },
                            { senderId: data.receiverId, receiverId: userId, status: 'accepted' },
                        ],
                    },
                });
                const message = await Message_1.default.create({
                    senderId: userId,
                    receiverId: data.receiverId,
                    content: data.content,
                    isMessageRequest: !areFriends,
                });
                const messageWithSender = await Message_1.default.findByPk(message.id, {
                    include: [
                        { model: userModel_1.default, as: 'sender', attributes: ['id', 'name', 'email', 'profilePicture'] },
                        { model: userModel_1.default, as: 'receiver', attributes: ['id', 'name', 'email', 'profilePicture'] },
                    ],
                });
                io.to(`user:${data.receiverId}`).emit('new_message', messageWithSender);
                socket.emit('message_sent', messageWithSender);
            }
            catch (error) {
                console.error('Socket send_message error:', error);
                socket.emit('error', { message: 'Failed to send message' });
            }
        });
        socket.on('disconnect', () => {
            console.log(`User ${userId} disconnected`);
        });
    });
    return io;
}
//# sourceMappingURL=index.js.map