import axios from "axios";
export const axiosInstance = axios.create({
  baseURL: "https://dd0ea2faa0c8.ngrok-free.app/api/v1",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});


