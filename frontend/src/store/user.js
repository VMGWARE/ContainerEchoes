// Utilities
import { defineStore } from "pinia";
import axios from "axios";
if (process.env.NODE_ENV === "development") {
  axios.defaults.baseURL = "http://localhost:5000/";
} else {
  axios.defaults.baseURL = "/api";
}

export const useUserStore = defineStore("user", {
  state: () => ({
    user: JSON.parse(localStorage.getItem("user")) || [],
    token: localStorage.getItem("token") || null,
    loggedIn: !!localStorage.getItem("token"),
  }),
  getters: {
    getUser: (state) => state.user,
    getToken: (state) => state.token,
    isLoggedIn: (state) => state.loggedIn,
    isSuperUser: (state) => state.user?.superuser || false,
  },
  mutations: {
    setToken(state, token) {
      axios.defaults.headers.common["Authorization"] = token
        ? `Bearer ${token}`
        : null;
      state.token = token;
    },
    setUser(state, user) {
      state.user = user;
    },
    setLoggedIn(state, loggedIn) {
      state.loggedIn = loggedIn;
    },
  },
  // Actions
  actions: {
    async login({ commit }, credentials) {
      try {
        const response = await axios.post("/auth/login", credentials);
        var resp = response.data;

        if (resp.code != 200) {
          return resp;
        } else {
          const token = resp.data.token;
          const user = resp.data.user;

          // Set the values
          commit("setToken", token);
          commit("setUser", user);
          commit("setLoggedIn", true);

          // Store the token and user in localStorage
          localStorage.setItem("token", token);
          localStorage.setItem("user", JSON.stringify(user));

          // Set the axios defaults for headers
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

          // Set the token cookie for aslong as the token is valid, default is 1 day
          const date = new Date();
          date.setDate(date.getDate() + 1);
          document.cookie = `token=${token}; expires=${date.toUTCString()}`;

          // Return the response
          return resp;
        }
      } catch (error) {
        return error;
      }
    },
    logout() {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      this.user = [];
      this.token = null;
      this.loggedIn = false;
    },
  },
  persist: true,
});
