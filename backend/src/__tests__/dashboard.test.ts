// backend/src/__tests__/dashboard.test.ts

import request from 'supertest';
import express from 'express';
import { getDashboardMetrics } from '../controllers/dashboardController.js';
import prisma from '../models/prismaClient.js';

// Mock Prisma client to isolate dashboard metrics unit tests
jest.mock('../models/prismaClient.js', () => ({
  __esModule: true,
  default: {
    user: {
      count: jest.fn(),
    },
    department: {
      findMany: jest.fn(),
    },
  },
}));

const app = express();
app.use(express.json());

app.get('/api/dashboard', getDashboardMetrics);

describe('Dashboard Controller & Metrics Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/dashboard', () => {
    it('should successfully return all 4 metrics including departmentCount and departmentBreakdown', async () => {
      // Mocking Prisma counts and department breakdown with employee counts
      (prisma.user.count as jest.Mock)
        .mockResolvedValueOnce(15) // total employees
        .mockResolvedValueOnce(12) // active employees
        .mockResolvedValueOnce(3);  // inactive employees

      const mockDepartments = [
        { name: 'Engineering', _count: { employees: 10 } },
        { name: 'HR', _count: { employees: 5 } }
      ];

      (prisma.department.findMany as jest.Mock).mockResolvedValue(mockDepartments);

      const response = await request(app).get('/api/dashboard');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        total: 15,
        active: 12,
        inactive: 3,
        departmentCount: 2, // Plain number matching department length requirement
        departmentBreakdown: [
          { name: 'Engineering', count: 10 },
          { name: 'HR', count: 5 }
        ]
      });

      // Verify Prisma methods were called correctly
      expect(prisma.user.count).toHaveBeenCalledTimes(3);
      expect(prisma.department.findMany).toHaveBeenCalledWith({
        include: { _count: { select: { employees: true } } }
      });
    });

    it('should return 500 if database query fails', async () => {
      (prisma.user.count as jest.Mock).mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/api/dashboard');

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('message', 'Error fetching dashboard metrics');
    });
  });
});