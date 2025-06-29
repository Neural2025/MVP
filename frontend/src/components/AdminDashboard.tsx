import React, { useState, useEffect } from 'react';
import Sidebar from "./Sidebar";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc"; // Required for timezone support
import timezone from "dayjs/plugin/timezone"; // Required for timezone support
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // Assuming a UI library select component
import { getTeams, getTeamById, inviteMember, changeMemberRole, removeMember } from "../lib/teamApi";

// Initialize Day.js plugins
dayjs.extend(utc);
dayjs.extend(timezone);

// Define interfaces for type safety
interface TeamMember {
  _id: string;
  email: string;
  role: string;
  lastLogin?: string;
}

interface Team {
  _id: string;
  name: string;
  code: string;
  members: TeamMember[];
}

interface InviteDetails {
  email: string;
  otp: string;
  tempPassword: string;
  teamCode: string;
}

const availableRoles = [
  { label: "Developer", value: "developer" },
  { label: "Tester", value: "tester" },
  { label: "Product Owner", value: "product_owner" },
];

const AdminDashboard: React.FC = () => {
  // State definitions with proper types
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("developer");
  const [inviteStatus, setInviteStatus] = useState<string | null>(null);
  const [inviteDetails, setInviteDetails] = useState<InviteDetails | null>(null);
  const [clock, setClock] = useState(dayjs());

  // Real-time clock
  useEffect(() => {
    const interval = setInterval(() => setClock(dayjs()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch team data
  useEffect(() => {
    const fetchTeam = async () => {
      try {
        setLoading(true);
        setError(null);
        const teams = await getTeams();
        if (teams.length === 0) {
          throw new Error("No team found for this admin.");
        }
        const teamData = await getTeamById(teams[0]._id);
        setTeam(teamData);
      } catch (err: any) {
        const debugMsg = err.response
          ? `Status: ${err.response.status}\nData: ${JSON.stringify(err.response.data)}\nHeaders: ${JSON.stringify(err.response.headers)}`
          : err.request
          ? `No response received. Request: ${JSON.stringify(err.request)}`
          : `Error: ${err.message}`;
        setError(`Failed to load team data: ${err.message}\n${debugMsg}`);
        console.error('[AdminDashboard] Error loading team:', err, debugMsg);
      } finally {
        setLoading(false);
      }
    };
    fetchTeam();
  }, []);

  // Handle invite submission
  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail || !team?._id) {
      setInviteStatus("Please enter a valid email address.");
      setTimeout(() => setInviteStatus(null), 3000);
      return;
    }
    if (!/\S+@\S+\.\S+/.test(inviteEmail)) {
      setInviteStatus("Please enter a valid email format.");
      setTimeout(() => setInviteStatus(null), 3000);
      return;
    }
    try {
      const res = await inviteMember(team._id, inviteEmail, inviteRole);
      setInviteStatus(`Invite sent to ${inviteEmail} as ${inviteRole}`);
      // Assuming the API returns these details
      setInviteDetails({
        email: inviteEmail,
        otp: res.otp || "N/A",
        tempPassword: res.tempPassword || "N/A",
        teamCode: team.code,
      });
      setInviteEmail("");
      setInviteRole("developer");
      const updated = await getTeamById(team._id);
      setTeam(updated);
      setTimeout(() => setInviteStatus(null), 3000);
    } catch (err: any) {
      setInviteStatus(err.message || "Failed to invite member");
      setTimeout(() => setInviteStatus(null), 3000);
    }
  };

  // Handle role change
  const handleRoleChange = async (userId: string, newRole: string) => {
    if (!team?._id) return;
    try {
      await changeMemberRole(team._id, userId, newRole);
      const updated = await getTeamById(team._id);
      setTeam(updated);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to update role");
      setTimeout(() => setError(null), 3000);
    }
  };

  // Handle member removal
  const handleRemoveMember = async (userId: string) => {
    if (!team?._id) return;
    try {
      await removeMember(team._id, userId);
      const updated = await getTeamById(team._id);
      setTeam(updated);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to remove member");
      setTimeout(() => setError(null), 3000);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen">
        <Sidebar teamName={team?.name} />
        <main className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-lg text-gray-600">Loading team data...</div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen">
        <Sidebar teamName={team?.name} />
        <main className="flex-1 flex flex-col items-center justify-center bg-gray-50 p-8">
          <div className="text-lg text-red-600 mb-4">An error occurred</div>
          <pre className="bg-gray-100 text-xs text-gray-800 p-4 rounded border max-w-2xl overflow-x-auto w-full text-left">
            {error}
          </pre>
          <div className="mt-4 text-gray-500">
            If you see a 401 or token error, your login session may be invalid or expired. Try logging out and in again. If this persists, share this error with your developer.
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <Sidebar teamName={team?.name} />
      <main className="flex-1 bg-gray-50 overflow-y-auto p-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 p-6 bg-gradient-to-r from-blue-700 to-blue-500 rounded-2xl shadow-lg">
          <div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight mb-1">NeuralBI Admin Dashboard</h1>
            <div className="text-lg text-blue-100 font-medium">Manage your team, invites, and roles in real time</div>
          </div>
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex flex-col items-center bg-white/20 px-6 py-2 rounded-xl shadow border border-blue-300">
              <span className="text-xs text-blue-100 uppercase tracking-wider">Current Time</span>
              <span className="font-mono text-2xl text-white">{clock.format('YYYY-MM-DD HH:mm:ss')}</span>
              <span className="text-xs text-blue-200">(Your Timezone: {clock.format('z')})</span>
            </div>
            <div className="flex flex-col items-center bg-white/20 px-6 py-2 rounded-xl shadow border border-blue-300">
              <span className="text-xs text-blue-100 uppercase tracking-wider">Team Code</span>
              <span className="font-mono text-2xl text-white">{team?.code}</span>
            </div>
          </div>
        </header>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow p-6 flex flex-col items-center border-t-4 border-blue-500">
            <div className="text-2xl font-bold text-blue-700">{team?.members.length}</div>
            <div className="text-gray-600">Total Members</div>
          </div>
          <div className="bg-white rounded-2xl shadow p-6 flex flex-col items-center border-t-4 border-green-500">
            <div className="text-xl font-semibold text-green-700">
              {team?.members.filter((m) => m.role === 'developer').length}
            </div>
            <div className="text-gray-600">Developers</div>
          </div>
          <div className="bg-white rounded-2xl shadow p-6 flex flex-col items-center border-t-4 border-yellow-500">
            <div className="text-xl font-semibold text-yellow-700">
              {team?.members.filter((m) => m.role === 'tester').length}
            </div>
            <div className="text-gray-600">Testers</div>
          </div>
          <div className="bg-white rounded-2xl shadow p-6 flex flex-col items-center border-t-4 border-purple-500 md:col-span-1">
            <div className="text-xl font-semibold text-purple-700">
              {team?.members.filter((m) => m.role === 'product_owner').length}
            </div>
            <div className="text-gray-600">Product Owners</div>
          </div>
        </div>

        {/* Invite & Members Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-blue-100">
            <h2 className="text-xl font-bold text-blue-700 mb-4">Invite Team Member</h2>
            <form onSubmit={handleInvite}>
              <div className="flex flex-col gap-2 mb-4">
                <label htmlFor="invite-email" className="text-sm font-medium">Email:</label>
                <Input
                  id="invite-email"
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="Enter email address"
                />
              </div>
              <div className="flex flex-col gap-2 mb-4">
                <label htmlFor="invite-role" className="text-sm font-medium">Role:</label>
                <Select value={inviteRole} onValueChange={setInviteRole}>
                  <SelectTrigger id="invite-role">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRoles.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="bg-blue-600 text-white">
                Invite
              </Button>
            </form>
            {inviteStatus && (
              <div className={`mt-2 ${inviteStatus.includes('Failed') ? 'text-red-600' : 'text-green-600'}`}>
                {inviteStatus}
              </div>
            )}
            {inviteDetails && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-300 rounded shadow text-blue-900 relative">
                <button
                  onClick={() => setInviteDetails(null)}
                  className="absolute top-2 right-2 text-blue-400 hover:text-blue-700"
                  aria-label="Close invite details"
                >
                  ×
                </button>
                <div className="font-semibold mb-2">
                  Share these credentials with the invited member:
                </div>
                <div><b>Email:</b> {inviteDetails.email}</div>
                <div><b>OTP:</b> {inviteDetails.otp}</div>
                <div><b>Temp Password:</b> {inviteDetails.tempPassword}</div>
                <div><b>Team Code:</b> {inviteDetails.teamCode}</div>
                <div className="text-xs mt-2 text-gray-500">
                  The invited member must use these to log in for the first time.
                </div>
              </div>
            )}
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-blue-700 mb-4">Team Members</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-xl shadow text-sm">
                <thead className="bg-blue-50">
                  <tr>
                    <th className="py-3 px-4 font-semibold text-blue-700 text-left">Email</th>
                    <th className="py-3 px-4 font-semibold text-blue-700 text-left">Role</th>
                    <th className="py-3 px-4 font-semibold text-blue-700 text-left">Last Login</th>
                    <th className="py-3 px-4 font-semibold text-blue-700 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {team?.members.map((member) => (
                    <tr key={member._id} className="hover:bg-blue-100/40 transition">
                      <td className="py-2 px-4 border-b font-mono text-gray-800">{member.email}</td>
                      <td className="py-2 px-4 border-b capitalize text-blue-700 font-medium">
                        {member.role.replace('_', ' ')}
                      </td>
                      <td className="py-2 px-4 border-b font-mono text-gray-700">
                        {member.lastLogin ? dayjs(member.lastLogin).format('YYYY-MM-DD HH:mm:ss') : (
                          <span className="italic text-gray-400">Never</span>
                        )}
                      </td>
                      <td className="py-2 px-4 border-b">
                        <Select
                          value={member.role}
                          onValueChange={(value) => handleRoleChange(member._id, value)}
                          disabled={loading}
                        >
                          <SelectTrigger className="text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {availableRoles.map((role) => (
                              <SelectItem key={role.value} value={role.value}>
                                {role.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          className="ml-2 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                          onClick={() => handleRemoveMember(member._id)}
                          disabled={loading}
                        >
                          Remove
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;