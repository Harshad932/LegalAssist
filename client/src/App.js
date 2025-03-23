import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import Home from './components/Home';
import CaseDetails from './components/CaseDetails';
import EditCasePage from './components/EditCase';
import Chatbot from './components/LlamaChat';
import ForgotPassword from './components/ForgotPassword';
import Reset from './components/Reset';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/chatbot" element={<Chatbot />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin/case/edit/:tokenNumber" element={<EditCasePage />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/case-details" element={<CaseDetails />} />
        <Route path="/admin/forgot-password" element={<ForgotPassword/>} />
        <Route path="/admin/reset" element={<Reset/>} />
      </Routes>
    </Router>
  );
}

export default App;