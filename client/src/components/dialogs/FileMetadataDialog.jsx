"use client"

import { useState } from "react"
import { useFileStore } from "../../store/fileStore"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Textarea } from "../ui/textarea"
import { FileText, ImageIcon, Film, Music, File, Calendar, Tag, User } from "lucide-react"
import { formatFileSize, formatDate } from "../../lib/utils"
import { toast } from "sonner"

export default function FileMetadataDialog({ file, open, onOpenChange }) {
  const { updateFileMetadata ,renameFolder } = useFileStore()
  const [metadata, setMetadata] = useState({
    name: file?.name || "",
    description: file?.description || "",
    tags: file?.metadata?.tags || "",
    owner: file?.metadata?.owner || "Me",
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if(file?.type!="folder"){
    updateFileMetadata(file.id, {
      name: metadata.name,
      metadata: {
        ...file.metadata,
        description: metadata.description,
        tags: metadata.tags,
        owner: metadata.owner,
      },
    })
  }else{
    renameFolder(file.id,metadata.name)
  }
  onOpenChange(false)
  }

  const getFileIcon = () => {
    switch (file?.type) {
      case "folder":
        return null
      case "document":
        return <FileText className="h-12 w-12 text-blue-500" />
      case "image":
        return <ImageIcon className="h-12 w-12 text-green-500" />
      case "video":
        return <Film className="h-12 w-12 text-red-500" />
      case "audio":
        return <Music className="h-12 w-12 text-purple-500" />
      default:
        return <File className="h-12 w-12 text-gray-500" />
    }
  }

  if (!file) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-background border">
        <DialogHeader>
          <DialogTitle>File Details</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="flex items-center gap-4">
              {file.thumbnail ? (
                <img
                  src={file.thumbnail || "/placeholder.svg"}
                  alt={file.name}
                  className="h-16 w-16 rounded-lg object-cover"
                />
              ) : (
                getFileIcon()
              )}
              <div>
                <p className="font-medium">{file.type.charAt(0).toUpperCase() + file.type.slice(1)}</p>
                <p className="text-sm text-muted-foreground">{formatFileSize(file.size)}</p>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={metadata.name}
                onChange={(e) => setMetadata({ ...metadata, name: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={metadata.description}
                onChange={(e) => setMetadata({ ...metadata, description: e.target.value })}
                placeholder="Add a description..."
                rows={3}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="tags">Tags</Label>
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <Input
                  id="tags"
                  value={metadata.tags}
                  onChange={(e) => setMetadata({ ...metadata, tags: e.target.value })}
                  placeholder="Add tags separated by commas..."
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="owner">Owner</Label>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <Input
                  id="owner"
                  value={metadata.owner}
                  onChange={(e) => setMetadata({ ...metadata, owner: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-muted-foreground">Created</Label>
                <div className="flex items-center gap-2 pt-1">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{formatDate(file.createdAt || file.modifiedAt)}</span>
                </div>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Modified</Label>
                <div className="flex items-center gap-2 pt-1">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{formatDate(file.modifiedAt)}</span>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
