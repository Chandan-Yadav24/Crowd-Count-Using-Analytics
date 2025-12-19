const API_BASE_URL = 'http://127.0.0.1:8000/api';

export const api = {
  // Auth
  login: async (username: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Login failed');
    }
    return response.json();
  },

  register: async (username: string, email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Registration failed');
    }
    return response.json();
  },

  // Videos
  uploadVideo: async (username: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('username', username);

    const response = await fetch(`${API_BASE_URL}/video/upload`, {
      method: 'POST',
      body: formData,
    });
    return response.json();
  },

  listVideos: async (username: string) => {
    const response = await fetch(`${API_BASE_URL}/video/list/${username}`);
    return response.json();
  },

  deleteVideo: async (videoId: number) => {
    const response = await fetch(`${API_BASE_URL}/video/delete/${videoId}`, {
      method: 'DELETE',
    });
    return response.json();
  },

  // Zones
  createZone: async (username: string, videoId: number, label: string, coordinates: number[][]) => {
    const response = await fetch(`${API_BASE_URL}/zone/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, video_id: videoId, label, coordinates }),
    });
    return response.json();
  },

  listZones: async (videoId: number) => {
    const response = await fetch(`${API_BASE_URL}/zone/list/${videoId}`);
    return response.json();
  },

  deleteZone: async (zoneId: number) => {
    const response = await fetch(`${API_BASE_URL}/zone/${zoneId}`, {
      method: 'DELETE',
    });
    return response.json();
  },

  // Admin
  listUsers: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/users`);
    if (!response.ok) throw new Error('Failed to fetch users');
    return response.json();
  },

  addUser: async (username: string, email: string, password: string, role: string) => {
    const response = await fetch(`${API_BASE_URL}/admin/add_user?role=${role}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to add user');
    }
    return response.json();
  },

  deleteUser: async (username: string) => {
    const response = await fetch(`${API_BASE_URL}/admin/delete_user/${username}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to delete user');
    }
    return response.json();
  },

  updateUser: async (username: string, data: { email?: string; role?: string; password?: string }) => {
    const response = await fetch(`${API_BASE_URL}/admin/update_user/${username}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to update user');
    }
    return response.json();
  },

  // User Account Management
  changeUsername: async (username: string, newUsername: string) => {
    const response = await fetch(`${API_BASE_URL}/change_username?username=${username}&new_username=${newUsername}`, {
      method: 'PUT',
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to change username');
    }
    return response.json();
  },

  changePassword: async (username: string, oldPassword: string, newPassword: string) => {
    const response = await fetch(`${API_BASE_URL}/change_password?username=${username}&old_password=${oldPassword}&new_password=${newPassword}`, {
      method: 'PUT',
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to change password');
    }
    return response.json();
  },

  deleteAccount: async (username: string) => {
    const response = await fetch(`${API_BASE_URL}/delete_account/${username}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to delete account');
    }
    return response.json();
  },
};
