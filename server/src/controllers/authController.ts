import { Request, Response } from 'express';
import { getAuth } from 'firebase-admin/auth';
import { ensureFirebaseInitialized } from '../config/firebaseAdmin';
import User from '../models/userModel';

export const loginWithFirebase = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.body;

    if (!token) {
      res.status(400).json({ message: 'Token is required' });
      return;
    }

    ensureFirebaseInitialized();
    const decoded = await getAuth().verifyIdToken(token);
    const { uid, email, name, picture } = decoded;

    if (!email) {
      res.status(400).json({ message: 'Email is required from Firebase' });
      return;
    }

    const [user, created] = await User.findOrCreate({
      where: { email },
      defaults: {
        name: name || email.split('@')[0],
        email,
        profilePicture: picture || undefined,
        firebaseUid: uid,
      },
    });

    if (!created) {
      user.name = name || user.name;
      user.profilePicture = picture || user.profilePicture;
      user.firebaseUid = uid;
      await user.save();
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      profilePicture: user.profilePicture,
      firebaseUid: user.firebaseUid,
    });
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};
