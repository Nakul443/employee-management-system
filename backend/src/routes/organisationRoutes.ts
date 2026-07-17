import { Router } from 'express';

const router = Router();

// GET /api/organization/tree - display organizational tree
router.get('/tree', (req, res) => {
    res.json({ message: 'Get organizational tree' });
});

export default router;