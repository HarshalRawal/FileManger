import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/api-error.js';
import { ApiResponse } from '../utils/api-response.js';
import prisma from '../db/index.js';
import { getAllChildren, getCategoryPath } from '../utils/getCategoryPath.js';
import { redis } from '../utils/cache.js';
import { updateCacheFile } from '../utils/cache.js';
const BASE_UPLOAD_DIR = path.resolve("public/uploads");
// export const fileUpload = asyncHandler(async (req, res) => {
//   const files = req.files;
//   let metadata;

//   if (!files || files.length === 0) {
//     throw new ApiError(400, "No files uploaded.");
//   }

//   try {
//     metadata = JSON.parse(req.body.metadata);
//   } catch {
//     throw new ApiError(400, "Invalid metadata JSON.");
//   }

//   if (!Array.isArray(metadata) || metadata.length !== files.length) {
//     throw new ApiError(400, "Metadata count must match files count.");
//   }

//   const categoryId = req.params.categoryId;
//   if (!categoryId) {
//     throw new ApiError(400, "categoryId is required in URL path.");
//   }

//   const relativePath = await getCategoryPath(categoryId);
//   //const uploadDir = path.resolve("/Users/harshalrawal/Desktop/Uploads", relativePath);
//    const uploadDir = path.resolve("public/uploads", relativePath);
//   await fs.mkdir(uploadDir, { recursive: true });

//   const savedFiles = [];
//   const tempFilePaths = [];

//   try {
//     for (let i = 0; i < files.length; i++) {
//       const file = files[i];
//       const meta = metadata[i];

//       const ext = path.extname(file.originalname);
//       const storedName = `${uuidv4()}${ext}`;
//       const fullPath = path.join(uploadDir, storedName);

//       // Save to disk
//       await fs.writeFile(fullPath, file.buffer);
//       tempFilePaths.push(fullPath);
//       const savedFile = await prisma.file.create({
//         data: {
//           originalName: file.originalname,
//           storedName,
//           mimeType: file.mimetype,
//           size: file.size.toString(),
//           path: fullPath,
//           categoryId,
//           description: meta.description || null,
//           tags: {
//             create: (meta.tags || []).map((tagId) => ({
//               tag: {
//                 connect: { id: tagId },
//               },
//             })),
//           },
//         },
//         include: {
//           tags: {
//             include:{
//               tag:true
//             }
//           }, // return tags if needed
//         },
//       });
//       savedFiles.push(savedFile);
//     }
//     let key;
//     if(categoryId){
//       key =  `category:${categoryId}`
//       const data = await redis.get(key);
//       if(!data) return;
//       const parsedData = JSON.parse(data);
//      // console.log(`Before:${JSON.stringify(parsedData.CategoryData.file)} \n`)
//       parsedData.noOfFiles = parsedData.noOfFiles + savedFiles.length;
//       parsedData.CategoryData.file.push(...savedFiles);
//      // console.log(`File: ${JSON.stringify(parsedData.CategoryData.file)}`);
//       await redis.set(key,JSON.stringify(parsedData),"EX",3600);
//       const result = await redis.set(key, JSON.stringify(parsedData), "EX", 3600);
//     }
//     else{
//         key = `rootCategories:data`;
//         await redis.del(key);
//     }
//     return res.status(201).json(
//       new ApiResponse(201, "Files uploaded successfully.", { files: savedFiles })
//     );
//   } catch (error) {
//     // Rollback any written files
//     await Promise.all(
//       tempFilePaths.map(async (filePath) => {
//         try {
//           await fs.unlink(filePath);
//         } catch (err) {
//           console.error("Rollback failed on:", filePath, err.message);
//         }
//       })
//     );

//     throw new ApiError(500, `File upload failed: ${error.message}`);
//   }
// });



// export const serve = asyncHandler(async (req,res)=>{
//    const {fileId}  = req.params;
//    const file = await prisma.file.findUnique({
//     where:{
//       id:fileId
//     },
//     select:{
//       path:true
//     }
//    })
//    console.log(`filePath =  ${file.path}`)
//    res.sendFile(file.path)
// })


