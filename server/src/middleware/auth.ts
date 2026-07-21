import { Request, Response, NextFunction } from 'express';
import { getAuth } from 'firebase-admin/auth';
import { ensureFirebaseInitialized } from '../config/firebaseAdmin';
import User from '../models/userModel';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    name: string;
    email: string;
    profilePicture?: string;
    firebaseUid?: string;
  };
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ message: 'No token provided' });
      return;
    }

    const token = authHeader.split('Bearer ')[1];
    ensureFirebaseInitialized();
    const decoded = await getAuth().verifyIdToken(token);
    const { uid, email, name, picture } = decoded;

    if (!email) {
      res.status(401).json({ message: 'Email not found in token' });
      return;
    }

    const user = await User.findOne({ where: { firebaseUid: uid } });
    if (!user) {
      res.status(401).json({ message: 'User not found' });
      return;
    }

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      profilePicture: user.profilePicture,
      firebaseUid: user.firebaseUid,
    };
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};
