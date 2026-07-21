"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFriends = exports.getPendingRequests = exports.rejectFriendRequest = exports.acceptFriendRequest = exports.sendFriendRequest = void 0;
const FriendRequest_1 = __importDefault(require("../models/FriendRequest"));
const userModel_1 = __importDefault(require("../models/userModel"));
const sequelize_1 = require("sequelize");
const sendFriendRequest = async (req, res) => {
    try {
        const { receiverId } = req.body;
        if (!receiverId) {
            res.status(400).json({ message: 'receiverId is required' });
            return;
        }
        if (receiverId === req.user.id) {
            res.status(400).json({ message: 'Cannot send friend request to yourself' });
            return;
        }
        const receiver = await userModel_1.default.findByPk(receiverId);
        if (!receiver) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        const existing = await FriendRequest_1.default.findOne({
            where: {
                [sequelize_1.Op.or]: [
                    { senderId: req.user.id, receiverId },
                    { senderId: receiverId, receiverId: req.user.id },
                ],
                status: { [sequelize_1.Op.ne]: 'rejected' },
            },
        });
        if (existing) {
            res.status(400).json({ message: 'Friend request already exists' });
            return;
        }
        const friendRequest = await FriendRequest_1.default.create({
            senderId: req.user.id,
            receiverId,
            status: 'pending',
        });
        res.status(201).json(friendRequest);
    }
    catch (error) {
        console.error('Send friend request error:', error);
        res.status(500).json({ message: 'Error sending friend request' });
    }
};
exports.sendFriendRequest = sendFriendRequest;
const acceptFriendRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const friendRequest = await FriendRequest_1.default.findOne({
            where: { id, receiverId: req.user.id, status: 'pending' },
        });
        if (!friendRequest) {
            res.status(404).json({ message: 'Friend request not found' });
            return;
        }
        friendRequest.status = 'accepted';
        await friendRequest.save();
        res.json(friendRequest);
    }
    catch (error) {
        console.error('Accept friend request error:', error);
        res.status(500).json({ message: 'Error accepting friend request' });
    }
};
exports.acceptFriendRequest = acceptFriendRequest;
const rejectFriendRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const friendRequest = await FriendRequest_1.default.findOne({
            where: { id, receiverId: req.user.id, status: 'pending' },
        });
        if (!friendRequest) {
            res.status(404).json({ message: 'Friend request not found' });
            return;
        }
        friendRequest.status = 'rejected';
        await friendRequest.save();
        res.json(friendRequest);
    }
    catch (error) {
        console.error('Reject friend request error:', error);
        res.status(500).json({ message: 'Error rejecting friend request' });
    }
};
exports.rejectFriendRequest = rejectFriendRequest;
const getPendingRequests = async (req, res) => {
    try {
        const requests = await FriendRequest_1.default.findAll({
            where: { receiverId: req.user.id, status: 'pending' },
            include: [{ model: userModel_1.default, as: 'sender', attributes: ['id', 'name', 'email', 'profilePicture'] }],
            order: [['createdAt', 'DESC']],
        });
        res.json(requests);
    }
    catch (error) {
        console.error('Get pending requests error:', error);
        res.status(500).json({ message: 'Error fetching pending requests' });
    }
};
exports.getPendingRequests = getPendingRequests;
const getFriends = async (req, res) => {
    try {
        const sentRequests = await FriendRequest_1.default.findAll({
            where: { senderId: req.user.id, status: 'accepted' },
            include: [{ model: userModel_1.default, as: 'receiver', attributes: ['id', 'name', 'email', 'profilePicture'] }],
        });
        const receivedRequests = await FriendRequest_1.default.findAll({
            where: { receiverId: req.user.id, status: 'accepted' },
            include: [{ model: userModel_1.default, as: 'sender', attributes: ['id', 'name', 'email', 'profilePicture'] }],
        });
        const friends = [
            ...sentRequests.map((r) => ({ ...r.receiver.toJSON(), friendRequestId: r.id })),
            ...receivedRequests.map((r) => ({ ...r.sender.toJSON(), friendRequestId: r.id })),
        ];
        res.json(friends);
    }
    catch (error) {
        console.error('Get friends error:', error);
        res.status(500).json({ message: 'Error fetching friends' });
    }
};
exports.getFriends = getFriends;
//# sourceMappingURL=friendRequestController.js.map