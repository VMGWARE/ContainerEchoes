// Utilities
import { defineStore } from "pinia";

export const useUserStore = defineStore("user", {
  state: () => ({
    user: JSON.parse(localStorage.getItem("user")) || [],
    token: localStorage.getItem("token") || null,
    loggedIn: !!localStorage.getItem("token"),
  }),
  getters: {
    user: (state) => state.user,
    token: (state) => state.token,
    isLoggedIn: (state) => state.loggedIn,
  },
  // Actions
  actions: {
    logout() {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      this.user = [];
      this.token = null;
      this.loggedIn = false;
    },
  },
});
