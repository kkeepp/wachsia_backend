import { Router } from 'express';
import { getTreeLevel, addExp, ranking } from '../controllers/tree_controller.js';

const router = Router();
router.get('/level', getTreeLevel);
router.get('/ranking', ranking);
router.post('/addExp', addExp);

export default router;
