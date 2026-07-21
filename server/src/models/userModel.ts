import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../database/connectDB';

interface UserAttributes {
  id: number;
  name: string;
  email: string;
  profilePicture?: string;
  firebaseUid?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id'> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public name!: string;
  public email!: string;
  public profilePicture?: string;
  public firebaseUid?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: new DataTypes.STRING(128),
      allowNull: false,
    },
    email: {
      type: new DataTypes.STRING(128),
      allowNull: false,
      unique: true,
    },
    profilePicture: {
      type: new DataTypes.STRING(512),
      allowNull: true,
    },
    firebaseUid: {
      type: new DataTypes.STRING(128),
      allowNull: true,
      unique: true,
    },
  },
  {
    sequelize,
    tableName: 'users',
  }
);

export default User;
