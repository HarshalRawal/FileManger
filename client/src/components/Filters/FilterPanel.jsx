"use client";

import { useEffect, useState } from "react";
import { useFileStore } from "@/store/fileStore";
import { Button } from "@/components/ui/button";
import { X, Filter, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import TagItem from "../dialogs/TagItem";

export default function TagFilterPanel({ open, onOpenChange }) {
  const {
    fetchRootTags,
    rootTags,
    filters,
    setFilters,
    clearFilters,
    filterFiles,
  } = useFileStore();

  const [selectedTags, setSelectedTags] = useState(filters.selectedTags || {});

  useEffect(() => {
    fetchRootTags();
  }, [fetchRootTags]);

  const handleTagSelect = (level, tag) => {
    setSelectedTags((prev) => {
      const updated = { ...prev };
      updated[level] = tag;

      // Remove deeper selections
      Object.keys(updated).forEach((lvl) => {
        if (parseInt(lvl) > level) {
          delete updated[lvl];
        }
      });

      return updated;
    });
  };

  const { currentFolder } = useFileStore();

  const handleApply = () => {
    const selectedTagIds = Object.values(selectedTags).map((t) => t.id);
    const categoryId = currentFolder?.id || null;
  
    console.log("🧩 Selected Tag IDs:", selectedTagIds);
    console.log("📁 Current Category ID:", categoryId);
  
    setFilters({ tags: selectedTagIds, selectedTags });
    filterFiles(categoryId,selectedTagIds);
    onOpenChange(false);
  };
  
  const handleClear = () => {
    setSelectedTags({});
    clearFilters();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-background rounded-lg border shadow-lg w-full max-w-md max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Filter by Tags</h2>
            {Object.keys(selectedTags).length > 0 && (
              <Badge variant="secondary">{Object.keys(selectedTags).length} selected</Badge>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-4 space-y-4">
          <div className="text-sm font-medium flex items-center gap-2">
            <Tag className="h-4 w-4" />
            Tags
          </div>
          <div className="flex flex-wrap gap-2">
            {rootTags.map((tag) => (
              <TagItem
                key={tag.id}
                tag={tag}
                level={0}
                selectedTags={selectedTags}
                onSelect={handleTagSelect}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between p-4 border-t bg-muted/50">
          <Button variant="outline" onClick={handleClear}>
            Clear
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleApply}>Apply</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
