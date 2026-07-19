// contains zod schemas for validating employee creation and update

import { z } from 'zod';
import { Role } from '../generated/prisma/client.js';

export const employeeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  departmentId: z.number().int().positive("Invalid department ID"),
  designation: z.string().min(1, "Designation is required"),
  salary: z.number().positive("Salary must be a positive number"),
  joiningDate: z.string().datetime().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  role: z.nativeEnum(Role),
  managerId: z.number().int().positive().optional().nullable(),
});

export const updateManagerSchema = z.object({
  managerId: z.number().int().positive("Invalid manager ID"),
});

export const updateEmployeeSchema = employeeSchema.partial().extend({
  password: z.string().min(6).optional(),
});