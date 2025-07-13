// components/tags/tag-selector.jsx
"use client"

import { useEffect } from "react"
import { useTagStore } from "@/store/tagStore"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"

export const TagSelector = ({ selectedTags = [], onAddTag }) => {
  const { tags, fetchTags } = useTagStore()

  useEffect(() => {
    fetchTags()
  }, [fetchTags])

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <Badge
          key={tag}
          variant={selectedTags.includes(tag) ? "default" : "secondary"}
          className="cursor-pointer hover:opacity-80"
          onClick={() => onAddTag(tag)}
        >
          {tag}
        </Badge>
      ))}
    </div>
  )
}
