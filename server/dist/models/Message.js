"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const connectDB_1 = __importDefault(require("../database/connectDB"));
class Message extends sequelize_1.Model {
}
Message.init({
    id: { type: sequelize_1.DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    senderId: { type: sequelize_1.DataTypes.INTEGER.UNSIGNED, allowNull: false },
    receiverId: { type: sequelize_1.DataTypes.INTEGER.UNSIGNED, allowNull: false },
    content: { type: sequelize_1.DataTypes.TEXT, allowNull: false },
    isMessageRequest: { type: sequelize_1.DataTypes.BOOLEAN, defaultValue: false },
    readAt: { type: sequelize_1.DataTypes.DATE, allowNull: true },
}, { sequelize: connectDB_1.default, tableName: 'messages' });
exports.default = Message;
//# sourceMappingURL=Message.js.map