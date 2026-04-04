import { Router } from 'express';
import { getByUser, getById, update, claim } from '../controllers/user_quest_controller.js';

const router = Router();
router.get('/findByUser', getByUser);
router.get('/findById', getById);
router.put('/updateProgress', update);
router.post('/claimReward', claim);

export default router;
