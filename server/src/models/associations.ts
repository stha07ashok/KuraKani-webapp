import User from './userModel';
import FriendRequest from './FriendRequest';
import Message from './Message';

User.hasMany(FriendRequest, { as: 'sentRequests', foreignKey: 'senderId' });
User.hasMany(FriendRequest, { as: 'receivedRequests', foreignKey: 'receiverId' });
FriendRequest.belongsTo(User, { as: 'sender', foreignKey: 'senderId' });
FriendRequest.belongsTo(User, { as: 'receiver', foreignKey: 'receiverId' });

User.hasMany(Message, { as: 'sentMessages', foreignKey: 'senderId' });
User.hasMany(Message, { as: 'receivedMessages', foreignKey: 'receiverId' });
Message.belongsTo(User, { as: 'sender', foreignKey: 'senderId' });
Message.belongsTo(User, { as: 'receiver', foreignKey: 'receiverId' });
Message.belongsTo(Message, { as: 'replyTo', foreignKey: 'replyToId' });
