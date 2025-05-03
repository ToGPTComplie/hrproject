import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import LeaveRequestSubmissionPage from './pages/LeaveRequestSubmissionPage';
import MyRequestsPage from './pages/MyRequestsPage';
import PendingApprovalsPage from './pages/PendingApprovalsPage';
import LeaveRequestDetailPage from './pages/LeaveRequestDetailPage';
// 导入工作流相关页面
import WorkflowDefinitionsPage from './pages/workflow/WorkflowDefinitionsPage';
import WorkflowDesignerPage from './pages/workflow/WorkflowDesignerPage';

const App = () => {
  return (
    <AppLayout>
      <Routes>
        <Route path="/submit" element={<LeaveRequestSubmissionPage />} />
        <Route path="/my-requests" element={<MyRequestsPage />} />
        <Route path="/pending-approvals" element={<PendingApprovalsPage />} />
        <Route path="/detail/:id" element={<LeaveRequestDetailPage />} />
        {/* 工作流相关路由 */}
        <Route path="/workflow/definitions" element={<WorkflowDefinitionsPage />} />
        <Route path="/workflow/designer" element={<WorkflowDesignerPage />} />
        <Route path="/workflow/designer/:definitionId" element={<WorkflowDesignerPage />} />
        <Route path="/" element={<Navigate to="/my-requests" replace />} />
      </Routes>
    </AppLayout>
  );
};

export default App;