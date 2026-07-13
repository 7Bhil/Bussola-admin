import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
    timeout: 30000, // Augmenté à 30s pour supporter les uploads d'images
})

// Attach JWT token from localStorage to each request if present
api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers = config.headers || {}
      config.headers.Authorization = `Bearer ${token}`
    }
  } catch (e) {
    // ignore
  }
  return config
}, (error) => Promise.reject(error))

export default api
