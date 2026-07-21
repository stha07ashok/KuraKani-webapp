"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchUsers = void 0;
const sequelize_1 = require("sequelize");
const userModel_1 = __importDefault(require("../models/userModel"));
const FriendRequest_1 = __importDefault(require("../models/FriendRequest"));
const searchUsers = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q || typeof q !== 'string' || q.trim().length === 0) {
            res.status(400).json({ message: 'Search query is required' });
            return;
        }
        const users = await userModel_1.default.findAll({
            where: {
                id: { [sequelize_1.Op.ne]: req.user.id },
                [sequelize_1.Op.or]: [
                    { name: { [sequelize_1.Op.like]: `%${q}%` } },
                    { email: { [sequelize_1.Op.like]: `%${q}%` } },
                ],
            },
            attributes: ['id', 'name', 'email', 'profilePicture'],
            limit: 20,
        });
        const friendRequests = await FriendRequest_1.default.findAll({
            where: {
                [sequelize_1.Op.or]: [
                    { senderId: req.user.id },
                    { receiverId: req.user.id },
                ],
            },
        });
        const usersWithStatus = users.map((u) => {
            const sent = friendRequests.find((fr) => fr.senderId === req.user.id && fr.receiverId === u.id);
            const received = friendRequests.find((fr) => fr.receiverId === req.user.id && fr.senderId === u.id);
            let friendshipStatus = 'none';
            if (sent?.status === 'accepted' || received?.status === 'accepted') {
                friendshipStatus = 'friends';
            }
            else if (sent?.status === 'pending') {
                friendshipStatus = 'pending_sent';
            }
            else if (received?.status === 'pending') {
                friendshipStatus = 'pending_received';
            }
            return { ...u.toJSON(), friendshipStatus };
        });
        res.json(usersWithStatus);
    }
    catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ message: 'Error searching users' });
    }
};
exports.searchUsers = searchUsers;
//# sourceMappingURL=userSearchController.js.map