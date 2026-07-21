import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const sendFriendRequest: (req: AuthRequest, res: Response) => Promise<void>;
export declare const acceptFriendRequest: (req: AuthRequest, res: Response) => Promise<void>;
export declare const rejectFriendRequest: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getPendingRequests: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getFriends: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=friendRequestController.d.ts.map