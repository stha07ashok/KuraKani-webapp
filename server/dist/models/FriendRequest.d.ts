import { Model, Optional } from 'sequelize';
interface FriendRequestAttributes {
    id: number;
    senderId: number;
    receiverId: number;
    status: 'pending' | 'accepted' | 'rejected';
    createdAt?: Date;
    updatedAt?: Date;
}
interface FriendRequestCreationAttributes extends Optional<FriendRequestAttributes, 'id' | 'status'> {
}
declare class FriendRequest extends Model<FriendRequestAttributes, FriendRequestCreationAttributes> implements FriendRequestAttributes {
    id: number;
    senderId: number;
    receiverId: number;
    status: 'pending' | 'accepted' | 'rejected';
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export default FriendRequest;
//# sourceMappingURL=FriendRequest.d.ts.map