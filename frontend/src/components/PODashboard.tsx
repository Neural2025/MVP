

import { useState, useEffect } from "react";
import { getPODashboardStats } from "../lib/dashboardApi";

// Example fallback for empty data
const emptyStats = {
  totalBugs: 0,
  resolvedBugs: 0,
  openBugs: 0,
  devProgress: 0,
  testerProgress: 0,
  bugSeverity: {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
  },
  activity: [],
};

const PODashboard = () => {
  const [stats, setStats] = useState<any>(emptyStats);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getPODashboardStats()
      .then((data) => {
        setStats({
          totalBugs: data.totalBugs ?? 0,
          resolvedBugs: data.resolvedBugs ?? 0,
          openBugs: data.openBugs ?? 0,
          devProgress: data.devProgress ?? 0,
          testerProgress: data.testerProgress ?? 0,
          bugSeverity: data.bugSeverity || { critical: 0, high: 0, medium: 0, low: 0 },
          activity: data.activity || [],
        });
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load dashboard data.");
        setLoading(false);
      });
  }, []);

  // Pie chart for bug severity (simple SVG)
  const bugPieData = Object.entries(stats.bugSeverity);
  const totalPie = bugPieData.reduce((sum, [, v]) => sum + (v as number), 0);
  let startAngle = 0;
  const pieColors = ["#e53e3e", "#f6ad55", "#ecc94b", "#68d391"];
  const pieSlices = bugPieData.map(([label, value], idx) => {
    const angle = totalPie === 0 ? 0 : (Number(value) / totalPie) * 360;
    const x1 = 50 + 50 * Math.cos((Math.PI * startAngle) / 180);
    const y1 = 50 + 50 * Math.sin((Math.PI * startAngle) / 180);
    const x2 = 50 + 50 * Math.cos((Math.PI * (startAngle + angle)) / 180);
    const y2 = 50 + 50 * Math.sin((Math.PI * (startAngle + angle)) / 180);
    const largeArc = angle > 180 ? 1 : 0;
    const path = `M50,50 L${x1},${y1} A50,50 0 ${largeArc},1 ${x2},${y2} Z`;
    startAngle += angle;
    return { path, color: pieColors[idx], label, value: Number(value) };
  });

  let content: JSX.Element | null = null;
  if (loading) {
    content = (
      <div className="p-8 max-w-4xl mx-auto text-center">
        <div className="text-lg text-gray-600">Loading dashboard...</div>
      </div>
    );
  } else if (error) {
    content = (
      <div className="p-8 max-w-4xl mx-auto text-center">
        <div className="text-lg text-red-600">{error}</div>
      </div>
    );
  } else {
    content = (
      <div className="p-8 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Product Owner Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-semibold mb-2">Bug Overview</h2>
            <div className="flex items-center gap-8">
              <div>
                <div className="text-2xl font-bold text-red-600">{stats.totalBugs}</div>
                <div className="text-sm text-gray-500">Total Bugs</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{stats.resolvedBugs}</div>
                <div className="text-sm text-gray-500">Resolved</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600">{stats.openBugs}</div>
                <div className="text-sm text-gray-500">Open</div>
              </div>
            </div>
            <div className="mt-6">
              <svg width="120" height="120" viewBox="0 0 100 100">
                {pieSlices.map((slice: { path: string; color: string; label: string; value: number }, idx: number) => (
                  <path key={idx} d={slice.path} fill={slice.color} stroke="#fff" strokeWidth="2" />
                ))}
              </svg>
              <div className="flex gap-2 mt-2 text-xs">
                {pieSlices.map((slice: { path: string; color: string; label: string; value: number }, idx: number) => (
                  <span key={idx} className="flex items-center gap-1">
                    <span className="inline-block w-3 h-3 rounded-full" style={{ background: slice.color }} />
                    {slice.label} ({slice.value})
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-semibold mb-2">Progress Overview</h2>
            <div className="flex flex-col gap-4">
              <div>
                <div className="font-semibold">Developer Progress</div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div className="bg-blue-500 h-4 rounded-full" style={{ width: `${stats.devProgress}%` }}></div>
                </div>
                <div className="text-xs text-gray-500 mt-1">{stats.devProgress}% complete</div>
              </div>
              <div>
                <div className="font-semibold">Tester Progress</div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div className="bg-green-500 h-4 rounded-full" style={{ width: `${stats.testerProgress}%` }}></div>
                </div>
                <div className="text-xs text-gray-500 mt-1">{stats.testerProgress}% complete</div>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
          <table className="min-w-full text-left">
            <thead>
              <tr>
                <th className="py-2 px-4">Date</th>
                <th className="py-2 px-4">Developer</th>
                <th className="py-2 px-4">Tester</th>
              </tr>
            </thead>
            <tbody>
              {stats.activity.map((row: any) => (
                <tr key={row.date} className="border-b">
                  <td className="py-2 px-4">{row.date}</td>
                  <td className="py-2 px-4">{row.dev}</td>
                  <td className="py-2 px-4">{row.tester}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return content;
};

export default PODashboard;
