// this file is for unit testing the authentication controller and role-based access control (RBAC) middleware

import request from 'supertest';
import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { login, logout } from '../controllers/authController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/authorizeMiddleware.js';
import prisma from '../models/prismaClient.js';

// Mock Prisma, bcrypt, and jwt dependencies
jest.mock('../models/prismaClient.js', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
    },
  },
}));

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
  verify: jest.fn(),
}));

const app = express();
app.use(express.json());

// Public routes
app.post('/api/auth/login', login);
app.post('/api/auth/logout', logout);

// Protected RBAC test route
app.get('/api/admin/only', authenticate, authorize(['SUPER_ADMIN']), (req, res) => {
  res.status(200).json({ message: 'Welcome Admin' });
});

describe('Authentication & RBAC Controller Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/login', () => {
    it('should successfully log in user with valid credentials and return token', async () => {
      const mockUser = {
        id: 1,
        email: 'admin@example.com',
        password: 'hashedPassword123',
        role: 'SUPER_ADMIN',
        name: 'Super Admin'
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('mock-jwt-token');

      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@example.com', password: 'correctPassword' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token', 'mock-jwt-token');
      expect(response.body.user).toHaveProperty('email', 'admin@example.com');
    });

    it('should return 401 for non-existent email or invalid password', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'wrong@example.com', password: 'password' });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should successfully logout user', async () => {
      const response = await request(app).post('/api/auth/logout');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('Role-Based Access Control Middleware Tests', () => {
    it('should block requests lacking a bearer token with 401', async () => {
      const response = await request(app).get('/api/admin/only');
      expect(response.status).toBe(401);
    });

    it('should allow access if user has required SUPER_ADMIN role', async () => {
      (jwt.verify as jest.Mock).mockReturnValue({ id: 1, role: 'SUPER_ADMIN' });

      const response = await request(app)
        .get('/api/admin/only')
        .set('Authorization', 'Bearer valid-admin-token');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Welcome Admin');
    });

    it('should forbid access if user role is insufficient (e.g. standard EMPLOYEE)', async () => {
      (jwt.verify as jest.Mock).mockReturnValue({ id: 2, role: 'EMPLOYEE' });

      const response = await request(app)
        .get('/api/admin/only')
        .set('Authorization', 'Bearer valid-employee-token');

      expect(response.status).toBe(403);
    });
  });
});