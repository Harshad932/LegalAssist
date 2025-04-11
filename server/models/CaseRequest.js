// models/CaseRequest.js
import mongoose from 'mongoose';

const caseRequestSchema = new mongoose.Schema({
    lawyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lawyer',
      required: true
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    caseToken: {
      type: String,
      required: true
    },
    clientName: {
      type: String,
      required: true
    },
    clientEmail: {
      type: String,
      required: true
    },
    clientPhone: String,
    caseDetails: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending'
    },
    // Add these for better tracking
    clientUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    relatedCase: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Case'
    }
  }, {
    timestamps: true
  });
  
const CaseRequest = mongoose.model('CaseRequest', caseRequestSchema);

export default CaseRequest;