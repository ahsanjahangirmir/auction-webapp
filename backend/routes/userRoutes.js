import express from 'express';
import { loginUser, signUpUser, getUserDetailsByUsername, changePassword } from '../controllers/userController.js';

const router = express.Router();

// Route for user login
router.post('/login', loginUser);

// Route for user sign-up
router.post('/signup', signUpUser);

router.get('/:username', getUserDetailsByUsername);

router.post('/change-password', changePassword);

export default router;
