// routes for employee management

import { Router } from 'express';
import { getEmployees, getReportees, updateManager, getEmployeeById, createEmployee, updateEmployee, deleteEmployee } from '../controllers/employeeController.js';
import { employeeSchema, updateEmployeeSchema, updateManagerSchema } from '../schemas/employeeSchema.js';
import { validate } from '../schemas/validate.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/authorizeMiddleware.js';

const router = Router();

// GET /api/employees - get employee list
router.get('/', authorize(['SUPER_ADMIN', 'HR']), getEmployees);

// GET /api/employees/:id - get employee by ID
router.get('/:id', getEmployeeById);

// GET /api/employees/:id/reportees - get direct reports for a specific employee
router.get('/:id/reportees', authorize(['SUPER_ADMIN', 'HR']), getReportees);

// PATCH /api/employees/:id/manager - assign or update reporting manager
router.patch('/:id/manager',
  authorize(['SUPER_ADMIN', 'HR']),
  validate(updateManagerSchema),
  updateManager
);

// POST /api/employees - create
router.post('/',
  authorize(['SUPER_ADMIN', 'HR']),
  validate(employeeSchema),
  createEmployee
);

// PUT /api/employees/:id - update
router.put('/:id', validate(updateEmployeeSchema), updateEmployee);

// DELETE /api/employees/:id - delete
router.delete('/:id', 
  authenticate, 
  authorize(['SUPER_ADMIN']), // only Super Admin can delete
  deleteEmployee
);

export default router;