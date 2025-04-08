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
import authLawyerRoutes from './routes/authLawyerRoutes.js';

dotenv.config();
const app = express();
app.use(express.json());;

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL, 
    pass: process.env.APP_PASSWORD, 
  },
});

let promptHistory = "";

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
          "google/gemini-2.0-pro-exp-02-05:free",
          "google/gemini-pro:free",  // Fallback to standard Gemini Pro
          "openai/gpt-3.5-turbo:free" // Final fallback to GPT-3.5
        ];
        
        let botResponse = null;
        let lastError = null;
        
        // Try each model until one works
        for (const model of models) {
          try {
            console.log(`Trying model: ${model}`);
            
            const response = await axios.post("https://openrouter.ai/api/v1/chat/completions", {
              model: model,
              messages: [
                { 
                  role: "system", 
                  content: "Your name is Legal Support Chatbot. You are a legal expert specializing in Indian laws. When answering legal questions, always provide information based on Indian laws unless explicitly stated otherwise,always provide relevant 2 to 3 past cases related to prompt."
                },
                { role: "user", content: combinedMessage }
              ],
            }, {
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`
              }
            });
            
            // If we get here, the request succeeded
            if (response.data && response.data.choices && response.data.choices.length > 0) {
              botResponse = response.data.choices[0].message?.content || "No content in response.";
              console.log(`Successfully got response from ${model}`);
              break; // Exit the loop as we got a successful response
            }
          } catch (modelError) {
            console.error(`Error with model ${model}:`, modelError.response?.data || modelError.message);
            lastError = modelError;
            
            // If it's not a rate limit error, we might want to stop trying
            if (modelError.response?.status !== 429) {
              break;
            }
            
            // For rate limit errors, continue to next model after a short delay
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }
        
        if (botResponse) {
          // Update prompt history (only keeping essential context)
          promptHistory += `\nUser: ${message}\nBot: ${botResponse}`;
          return res.json({ reply: botResponse });
        } else {
          // If all models failed, return an appropriate error
          console.error("All models failed. Last error:", lastError?.response?.data || lastError?.message);
          
          // Return a user-friendly message
          return res.status(503).json({ 
            error: "The service is currently experiencing high demand. Please try again in a few moments.",
            details: lastError?.response?.data || lastError?.message
          });
        }
        
      } catch (error) {
        console.error("Chat API error:", error.response?.data || error.message);
        res.status(500).json({ 
          error: "Error processing request",
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

  app.listen(process.env.PORT, () => {
    console.log("Server running on port: " + process.env.PORT);
  });

// Fetch unprioritized cases and set priorities for a specific number of cases
