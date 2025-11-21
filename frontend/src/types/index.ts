export interface User {
  id: number;
  username: string;
  email: string;
  role: 'user' | 'admin' | 'superadmin';
}

export interface Video {
  id: number;
  filename: string;
  filepath: string;
  status: string;
  uploaded_at: string;
}

export interface Zone {
  id: number;
  label: string;
  coordinates: number[][];
  video_id: number;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  role: string;
}
