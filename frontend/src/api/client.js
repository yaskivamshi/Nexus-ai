// src/api/client.js
// Axios instance pre-configured to talk to our FastAPI backend
import axios from 'axios'
import { supabase } from '../lib/supabase'

const api = axios.create({
  // Tries to read the environment variable first; falls back to your live server if it's not set
  baseURL: import.meta.env.VITE_API_URL || "https://nexus-ai-api-gamma.vercel.app",
  headers: { 'Content-Type': 'application/json' },
})

// Before every request, attach the Supabase JWT token for auth
api.interceptors.request.use(async (config) => {
  const { data } = await supabase.auth.getSession()
  if (data.session?.access_token) {
    config.headers.Authorization = `Bearer ${data.session.access_token}`
  }
  return config
})

// Global error handler — catches 401 Unauthorized, etc.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      supabase.auth.signOut()
    }
    return Promise.reject(error)
  }
)

export default api