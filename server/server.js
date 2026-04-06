import express from "express";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import session from "express-session";
import passport from "passport";
import cors from "cors";
import axios from "axios";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { analyzeCasePriority } from './prioritizationService.js';
import { Strategy as LocalStrategy } from "passport-local";
import {Case,Admin}  from "./projectModel.js";

import authUserRoutes from './routes/authUserRoutes.js';
import { protect,lawyerProtect,userProtect } from './middleware/authMiddleware.js';
import User from './models/User.js';
import Lawyer from './models/Lawyer.js';
import CaseRequest from './models/CaseRequest.js';

import authLawyerRoutes from './routes/authLawyerRoutes.js';

import messageRoutes from './routes/messageRoutes.js';

import { createServer } from 'http';
import { initializeSocket } from './socket.js';

dotenv.config();
const app = express();
app.use(express.json());;

const server = createServer(app);

// Initialize WebSocket
const io = initializeSocket(server);

// Store io instance in app for use in routes
app.set('socketio', io);

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL, 
    pass: process.env.APP_PASSWORD, 
  },
});

let promptHistory = "";

console.log("✅ Loaded CORS_ORIGIN:", process.env.CORS_ORIGIN);

app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true,
}));

  
  app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      secure: false, // Set to true when using HTTPS
      sameSite: 'Lax', // Use 'Lax' for local development
      maxAge: 1000 * 60 * 60 * 24,
    },
  }));

app.use(passport.initialize());
app.use(passport.session());

passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await Admin.findOne({ username });
        if (!user) return done(null, false, { message: "User not found" });
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return done(null, false, { message: "Incorrect password" });
  
        return done(null, user);
      } catch (error) {
        console.error("Error during authentication:", error);
        return done(error);
      }
    })
  );
  
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await Admin.findById(id);
      done(null, user);
    } catch (error) {
      console.error("Error during deserialization:", error);
      done(error);
    }
  });

  app.get('/auth/check-session', (req, res) => {
    if (req.isAuthenticated()) {
      res.status(200).json({ message: 'Authenticated' });
    } else {
      res.status(401).json({ message: 'Not authenticated' });
    }
  });
  
  function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Unauthorized. Please log in." });
  }

  app.post("/admin/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        console.error("Authentication error:", err);
        return next(err);
      }
  
      if (!user) {
        return res.status(401).json({ message: info.message || "Invalid credentials" });
      }
  
      req.logIn(user, (err) => {
        if (err) {
          console.error("Login error:", err);
          return next(err);
        }
        res.status(200).json({ message: "Login successful", user: user.username });
      });
    })(req, res, next);
  });

