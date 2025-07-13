import { useEffect } from "react";
import { useFileStore } from "@/store/fileStore";
import TagItem from "./TagItem";

export default function TagSelector({ level = 0, selectedTags = {}, onSelect }) {
  const { rootTags, isTagsLoading, fetchRootTags } = useFileStore();

  useEffect(() => {
    fetchRootTags();
  }, [fetchRootTags]);

  return (
    <div className="grid gap-3">
      <label className="text-sm font-medium">Select Tags</label>
      <div className="flex flex-wrap gap-2">
        {isTagsLoading ? (
          <div className="text-sm text-muted-foreground">Loading...</div>
        ) : (
          rootTags.map((tag) => (
            <TagItem
              key={tag.id}
              tag={tag}
              level={level}
              selectedTags={selectedTags}
              onSelect={onSelect}
            />
          ))
        )}
      </div>
    </div>
  );
}
