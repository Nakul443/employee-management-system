import express, { type Request, type Response } from 'express';
import prisma from './src/models/prismaClient.js';
import authRoutes from './src/routes/authRoutes.js';
import employeeRoutes from './src/routes/employeeRoutes.js';
import { authenticate as authMiddleware } from './src/middleware/authMiddleware.js';
import { authorize as authorizeMiddleware } from './src/middleware/authorizeMiddleware.js';
import { Role } from './src/types/roles.js';
import organisationRoutes from './src/routes/organisationRoutes.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());


// registering API routes
app.use('/api/auth', authRoutes); // no middleware here cuz login and logout don't require authentication
app.use('/api/employees', authMiddleware, authorizeMiddleware([Role.ADMIN, Role.HR]), employeeRoutes);
app.use('/api/organization', authMiddleware, authorizeMiddleware([Role.ADMIN, Role.HR]), organisationRoutes);

// Health check endpoint
app.get('/health', async (req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ status: 'error', message: 'Database connection failed' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});