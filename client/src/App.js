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

import UserRegistration from './components/user/userRegistration';
import UserLogin from './components/user/UserLogin';
import UserProfile from './components/user/UserProfile';
import LawyerProfileView from './components/user/LawyerProfileView';
import RequestDetails from './components/user/RequestDetails';
import ClientMessagesPage from './components/user/ClientMessagePage';
import LawyerSearchPage  from './components/user/LawyerSearch';

import LawyerRegistration from './components/lawyer/LawyerRegistration';
import LawyerLogin from './components/lawyer/LawyerLogin';
import LawyerProfile from './components/lawyer/LawyerProfile';
import CaseRequestDetails from './components/lawyer/CaseRequestDetails';
import AcceptedCases from './components/lawyer/AcceptedCases';
import LawyerCaseDetails from './components/lawyer/LawyerCaseDetails';
import LawyerMessagesPage from './components/lawyer/LawyerMessagePage';

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

        <Route path="/user/registration" element={<UserRegistration/>} />
        <Route path="/user/login" element={<UserLogin/>} />
        <Route path="/user/profile" element={<UserProfile/>} />
        <Route path="/user/lawyer-profile/:lawyerId" element={<LawyerProfileView/>} />
        <Route path="/requests/:requestId" element={<RequestDetails />} />
        <Route path="/lawyer-search" element={<LawyerSearchPage />} />

        <Route path="/lawyer/registration" element={<LawyerRegistration/>} />
        <Route path="/lawyer/login" element={<LawyerLogin/>} />
        <Route path="/lawyer/profile" element={<LawyerProfile/>} />
        <Route path="/lawyer/case-requests/:requestId" element={<CaseRequestDetails/>} />
        <Route path="/lawyer/accepted-cases" element={<AcceptedCases />} />
        <Route path="/lawyer/case-details/:caseToken" element={<LawyerCaseDetails />} />
        <Route path="/lawyer/messages/:caseToken" element={<LawyerMessagesPage />} />
        <Route path="/client/messages/:caseToken" element={<ClientMessagesPage />} />
      </Routes>
    </Router>
  );
}

export default App;