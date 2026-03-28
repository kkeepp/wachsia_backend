import { Router } from 'express';
import { getAll, getById, getByMember, create, remove } from '../controllers/community_controller.js';

const router = Router();
router.get('/findAll', getAll);
router.get('/findById', getById);
router.get('/findByMember', getByMember);
router.post('/create', create);
router.delete('/delete', remove);

export default router;
