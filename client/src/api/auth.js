import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:4000/api/v1", // change to your actual backend
  withCredentials: true, // ⬅️ needed to send cookies (for auth)
});

export const registerUser = (data) => API.post("/auth/register", data);
export const loginUser = (data) => API.post("/auth/login", data);
