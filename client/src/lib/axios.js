import axios from "axios"

// Create axios instance with base URL
export const axiosInstance = axios.create({
  baseURL: "https://9fbf264f7bb4.ngrok-free.app/api/v1",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true
});

