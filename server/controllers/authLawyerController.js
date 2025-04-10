import Lawyer from '../models/Lawyer.js';
import generateToken from '../utils/generateToken.js';

// @desc    Register a new lawyer
// @route   POST /api/auth/lawyer/register
// @access  Public
export const registerLawyer = async (req, res) => {
  try {
    const { 
      name, 
      email, 
      password, 
      phone, 
      specialization, 
      experience, 
      barAssociationId, 
      location, 
      languages, 
      hourlyRate 
    } = req.body;

    // Check if lawyer exists
    const lawyerExists = await Lawyer.findOne({ email });
    if (lawyerExists) {
      return res.status(400).json({ 
        success: false,
        message: 'Lawyer already exists' 
      });
    }

    // Create lawyer
    const lawyer = await Lawyer.create({
      name,
      email,
      password,
      phone,
      specialization,
      experience,
      barAssociationId,
      location,
      languages,
      hourlyRate,
      role: 'lawyer'
    });

    if (lawyer) {
      res.status(201).json({
        success: true,
        _id: lawyer._id,
        name: lawyer.name,
        email: lawyer.email,
        role: lawyer.role,
        token: generateToken(lawyer._id)
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Authenticate lawyer & get token
// @route   POST /api/auth/lawyer/login
// @access  Public
// authController.js
export const loginLawyer = async (req, res) => {
  try {
    const { email, password } = req.body;

    const lawyer = await Lawyer.findOne({ email });

    if (!lawyer) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const isMatch = await lawyer.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const token = lawyer.generateAuthToken();

    res.json({
      success: true,
      token,
      role: 'lawyer',
      id: lawyer._id,
      name: lawyer.name,
      email: lawyer.email
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};