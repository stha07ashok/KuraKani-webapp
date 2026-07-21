"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const userModel_1 = __importDefault(require("./userModel"));
const FriendRequest_1 = __importDefault(require("./FriendRequest"));
const Message_1 = __importDefault(require("./Message"));
userModel_1.default.hasMany(FriendRequest_1.default, { as: 'sentRequests', foreignKey: 'senderId' });
userModel_1.default.hasMany(FriendRequest_1.default, { as: 'receivedRequests', foreignKey: 'receiverId' });
FriendRequest_1.default.belongsTo(userModel_1.default, { as: 'sender', foreignKey: 'senderId' });
FriendRequest_1.default.belongsTo(userModel_1.default, { as: 'receiver', foreignKey: 'receiverId' });
userModel_1.default.hasMany(Message_1.default, { as: 'sentMessages', foreignKey: 'senderId' });
userModel_1.default.hasMany(Message_1.default, { as: 'receivedMessages', foreignKey: 'receiverId' });
Message_1.default.belongsTo(userModel_1.default, { as: 'sender', foreignKey: 'senderId' });
Message_1.default.belongsTo(userModel_1.default, { as: 'receiver', foreignKey: 'receiverId' });
//# sourceMappingURL=associations.js.map