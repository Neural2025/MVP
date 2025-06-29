import { api } from './api';

// PO Dashboard: Get stats for bugs, progress, severity, and activity
export const getPODashboardStats = async () => {
  const res = await api.get('/api/user/stats');
  return res.data.data;
};

// PO Dashboard: Get bug reports
export const getBugReports = async () => {
  const res = await api.get('/api/bug-reports');
  return res.data.data;
};

// PO Dashboard: Get test execution history
export const getTestHistory = async () => {
  const res = await api.get('/api/test-history');
  return res.data.data;
};

// PO Dashboard: Get code analysis history
export const getAnalysisHistory = async () => {
  const res = await api.get('/api/analysis-history');
  return res.data.data;
};
