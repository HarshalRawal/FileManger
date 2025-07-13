"use client"

import { useState, useRef } from "react"
import { useFileStore } from "../../store/fileStore"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Textarea } from "../ui/textarea"
import { Upload, X } from "lucide-react"
import { Progress } from "../ui/progress"
import TagSelector from "./TagSelector"

export default function FileUploadDialog({ open, onOpenChange, onMetadataEdit, categoryId = null }) {
  const { uploadFiles, isLoading } = useFileStore()
  const [files, setFiles] = useState([])
  const [progress, setProgress] = useState(0)
  const fileInputRef = useRef(null)

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files).map((file) => ({
        file,
        id: Math.random().toString(36).substring(2, 9),
        description: "",
        selectedTags: {} // per-level selection
      }))
      setFiles((prev) => [...prev, ...newFiles])
    }
  }

  const updateFileTags = (fileId, level, tag) => {
    setFiles((prev) =>
      prev.map((file) => {
        if (file.id !== fileId) return file

        // trim deeper levels when a higher level changes
        const trimmed = Object.fromEntries(
          Object.entries(file.selectedTags || {}).filter(([k]) => parseInt(k) < level)
        )

        return {
          ...file,
          selectedTags: {
            ...trimmed,
            [level]: tag,
          },
        }
      })
    )
  }

  const removeFile = (id) => {
    setFiles((prev) => prev.filter((file) => file.id !== id))
  }

  const updateFileDescription = (id, description) => {
    setFiles((prev) =>
      prev.map((file) =>
        file.id === id ? { ...file, description } : file
      )
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (files.length === 0) return

    const metadata = files.map((file) => ({
      originalName: file.file.name,
      description: file.description || "",
      tags: Object.values(file.selectedTags || {}).map((t) => t.id), // extract all level selections
    }))

    console.log("🧾 Selected tags by file:")
    files.forEach((file) => {
      console.log(`File ID: ${file.id}`)
      console.log(
        "Selected Tags:",
        Object.values(file.selectedTags || {}).map((t) => t.id)
      )
    })

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return 90
        }
        return prev + 10
      })
    }, 200)

    const success = await uploadFiles(files, categoryId, metadata)

    clearInterval(progressInterval)
    setProgress(100)

    if (success) {
      if (files.length > 0 && onMetadataEdit) {
        setTimeout(() => {
          // optional metadata dialog
        }, 500)
      }

      setFiles([])
      setProgress(0)
      onOpenChange(false)
    } else {
      setProgress(0)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      setFiles([])
      setProgress(0)
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-background border">
        <DialogHeader>
          <DialogTitle>Upload Files</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="files">Select Files</Label>
              <div
                className="flex h-32 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-input bg-muted/50 px-6 py-4 text-center"
                onClick={() => !isLoading && fileInputRef.current?.click()}
              >
                <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
                <p className="mb-1 text-sm font-medium">Drag and drop files here or click to browse</p>
                <p className="text-xs text-muted-foreground">Support for images, documents, videos, and more</p>
                <Input
                  ref={fileInputRef}
                  id="files"
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={isLoading}
                />
              </div>
            </div>

            {files.length > 0 && (
              <div className="grid gap-2">
                <Label>Selected Files ({files.length})</Label>
                <div className="max-h-60 overflow-auto rounded-lg border bg-card p-2">
                  {files.map((fileObj) => (
                    <div key={fileObj.id} className="mb-3 rounded-lg border p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="truncate text-sm font-medium">{fileObj.file.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => removeFile(fileObj.id)}
                          disabled={isLoading}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid gap-1">
                        <Label htmlFor={`description-${fileObj.id}`} className="text-xs">
                          Description
                        </Label>
                        <Textarea
                          id={`description-${fileObj.id}`}
                          value={fileObj.description}
                          onChange={(e) => updateFileDescription(fileObj.id, e.target.value)}
                          placeholder="Add a description for this file..."
                          className="min-h-[60px] text-sm"
                          disabled={isLoading}
                        />
                        <TagSelector
                          level={0}
                          selectedTags={fileObj.selectedTags || {}}
                          onSelect={(level, tag) => updateFileTags(fileObj.id, level, tag)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {isLoading && (
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label>Uploading...</Label>
                  <span className="text-xs text-muted-foreground">{progress}%</span>
                </div>
                <Progress value={progress} />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={files.length === 0 || isLoading}>
              {isLoading ? "Uploading..." : "Upload"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
