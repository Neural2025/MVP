import React from "react";

import { useEffect, useState } from "react";
import { getPODashboardStats } from "../lib/dashboardApi";

const AnalyticsPage = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getPODashboardStats();
      setStats(data);
    } catch (err: any) {
      let msg = "Failed to load analytics";
      if (err.response) {
        msg += `: ${err.response.data?.message || JSON.stringify(err.response.data)}`;
      } else if (err.message) {
        msg += `: ${err.message}`;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStats(); }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading analytics...</div>;
  if (error) return (
    <div className="min-h-screen flex flex-col items-center justify-center text-red-600">
      {error}
      <button onClick={fetchStats} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">Retry</button>
    </div>
  );

  if (!stats) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md p-8">
        <h1 className="text-3xl font-bold text-blue-700 mb-4">Team Analytics</h1>
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="bg-blue-100 rounded-lg p-6 text-center">
            <div className="text-4xl font-bold text-blue-700">{stats.totalBugs}</div>
            <div className="text-lg text-blue-900">Total Bugs</div>
          </div>
          <div className="bg-green-100 rounded-lg p-6 text-center">
            <div className="text-4xl font-bold text-green-700">{stats.resolvedBugs}</div>
            <div className="text-lg text-green-900">Resolved Bugs</div>
          </div>
          <div className="bg-yellow-100 rounded-lg p-6 text-center">
            <div className="text-4xl font-bold text-yellow-700">{stats.openBugs}</div>
            <div className="text-lg text-yellow-900">Open Bugs</div>
          </div>
        </div>
        <div className="mb-6">
          <div className="font-semibold mb-1">Developer Progress</div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div className="bg-blue-500 h-4 rounded-full" style={{ width: `${stats.devProgress}%` }}></div>
          </div>
          <div className="text-xs text-gray-500 mt-1">{stats.devProgress}% complete</div>
        </div>
        <div>
          <div className="font-semibold mb-1">Tester Progress</div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div className="bg-green-500 h-4 rounded-full" style={{ width: `${stats.testerProgress}%` }}></div>
          </div>
          <div className="text-xs text-gray-500 mt-1">{stats.testerProgress}% complete</div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
