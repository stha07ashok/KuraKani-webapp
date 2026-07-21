"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const connectDB_1 = __importDefault(require("../database/connectDB"));
class User extends sequelize_1.Model {
}
User.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: new sequelize_1.DataTypes.STRING(128),
        allowNull: false,
    },
    email: {
        type: new sequelize_1.DataTypes.STRING(128),
        allowNull: false,
        unique: true,
    },
    profilePicture: {
        type: new sequelize_1.DataTypes.STRING(512),
        allowNull: true,
    },
    firebaseUid: {
        type: new sequelize_1.DataTypes.STRING(128),
        allowNull: true,
        unique: true,
    },
}, {
    sequelize: connectDB_1.default,
    tableName: 'users',
});
exports.default = User;
//# sourceMappingURL=index.js.map