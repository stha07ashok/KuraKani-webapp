"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userSearchController_1 = require("../controllers/userSearchController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/search', auth_1.authenticate, userSearchController_1.searchUsers);
exports.default = router;
//# sourceMappingURL=userSearchRoutes.js.map