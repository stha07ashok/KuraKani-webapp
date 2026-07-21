"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMessageRequests = exports.getConversation = exports.sendMessage = void 0;
const Message_1 = __importDefault(require("../models/Message"));
const FriendRequest_1 = __importDefault(require("../models/FriendRequest"));
const userModel_1 = __importDefault(require("../models/userModel"));
const sequelize_1 = require("sequelize");
const sendMessage = async (req, res) => {
    try {
        const { receiverId, content } = req.body;
        if (!receiverId || !content) {
            res.status(400).json({ message: 'receiverId and content are required' });
            return;
        }
        const areFriends = await FriendRequest_1.default.findOne({
            where: {
                [sequelize_1.Op.or]: [
                    { senderId: req.user.id, receiverId, status: 'accepted' },
                    { senderId: receiverId, receiverId: req.user.id, status: 'accepted' },
                ],
            },
        });
        const message = await Message_1.default.create({
            senderId: req.user.id,
            receiverId,
            content,
            isMessageRequest: !areFriends,
        });
        const messageWithSender = await Message_1.default.findByPk(message.id, {
            include: [{ model: userModel_1.default, as: 'sender', attributes: ['id', 'name', 'email', 'profilePicture'] }],
        });
        res.status(201).json(messageWithSender);
    }
    catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({ message: 'Error sending message' });
    }
};
exports.sendMessage = sendMessage;
const getConversation = async (req, res) => {
    try {
        const { userId } = req.params;
        const messages = await Message_1.default.findAll({
            where: {
                isMessageRequest: false,
                [sequelize_1.Op.or]: [
                    { senderId: req.user.id, receiverId: userId },
                    { senderId: userId, receiverId: req.user.id },
                ],
            },
            include: [
                { model: userModel_1.default, as: 'sender', attributes: ['id', 'name', 'email', 'profilePicture'] },
                { model: userModel_1.default, as: 'receiver', attributes: ['id', 'name', 'email', 'profilePicture'] },
            ],
            order: [['createdAt', 'ASC']],
        });
        await Message_1.default.update({ readAt: new Date() }, {
            where: { senderId: userId, receiverId: req.user.id, readAt: null },
        });
        res.json(messages);
    }
    catch (error) {
        console.error('Get conversation error:', error);
        res.status(500).json({ message: 'Error fetching conversation' });
    }
};
exports.getConversation = getConversation;
const getMessageRequests = async (req, res) => {
    try {
        const messages = await Message_1.default.findAll({
            where: { receiverId: req.user.id, isMessageRequest: true },
            include: [
                { model: userModel_1.default, as: 'sender', attributes: ['id', 'name', 'email', 'profilePicture'] },
            ],
            order: [['createdAt', 'DESC']],
        });
        const grouped = messages.reduce((acc, msg) => {
            const m = msg;
            const existing = acc.find((g) => g.sender.id === m.senderId);
            if (existing) {
                existing.messages.push(m);
            }
            else {
                acc.push({ sender: m.sender, messages: [m] });
            }
            return acc;
        }, []);
        res.json(grouped);
    }
    catch (error) {
        console.error('Get message requests error:', error);
        res.status(500).json({ message: 'Error fetching message requests' });
    }
};
exports.getMessageRequests = getMessageRequests;
//# sourceMappingURL=messageController.js.map