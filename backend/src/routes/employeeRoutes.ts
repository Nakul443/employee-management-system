// routes for employee management

import { Router } from 'express';
import { getEmployees, getReportees, updateManager, getEmployeeById, createEmployee, updateEmployee, deleteEmployee } from '../controllers/employeeController.js';
import { employeeSchema, updateManagerSchema } from '../schemas/employeeSchema.js';
import { validate } from '../schemas/validate.js';

const router = Router();

// GET /api/employees - get employee list
// Example: /api/employees?name=XYZ&department=ABC
router.get('/', getEmployees);

// GET /api/employees/:id/reportees - get direct reports for a specific employee
router.get('/:id/reportees', getReportees);

// PATCH /api/employees/:id/manager - assign or update reporting manager
router.patch('/:id/manager', validate(updateManagerSchema), updateManager);

// GET /api/employees/:id - get employee by ID
router.get('/:id', getEmployeeById);

// POST /api/employees - create
router.post('/', validate(employeeSchema), createEmployee);

// PUT /api/employees/:id - update
router.put('/:id', updateEmployee);

// DELETE /api/employees/:id - delete
router.delete('/:id', deleteEmployee);

export default router;