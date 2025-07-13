import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { getCategoryPath } from "../utils/getCategoryPath.js";
import { redis ,cacheRootCategory,cacheCategory,deleteCategoryAndCleanCache} from "../utils/cache.js";
import prisma from "../db/index.js";
import fs from "fs";
import path from "path";
import { renameFolderInDisk } from "../utils/renameFolder.js";
export const createCategory = asyncHandler(async(req,res)=>{
    const { name, parentId } = req.body;
    // todo also check if the current user is ADMIN or Not/

    if(!name){
        throw new ApiError(400,`Name is required to create a new category`);
    }
    if(parentId){
        const existingParent = await prisma.category.findUnique({
            where:{
                id:parentId
            }
        })
        if(!existingParent){
            throw new ApiError(404,`Parent With id:${parentId} does not exists`);
        }

    }

    const existingCategory = await prisma.category.findFirst({
        where:{
            parentId : parentId || null,
            name : name
        }
    })

    if(existingCategory){
        throw new ApiError(409,`Category with name ${name} already exists under parent id :${parentId}`);
    }
    let key;
   if(!parentId){
      key = "rootCategories:data";
     await redis.del(key);
   }else{
     key = `category:${parentId}`
     await redis.del(key);
   }
    const newCategory = await prisma.category.create({
        data:{
            name:name.trim(),
            parentId:parentId || null
        }
    })
    return res.status(201).json(new ApiResponse(201,`New Category Successfully Created`,{
        newCategory
    }))
})

export const getCategory = asyncHandler(async(req,res)=>{
    const {id} = req.params;
    const cacheKey = `category:${id}`
    const cachedData = await redis.get(cacheKey);
  
    if (cachedData) {
      const parsed = JSON.parse(cachedData);
      return res.status(200).json(new ApiResponse(200,"From Cache",{
        noOfChildern:parsed.noOfChildern,
        noOfFiles:parsed.noOfFiles,
        CategoryData:parsed.CategoryData
      }))
    }
    const existingCategory = await prisma.category.findUnique({
        where:{
            id
        },
        include:{
            children:true,
            parent:true,
            file:{
                include:{
                    tags:{
                        include:{
                            tag:{
                                select:{
                                    id:true,
                                    label:true
                                }
                            }
                        }
                    }
                }
            }
        }
    })
     
    if(!existingCategory){
        throw new ApiError(404,`Category with id:${id} does not exists`);
    }
    
    const transformedFiles = existingCategory.file.map((file)=>{
        return {
            ...file,
            tags:file.tags.map(({tag})=>{
                return {
                    tagId:tag.id,
                    label:tag.label
                }
            })
        }
    })
    const data = {
        noOfChildern:existingCategory.children.length,
        noOfFiles:existingCategory.file.length,
        CategoryData:{
            ...existingCategory,
            file:transformedFiles
        }
    }
    await cacheCategory(cacheKey,data);
    return res.status(200).json(new ApiResponse(200,`Category found for with id ${id}`,{
        noOfChildern:existingCategory.children.length,
        noOfFiles:existingCategory.file.length,
        CategoryData:{
            ...existingCategory,
            file:transformedFiles
        }
    }))
})


export const renameCategory = asyncHandler(async(req,res)=>{
    const {id,newName} = req.body;

    const existingParent = await prisma.category.findUnique({
        where:{
            id
        }
    })

    if(!existingParent){
        throw new ApiError(404,`Category with id ${id} does not exists`)
    }

    const updatedCategory = await prisma.category.update({
        where:{
            id
        },
        data:{
            name:newName.trim()
        },
        select:{
            id:true,
            name:true
        }
    })
    await renameFolderInDisk(id);
    return res.status(200).json(new ApiResponse(200,`SuccessFully Renamed the Category`,{
        updatedCategory
    }))

})

export const getRootCategories = asyncHandler(async(req,res)=>{

    const cacheKey = "rootCategories:data";

    // Step 1: Check Redis cache
    const cachedData = await redis.get(cacheKey);
  
    if (cachedData) {
      const parsed = JSON.parse(cachedData);
      return res.status(200).json(new ApiResponse(200,"From Cache",{rootCategories:parsed}))
    }
  
    const rootCategories = await prisma.category.findMany({
        where:{
            parentId:null
        },
        include:{
            children:true,
            file:true
        }
    })
    
    if(!rootCategories){
        throw new ApiError(404,`No Root Categories Found`);
    }
    await cacheRootCategory(rootCategories);
    return res.status(200).json(new ApiResponse(200,`SuccessFully Found Root Categories`,{
        rootCategories
    }))
})
export const deleteCategory = asyncHandler(async(req,res)=>{
    const {id} = req.params;
    const cacheKey = `category:${id}`
    const existingCategory = await prisma.category.findUnique({
        where:{
            id
        }
    })
    if(existingCategory.parentId===null){
        const key = `rootCategories:data`
        await redis.del(key);
    }
    const relativePath = await getCategoryPath(id);
    if(!existingCategory){
        throw new ApiError(404,`No Category Found with Id ${id}`)
    }
    await deleteCategoryAndCleanCache(id);
    const deletedCategory = await prisma.category.delete({
        where:{
            id
        }
    })
    if(!deleteCategory){
        throw new ApiError(500,"Failed to delete folder");
    }
    console.log("PATH",path);
    const absolutePath = path.join('/Users/harshalrawal/Desktop/Uploads/',relativePath);
    fs.rm(absolutePath, { recursive: true, force: true }, (err) => {
        if (err) {
          console.error(`Failed to remove folder: ${err.message}`);
          return;
        }
    })  
    return res.status(200).json(new ApiResponse(200,`Successfully deleted category with id ${id}`,{
        deletedCategory
    }));
})