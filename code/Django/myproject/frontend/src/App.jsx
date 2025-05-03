import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import LeaveRequestSubmissionPage from './pages/LeaveRequestSubmissionPage';
import MyRequestsPage from './pages/MyRequestsPage';
import PendingApprovalsPage from './pages/PendingApprovalsPage';
import LeaveRequestDetailPage from './pages/LeaveRequestDetailPage';

const App = () => {
  return (
    <AppLayout>
      <Routes>
        <Route path="/submit" element={<LeaveRequestSubmissionPage />} />
        <Route path="/my-requests" element={<MyRequestsPage />} />
        <Route path="/pending-approvals" element={<PendingApprovalsPage />} />
        <Route path="/detail/:id" element={<LeaveRequestDetailPage />} />
        <Route path="/" element={<Navigate to="/my-requests" replace />} />
      </Routes>
    </AppLayout>
  );
};

export default App;