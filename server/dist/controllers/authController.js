"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginWithFirebase = void 0;
const auth_1 = require("firebase-admin/auth");
const firebaseAdmin_1 = require("../config/firebaseAdmin");
const userModel_1 = __importDefault(require("../models/userModel"));
const loginWithFirebase = async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) {
            res.status(400).json({ message: 'Token is required' });
            return;
        }
        (0, firebaseAdmin_1.ensureFirebaseInitialized)();
        const decoded = await (0, auth_1.getAuth)().verifyIdToken(token);
        const { uid, email, name, picture } = decoded;
        if (!email) {
            res.status(400).json({ message: 'Email is required from Firebase' });
            return;
        }
        const [user, created] = await userModel_1.default.findOrCreate({
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
    }
    catch (error) {
        console.error('Auth error:', error);
        res.status(401).json({ message: 'Invalid or expired token' });
    }
};
exports.loginWithFirebase = loginWithFirebase;
//# sourceMappingURL=authController.js.map