import { update } from "../controllers/files.controllers.js";
import { children } from "../controllers/tag.controllers.js";
import { connectRedis } from "../db/redis.js";

export const redis = await connectRedis();

export const cacheRootCategory = async (newData) => {
    const key = `rootCategories:data`;
      await redis.set(key, JSON.stringify(newData), 'EX', 3600);
      console.log("Data cached.");
}

export const cacheCategory = async(cacheKey,data)=>{
    await redis.set(cacheKey,JSON.stringify(data),'EX',3600);
    console.log(`category cached`)
}

export const deleteCategoryAndCleanCache = async (categoryId) => {
    const toDelete = [];
     
    // Step 0: Pre-fetch the category data (before deleting)
    const raw = await redis.get(`category:${categoryId}`);
    const categoryData = raw ? JSON.parse(raw) : null;
    const parentId = categoryData?.CategoryData?.parentId;
  
    // Step 1: Recursively gather all descendants
    async function gatherDescendants(id) {
      const raw = await redis.get(`category:${id}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        const children = parsed?.CategoryData?.children || [];
        for (const child of children) {
          await gatherDescendants(child.id); // Recursively gather
        }
      }
      toDelete.push(`category:${id}`);
    }
  
    await gatherDescendants(categoryId);
    console.log("To delete", toDelete);
  
    if (toDelete.length > 0) {
      await redis.del(...toDelete);
    }
  
    // Step 2: Update parent in cache
    if (parentId) {
      // Case: Non-root parent, in Redis as `category:{parentId}`
      const parentRaw = await redis.get(`category:${parentId}`);
      if (parentRaw) {
        const parentData = JSON.parse(parentRaw);
        parentData.CategoryData.children = parentData.CategoryData.children.filter(
          (child) => child.id !== categoryId
        );
        parentData.noOfChildern = parentData.CategoryData.children.length;
        await redis.set(`category:${parentId}`, JSON.stringify(parentData), "EX", 3600);
      }
    } else {
      // Case: Root-level (present in `rootCategories:data`)
      const rootRaw = await redis.get("rootCategories:data");
      if (rootRaw) {
        const parsed = JSON.parse(rootRaw);
        const newData = parsed.map((category)=>{
            const res = category.children.filter((child)=>child.id!==categoryId);
            const newCategory = {...category,children:res};
            return newCategory
        })
        console.log("New DATA ",newData);
        await redis.set("rootCategories:data", JSON.stringify(newData), "EX", 3600);
      }
    }
  };


  export const updateCacheFile = async (categoryId, fileId, file) => {
    const key = `category:${categoryId}`;
    const data = await redis.get(key);
  
    if (!data) {
      return;
    }
  
    const parsedData = JSON.parse(data);
    const cacheFile = parsedData.CategoryData.file.map((f) => {
      if (f.id !== fileId) {
        return f;
      } else {
        f.originalName = file.originalName;
        f.description = file.description;
        return f;
      }
    });
  
    parsedData.CategoryData.file = cacheFile;
  
    await redis.set(key, JSON.stringify(parsedData), "EX", 3600);
  };

 export  const updateCacheCategory = async(cacheKey,newName)=>{
        const data = await redis.get(cacheKey);
        if(!data){
          return;
        }
        const parsedData = JSON.parse(data);
        parsedData.CategoryData.name = newName;
        await redis.set(cacheKey, JSON.stringify(parsedData), "EX", 3600);
}

export const clearAllCategoryCache = async () => {
  const categoryKeys = await redis.keys('category:*');
  const rootKeys = await redis.keys('rootCategories:*');

  const allKeys = [...categoryKeys, ...rootKeys];

  if (allKeys.length > 0) {
    await redis.del(...allKeys);
    console.log(`🧹 Deleted ${allKeys.length} category cache keys`);
  } else {
    console.log('ℹ️ No category cache keys found');
  }
};
  
  
  
  