export const fileUpload = asyncHandler(async (req, res) => {
  const files = req.files;
  let metadata;

  if (!files || files.length === 0) {
    throw new ApiError(400, "No files uploaded.");
  }

  try {
    metadata = JSON.parse(req.body.metadata);
  } catch {
    throw new ApiError(400, "Invalid metadata JSON.");
  }

  if (!Array.isArray(metadata) || metadata.length !== files.length) {
    throw new ApiError(400, "Metadata count must match files count.");
  }

  const categoryId = req.params.categoryId;
  if (!categoryId) {
    throw new ApiError(400, "categoryId is required in URL path.");
  }

  const relativePath = await getCategoryPath(categoryId);
  const uploadDir = path.resolve("public/uploads", relativePath);
  await fs.mkdir(uploadDir, { recursive: true });

  const savedFiles = [];

  try {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const meta = metadata[i];

      const ext = path.extname(file.originalname);
      const storedName = file.filename;
      const originalPath = file.path;
      const newPath = path.join(uploadDir, storedName);

      // Move file to category subfolder
      await fs.rename(originalPath, newPath);
      const fullPath  = file.path;
      const savedFile = await prisma.file.create({
        data: {
          originalName: file.originalname,
          storedName,
          mimeType: file.mimetype || "application/octet-stream",
          size: String(file.size),
          path: fullPath,
          categoryId,
          description: meta.description || null,
          tags: {
            create: (meta.tags || []).map((tagId) => ({
              tag: {
                connect: { id: tagId },
              },
            })),
          },
        },
        include: {
          tags: {
            include: { tag: true },
          },
        },
      });

      savedFiles.push(savedFile);
    }

    // 🔁 Redis cache update
    const key = categoryId ? `category:${categoryId}` : "rootCategories:data";

    if (categoryId) {
      const data = await redis.get(key);
      if (data) {
        const parsedData = JSON.parse(data);
        parsedData.noOfFiles += savedFiles.length;
        parsedData.CategoryData.file.push(...savedFiles);
        await redis.set(key, JSON.stringify(parsedData), "EX", 3600);
      }
    } else {
      await redis.del(key);
    }

    return res
      .status(201)
      .json(new ApiResponse(201, "Files uploaded successfully.", { files: savedFiles }));
  } catch (error) {
    // Rollback files from disk if DB fails
    await Promise.all(
      files.map(async (file) => {
        try {
          await fs.unlink(file.path);
        } catch (err) {
          console.error("Failed to delete:", file.path, err.message);
        }
      })
    );

    throw new ApiError(500, `File upload failed: ${error.message}`);
  }
});




export const serve = asyncHandler(async (req, res) => {
  const { fileId } = req.params;

  const file = await prisma.file.findUnique({
    where: { id: fileId },
    select: { path: true },
  });

  if (!file) {
    throw new ApiError(404, `File with ID ${fileId} not found`);
  }

  // Security: Ensure the file path is within the uploads directory
  if (!file.path.startsWith(BASE_UPLOAD_DIR)) {
    throw new ApiError(400, "Invalid file path");
  }

  return res.sendFile(file.path);
});

// export const download  = asyncHandler(async(req,res)=>{
//   const {fileId} = req.params;
//   if(!fileId){
//     throw new ApiError(400,"File Id is required");
//   }
//   const file   = await prisma.file.findUnique({
//     where:{
//       id:fileId
//     },
//     select:{
//       path:true,
//       originalName:true
//     }
//   })
//   if(!file){
//     throw new ApiError(404,`File with id ${fileId} not found`);
//   }
//   return res.download(file.path,file.originalName);
// })

export const download = asyncHandler(async (req, res) => {
  const { fileId } = req.params;

  if (!fileId) {
    throw new ApiError(400, "File ID is required");
  }

  const file = await prisma.file.findUnique({
    where: { id: fileId },
    select: {
      path: true,
      originalName: true,
    },
  });

  if (!file) {
    throw new ApiError(404, `File with ID ${fileId} not found`);
  }

  if (!file.path.startsWith(BASE_UPLOAD_DIR)) {
    throw new ApiError(400, "Invalid file path");
  }

  return res.download(file.path, file.originalName);
});

