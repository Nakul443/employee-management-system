// this file contains unit tests for the employee controller and CRUD operations

import request from 'supertest';
import express from 'express';
import { getEmployees, getEmployeeById, createEmployee, updateEmployee, deleteEmployee } from '../controllers/employeeController.js';
import prisma from '../models/prismaClient.js';

// Mock Prisma client and authentication middleware to isolate employee CRUD tests
jest.mock('../models/prismaClient.js', () => ({
  __esModule: true,
  default: {
    user: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    $transaction: jest.fn((queries: Promise<any>[]) => Promise.all(queries)),
  },
}));

const app = express();
app.use(express.json());
app.use((req: any, res, next) => {
  req.user = { id: 1, role: 'SUPER_ADMIN' };
  next();
});

app.get('/api/employees', getEmployees);
app.get('/api/employees/:id', getEmployeeById);
app.post('/api/employees', createEmployee);
app.put('/api/employees/:id', updateEmployee);
app.delete('/api/employees/:id', deleteEmployee);

describe('Employee Controller CRUD Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/employees', () => {
    it('should return a paginated list of employees with search and filters', async () => {
      const mockEmployees = [
        { id: 1, name: 'Alice Smith', email: 'alice@example.com', role: 'EMPLOYEE', status: 'ACTIVE' },
        { id: 2, name: 'Bob Jones', email: 'bob@example.com', role: 'HR', status: 'ACTIVE' }
      ];

      (prisma.user.findMany as jest.Mock).mockResolvedValue(mockEmployees);
      (prisma.user.count as jest.Mock).mockResolvedValue(2);

      const response = await request(app).get('/api/employees?search=alice&status=ACTIVE');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(prisma.user.findMany).toHaveBeenCalled();
    });
  });

  describe('GET /api/employees/:id', () => {
    it('should return a single employee by ID', async () => {
      const mockEmployee = { id: 1, name: 'Alice Smith', email: 'alice@example.com' };
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockEmployee);

      const response = await request(app).get('/api/employees/1');

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Alice Smith');
    });

    it('should return 404 if employee does not exist', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app).get('/api/employees/999');

      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/employees', () => {
    it('should successfully create a new employee', async () => {
      const newEmployeePayload = {
        name: 'Charlie Brown',
        email: 'charlie@example.com',
        password: 'securePassword123',
        phone: '9876543210',
        departmentId: 1,
        designation: 'Intern',
        salary: 40000,
        role: 'EMPLOYEE'
      };

      const createdUserResponse = { id: 3, ...newEmployeePayload };
      // Omit password from expected prisma create return check or mock appropriately
      (prisma.user.create as jest.Mock).mockResolvedValue(createdUserResponse);

      const response = await request(app)
        .post('/api/employees')
        .send(newEmployeePayload);

      expect(response.status).toBe(201);
      expect(prisma.user.create).toHaveBeenCalled();
    });
  });

  describe('PUT /api/employees/:id', () => {
    it('should successfully update employee details', async () => {
      const updatePayload = { name: 'Alice Updated', salary: 90000 };
      (prisma.user.update as jest.Mock).mockResolvedValue({ id: 1, ...updatePayload });

      const response = await request(app)
        .put('/api/employees/1')
        .send(updatePayload);

      expect(response.status).toBe(200);
      expect(prisma.user.update).toHaveBeenCalled();
    });
  });

  describe('DELETE /api/employees/:id', () => {
    it('should perform a soft delete or removal successfully', async () => {
      // Assuming soft delete updates status or isDeleted flag
      (prisma.user.update as jest.Mock).mockResolvedValue({ id: 1, isDeleted: true });

      const response = await request(app).delete('/api/employees/1');

      expect(response.status).toBe(200);
      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 1 },
          data: expect.any(Object)
        })
      );
    });
  });
});