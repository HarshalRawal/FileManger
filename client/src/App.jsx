"use client"

import { useEffect } from "react"
import { Routes, Route, Navigate } from "react-router-dom"
import { ThemeProvider } from "./components/Theme/Theme-Provider"
import { Toaster } from "sonner"

import Layout from "./components/layout/Layout"
import FolderPage from "./pages/FolderPage"
import NotFoundPage from "./pages/NotFoundPage"
import Login from "./pages/Login"
import SignUp from "./pages/SignUp"
import RootFolderPage from "./pages/RootFolderPage"
import { useAuthStore } from "./store/useAuthStore"

function ProtectedRoute({ children }) {
  const user = useAuthStore((state) => state.user)
  const loading = useAuthStore((state) => state.loading)

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return user ? children : <Navigate to="/login" replace />
}

function App() {
  const fetchUser = useAuthStore((state) => state.fetchUser)
  const loading = useAuthStore((state) => state.loading)

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <ThemeProvider defaultTheme="light" storageKey="file-manager-theme">
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Protected Layout */}
        <Route  
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          {/* Redirect root to folders */}
          <Route index element={<Navigate to="/folders" replace />} />

          {/* Protected Routes */}
          <Route path="folders" element={<RootFolderPage />} />
          <Route path="folders/:folderId" element={<FolderPage />} />
          <Route path="starred" element={<FolderPage view="starred" />} />
          <Route path="recent" element={<FolderPage view="recent" />} />
          <Route path="trash" element={<FolderPage view="trash" />} />

          {/* Catch-all 404 inside layout */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
      <Toaster richColors position="top-right" />
    </ThemeProvider>
  )
}

export default App
