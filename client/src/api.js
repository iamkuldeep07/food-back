// src/api.js
import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  timeout: 15000,
  // DO NOT set Content-Type globally for multipart file uploads
});

API.interceptors.request.use((cfg) => {
  const token = localStorage.getItem("fb_token");
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

export const setAuthToken = (token) => {
  if (token) API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  else delete API.defaults.headers.common["Authorization"];
};

export default API;