// Utilities
import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  state: () => ({
    publicRoutes: ['/login', '/register', '/forgot-password', '/reset-password'],
    adminRoutes: ['/admin'],
  }),
  persist: true,
})
