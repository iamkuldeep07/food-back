import { create } from "zustand";
import jwtDecode from "jwt-decode";
import { setAuthToken } from "../api";

export const useAuthStore = create((set) => ({
  token: localStorage.getItem("fb_token") || null,
  user: localStorage.getItem("fb_token")
    ? jwtDecode(localStorage.getItem("fb_token"))
    : null,

  setToken: (token) => {
    localStorage.setItem("fb_token", token);
    setAuthToken(token);
    set({ token, user: jwtDecode(token) });
  },

  logout: () => {
    localStorage.removeItem("fb_token");
    setAuthToken(null);
    set({ token: null, user: null });
  }
}));