import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useFileStore } from "@/store/fileStore";

export default function TagItem({ tag, level, selectedTags = {}, onSelect }) {
  const {
    childrenTags,
    fetchChildrenTags,
    isChildrenTagsLoading,
  } = useFileStore();

  const [hasLoadedChildren, setHasLoadedChildren] = useState(false);
  const children = childrenTags[tag.id] || [];

  const isSelected = selectedTags[level]?.id === tag.id;

  const loadChildren = async () => {
    if (!hasLoadedChildren) {
      await fetchChildrenTags(tag.id);
      setHasLoadedChildren(true);
    }
  };

  const handleClick = async (e) => {
    e.stopPropagation();
    onSelect(level, tag);
    await loadChildren();
  };

  const showPopover = children.length > 0 || !hasLoadedChildren;

  if (!showPopover) {
    return (
      <Button
        type="button"
        variant={isSelected ? "default" : "ghost"}
        size="sm"
        className="w-full justify-start text-left text-sm"
        onClick={() => onSelect(level, tag)}
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
          variant={isSelected ? "default" : "ghost"}
          size="sm"
          className="w-full justify-between text-left text-sm"
          onClick={handleClick}
          onMouseEnter={loadChildren}
        >
          {tag.label}
          <span className="ml-2">▸</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent side="right" align="start" className="w-52 p-0 ml-1">
        <ScrollArea className="max-h-48 p-2">
          {isChildrenTagsLoading && !hasLoadedChildren ? (
            <div className="text-xs text-muted-foreground px-2">Loading...</div>
          ) : children.length > 0 ? (
            children.map((child) => (
              <TagItem
                key={child.id}
                tag={child}
                level={level + 1}
                selectedTags={selectedTags}
                onSelect={onSelect}
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
