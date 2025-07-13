"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useFileStore } from "@/store/fileStore";

export default function TagFilterItem({ tag, selectedTags = [], onToggle }) {
  const { childrenTags, fetchChildrenTags } = useFileStore();
  const [hasLoaded, setHasLoaded] = useState(false);

  const children = childrenTags[tag.id] || [];
  const isSelected = selectedTags.includes(tag.label);

  const shouldFetch = tag.hasChildren && !hasLoaded && !childrenTags[tag.id];

  const loadChildren = async () => {
    if (shouldFetch) {
      await fetchChildrenTags(tag.id);
      setHasLoaded(true);
    }
  };

  const hasChildren = tag.hasChildren || children.length > 0;

  if (!hasChildren) {
    return (
      <Button
        type="button"
        variant={isSelected ? "default" : "outline"}
        size="sm"
        className="rounded-full text-xs"
        onClick={() => onToggle(tag.label)}
      >
        {tag.label}
      </Button>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant={isSelected ? "default" : "outline"}
          size="sm"
          className="rounded-full text-xs"
          onMouseEnter={loadChildren}
          onClick={() => onToggle(tag.label)}
        >
          {tag.label} ▸
        </Button>
      </PopoverTrigger>
      <PopoverContent side="right" align="start" className="w-48 p-1">
        <ScrollArea className="max-h-48 p-1">
          {children.length > 0 ? (
            children.map((child) => (
              <TagFilterItem
                key={child.id}
                tag={child}
                selectedTags={selectedTags}
                onToggle={onToggle}
              />
            ))
          ) : (
            <div className="text-xs text-muted-foreground px-2">No sub-tags</div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
