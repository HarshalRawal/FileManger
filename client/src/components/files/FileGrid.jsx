"use client"

import { MoreHorizontal, Folder, FileText, ImageIcon, Film, Music, File } from "lucide-react"
import { Button } from "../ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu"
import { formatFileSize, formatDate } from "../../lib/utils"
import { useFileStore } from "../../store/fileStore"

export default function FileGrid({ items, onFileClick, onMetadataEdit }) {
  const { deleteItem, toggleStarred } = useFileStore()

  const getFileIcon = (type) => {
    switch (type) {
      case "folder":
        return <Folder className="h-12 w-12 text-amber-500" />
      case "document":
      case "pdf":
      case "doc":
      case "docx":
      case "txt":
      case "xlsx":
      case "application/pdf":
        return <FileText className="h-12 w-12 text-blue-500" />
      case "image":
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
        return <ImageIcon className="h-12 w-12 text-green-500" />
      case "video":
      case "mp4":
      case "mov":
      case "avi":
        return <Film className="h-12 w-12 text-red-500" />
      case "audio":
      case "mp3":
      case "wav":
        return <Music className="h-12 w-12 text-purple-500" />
      default:
        return <File className="h-12 w-12 text-gray-500" />
    }
  }

  const getFileServeUrl = (fileId) => {
    const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api"
    return `${baseUrl}/file/serve/${fileId}`
  }

  const handleDelete = async (e, item) => {
    e.stopPropagation()
    await deleteItem(item.id)
  }

  const handleToggleStar = async (e, item) => {
    e.stopPropagation()
    await toggleStarred(item.id)
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
      {/* Grid container with proper responsive columns and spacing */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 auto-rows-max">
        {items.map((item) => (
          <div
            key={item.id}
            className="group relative flex flex-col items-center rounded-lg border bg-card p-4 transition-all hover:shadow-md cursor-pointer min-h-[160px]"
            onClick={() => onFileClick(item)}
          >
            {/* Icon/Thumbnail container with fixed height */}
            <div className="mb-3 flex h-16 w-16 items-center justify-center flex-shrink-0">
              {/* Show image preview for image files */}
              {(item.type === "image" ||
                item.type === "jpg" ||
                item.type === "jpeg" ||
                item.type === "png" ||
                item.type === "gif") &&
              item.id ? (
                <>
                  <img
                    src={getFileServeUrl(item.id) || "/placeholder.svg"}
                    alt={item.name}
                    className="h-full w-full object-cover rounded-lg"
                    onError={(e) => {
                      e.target.style.display = "none"
                      e.target.nextSibling.style.display = "flex"
                    }}
                  />
                  <div className="h-full w-full flex items-center justify-center" style={{ display: "none" }}>
                    {getFileIcon(item.type)}
                  </div>
                </>
              ) : (
                <div className="h-full w-full flex items-center justify-center">
                  {getFileIcon(item.type || item.fileType)}
                </div>
              )}
            </div>

            {/* File info with consistent spacing */}
            <div className="w-full text-center flex-1 flex flex-col justify-between min-h-[60px]">
              <div className="space-y-1">
                <p className="text-sm font-medium line-clamp-2 leading-tight" title={item.name}>
                  {item.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {item.type === "folder"
                    ? `${item.itemCount || item.fileCount || 0} items`
                    : formatFileSize(item.size || item.fileSize)}
                </p>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {formatDate(item.modifiedAt || item.updatedAt || item.createdAt)}
              </p>
            </div>

            {/* Action buttons */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1 opacity-0 group-hover:opacity-100 h-8 w-8"
              onClick={(e) => handleToggleStar(e, item)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill={item.starred || item.isFavorite ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={item.starred || item.isFavorite ? "text-yellow-400" : "text-muted-foreground"}
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-8 top-1 opacity-0 group-hover:opacity-100 h-8 w-8"
                  onClick={(e) => e.stopPropagation()}
                >
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
        ))}
      </div>

      {/* Show item count at the bottom */}
      {items.length > 0 && (
        <div className="mt-6 text-center text-sm text-muted-foreground border-t pt-4">
          Showing {items.length} {items.length === 1 ? "item" : "items"}
        </div>
      )}
    </div>
  )
}
