import { Model, Optional } from 'sequelize';
interface UserAttributes {
    id: number;
    name: string;
    email: string;
    profilePicture?: string;
    firebaseUid?: string;
    createdAt?: Date;
    updatedAt?: Date;
}
interface UserCreationAttributes extends Optional<UserAttributes, 'id'> {
}
declare class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
    id: number;
    name: string;
    email: string;
    profilePicture?: string;
    firebaseUid?: string;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export default User;
//# sourceMappingURL=index.d.ts.map