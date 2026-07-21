import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const sendMessage: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getConversation: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getMessageRequests: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=messageController.d.ts.map