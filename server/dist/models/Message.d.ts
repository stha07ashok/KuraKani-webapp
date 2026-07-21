import { Model, Optional } from 'sequelize';
interface MessageAttributes {
    id: number;
    senderId: number;
    receiverId: number;
    content: string;
    isMessageRequest: boolean;
    readAt?: Date | null;
    createdAt?: Date;
    updatedAt?: Date;
}
interface MessageCreationAttributes extends Optional<MessageAttributes, 'id' | 'isMessageRequest' | 'readAt'> {
}
declare class Message extends Model<MessageAttributes, MessageCreationAttributes> implements MessageAttributes {
    id: number;
    senderId: number;
    receiverId: number;
    content: string;
    isMessageRequest: boolean;
    readAt: Date | null;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export default Message;
//# sourceMappingURL=Message.d.ts.map