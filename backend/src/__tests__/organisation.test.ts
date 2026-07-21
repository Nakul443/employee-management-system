// this file contains unit tests for the organisation controller and hierarchy logic

import request from 'supertest';
import express from 'express';
import { getOrgTree } from '../controllers/organisationController.js';
import { getReportees } from '../controllers/employeeController.js';
import prisma from '../models/prismaClient.js';
import { updateManager } from '../controllers/employeeController.js';


// Mock Prisma client and authentication middleware to focus on unit testing organizational hierarchy logic
jest.mock('../models/prismaClient.js', () => ({
  __esModule: true,
  default: {
    user: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

const app = express();
app.use(express.json());

app.get('/api/organization/tree', getOrgTree);
app.get('/api/employees/:id/reportees', getReportees);
app.patch('/api/employees/:id/manager', updateManager);

describe('Organisation Controller & Hierarchy Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/organization/tree', () => {
    it('should return the organizational tree structure successfully', async () => {
      const mockUsers = [
        { id: 1, name: 'Boss Man', managerId: null, designation: 'CEO' },
        { id: 2, name: 'Manager Jane', managerId: 1, designation: 'HR Manager' },
        { id: 3, name: 'Developer Joe', managerId: 2, designation: 'Developer' }
      ];

      (prisma.user.findMany as unknown as jest.Mock).mockResolvedValue(mockUsers);

      const response = await request(app).get('/api/organization/tree');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('GET /api/employees/:id/reportees', () => {
    it('should return direct reportees for a valid manager ID', async () => {
      const mockReportees = [
        { id: 2, name: 'Manager Jane', managerId: 1 },
        { id: 3, name: 'Developer Joe', managerId: 1 }
      ];

      (prisma.user.findMany as jest.Mock).mockResolvedValue(mockReportees);

      const response = await request(app).get('/api/employees/1/reportees');

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(2);
      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { managerId: 1, isDeleted: false }
        })
      );
    });
  });

  describe('PATCH /api/employees/:id/manager', () => {
    it('should successfully update an employee manager when valid', async () => {
      (prisma.user.findMany as jest.Mock).mockResolvedValue([]); // no existing reports, no cycle possible
      (prisma.user.update as jest.Mock).mockResolvedValue({ id: 3, managerId: 2 });

      const response = await request(app)
        .patch('/api/employees/3/manager')
        .send({ managerId: 2 });

      expect(response.status).toBe(200);
      expect(prisma.user.update).toHaveBeenCalled();
    });

    it('should prevent circular reporting (assigning reportee as manager)', async () => {
      (prisma.user.findMany as jest.Mock).mockResolvedValue([{ id: 3 }]); // simulates: employee 2 already has employee 3 as a direct report

      const response = await request(app)
        .patch('/api/employees/2/manager')
        .send({ managerId: 3 });

      expect(response.status).toBe(400);
    });
  });
});