app.get("/case/:tokenNumber", async (req, res) => {
    try {
      const caseData = await Case.findOne({ tokenNumber: req.params.tokenNumber });
      console.log(caseData);
      if (!caseData) {
        return res.status(404).json({ message: "Case not found" });
      }
      res.json(caseData);
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });

  app.post("/admin/prioritize-cases", ensureAuthenticated, async (req, res) => {
    try {
      const { numberOfCases } = req.body;
      
      if (!numberOfCases || numberOfCases <= 0) {
        return res.status(400).json({ error: "Please provide a valid number of cases to prioritize" });
      }
      
      // Get cases that don't have priorities set, or fetch the newest ones
      const casesToProcess = await Case.find({ 
        $or: [
          { priority: { $exists: false } },
          { priority: null }
        ]
      }).limit(parseInt(numberOfCases));
      
      // If no unprioritized cases found, get the newest cases
      if (casesToProcess.length === 0) {
        const newestCases = await Case.find({})
          .sort({ filingDate: -1 })
          .limit(parseInt(numberOfCases));
        
        casesToProcess.push(...newestCases);
      }
      
      let processedCount = 0;
      const results = [];
      
      // Process cases one by one
      for (const caseItem of casesToProcess) {
        let priorityText = '';
        if (caseItem.caseTitle) priorityText += caseItem.caseTitle + ". ";
        if (caseItem.caseType) priorityText += "Type: " + caseItem.caseType + ". ";
        
        // Extract text from hearings
        if (caseItem.hearings && caseItem.hearings.length > 0) {
          const hearingTexts = caseItem.hearings
            .filter(h => h.description)
            .map(h => h.description)
            .join(". ");
          
          if (hearingTexts) {
            priorityText += "Description: " + hearingTexts;
          }
        }
        
        // Analyze and set priority
        const newPriority = await analyzeCasePriority(priorityText);
        caseItem.priority = newPriority;
        await caseItem.save();
        
        results.push({
          tokenNumber: caseItem.tokenNumber,
          caseTitle: caseItem.caseTitle,
          oldPriority: caseItem.priority !== newPriority ? caseItem.priority : null,
          newPriority: newPriority
        });
        
        processedCount++;
      }
      
      res.json({
        message: `Successfully prioritized ${processedCount} cases`,
        processedCases: results
      });
    } catch (error) {
      console.error("Error prioritizing cases:", error);
      res.status(500).json({ error: "Error prioritizing cases", details: error.message });
    }
  });
  
  // Get all cases API (for admin dashboard)
  app.get("/admin/cases", ensureAuthenticated, async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;
      
      // Get prioritized cases first, ordered by priority
      const prioritized = await Case.find();
      
      // Get total count for pagination
      const totalCases = await Case.countDocuments();
      
      res.json({
        cases: prioritized,
        pagination: {
          total: totalCases,
          page,
          pages: Math.ceil(totalCases / limit),
          limit
        }
      });
    } catch (error) {
      console.error("Error fetching cases:", error);
      res.status(500).json({ error: "Error fetching cases" });
    }
  });
  
  // Add this to your Express server file
  app.put("/admin/case/edit/:tokenNumber", async (req, res) =>  {
      try {
        const { tokenNumber } = req.params;
        const updatedCaseData = req.body;
        console.log(tokenNumber)
        // Find and update the case
        const updatedCase = await Case.findOneAndUpdate(
          { tokenNumber }, 
          updatedCaseData,
          { new: true, runValidators: true }
        );
        
        if (!updatedCase) {
          return res.status(404).json({ error: "Case not found" });
        }
        
        res.json({
          message: "Case updated successfully",
          case: updatedCase
        });
      } catch (error) {
        console.error("Error updating case:", error);
        res.status(500).json({ error: "Error updating case", details: error.message });
      }
    });

    app.post('/api/chat', async (req, res) => {
      try {
        console.log("Received a request");
    
        const { message } = req.body;
        
        if (!message) {
          return res.status(400).json({ error: "Message is required" });
        }
    
        // Attach prompt history as a prefix to the user's new query
        const combinedMessage = `Prompt History:\n${promptHistory}\nUser Query: ${message}`;
        
        // Define models to try in order (fallback strategy)
        const models = [
      "openai/gpt-oss-20b",      
      "llama-3.1-8b-instant",           
      "mixtral-8x7b-32768",           
      "gemma2-9b-it",               
    ];
        
        let botResponse = null;
        let lastError = null;
        
        // Try each model until one works
        for (const model of models) {
          try {
            console.log(`Trying model: ${model}`);
            
            const response = await axios.post("https://api.groq.com/openai/v1/chat/completions", {
              model: model,
              messages: [
                { 
                  role: "system", 
                  content: "Your name is Legal Support Chatbot. You are a legal expert specializing in Indian laws. When answering legal questions, always provide information based on Indian laws unless explicitly stated otherwise, always provide relevant 2 to 3 past cases related to prompt."
                },
                { role: "user", content: combinedMessage }
              ],
            }, {
              headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
            "HTTP-Referer": "http://localhost:5000",
            "X-Title": "Symptom Checker App"
          },
              timeout: 10000 // 10 seconds timeout
            });
            
            // If we get here, the request succeeded
            if (response.data?.choices?.[0]?.message?.content) {
              botResponse = response.data.choices[0].message.content;
              console.log(`Successfully got response from ${model}`);
              
              // Update prompt history (limit to last 5 exchanges to avoid too long context)
              promptHistory += `\nUser: ${message}\nBot: ${botResponse}`;
              promptHistory = promptHistory.split('\n').slice(-10).join('\n'); // Keep last 5 exchanges
              
              return res.json({ reply: botResponse });
            }
          } catch (modelError) {
            console.error(`Error with model ${model}:`, modelError.response?.data || modelError.message);
            lastError = modelError;
            
            // If it's not a rate limit error, continue to next model
            if (modelError.response?.status !== 429) {
              continue;
            }
            
            // For rate limit errors, wait a bit before trying next model
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
        
        // If all models failed
        console.error("All models failed. Last error:", lastError?.response?.data || lastError?.message);
        return res.status(503).json({ 
          error: "Our legal experts are currently busy. Please try again shortly.",
          details: lastError?.response?.data || lastError?.message
        });
        
      } catch (error) {
        console.error("Chat API error:", error.response?.data || error.message);
        res.status(500).json({ 
          error: "Error processing your legal query",
          details: error.response?.data || error.message
        });
      }
    });

      app.post("/admin/forgotPassword",async (req,res)=>
        {
        
          const { username, email } = req.body;
        
          try {
            const user = await Admin.findOne({ username, email });
            if (!user) return res.status(404).json({ message: "User not found" });
        
            const resetToken = crypto.randomBytes(32).toString('hex');
        
            // Store the token and expiry time in the user's record
            user.resetToken = resetToken;
            user.resetTokenExpiry = Date.now() + 3600000; // Token valid for 1 hour
            await user.save();
        
            // Send email with the reset token
            const resetLink = `http://localhost:3000/admin/reset?token=${resetToken}`;
            await transporter.sendMail({
              to: user.email,
              subject: 'Password Reset Request',
              text: `You requested a password reset. Please use the following link to reset your password: ${resetLink}`,
            });
        
            res.status(200).json({ message: 'Password reset link sent to your email.' });
          } catch (error) {
            console.error('Error in forgotPassword:', error);
            res.status(500).json({ message: 'Server error' });
          }
        });

        app.post('/admin/reset-password', async (req, res) => {
          const { token, newPassword } = req.body;
          console.log(token,newPassword)
          try {
            // Find the user by the reset token and check if it's expired
            const user = await Admin.findOne({
              resetToken: token,
              resetTokenExpiry: { $gt: Date.now() },
            });
        
            if (!user) {
              return res.status(400).json({ message: 'Invalid or expired token' });
            }
        
            // Hash the new password
            user.password = await bcrypt.hash(newPassword, 10);
            user.resetToken = undefined;  // Clear the reset token after it's used
            user.resetTokenExpiry = undefined;  // Clear expiry
            await user.save();
        
            res.status(200).json({ message: 'Password has been reset successfully.' });
          } catch (error) {
            console.error('Error in reset-password:', error);
            res.status(500).json({ message: 'Server error' });
          }
        });

app.use('/api/user/auth', authUserRoutes);
app.use('/api/lawyer/auth', authLawyerRoutes);

app.get('/api/users/me', protect, async (req, res) => {
  try {
    
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('cases'); // If you want to populate cases
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Server error in /me route:', error); // Debug
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message // Include specific error
    });
  }
});

