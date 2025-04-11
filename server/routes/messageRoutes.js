import express from 'express';
import Message from '../models/Message.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get messages for a case
router.get('/:caseToken', protect, async (req, res) => {
  try {
    const messages = await Message.find({ caseToken: req.params.caseToken })
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      messages
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Send a message
// In your messageRoutes.js
router.post('/', protect, async (req, res) => {
    try {
      const { caseToken, content } = req.body;
      const io = req.app.get('socketio');
      
      // Determine sender info based on which token was used
      const sender = req.lawyer || req.user;
      const senderType = req.lawyer ? 'lawyer' : 'client';
      
      const message = await Message.create({
        caseToken,
        senderId: sender._id,
        senderType,
        senderName: sender.name,
        content
      });
  
      // Emit to all clients in the case room
      io.to(caseToken).emit('newMessage', message);
  
      res.status(201).json({
        success: true,
        message
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  });

export default router;