import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

try {
  await mongoose.connect(process.env.MONGOURI); // No additional options required
  console.log("Connected to MongoDB successfully.");
} catch (error) {
  console.error("Error connecting to MongoDB:", error);
}

// projectModel.js - Add priority field
const caseSchema = new mongoose.Schema({
  tokenNumber: { type: String, unique: true, required: true },
  caseTitle: String,
  caseType: String,
  court: String,
  judge: String,
  petitioner: String,
  respondent: String,
  firNumber: String,
  filingDate: Date,
  status: { type: String, default: "Pending" },
  priority: { type: String, enum: ['Critical', 'High', 'Medium', 'Low'], default: 'Medium' },
  hearings: [
    {
      date: Date,
      description: String,
      judgeRemarks: String,
      status: String
    }
  ],
});

const Case = mongoose.model("Case", caseSchema);

const adminSchema = new mongoose.Schema({
  username:{type:String,required: true,unique:true},
  password:{type:String,required: true},
  email:{type:String,required: true,unique:true},
  resetToken: { type: String },  
  resetTokenExpiry: { type: Date },
}, { timestamps: true });

const Admin = mongoose.model('admin', adminSchema);

export {Case,Admin};
