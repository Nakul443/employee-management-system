// contains zod schemas for validating employee creation and update

import { z } from 'zod';
import { Role } from '../types/roles.js';

export const employeeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  departmentId: z.string().uuid("Invalid department ID"),
  designation: z.string().min(1, "Designation is required"),
  salary: z.number().positive("Salary must be a positive number"),
  joiningDate: z.string().datetime().optional(), // Or use z.coerce.date()
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  role: z.nativeEnum(Role),
  managerId: z.string().uuid().optional().nullable(),
});

export const updateManagerSchema = z.object({
  managerId: z.string().uuid("Invalid manager ID"),
});