app.get('/api/lawyers/search', async (req, res) => {
  try {
    const { specialization, location, minExperience, maxRate } = req.query;
    
    // Initialize query with verified: true
    const query={}
    
    if (specialization) {
      query.specialization = { $in: specialization.split(',').map(s => s.trim()) };
    }
    
    if (location) {
      query.location = new RegExp(location.replace('+', ' '), 'i'); // Handle URL encoded spaces
    }
    
    if (minExperience) {
      query.experience = { $gte: parseInt(minExperience) };
    }
    
    if (maxRate) {
      query.hourlyRate = { $lte: parseInt(maxRate) };
    }
    
    const lawyers = await Lawyer.find(query).select('-password -__v');
    
    res.json(lawyers);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message,
      error: error.stack // For debugging
    });
  }
});

// Get lawyer profile
app.get('/api/lawyers/me', protect, lawyerProtect, async (req, res) => {
  try {

    const lawyer = await Lawyer.findById(req.lawyer._id)
      .select('-password -__v');

    res.status(200).json({
      success: true,
      data: lawyer
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

app.get('/api/lawyers/:id', async (req, res) => {
  try {
    const lawyer = await Lawyer.findById(req.params.id)
      .select('-password -__v');
    
    if (!lawyer) {
      return res.status(404).json({
        success: false,
        message: 'Lawyer not found'
      });
    }

    res.status(200).json({
      success: true,
      data: lawyer
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

app.post('/api/case-requests', protect, async (req, res) => {
  try {
    const { lawyerId, caseToken, clientName, clientEmail, clientPhone, caseDetails } = req.body;
    
    // Create new case request
    const newRequest = await CaseRequest.create({
      lawyer: lawyerId,
      client: req.user._id,
      caseToken,
      clientName,
      clientEmail,
      clientPhone,
      caseDetails,
      status: 'pending'
    });

    // In real app, you might want to:
    // 1. Send email notification to lawyer
    // 2. Add notification to lawyer's dashboard

    res.status(201).json({
      success: true,
      data: newRequest
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Correct route definition
app.get('/api/lawyers/my/requests', protect, lawyerProtect, async (req, res) => {
  try {
    const requests = await CaseRequest.find({ 
      lawyer: req.lawyer._id,
      status: 'pending'
    })
    .sort({ createdAt: -1 })
    .populate('clientUser', 'name email phone'); // Optional: populate client info

    res.status(200).json({
      success: true,
      data: requests
    });
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching requests',
      error: error.message
    });
  }
});

app.patch('/api/case-requests/:id', protect, lawyerProtect, async (req, res) => {
  try {
    const { status } = req.body;
    const request = await CaseRequest.findOneAndUpdate(
      { 
        _id: req.params.id,
        lawyer: req.lawyer._id // Ensure lawyer only updates their own requests
      },
      { status },
      { new: true }
    );

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    // In real app, you would:
    // 1. Send email notification to client
    // 2. Create a case if accepted
    // 3. Update any related data

    res.status(200).json({
      success: true,
      data: request
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get request by ID
app.get('/api/case-requests/:id', protect, lawyerProtect, async (req, res) => {
  try {
    const request = await CaseRequest.findById(req.params.id)
      .populate('clientUser', 'name email phone');
    
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    // Verify lawyer owns this request
    if (!request.lawyer.equals(req.lawyer._id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this request'
      });
    }

    res.status(200).json({
      success: true,
      data: request
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get case by token number
app.get('/api/cases/by-token/:token', protect, async (req, res) => {
  try {
    const caseData = await Case.findOne({ tokenNumber: req.params.token });
    
    if (!caseData) {
      return res.status(404).json({
        success: false,
        message: 'Case not found'
      });
    }

    res.status(200).json({
      success: true,
      data: caseData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get case by token
app.get('/api/user/cases/by-token/:token', protect, async (req, res) => {
  try {
    // Verify the case belongs to the requesting user
    const caseData = await Case.findOne({ 
      tokenNumber: req.params.token,
    });
    
    if (!caseData) {
      return res.status(404).json({
        success: false,
        message: 'Case not found or not owned by you'
      });
    }

    res.status(200).json({
      success: true,
      data: caseData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get user's case requests
app.get('/api/users/requests', protect, async (req, res) => {
  try {
    const requests = await CaseRequest.find({ client: req.user._id })
      .populate('lawyer', 'name email specialization')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: requests
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get single request (user's own only)
// Get single request (user's own only)
app.get('/api/requests/:id', protect, async (req, res) => {
  try {
    const request = await CaseRequest.findOne({
      _id: req.params.id,
      client: req.user._id // Ensure user only sees their own requests
    }).populate('lawyer', 'name email specialization');

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    res.status(200).json({
      success: true,
      data: request
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get all accepted cases for a lawyer
app.get('/api/lawyer/accepted-cases', protect, lawyerProtect, async (req, res) => {
  try {
    const requests = await CaseRequest.find({
      lawyer: req.lawyer._id,
      status: 'accepted'
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: requests
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get case details by token number
app.get('/api/cases/:tokenNumber', protect, lawyerProtect, async (req, res) => {
  try {
    const { tokenNumber } = req.params;

    // Find the case request first to verify ownership
    const request = await CaseRequest.findOne({
      caseToken: tokenNumber,
      lawyer: req.lawyer._id
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Case not found or not authorized'
      });
    }

    // Find the case details
    const caseDetails = await Case.findOne({ tokenNumber });

    if (!caseDetails) {
      return res.status(404).json({
        success: false,
        message: 'Case details not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        case: caseDetails,
        request: request
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

app.use('/api/messages', messageRoutes);

server.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`));

// Fetch unprioritized cases and set priorities for a specific number of cases
