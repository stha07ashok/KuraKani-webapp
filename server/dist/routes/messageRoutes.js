"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const messageController_1 = require("../controllers/messageController");
const router = (0, express_1.Router)();
router.post('/', auth_1.authenticate, messageController_1.sendMessage);
router.get('/requests', auth_1.authenticate, messageController_1.getMessageRequests);
router.get('/:userId', auth_1.authenticate, messageController_1.getConversation);
exports.default = router;
//# sourceMappingURL=messageRoutes.js.map