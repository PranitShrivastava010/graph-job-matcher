import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  getDemoProfiles: () => api.get('/auth/demo-profiles')
};

export const jobAPI = {
  getJobs: (params) => api.get('/jobs', { params }),
  getDirectMatches: (params) => api.get('/jobs/direct-matches', { params }),
  getRelatedMatches: (params) => api.get('/jobs/related-matches', { params }),
  getSkillGap: () => api.get('/jobs/skill-gap'),
  getJobDetail: (id) => api.get(`/jobs/${id}`)
};

export const skillAPI = {
  getAllSkills: () => api.get('/skills'),
  updateUserSkills: (skills) => api.put('/skills/me', { skills })
};

export const graphAPI = {
  getGraphData: () => api.get('/graph/explore'),
  getHealth: () => api.get('/graph/health')
};

export default api;
