import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../database/connectDB';

interface FriendRequestAttributes {
  id: number;
  senderId: number;
  receiverId: number;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt?: Date;
  updatedAt?: Date;
}

interface FriendRequestCreationAttributes extends Optional<FriendRequestAttributes, 'id' | 'status'> {}

class FriendRequest extends Model<FriendRequestAttributes, FriendRequestCreationAttributes> implements FriendRequestAttributes {
  public id!: number;
  public senderId!: number;
  public receiverId!: number;
  public status!: 'pending' | 'accepted' | 'rejected';
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

FriendRequest.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    senderId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    receiverId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    status: { type: DataTypes.ENUM('pending', 'accepted', 'rejected'), defaultValue: 'pending' },
  },
  { sequelize, tableName: 'friend_requests' }
);

export default FriendRequest;
