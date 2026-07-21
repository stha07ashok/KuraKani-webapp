"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const connectDB_1 = __importDefault(require("../database/connectDB"));
class FriendRequest extends sequelize_1.Model {
}
FriendRequest.init({
    id: { type: sequelize_1.DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    senderId: { type: sequelize_1.DataTypes.INTEGER.UNSIGNED, allowNull: false },
    receiverId: { type: sequelize_1.DataTypes.INTEGER.UNSIGNED, allowNull: false },
    status: { type: sequelize_1.DataTypes.ENUM('pending', 'accepted', 'rejected'), defaultValue: 'pending' },
}, { sequelize: connectDB_1.default, tableName: 'friend_requests' });
exports.default = FriendRequest;
//# sourceMappingURL=FriendRequest.js.map