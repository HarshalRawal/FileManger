"use client"

import { useEffect, useState } from "react"
import { useParams, useNavigate, useLocation } from "react-router-dom"
import { useFileStore } from "@/store/fileStore"
import { useViewStore } from "../store/viewStore"
import Breadcrumbs from "../components/layout/Breadcrumbs"
import FileGrid from "../components/files/FileGrid"
import FileList from "../components/files/FileList"
import CreateFolderDialog from "../components/dialogs/CreateFolderDialog"
import FileUploadDialog from "../components/dialogs/FileUploadDialog"
import FilePreviewDialog from "../components/dialogs/FilePreviewDialog"
import FileMetadataDialog from "../components/dialogs/FileMetadataDialog"
import FilterPanel from "@/components/Filters/FilterPanel"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import { Plus, Loader2, ArrowLeft, Filter, X } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu"
import { toast } from "sonner"
import { useAuthStore } from "../store/useAuthStore"

export default function FolderPage({ view = "default" }) {
  const { folderId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const authLoading = useAuthStore((state) => state.loading)
  const user = useAuthStore((state) => state.user)

  console.log("[FOLDERPAGE] Component render - folderId:", folderId, "pathname:", location.pathname)

  const {
    currentItems,
    currentFolder,
    breadcrumbs,
    searchQuery,
    filters,
    isLoading,
    isFiltering,
    getRootFolders,
    getFolderContents,
    clearFilters,
  } = useFileStore()

  const { viewMode } = useViewStore()
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false)
  const [isFileUploadOpen, setIsFileUploadOpen] = useState(false)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [fileForMetadata, setFileForMetadata] = useState(null)

  // Track if we've attempted to load content for the current folderId
  const [hasLoadedContent, setHasLoadedContent] = useState(false)

  // Load folder contents based on URL params
  useEffect(() => {
    console.log("[FOLDERPAGE] useEffect triggered")
    console.log("[FOLDERPAGE] - folderId:", folderId)
    console.log("[FOLDERPAGE] - hasLoadedContent:", hasLoadedContent)
    console.log("[FOLDERPAGE] - authLoading:", authLoading)
    console.log("[FOLDERPAGE] - pathname:", location.pathname)
    console.log("[FOLDERPAGE] - user:", user)

    const loadContent = async () => {
      console.log("[FOLDERPAGE] loadContent function called")

      // Wait for auth to load
      if (authLoading) {
        console.log("[FOLDERPAGE] Waiting for auth to load, returning early")
        return
      }

      // Prevent double-loading
      if (hasLoadedContent) {
        console.log("[FOLDERPAGE] Content already loaded, returning early")
        return
      }

      const isValidFolderId = folderId && folderId !== "undefined" && folderId !== "null" && folderId.trim() !== ""

      console.log("[FOLDERPAGE] isValidFolderId:", isValidFolderId)

      if (isValidFolderId) {
        console.log("[FOLDERPAGE] Loading content for folderId:", folderId)
        const success = await getFolderContents(folderId)
        if (!success) {
          console.error("[FOLDERPAGE] Failed to load folder contents for:", folderId)
          navigate("/folders")
        } else {
          console.log("[FOLDERPAGE] Successfully loaded folder contents")
          setHasLoadedContent(true)
        }
      } else {
        // Call getRootFolders ONLY if it's truly undefined (initial page load or root navigation)
        if (typeof folderId === "undefined") {
          console.warn("[FOLDERPAGE] ⚠️ CALLING getRootFolders() because folderId is truly undefined")
          console.log("[FOLDERPAGE] Stack trace:", new Error().stack)
          await getRootFolders()
          setHasLoadedContent(true)
        } else {
          console.warn("[FOLDERPAGE] Skipping getRootFolders due to invalid folderId:", folderId)
        }
      }
    }

    loadContent()
  }, [authLoading, folderId, getRootFolders, getFolderContents, navigate, hasLoadedContent, location.pathname, user])

  // Conditionally reset hasLoadedContent on valid folderId changes
  useEffect(() => {
    console.log("[FOLDERPAGE] Second useEffect - resetting hasLoadedContent")
    console.log("[FOLDERPAGE] - folderId:", folderId)

    const isValid = folderId && folderId !== "undefined" && folderId !== "null" && folderId.trim() !== ""

    console.log("[FOLDERPAGE] - isValid:", isValid)

    if (isValid) {
      console.log("[FOLDERPAGE] Resetting hasLoadedContent to false")
      setHasLoadedContent(false)
    }
  }, [folderId])

  const handleFileClick = async (file) => {
    console.log("File clicked:", file)

    if (file.type === "folder") {
      // Validate folder ID before navigation
      if (!file.id || file.id === "undefined" || file.id === "null") {
        console.error("Invalid folder ID:", file.id)
        toast.error("Cannot open folder: Invalid folder ID")
        return
      }

      console.log("Navigating to folder with ID:", file.id)
      navigate(`/folders/${file.id}`)
    } else {
      console.log(`selected File : ${JSON.stringify(file)}`)
      setSelectedFile(file)
    }
  }

  const handleMetadataEdit = (file) => {
    setFileForMetadata(file)
  }

  const handleBackClick = async () => {
    console.log("Back button clicked, current breadcrumbs:", breadcrumbs)

    if (!breadcrumbs || breadcrumbs.length <= 1) {
      navigate("/folders")
      return
    }

    // Get parent breadcrumb
    const parentBreadcrumb = breadcrumbs[breadcrumbs.length - 2]
    console.log("Navigating to parent:", parentBreadcrumb)

    if (parentBreadcrumb.id === null) {
      navigate("/folders")
    } else {
      navigate(`/folders/${parentBreadcrumb.id}`)
    }
  }

  const handleClearFilters = () => {
    clearFilters()
    toast.success("Filters cleared")
  }

  // Calculate active filter count
  const getActiveFilterCount = () => {
    // Add fallback for filters
    const safeFilters = filters || {
      fileTypes: [],
      tags: [],
      dateRange: { from: null, to: null },
      sizeRange: { min: null, max: null },
      owner: null,
    }

    let count = 0
    if (safeFilters.fileTypes?.length > 0) count++
    if (safeFilters.tags?.length > 0) count++
    if (safeFilters.dateRange?.from || safeFilters.dateRange?.to) count++
    if (safeFilters.sizeRange?.min || safeFilters.sizeRange?.max) count++
    if (safeFilters.owner) count++
    return count
  }

  const activeFilterCount = getActiveFilterCount()
  const hasActiveFilters = activeFilterCount > 0
  const safeIsFiltering = isFiltering || false

  // Ensure currentItems is always an array before filtering
  const safeCurrentItems = Array.isArray(currentItems) ? currentItems : []

  // Filter items based on search query
  const filteredItems = searchQuery
    ? safeCurrentItems.filter((item) => {
        // Ensure item and item.name exist before filtering
        return item && item.name && item.name.toLowerCase().includes(searchQuery.toLowerCase())
      })
    : safeCurrentItems

  // Sort items to display folders first, then files
  const sortedItems = [...filteredItems].sort((a, b) => {
    // Ensure both items exist and have names
    if (!a || !b) return 0

    const aName = a.name || ""
    const bName = b.name || ""
    const aType = a.type || ""
    const bType = b.type || ""

    // If both are folders or both are files, sort alphabetically
    if ((aType === "folder" && bType === "folder") || (aType !== "folder" && bType !== "folder")) {
      return aName.localeCompare(bName)
    }
    // Folders come before files
    return aType === "folder" ? -1 : 1
  })

  const canGoBack = breadcrumbs && breadcrumbs.length > 1

  // Show loading only if auth is loading OR if we haven't loaded content yet
  if (authLoading || (!hasLoadedContent && isLoading)) {
    console.log("[FOLDERPAGE] Showing loading screen")
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin h-8 w-8" />
      </div>
    )
  }

  console.log("[FOLDERPAGE] Rendering main content")

  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0 p-4 border-b bg-background">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {canGoBack && (
              <Button variant="ghost" size="icon" onClick={handleBackClick} disabled={isLoading} className="mr-2">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <div>
              <h1 className="text-2xl font-bold">{currentFolder ? currentFolder.name : "My Drive"}</h1>
              {currentFolder && (
                <p className="text-sm text-muted-foreground">
                  {currentFolder.noOfChildren || 0} folders, {currentFolder.noOfFiles || 0} files
                </p>
              )}
            </div>
            {(isLoading || safeIsFiltering) && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
          </div>

          <div className="flex items-center gap-2">
            {/* Filter Button */}
            <Button
              variant={hasActiveFilters ? "default" : "outline"}
              onClick={() => setIsFilterOpen(true)}
              disabled={isLoading}
              className="relative"
            >
              <Filter className="mr-2 h-4 w-4" />
              Filter
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" disabled={isLoading}>
                  <Plus className="mr-2 h-4 w-4" />
                  New
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsCreateFolderOpen(true)}>New Folder</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsFileUploadOpen(true)}>File Upload</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Breadcrumbs />

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Filters active:</span>
              <Badge variant="secondary" className="flex items-center gap-1">
                {activeFilterCount} filter{activeFilterCount !== 1 ? "s" : ""}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={handleClearFilters}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            </div>
          )}
        </div>

        {/* Filter Status */}
        {safeIsFiltering && (
          <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Applying filters...
          </div>
        )}
      </div>

      {/* Scrollable content area */}
      <div className="flex-1 overflow-auto">
        <div className="p-4">
          {isLoading && sortedItems.length === 0 ? (
            <div className="flex h-[50vh] flex-col items-center justify-center text-center">
              <Loader2 className="mb-4 h-10 w-10 animate-spin text-primary" />
              <h3 className="mb-2 text-xl font-semibold">Loading...</h3>
              <p className="text-muted-foreground">Fetching folder contents</p>
            </div>
          ) : sortedItems.length === 0 ? (
            <div className="flex h-[50vh] flex-col items-center justify-center text-center">
              <div className="mb-4 rounded-full bg-muted p-6">
                <svg
                  className="h-10 w-10 text-muted-foreground"
                  fill="none"
                  height="24"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  width="24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M5 8h14M5 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM19 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
                  <path d="M19 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
                  <path d="M12 16a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
                  <path d="M5 16a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
                  <path d="M5 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
                  <path d="M12 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
                  <path d="M19 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-semibold">
                {hasActiveFilters ? "No matching files" : currentFolder ? "Empty folder" : "No files or folders"}
              </h3>
              <p className="mb-4 text-muted-foreground">
                {hasActiveFilters
                  ? "No files match your current filters. Try adjusting your filter criteria."
                  : currentFolder
                    ? "This folder is empty. Create a new folder or upload files to get started."
                    : "Create a new folder or upload files to get started"}
              </p>
              <div className="flex gap-2">
                {hasActiveFilters ? (
                  <Button onClick={handleClearFilters}>Clear Filters</Button>
                ) : (
                  <>
                    <Button onClick={() => setIsCreateFolderOpen(true)}>Create Folder</Button>
                    <Button variant="outline" onClick={() => setIsFileUploadOpen(true)}>
                      Upload Files
                    </Button>
                  </>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* Results summary */}
              {(hasActiveFilters || searchQuery) && (
                <div className="mb-4 flex items-center justify-between text-sm text-muted-foreground">
                  <span>
                    Showing {sortedItems.length} result{sortedItems.length !== 1 ? "s" : ""}
                    {searchQuery && ` for "${searchQuery}"`}
                  </span>
                  {hasActiveFilters && (
                    <Button variant="ghost" size="sm" onClick={handleClearFilters}>
                      Clear filters
                    </Button>
                  )}
                </div>
              )}

              {viewMode === "grid" ? (
                <FileGrid items={sortedItems} onFileClick={handleFileClick} onMetadataEdit={handleMetadataEdit} />
              ) : (
                <FileList items={sortedItems} onFileClick={handleFileClick} onMetadataEdit={handleMetadataEdit} />
              )}
            </>
          )}
        </div>
      </div>

      {/* Dialogs */}
      <CreateFolderDialog open={isCreateFolderOpen} onOpenChange={setIsCreateFolderOpen} />
      <FileUploadDialog
        open={isFileUploadOpen}
        onOpenChange={setIsFileUploadOpen}
        onMetadataEdit={handleMetadataEdit}
        categoryId={folderId}
      />
      <FilterPanel open={isFilterOpen} onOpenChange={setIsFilterOpen} />
      {selectedFile && (
        <FilePreviewDialog file={selectedFile} open={!!selectedFile} onOpenChange={() => setSelectedFile(null)} />
      )}
      {fileForMetadata && (
        <FileMetadataDialog
          file={fileForMetadata}
          open={!!fileForMetadata}
          onOpenChange={() => setFileForMetadata(null)}
        />
      )}
    </div>
  )
}
