// src/components/auth/ProtectedRoute.jsx
import { Navigate, replace } from "react-router-dom"
import { useAuthStore } from "@/store/useAuthStore"
import { Loader } from "lucide-react"
const ProtectedRoute = ({ children }) => {
  const {user,loading} = useAuthStore()
  if (loading) return <Loader/>
  return (user) ? children : <Navigate to={"/login"} replace/>
}

export default ProtectedRoute
