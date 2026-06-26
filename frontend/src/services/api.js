/**
 * services/api.js
 * Centralised Axios instance + all API call functions.
 * Base URL proxied through Vite → http://localhost:8000
 */

import axios from 'axios'
import pythonApi from "./pythonApi";
import javaApi from "./javaApi";

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT from localStorage to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('se_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// On 401, clear auth and redirect to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('se_token')
      localStorage.removeItem('se_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// ── Auth ──────────────────────────────────────────────────────────────────
export const authAPI = {
  login: (data) => javaApi.post("/auth/login", data),
  register: (data) => javaApi.post("/auth/register", data),
  me: () => javaApi.get("/auth/me"),
}

// ── Jobs ──────────────────────────────────────────────────────────────────
export const jobsAPI = {
  list: (params) => pythonApi.get("/jobs/", { params }),

  upload: (file) => {
    const fd = new FormData();
    fd.append("file", file);

    return pythonApi.post("/jobs/upload", fd, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  companies: () => pythonApi.get("/jobs/companies"),
  roles: () => pythonApi.get("/jobs/roles"),
  delete: (id) => pythonApi.delete(`/jobs/${id}`),
};

// ── Skills ────────────────────────────────────────────────────────────────
export const skillsAPI = {
  analyze: (data) => pythonApi.post('/skills/analyze', data),
  predict: (data) => pythonApi.post('/skills/predict', data),
  trends:  ()     => pythonApi.get('/skills/trends'),
  top:     (n)    => pythonApi.get('/skills/top', { params: { limit: n || 20 } }),
}

// ── Chat ──────────────────────────────────────────────────────────────────
export const chatAPI = {
  send:         (message) => pythonApi.post('/chat/message', { message }),
  history:      ()        => pythonApi.get('/chat/history'),
  clearHistory: ()        => pythonApi.delete('/chat/history'),
}

// ── User ──────────────────────────────────────────────────────────────────
export const userAPI = {
  data:         ()       => pythonApi.get('/user/data'),
  updateSkills: (skills) => pythonApi.put('/user/skills', { skills }),
  stats:        ()       => pythonApi.get('/user/stats'),
  deleteAccount:()       => pythonApi.delete('/user/account'),
}

export default api
