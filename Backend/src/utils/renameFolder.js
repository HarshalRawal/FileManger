import fs from 'fs/promises';
import path from 'path';
import { getCategoryPath } from './getCategoryPath.js';
export const renameFolderInDisk = async (categoryId ,oldName ,newName) => {
  const relativePath = await getCategoryPath(categoryId);
  const newPath = path.resolve("/Users/harshalrawal/Desktop/Uploads", relativePath);

  try {
    await fs.rename(oldFolder, newFolder);
  } catch (err) {
    console.error("Error renaming folder on disk:", err);
    throw new ApiError(500, "Failed to rename folder on disk");
  }
};
