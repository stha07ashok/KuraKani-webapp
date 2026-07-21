"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const http_1 = require("http");
const connectDB_1 = __importDefault(require("./database/connectDB"));
require("./models/associations");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const userSearchRoutes_1 = __importDefault(require("./routes/userSearchRoutes"));
const friendRequestRoutes_1 = __importDefault(require("./routes/friendRequestRoutes"));
const messageRoutes_1 = __importDefault(require("./routes/messageRoutes"));
const socket_1 = require("./socket");
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
const PORT = process.env.PORT || 5000;
app.use((0, cors_1.default)({ origin: ['http://localhost:3000'], credentials: true }));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.get('/api/health', (_req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
});
app.use('/api/auth', authRoutes_1.default);
app.use('/api/users', userSearchRoutes_1.default);
app.use('/api/friend-requests', friendRequestRoutes_1.default);
app.use('/api/messages', messageRoutes_1.default);
(0, socket_1.setupSocket)(httpServer);
const start = async () => {
    try {
        await connectDB_1.default.authenticate();
        console.log('Database connection has been established successfully.');
        await connectDB_1.default.sync({ alter: true });
        console.log('All models were synchronized successfully.');
        httpServer.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    }
    catch (error) {
        console.error('Unable to connect to the database:', error);
        process.exit(1);
    }
};
start();
//# sourceMappingURL=server.js.map