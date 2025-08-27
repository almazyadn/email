import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface LoginRequest {
  username: string;
  password: string;
  email: string;
  ews_url: string;
}

export interface Email {
  subject: string;
  sender: string;
  datetime_received: string;
  is_read: boolean;
}

export interface ScheduleItem {
  Email: string;
  Department: string;
  SunTue: string;
  WedThu: string;
  FriSat: string;
  Shift: string;
  score: number;
}

export const authAPI = {
  login: async (data: LoginRequest) => {
    const response = await api.post('/api/login', data);
    return response.data;
  },
};

export const emailAPI = {
  getEmails: async (folderName: string = 'Inbox') => {
    const response = await api.get(`/api/emails?folder_name=${folderName}`);
    return response.data;
  },
};

export const scheduleAPI = {
  getSchedule: async () => {
    const response = await api.get('/api/schedule');
    return response.data;
  },
  
  updateSchedule: async (schedule: ScheduleItem[]) => {
    const response = await api.post('/api/schedule', { schedule });
    return response.data;
  },
};