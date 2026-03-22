import { Router } from 'express';
import { getTreeLevel } from '../controllers/tree_controller.js';

const router = Router();
router.get('/level', getTreeLevel);

export default router;
