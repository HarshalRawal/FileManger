"use client"

import React from "react"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { Button } from "../ui/button"
import { Download, FileText, ImageIcon, Film, Music, File, ExternalLink, AlertCircle } from "lucide-react"
import { formatFileSize, formatDate } from "../../lib/utils"
import { toast } from "sonner"
import { useState } from "react"

export default function FilePreviewDialog({ file, open, onOpenChange }) {
  const [previewError, setPreviewError] = useState(false)

  // Construct proper API URLs for file serving
  const getFileServeUrl = (fileId) => {
    const baseUrl = "https://filemanager.harshal.app/api/v1"
    return `${baseUrl}/files/serve/${fileId}`
  }
  
  const getDownloadUrl = (fileId) => {
    const baseUrl = "https://filemanager.harshal.app/api/v1"
    return `${baseUrl}/files/download/${fileId}`
  }
  

  const renderPreview = () => {
    const serveUrl = getFileServeUrl(file.id)

    // If there's a preview error, show fallback
    if (previewError) {
      return renderFallback()
    }

    switch (file.type) {
      case "image":
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
      case "webp":
      case "svg":
        return (
          <div className="flex items-center justify-center bg-muted/20 rounded-lg p-4 min-h-[300px] max-h-[50vh]">
            <img
              src={serveUrl || "/placeholder.svg"}
              alt={file.name}
              className="max-h-full max-w-full rounded-lg object-contain"
              onLoad={() => setPreviewError(false)}
              onError={(e) => {
                console.error("Image failed to load:", serveUrl)
                setPreviewError(true)
              }}
            />
          </div>
        )

      case "video":
      case "mp4":
      case "mov":
      case "avi":
      case "webm":
      case "mkv":
        return (
          <div className="flex items-center justify-center bg-muted/20 rounded-lg p-4 min-h-[300px] max-h-[50vh]">
            <video
              src={serveUrl}
              controls
              className="max-h-full max-w-full rounded-lg"
              onLoadStart={() => setPreviewError(false)}
              onError={(e) => {
                console.error("Video failed to load:", serveUrl)
                setPreviewError(true)
              }}
            >
              Your browser does not support the video tag.
            </video>
          </div>
        )

      case "audio":
      case "mp3":
      case "wav":
      case "ogg":
      case "flac":
      case "aac":
        return (
          <div className="flex flex-col items-center justify-center gap-4 p-6 bg-muted/20 rounded-lg min-h-[200px]">
            <Music className="h-16 w-16 text-purple-500" />
            <p className="text-center text-lg font-medium">{file.name}</p>
            <audio
              src={serveUrl}
              controls
              className="w-full max-w-md"
              onLoadStart={() => setPreviewError(false)}
              onError={(e) => {
                console.error("Audio failed to load:", serveUrl)
                toast.error("Failed to load audio file")
              }}
            >
              Your browser does not support the audio tag.
            </audio>
          </div>
        )

      case "pdf":
      case "application/pdf":
        return (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-center bg-muted/20 rounded-lg p-2">
              <iframe
                src={serveUrl}
                className="w-full h-[45vh] rounded-lg border"
                title={file.name}
                onLoad={(e) => {
                  setPreviewError(false)
                  // Additional check for iframe content
                  setTimeout(() => {
                    try {
                      const iframe = e.target
                      if (iframe.contentDocument) {
                        const iframeBody = iframe.contentDocument.body
                        if (
                          iframeBody &&
                          (iframeBody.innerHTML.includes("404") || iframeBody.innerHTML.includes("Not Found"))
                        ) {
                          setPreviewError(true)
                        }
                      }
                    } catch (error) {
                      // Cross-origin restrictions - this is normal
                      console.log("Cannot access iframe content due to CORS (this is normal)")
                    }
                  }, 1000)
                }}
                onError={(e) => {
                  console.error("PDF iframe failed to load:", serveUrl)
                  setPreviewError(true)
                }}
              />
            </div>
            <div className="flex justify-center gap-2">
              <Button onClick={() => window.open(serveUrl, "_blank")}>
                <ExternalLink className="mr-2 h-4 w-4" />
                Open in new tab
              </Button>
              <Button variant="outline" onClick={() => downloadFile(file)}>
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </div>
          </div>
        )

      case "txt":
      case "text/plain":
        return (
          <div className="flex flex-col gap-3">
            <div className="bg-muted/20 rounded-lg p-2">
              <iframe
                src={serveUrl}
                className="w-full h-[40vh] rounded-lg border bg-white"
                title={file.name}
                onLoad={() => setPreviewError(false)}
                onError={(e) => {
                  console.error("Text file failed to load:", serveUrl)
                  setPreviewError(true)
                }}
              />
            </div>
            <div className="flex justify-center gap-2">
              <Button onClick={() => window.open(serveUrl, "_blank")}>
                <ExternalLink className="mr-2 h-4 w-4" />
                Open in new tab
              </Button>
              <Button variant="outline" onClick={() => downloadFile(file)}>
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </div>
          </div>
        )

      default:
        return renderFallback()
    }
  }

  const renderFallback = () => {
    const getIcon = () => {
      switch (file.type) {
        case "document":
        case "doc":
        case "docx":
        case "pdf":
          return <FileText className="h-16 w-16 text-blue-500" />
        case "image":
          return <ImageIcon className="h-16 w-16 text-green-500" />
        case "video":
          return <Film className="h-16 w-16 text-red-500" />
        case "audio":
          return <Music className="h-16 w-16 text-purple-500" />
        default:
          return <File className="h-16 w-16 text-gray-500" />
      }
    }

    return (
      <div className="flex flex-col items-center justify-center gap-4 p-6 bg-muted/20 rounded-lg min-h-[200px]">
        {previewError && <AlertCircle className="h-6 w-6 text-orange-500" />}
        {getIcon()}
        <p className="text-center text-lg font-medium">{file.name}</p>
        <p className="text-center text-sm text-muted-foreground">
          {previewError ? "Preview not available" : file.description || `${file.mimeType || file.type} file`}
        </p>
        <div className="flex gap-2">
          <Button onClick={() => window.open(getFileServeUrl(file.id), "_blank")}>
            <ExternalLink className="mr-2 h-4 w-4" />
            Open in new tab
          </Button>
          <Button variant="outline" onClick={() => downloadFile(file)}>
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
        </div>
      </div>
    )
  }

  // Download function using the download endpoint
  const downloadFile = async (file) => {
    try {
      console.log(`File Id : ${file.id}`);
      const downloadUrl = getDownloadUrl(file.id)

      // Create a temporary link and trigger download
      const link = document.createElement("a")
      link.href = downloadUrl
      link.download = file.name
      link.target = "_blank"

      // Add to DOM, click, and remove
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast.success(`Downloading ${file.name}`)
    } catch (error) {
      console.error("Download failed:", error)
      toast.error("Failed to download file")
    }
  }

  const getFileIcon = () => {
    switch (file.type) {
      case "document":
      case "pdf":
        return <FileText className="h-5 w-5 text-blue-500" />
      case "image":
        return <ImageIcon className="h-5 w-5 text-green-500" />
      case "video":
        return <Film className="h-5 w-5 text-red-500" />
      case "audio":
        return <Music className="h-5 w-5 text-purple-500" />
      default:
        return <File className="h-5 w-5 text-gray-500" />
    }
  }

  // Reset preview error when file changes
  React.useEffect(() => {
    setPreviewError(false)
  }, [file?.id])

  if (!file) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[95vh] bg-background border flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            {getFileIcon()}
            {file.name}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-auto space-y-4">
          {/* Preview Section */}
          <div className="flex-shrink-0">{renderPreview()}</div>

          {/* File Details Section */}
          <div className="flex-shrink-0 grid grid-cols-2 gap-4 rounded-lg border bg-card p-4 text-sm">
            <div>
              <p className="font-medium text-foreground">Size</p>
              <p className="text-muted-foreground">{formatFileSize(file.size)}</p>
            </div>
            <div>
              <p className="font-medium text-foreground">Type</p>
              <p className="text-muted-foreground">{file.mimeType || file.type}</p>
            </div>
            <div>
              <p className="font-medium text-foreground">Uploaded</p>
              <p className="text-muted-foreground">{formatDate(file.uploadedAt || file.createdAt)}</p>
            </div>
            <div>
              <p className="font-medium text-foreground">Tags</p>
              <p className="text-muted-foreground">{ file.tags.join("|")}</p>
            </div>
            <div>
              <p className="font-medium text-foreground">Modified</p>
              <p className="text-muted-foreground">{formatDate(file.modifiedAt || file.updatedAt)}</p>
            </div>
            {file.description && (
              <div className="col-span-2">
                <p className="font-medium text-foreground">Description</p>
                <p className="text-muted-foreground">{file.description}</p>
              </div>
            )}
            {file.documentType && (
              <div>
                <p className="font-medium text-foreground">Document Type</p>
                <p className="text-muted-foreground">{file.documentType}</p>
              </div>
            )}
            {file.sapId && (
              <div>
                <p className="font-medium text-foreground">SAP ID</p>
                <p className="text-muted-foreground">{file.sapId}</p>
              </div>
            )}
          </div>

          {/* Debug information - only in development */}
          {process.env.NODE_ENV === "development" && (
            <div className="flex-shrink-0 rounded-lg bg-muted p-3 text-xs space-y-1">
              <p className="font-medium">Debug Information:</p>
              <p>
                <strong>File ID:</strong> {file.id}
              </p>
              <p>
                <strong>Serve URL:</strong> {getFileServeUrl(file.id)}
              </p>
              <p>
                <strong>Download URL:</strong> {getDownloadUrl(file.id)}
              </p>
              <p>
                <strong>Original Path:</strong> {file.path}
              </p>
              <p>
                <strong>MIME Type:</strong> {file.mimeType}
              </p>
              <p>
                <strong>File Type:</strong> {file.type}
              </p>
              <p>
                <strong>Preview Error:</strong> {previewError.toString()}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
