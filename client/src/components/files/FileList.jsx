"use client"

import { MoreHorizontal, Folder, FileText, ImageIcon, Film, Music, File, Star, StarOff } from "lucide-react"
import { Button } from "../ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu"
import { formatFileSize, formatDate } from "../../lib/utils"
import { useFileStore } from "../../store/fileStore"
import { toast } from "sonner"

export default function FileList({ items, onFileClick, onMetadataEdit }) {
  const { toggleStarred, deleteItem } = useFileStore()

  const getFileIcon = (type) => {
    switch (type) {
      case "folder":
        return <Folder className="h-5 w-5 text-amber-500" />
      case "document":
      case "pdf":
      case "doc":
      case "docx":
      case "txt":
      case "xlsx":
      case "application/pdf":
        return <FileText className="h-5 w-5 text-blue-500" />
      case "image":
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
        return <ImageIcon className="h-5 w-5 text-green-500" />
      case "video":
      case "mp4":
      case "mov":
      case "avi":
        return <Film className="h-5 w-5 text-red-500" />
      case "audio":
      case "mp3":
      case "wav":
        return <Music className="h-5 w-5 text-purple-500" />
      default:
        return <File className="h-5 w-5 text-gray-500" />
    }
  }

  const handleToggleStar = (e, item) => {
    e.stopPropagation()
    toggleStarred(item.id)
    toast.success(`${item.name} ${item.starred ? "removed from" : "added to"} starred items`)
  }

  const handleDelete = (e, item) => {
    e.stopPropagation()
    deleteItem(item.id)
    toast.success(`${item.name} moved to trash`)
  }

  const handleDownload = async (e, item) => {
    e.stopPropagation()
    const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api"
    const downloadUrl = `${baseUrl}/file/download/${item.id}`

    const link = document.createElement("a")
    link.href = downloadUrl
    link.download = item.name
    link.target = "_blank"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="w-full">
      {/* List container with proper scrolling */}
      <div className="rounded-lg border bg-card overflow-hidden">
        {/* Header - sticky */}
        <div className="sticky top-0 z-10 grid grid-cols-12 gap-4 border-b bg-muted/50 p-4 text-sm font-medium">
          <div className="col-span-6">Name</div>
          <div className="col-span-2">Size</div>
          <div className="col-span-3">Modified</div>
          <div className="col-span-1"></div>
        </div>

        {/* Scrollable content */}
        <div className="max-h-[calc(100vh-300px)] overflow-auto">
          {items.map((item, index) => (
            <div
              key={item.id}
              className={`grid grid-cols-12 gap-4 p-4 hover:bg-muted/50 cursor-pointer transition-colors ${
                index !== items.length - 1 ? "border-b" : ""
              }`}
              onClick={() => onFileClick(item)}
            >
              <div className="col-span-6 flex items-center gap-3 min-w-0">
                {getFileIcon(item.type)}
                <span className="truncate font-medium" title={item.name}>
                  {item.name}
                </span>
              </div>
              <div className="col-span-2 flex items-center text-sm text-muted-foreground">
                {item.type === "folder" ? `${item.itemCount || 0} items` : formatFileSize(item.size)}
              </div>
              <div className="col-span-3 flex items-center text-sm text-muted-foreground">
                {formatDate(item.modifiedAt || item.updatedAt)}
              </div>
              <div className="col-span-1 flex items-center justify-end gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => handleToggleStar(e, item)}
                  title={item.starred ? "Remove from starred" : "Add to starred"}
                >
                  {item.starred ? <Star className="h-4 w-4 text-yellow-400" /> : <StarOff className="h-4 w-4" />}
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation()
                        onMetadataEdit(item)
                      }}
                    >
                      View details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => e.stopPropagation()}>Share</DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => handleDownload(e, item)}>Download</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive" onClick={(e) => handleDelete(e, item)}>
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Show item count at the bottom */}
      {items.length > 0 && (
        <div className="mt-4 text-center text-sm text-muted-foreground">
          Showing {items.length} {items.length === 1 ? "item" : "items"}
        </div>
      )}
    </div>
  )
}
