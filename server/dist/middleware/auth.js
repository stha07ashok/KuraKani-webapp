"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const auth_1 = require("firebase-admin/auth");
const firebaseAdmin_1 = require("../config/firebaseAdmin");
const userModel_1 = __importDefault(require("../models/userModel"));
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            res.status(401).json({ message: 'No token provided' });
            return;
        }
        const token = authHeader.split('Bearer ')[1];
        (0, firebaseAdmin_1.ensureFirebaseInitialized)();
        const decoded = await (0, auth_1.getAuth)().verifyIdToken(token);
        const { uid, email, name, picture } = decoded;
        if (!email) {
            res.status(401).json({ message: 'Email not found in token' });
            return;
        }
        const user = await userModel_1.default.findOne({ where: { firebaseUid: uid } });
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
    }
    catch {
        res.status(401).json({ message: 'Invalid or expired token' });
    }
};
exports.authenticate = authenticate;
//# sourceMappingURL=auth.js.map