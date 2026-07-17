// routes for organisational hierarchy

import { Router } from 'express';
import { getOrgTree } from '../controllers/organisationController.js';

const router = Router();

// GET /api/organization/tree - display organizational tree
router.get('/tree', getOrgTree);

export default router;