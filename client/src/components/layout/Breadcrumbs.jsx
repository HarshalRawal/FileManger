"use client"

import { useNavigate } from "react-router-dom"
import { ChevronRight, Home } from "lucide-react"
import { Button } from "../ui/button"
import { useFileStore } from "../../store/fileStore"

export default function Breadcrumbs() {
  const { breadcrumbs, isLoading, navigateToBreadcrumb } = useFileStore()
  const navigate = useNavigate()

  console.log("[BREADCRUMBS] Component render - breadcrumbs:", breadcrumbs)

  if (!breadcrumbs || breadcrumbs.length === 0) {
    console.log("[BREADCRUMBS] No breadcrumbs, returning null")
    return null
  }

  const handleBreadcrumbClick = async (index, crumb) => {
    console.log("[BREADCRUMBS] Breadcrumb clicked:", { index, crumb })

    if (isLoading) {
      console.log("[BREADCRUMBS] Loading in progress, ignoring click")
      return
    }

    if (crumb.id === null) {
      console.log("[BREADCRUMBS] Navigating to root via navigate('/folders')")
      // Navigate to root
      navigate("/folders")
    } else {
      console.log("[BREADCRUMBS] Navigating to folder:", crumb.id)
      // Navigate to specific folder
      navigate(`/folders/${crumb.id}`)
    }
  }

  return (
    <nav className="flex items-center space-x-1 text-sm text-muted-foreground mb-4 overflow-x-auto">
      {breadcrumbs.map((crumb, index) => (
        <div key={crumb.id || "root"} className="flex items-center">
          {index > 0 && <ChevronRight className="h-4 w-4 mx-1 flex-shrink-0" />}
          <Button
            variant="ghost"
            size="sm"
            className="h-auto p-1 font-normal hover:text-foreground whitespace-nowrap"
            onClick={() => handleBreadcrumbClick(index, crumb)}
            disabled={isLoading}
          >
            {index === 0 ? (
              <div className="flex items-center gap-1">
                <Home className="h-4 w-4" />
                {crumb.name}
              </div>
            ) : (
              crumb.name
            )}
          </Button>
        </div>
      ))}
    </nav>
  )
}
