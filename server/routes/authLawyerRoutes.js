import {
    registerLawyer,
    loginLawyer
  } from '../controllers/authLawyerController.js';
  import express from 'express';

  const router = express.Router();
  
  // Add these to your existing auth routes
  router.post('/register', registerLawyer);
  router.post('/login', loginLawyer);

  export default router;