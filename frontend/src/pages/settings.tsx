import React, { useEffect, useState } from "react";
import { getTeams, getTeamById } from "../lib/teamApi";
import { api } from "../lib/api";

const SettingsPage = () => {
  const [team, setTeam] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        setLoading(true);
        setError(null);
        const teams = await getTeams();
        if (!teams.length) throw new Error("No team found for this admin.");
        const teamData = await getTeamById(teams[0]._id);
        setTeam(teamData);
        setNewName(teamData.name);
      } catch (err: any) {
        setError(err.message || "Failed to load team info");
      } finally {
        setLoading(false);
      }
    };
    fetchTeam();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!team?._id) return;
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      const res = await api.patch(`/api/teams/${team._id}`, { name: newName });
      setSuccess(res.data?.message || "Team name updated!");
      setTeam({ ...team, name: newName });
    } catch (err: any) {
      let msg = "Failed to update team name";
      if (err.response) {
        msg += `: ${err.response.data?.message || JSON.stringify(err.response.data)}`;
      } else if (err.message) {
        msg += `: ${err.message}`;
      }
      setError(msg);
    } finally {
      setLoading(false);
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading settings...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-600">{error}</div>;
  if (!team) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-xl mx-auto bg-white rounded-xl shadow-md p-8">
        <h1 className="text-3xl font-bold text-blue-700 mb-4">Team Settings</h1>
        <div className="mb-4">
          <div className="font-semibold">Team Code:</div>
          <div className="font-mono bg-gray-100 px-2 py-1 rounded inline-block">{team.code}</div>
        </div>
        <form onSubmit={handleUpdate} className="mb-2">
          <label className="block font-semibold mb-1">Team Name</label>
          <input
            className="border border-gray-300 rounded px-3 py-2 w-full mb-2"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            required
          />
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition" disabled={loading || !newName || newName === team.name}>
            {loading ? 'Updating...' : 'Update Name'}
          </button>
        </form>
        {success && <div className="text-green-600 mt-2">{success}</div>}
        {error && <div className="text-red-600 mt-2">{error}</div>}
      </div>
    </div>
  );
};

export default SettingsPage;
