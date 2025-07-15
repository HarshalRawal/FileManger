import axios from "axios";

// ✅ Secure, custom domain
export const axiosInstance = axios.create({
  baseURL: "https://filemanager.harshal.app/api/v1",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true // Required if using cookies for auth
});



