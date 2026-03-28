import { Router } from 'express';
import { getMonthlySummary, getDailyDetail, collect } from '../controllers/scanned_product_controller.js';

const router = Router();
router.get('/monthly', getMonthlySummary);
router.get('/daily', getDailyDetail);
router.post('/collect', collect);

export default router;
