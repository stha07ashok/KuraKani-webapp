import express, { Request, Response } from 'express';
import cors from 'cors';
import { createServer } from 'http';
import sequelize from './database/connectDB';
import './models/associations';
import authRoutes from './routes/authRoutes';
import userSearchRoutes from './routes/userSearchRoutes';
import friendRequestRoutes from './routes/friendRequestRoutes';
import messageRoutes from './routes/messageRoutes';
import { setupSocket } from './socket';

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: ['http://localhost:3000'], credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userSearchRoutes);
app.use('/api/friend-requests', friendRequestRoutes);
app.use('/api/messages', messageRoutes);

setupSocket(httpServer);

const start = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');

    await sequelize.sync({ alter: true });
    console.log('All models were synchronized successfully.');

    httpServer.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};

start();
