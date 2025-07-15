import { create } from 'zustand'
import { axiosInstance } from '@/lib/axios'

export const useAuthStore = create((set) => ({
  user: null,
  loading: true,

  // ✅ Fetch user info from /api/me
  fetchUser: async () => {
    try {
      const res = await axiosInstance.get('/auth/me', { withCredentials: true })
      set({ user: res.data, loading: false })
    } catch (err) {
      set({ user: null, loading: false })
    }
  },

  // ✅ Login and fetch user immediately
  login: async (sapId,password) => {
    try {
      await axiosInstance.post('/auth/login',{ sapId, password }, { withCredentials: true })
      await useAuthStore.getState().fetchUser()
      return { success: true }
    } catch (err) {
      return { success: false, error: err.response?.data?.message || "Login failed" }
    }
  },

  // ✅ Signup and fetch user immediately
  signup: async (userData) => {
    try {
      await axiosInstance.post('/auth/register', userData, { withCredentials: true })
      await useAuthStore.getState().fetchUser()
      return { success: true }
    } catch (err) {
      return { success: false, error: err.response?.data?.message || "Signup failed" }
    }
  },

  // ✅ Logout and clear user state
  logout: async () => {
    try {
      await axiosInstance.post('/api/logout', {}, { withCredentials: true })
    } catch (err) {
      // silent fail is okay
    }
    set({ user: null })
  },
}))
