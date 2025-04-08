import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { registerUser, loginUser } from '../controllers/authUserController.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);

export default router;