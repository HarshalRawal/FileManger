"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
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
import { Plus, Loader2, Filter, X } from "lucide-react"
import { toast } from "sonner"
import { useAuthStore } from "../store/useAuthStore"

export default function RootFolderPage() {
  const navigate = useNavigate()
  const authLoading = useAuthStore((state) => state.loading)
  const user = useAuthStore((state) => state.user)

  const {
    currentItems,
    breadcrumbs,
    filters,
    searchQuery,
    isLoading,
    isFiltering,
    getRootFolders,
    clearFilters,
  } = useFileStore()

  const { viewMode } = useViewStore()

  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false)
  const [isFileUploadOpen, setIsFileUploadOpen] = useState(false)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [fileForMetadata, setFileForMetadata] = useState(null)

  useEffect(() => {
    if (!authLoading && user) {
      getRootFolders()
    }
  }, [authLoading, user, getRootFolders])

  const handleFileClick = (file) => {
    if (file.type === "folder") {
      if (!file.id) {
        toast.error("Invalid folder ID")
        return
      }
      navigate(`/folders/${file.id}`)
    } else {
      setSelectedFile(file)
    }
  }

  const handleMetadataEdit = (file) => {
    setFileForMetadata(file)
  }

  const handleClearFilters = () => {
    clearFilters()
    toast.success("Filters cleared")
  }

  const getActiveFilterCount = () => {
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
  const safeCurrentItems = Array.isArray(currentItems) ? currentItems : []

  const filteredItems = searchQuery
    ? safeCurrentItems.filter((item) =>
        item?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : safeCurrentItems

  const sortedItems = [...filteredItems].sort((a, b) => {
    const aType = a.type || ""
    const bType = b.type || ""
    const aName = a.name || ""
    const bName = b.name || ""

    if ((aType === "folder" && bType === "folder") || (aType !== "folder" && bType !== "folder")) {
      return aName.localeCompare(bName)
    }
    return aType === "folder" ? -1 : 1
  })

  if (authLoading || isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin h-8 w-8" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0 p-4 border-b bg-background">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div>
              <h1 className="text-2xl font-bold">My Drive</h1>
            </div>
            {(isLoading || safeIsFiltering) && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
          </div>

          <div className="flex items-center gap-2">
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

            <Button variant="outline" onClick={() => setIsCreateFolderOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Breadcrumbs />

          {hasActiveFilters && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Filters active:</span>
              <Badge variant="secondary" className="flex items-center gap-1">
                {activeFilterCount}
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
      </div>

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
                <svg className="h-10 w-10 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M5 8h14M5 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM19 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
                  <path d="M19 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
                  <path d="M12 16a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
                  <path d="M5 16a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
                  <path d="M5 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
                  <path d="M12 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
                  <path d="M19 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-semibold">No files or folders</h3>
              <p className="mb-4 text-muted-foreground">Create a new folder or upload files to get started.</p>
              <div className="flex gap-2">
                <Button onClick={() => setIsCreateFolderOpen(true)}>Create Folder</Button>
                <Button variant="outline" onClick={() => setIsFileUploadOpen(true)}>Upload Files</Button>
              </div>
            </div>
          ) : (
            <>
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

      <CreateFolderDialog open={isCreateFolderOpen} onOpenChange={setIsCreateFolderOpen} />
      <FileUploadDialog
        open={isFileUploadOpen}
        onOpenChange={setIsFileUploadOpen}
        onMetadataEdit={handleMetadataEdit}
        categoryId={null}
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
