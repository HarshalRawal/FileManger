import fs from "fs"
import { getCategoryPath } from "./getCategoryPath.js"
export const renameFolderInDisk = async(categoryId)=>{
  const categoryPath = await getCategoryPath(categoryId);
  console.log(`/Users/harshalrawal/Desktop/Uploads/${categoryPath}`);
}