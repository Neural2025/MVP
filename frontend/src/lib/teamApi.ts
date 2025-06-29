import { api } from './api';

// Fetch teams for the logged-in admin
export const getTeams = async () => {
  const res = await api.get('/api/teams');
  return res.data;
};

// Fetch team details (by teamId)
export const getTeamById = async (teamId: string) => {
  const res = await api.get(`/api/teams/${teamId}`);
  return res.data;
};

// Invite a member to a team
export const inviteMember = async (teamId: string, email: string, role: string) => {
  const res = await api.post(`/api/teams/${teamId}/invite`, { email, role });
  return res.data;
};

// Change a member's role
export const changeMemberRole = async (teamId: string, userId: string, newRole: string) => {
  const res = await api.patch(`/api/teams/${teamId}/role`, { userId, newRole });
  return res.data;
};

// Remove a member from a team
export const removeMember = async (teamId: string, userId: string) => {
  const res = await api.delete(`/api/teams/${teamId}/member/${userId}`);
  return res.data;
};
