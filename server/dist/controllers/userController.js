"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUser = exports.getUsers = void 0;
const models_1 = __importDefault(require("../models"));
const getUsers = async (_req, res) => {
    try {
        const users = await models_1.default.findAll();
        res.json(users);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching users', error });
    }
};
exports.getUsers = getUsers;
const createUser = async (req, res) => {
    try {
        const { name, email } = req.body;
        const user = await models_1.default.create({ name, email });
        res.status(201).json(user);
    }
    catch (error) {
        res.status(500).json({ message: 'Error creating user', error });
    }
};
exports.createUser = createUser;
//# sourceMappingURL=userController.js.map