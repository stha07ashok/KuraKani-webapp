"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const friendRequestController_1 = require("../controllers/friendRequestController");
const router = (0, express_1.Router)();
router.post('/', auth_1.authenticate, friendRequestController_1.sendFriendRequest);
router.put('/:id/accept', auth_1.authenticate, friendRequestController_1.acceptFriendRequest);
router.put('/:id/reject', auth_1.authenticate, friendRequestController_1.rejectFriendRequest);
router.get('/pending', auth_1.authenticate, friendRequestController_1.getPendingRequests);
router.get('/friends', auth_1.authenticate, friendRequestController_1.getFriends);
exports.default = router;
//# sourceMappingURL=friendRequestRoutes.js.map