export const deleteFiles = asyncHandler(async(req,res)=>{
  const {fileId} = await req.params;
  if(!fileId){
    throw new ApiError(400,`file Id is required`);
  }
  const file = await prisma.file.findUnique({
    where:{
      id:fileId
    },
  })
  if(!file){
    throw new ApiError(404,`File with id ${fileId} not found`);
  }
  const deletedFile = await prisma.file.delete({
    where:{
      id:fileId
    }
  })
  const key = `category:${deletedFile.categoryId}`
  const data = await redis.get(key);
  if(data){
    const parsedData = JSON.parse(data);
    parsedData.noOfFiles = parsedData.noOfFiles - 1;
    const newFile = parsedData.CategoryData.file.filter((f)=>f.id!==fileId);
    parsedData.CategoryData.file = newFile;
    await redis.set(key,JSON.stringify(parsedData),"EX",3600);
  }
  fs.unlink(file.path,async(err)=>{
    if(err && err.code!=='EOENT'){
      throw new ApiError(500,"Failed to delete file")
    }
  })
    return res.status(200).json(new ApiResponse(200,`Successfully delete file`))
})

export const filter = asyncHandler(async (req, res) => {
  const id = req.params.id || null;
  const tags = req.query.tags?.toString().split(",").filter(Boolean) || [];

  console.log("🔍 Filter Tags:", tags);
  console.log("📂 Category ID:", id);

  // Validate tag input
  if (!tags.length) {
    throw new ApiError(400, "At least one tag must be provided in query.");
  }

  // Optional: Check if category exists (only if id is provided)
  if (id) {
    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) {
      throw new ApiError(404, `Category with id ${id} not found`);
    }
  }

  // ✅ Build category filter (include descendants)
  const children = await getAllChildren(id); // should return []
  const categoryIdsToSearch = id ? [id, ...children] : []; // null = no filtering

  // ✅ Build dynamic filter
  const where = {
    tags: {
      some: {
        tagId: { in: tags },
      },
    },
    ...(categoryIdsToSearch.length && {
      categoryId: { in: categoryIdsToSearch },
    }),
  };

  const files = await prisma.file.findMany({
    where,
    include: {
      tags: {
        include: {
          tag: {
            select: {
              id: true,
              label: true,
            },
          },
        },
      },
    },
  });

  const transformedFiles = files.map((file) => ({
    ...file,
    tags: file.tags.map(({ tag }) => ({
      tagId: tag.id,
      tagLabel: tag.label,
    })),
  }));

  return res.status(200).json(
    new ApiResponse(
      200,
      `Filtered files${id ? ` for category ${id}` : ""}`,
      {
        files: transformedFiles,
        matchedTags: tags,
      }
    )
  );
});

export const update = asyncHandler(async(req,res)=>{
    const {id} = req.params;
    const {updates} = req.body;
    const file = await prisma.file.findUnique({
      where:{
        id
      },
      select:{
        originalName:true,
        description:true
      }
    })
    if(!file){
      throw new ApiError(404,"File Not Found")
    }
   const newFile =  await prisma.file.update({
    where:{
      id
    },
     data:{
      originalName:updates.name.trim(),
      description:updates.metadata.description.trim()
     },
     select:{
      id:true,
      categoryId:true,
      originalName:true,
      description:true
     }
   })
   if(!newFile){
    throw new ApiError(500,"Error updating the file")
   }
   console.log(`ID ${newFile.categoryId}`);
   await updateCacheFile(newFile.categoryId,id,newFile);
   return res.status(200).json(new ApiResponse(200,`Successfully updated File detail`,{
    newFile
   }))
})

export const search  = asyncHandler(async(req,res)=>{
  const query = req.query.query;
  if(!query){
    throw new ApiError(400,"Query is required");
  }
  const files = await prisma.file.findMany({
    where:{
      originalName: {contains : query , mode:"insensitive"}
    },
    include:{
      tags : {
        include :{
          tag :{
            select :{
              id:true,
              label:true,
            }
          }
        }
      }
    }
  })
  const folder = await prisma.category.findMany({
    where:{
      name : {contains : query , mode : "insensitive"}
    }
  })
  const message = files.length === 0 && folder.length === 0 ? "No data Found" : "Data found";
  return res.status(200).json(new ApiResponse(200,message,{
    files,
    folder
  }))
})