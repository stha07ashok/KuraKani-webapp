import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../database/connectDB';

interface CallLogAttributes {
  id: number;
  callerId: number;
  receiverId: number;
  type: 'audio' | 'video';
  status: 'missed' | 'answered' | 'rejected';
  startedAt?: Date | null;
  endedAt?: Date | null;
  duration?: number | null;
  createdAt?: Date;
  updatedAt?: Date;
}

interface CallLogCreationAttributes extends Optional<CallLogAttributes, 'id' | 'startedAt' | 'endedAt' | 'duration'> {}

class CallLog extends Model<CallLogAttributes, CallLogCreationAttributes> implements CallLogAttributes {
  public id!: number;
  public callerId!: number;
  public receiverId!: number;
  public type!: 'audio' | 'video';
  public status!: 'missed' | 'answered' | 'rejected';
  public startedAt!: Date | null;
  public endedAt!: Date | null;
  public duration!: number | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

CallLog.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    callerId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    receiverId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    type: { type: DataTypes.ENUM('audio', 'video'), allowNull: false },
    status: { type: DataTypes.ENUM('missed', 'answered', 'rejected'), allowNull: false },
    startedAt: { type: DataTypes.DATE, allowNull: true },
    endedAt: { type: DataTypes.DATE, allowNull: true },
    duration: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
  },
  { sequelize, tableName: 'call_logs' }
);

export default CallLog;
