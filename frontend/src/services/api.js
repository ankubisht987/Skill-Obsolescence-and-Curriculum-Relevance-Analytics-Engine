/**
 * services/api.js
 * Centralised Axios instance + all API call functions.
 * Base URL proxied through Vite → http://localhost:8000
 */

import axios from 'axios'

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
  register: (data) => api.post('/auth/register', data),
  login:    (data) => api.post('/auth/login',    data),
  me:       ()     => api.get('/auth/me'),
}

// ── Jobs ──────────────────────────────────────────────────────────────────
export const jobsAPI = {
  list:      (params) => api.get('/jobs/', { params }),
  upload:    (file)   => {
    const fd = new FormData()
    fd.append('file', file)
    return api.post('/jobs/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
  },
  companies: () => api.get('/jobs/companies'),
  roles:     () => api.get('/jobs/roles'),
  delete:    (id) => api.delete(`/jobs/${id}`),
}

// ── Skills ────────────────────────────────────────────────────────────────
export const skillsAPI = {
  analyze: (data) => api.post('/skills/analyze', data),
  predict: (data) => api.post('/skills/predict', data),
  trends:  ()     => api.get('/skills/trends'),
  top:     (n)    => api.get('/skills/top', { params: { limit: n || 20 } }),
}

// ── Chat ──────────────────────────────────────────────────────────────────
export const chatAPI = {
  send:         (message) => api.post('/chat/message', { message }),
  history:      ()        => api.get('/chat/history'),
  clearHistory: ()        => api.delete('/chat/history'),
}

// ── User ──────────────────────────────────────────────────────────────────
export const userAPI = {
  data:         ()       => api.get('/user/data'),
  updateSkills: (skills) => api.put('/user/skills', { skills }),
  stats:        ()       => api.get('/user/stats'),
  deleteAccount:()       => api.delete('/user/account'),
}

export default api
