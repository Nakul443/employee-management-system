import { Router } from 'express';

const router = Router();

// GET /api/employees - get employee list
// Example: /api/employees?name=XYZ&department=ABC
router.get('/', (req, res) => {

    const { name, email, department, role, status, sortBy } = req.query;

    res.json({ 
        message: 'Get employees', 
        filtersReceived: { name, email, department, role, status, sortBy } 
    });
});

// GET /api/employees/:id/reportees - get direct reports for a specific employee
router.get('/:id/reportees', (req, res) => {
    const { id } = req.params;
    res.json({ message: `Get direct reports for employee ${id}` });
});

// PATCH /api/employees/:id/manager - assign or update reporting manager
router.patch('/:id/manager', (req, res) => {
    const { id } = req.params;
    res.json({ message: `Update reporting manager for employee ${id}` });
});

// GET /api/employees/:id - get employee by ID
router.get('/:id', (req, res) => {
    const { id } = req.params;
    res.json({ message: `Get employee with ID ${id}` });
});

// POST /api/employees - create
router.post('/', (req, res) => {
    res.json({ message: 'Create employee' });
});

// PUT /api/employees/:id - update
router.put('/:id', (req, res) => {
    res.json({ message: `Update employee ${req.params.id}` });
});

// DELETE /api/employees/:id - delete
router.delete('/:id', (req, res) => {
    res.json({ message: `Delete employee ${req.params.id}` });
});

export default router;