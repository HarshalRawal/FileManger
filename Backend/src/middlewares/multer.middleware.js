import multer, { memoryStorage } from "multer";
import path from "path";
import fs from "fs";
import {v4 as uuidv4 } from 'uuid';
import { getCategoryPath } from "../utils/getCategoryPath.js";
// const storageConfig  = multer.diskStorage({
//     destination:async(req,file,cb)=>{
//         try {
//             const categoryId = req.query.categoryId;
//             console.log(req.body.categoryId);
//             if(!categoryId){
//                 return cb(new Error(`CategoryId is required`),null)
//             }
//             const relativePath = await getCategoryPath(categoryId);
//             const uploadDir = path.resolve(`/Users/harshalrawal/Desktop/Uploads`,relativePath);
             
//           fs.mkdirSync(uploadDir,{recursive:true});

//           cb(null,uploadDir);

//         } catch (error) {
//             cb(error,null);
//         }
//     },
//     filename:(req,file,cb)=>{
//         const ext = path.extname(file.originalname);
//         const storedName = `${uuidv4()}${ext}`;
//         cb(null,storedName);
//     }
// });

const fileFilter = (req, file, cb) => {
    // Check the mimetype and reject videos
    if (file.mimetype.startsWith('video/')) {
      cb(new Error('Video files are not allowed'), false);
    } else {
      cb(null, true);
    }
  };

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "public/uploads"); // This should match the Docker volume
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    },
  });
  
  // ✅ Export the multer middleware
  export const upload = multer({
    storage,
    fileFilter,
    limits: {
      fileSize: 5 * 1024 * 1024, // limit file size to 5MB
    },
  });
// export const upload = multer({
//     storage:memoryStorage(),
//     fileFilter:fileFilter,
//     limits:{
//         fieldSize: 5 * 1024 * 1024
//     }
// });  