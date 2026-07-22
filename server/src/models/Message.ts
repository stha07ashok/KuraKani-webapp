import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../database/connectDB';

interface MessageAttributes {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  isMessageRequest: boolean;
  readAt?: Date | null;
  replyToId?: number | null;
  deletedAt?: Date | null;
  deletedForSenderAt?: Date | null;
  deletedForReceiverAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

interface MessageCreationAttributes extends Optional<MessageAttributes, 'id' | 'isMessageRequest' | 'readAt' | 'replyToId' | 'deletedAt' | 'deletedForSenderAt' | 'deletedForReceiverAt'> {}

class Message extends Model<MessageAttributes, MessageCreationAttributes> implements MessageAttributes {
  public id!: number;
  public senderId!: number;
  public receiverId!: number;
  public content!: string;
  public isMessageRequest!: boolean;
  public readAt!: Date | null;
  public replyToId!: number | null;
  public deletedAt!: Date | null;
  public deletedForSenderAt!: Date | null;
  public deletedForReceiverAt!: Date | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Message.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    senderId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    receiverId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    content: { type: DataTypes.TEXT, allowNull: false },
    isMessageRequest: { type: DataTypes.BOOLEAN, defaultValue: false },
    readAt: { type: DataTypes.DATE, allowNull: true },
    replyToId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
    deletedAt: { type: DataTypes.DATE, allowNull: true },
    deletedForSenderAt: { type: DataTypes.DATE, allowNull: true },
    deletedForReceiverAt: { type: DataTypes.DATE, allowNull: true },
  },
  { sequelize, tableName: 'messages' }
);

export default Message;
