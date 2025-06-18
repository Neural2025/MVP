// Utility function to trigger dashboard refresh across tabs
export const triggerDashboardRefresh = () => {
  // Set a flag in localStorage to trigger refresh in other tabs
  localStorage.setItem('dashboard-refresh', Date.now().toString());
  
  // Also trigger a custom event for the current tab
  window.dispatchEvent(new CustomEvent('dashboard-refresh'));
};

// Hook to listen for dashboard refresh events
export const useDashboardRefresh = (callback: () => void) => {
  const handleRefresh = () => {
    callback();
  };

  // Listen for custom events in the current tab
  window.addEventListener('dashboard-refresh', handleRefresh);
  
  return () => {
    window.removeEventListener('dashboard-refresh', handleRefresh);
  };
};
