import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App.jsx"
import "./index.css"
import { axiosInstance } from "./lib/axios.js"
import { BrowserRouter } from "react-router-dom"

// Optional: expose globally if needed
window.axiosInstance = axiosInstance

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
