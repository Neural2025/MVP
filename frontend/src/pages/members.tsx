import React, { useEffect, useState } from "react";
import { getTeams, getTeamById } from "../lib/teamApi";

const MembersPage = () => {
  const [team, setTeam] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTeam = async () => {
    try {
      setLoading(true);
      setError(null);
      const teams = await getTeams();
      if (!teams.length) throw new Error("No team found for this admin.");
      const teamData = await getTeamById(teams[0]._id);
      setTeam(teamData);
    } catch (err: any) {
      let msg = "Failed to load team info";
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

  useEffect(() => { fetchTeam(); }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading members...</div>;
  if (error) return (
    <div className="min-h-screen flex flex-col items-center justify-center text-red-600">
      {error}
      <button onClick={fetchTeam} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">Retry</button>
    </div>
  );
  if (!team) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md p-8">
        <h1 className="text-3xl font-bold text-blue-700 mb-4">Team Members</h1>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-xl shadow text-sm">
            <thead className="bg-blue-50">
              <tr>
                <th className="py-3 px-4 font-semibold text-blue-700 text-left">Email</th>
                <th className="py-3 px-4 font-semibold text-blue-700 text-left">Role</th>
                <th className="py-3 px-4 font-semibold text-blue-700 text-left">Last Login</th>
              </tr>
            </thead>
            <tbody>
              {team.members.map((member: any) => (
                <tr key={member._id} className="hover:bg-blue-100/40 transition">
                  <td className="py-2 px-4 border-b font-mono text-gray-800">{member.email}</td>
                  <td className="py-2 px-4 border-b capitalize text-blue-700 font-medium">{member.role.replace('_', ' ')}</td>
                  <td className="py-2 px-4 border-b font-mono text-gray-700">{member.lastLogin ? new Date(member.lastLogin).toLocaleString() : <span className="italic text-gray-400">Never</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MembersPage;
