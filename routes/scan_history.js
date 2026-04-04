import { Router } from 'express';
import { getProduct, scan, getHistory, getMonthly, getDaily } from '../controllers/scan_history_controller.js';

const router = Router();
router.get('/product', getProduct);
router.get('/history', getHistory);
router.get('/monthly', getMonthly);
router.get('/daily', getDaily);
router.post('/scan', scan);

export default router;
