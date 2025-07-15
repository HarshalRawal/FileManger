import axios from "axios"

// Create axios instance with base URL
export const axiosInstance = axios.create({
  baseURL: "http://13.203.74.174:4000/api/v1",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials : true
})

