// file to test the employee zod schemas

import { employeeSchema, updateEmployeeSchema } from '../schemas/employeeSchema.js';
import { Role } from '../generated/prisma/client.js';

describe('Employee Zod Schemas', () => {
  const validEmployeeData = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    password: 'securePassword123',
    phone: '1234567890',
    departmentId: 1,
    designation: 'Software Engineer',
    salary: 75000,
    role: Role.EMPLOYEE,
    status: 'ACTIVE',
    joiningDate: '2026-07-20T00:00:00.000Z',
    managerId: null,
    profileImage: 'https://example.com/image.png'
  };

  describe('employeeSchema (Creation)', () => {
    it('should successfully parse valid employee data', () => {
      const result = employeeSchema.safeParse(validEmployeeData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe(validEmployeeData.email);
      }
    });

    it('should fail if name is missing or empty', () => {
      const invalidData = { ...validEmployeeData, name: '' };
      const result = employeeSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should fail if email format is invalid', () => {
      const invalidData = { ...validEmployeeData, email: 'not-an-email' };
      const result = employeeSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should fail if password is less than 6 characters', () => {
      const invalidData = { ...validEmployeeData, password: '123' };
      const result = employeeSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should fail if phone number is less than 10 digits', () => {
      const invalidData = { ...validEmployeeData, phone: '12345' };
      const result = employeeSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should fail if salary is negative or zero', () => {
      const invalidData = { ...validEmployeeData, salary: -500 };
      const result = employeeSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('updateEmployeeSchema (Update)', () => {
    it('should allow partial updates with valid fields', () => {
      const partialData = {
        name: 'Jane Doe',
        salary: 85000
      };
      const result = updateEmployeeSchema.safeParse(partialData);
      expect(result.success).toBe(true);
    });

    it('should validate password length if password is provided in update', () => {
      const invalidUpdate = {
        password: 'short'
      };
      const result = updateEmployeeSchema.safeParse(invalidUpdate);
      expect(result.success).toBe(false);
    });
  });
});