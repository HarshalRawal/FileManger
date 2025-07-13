import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return "0 Bytes"

  const sizes = ["Bytes", "KB", "MB", "GB", "TB"]
  const i = Math.floor(Math.log(bytes) / Math.log(1024))

  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`
}

export function formatDate(dateString) {
  if (!dateString) return ""

  const date = new Date(dateString)
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
  }).format(date)
}

export function getFileTypeFromExtension(filename) {
  if (!filename) return "file"

  const extension = filename.split(".").pop().toLowerCase()

  const imageExtensions = ["jpg", "jpeg", "png", "gif", "bmp", "webp", "svg"]
  const documentExtensions = ["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt", "rtf", "md"]
  const videoExtensions = ["mp4", "webm", "mov", "avi", "mkv"]
  const audioExtensions = ["mp3", "wav", "ogg", "flac", "aac"]

  if (imageExtensions.includes(extension)) return "image"
  if (documentExtensions.includes(extension)) return "document"
  if (videoExtensions.includes(extension)) return "video"
  if (audioExtensions.includes(extension)) return "audio"

  return "file"
}

export function getFileTypeFromMimeType(mimeType) {
  if (!mimeType) return "file"

  if (mimeType.startsWith("image/")) return "image"
  if (mimeType.startsWith("video/")) return "video"
  if (mimeType.startsWith("audio/")) return "audio"
  if (
    mimeType === "application/pdf" ||
    mimeType.includes("document") ||
    mimeType.includes("sheet") ||
    mimeType.includes("presentation")
  )
    return "document"

  return "file"
}

export function generateUniqueId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}
