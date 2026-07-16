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
    res.json({ message: 'Update employee' });
});

// DELETE /api/employees/:id - delete
router.delete('/:id', (req, res) => {
    res.json({ message: 'Delete employee' });
});

export default router;