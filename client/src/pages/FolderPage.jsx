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

  const {
    currentItems,
    currentFolder,
    breadcrumbs,
    searchQuery,
    filters,
    isLoading,
    isFiltering,
    getFolderContents,
    clearFilters,
  } = useFileStore()

  const { viewMode } = useViewStore()
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false)
  const [isFileUploadOpen, setIsFileUploadOpen] = useState(false)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [fileForMetadata, setFileForMetadata] = useState(null)
  const [hasLoadedContent, setHasLoadedContent] = useState(false)

  useEffect(() => {
    const loadContent = async () => {
      if (authLoading || hasLoadedContent) return

      const isValidFolderId =
        folderId && folderId !== "undefined" && folderId !== "null" && folderId.trim() !== ""

      if (isValidFolderId) {
        const success = await getFolderContents(folderId)
        if (!success) {
          navigate("/folders")
        } else {
          setHasLoadedContent(true)
        }
      } else {
        console.warn("[FOLDERPAGE] Invalid folderId, skipping load.")
      }
    }

    loadContent()
  }, [authLoading, folderId, getFolderContents, navigate, hasLoadedContent])

  useEffect(() => {
    const isValid = folderId && folderId !== "undefined" && folderId !== "null" && folderId.trim() !== ""
    if (isValid) {
      setHasLoadedContent(false)
    }
  }, [folderId])

  const handleFileClick = (file) => {
    if (file.type === "folder") {
      if (!file.id || file.id === "undefined" || file.id === "null") {
        toast.error("Cannot open folder: Invalid folder ID")
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

  const handleBackClick = () => {
    if (!breadcrumbs || breadcrumbs.length <= 1) {
      navigate("/folders")
      return
    }

    const parent = breadcrumbs[breadcrumbs.length - 2]
    if (!parent.id) {
      navigate("/folders")
    } else {
      navigate(`/folders/${parent.id}`)
    }
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

  const canGoBack = breadcrumbs && breadcrumbs.length > 1

  if (authLoading || (!hasLoadedContent && isLoading)) {
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

        {safeIsFiltering && (
          <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Applying filters...
          </div>
        )}
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
              <h3 className="mb-2 text-xl font-semibold">Empty folder</h3>
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
