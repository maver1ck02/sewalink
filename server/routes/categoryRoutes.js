import { Router } from 'express';
import * as cats from '../controllers/categoryController.js';

const router = Router();
router.get('/', cats.listCategories);
export default router;
