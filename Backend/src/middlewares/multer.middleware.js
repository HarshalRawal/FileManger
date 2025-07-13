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

export const upload = multer({
    storage:memoryStorage(),
    fileFilter:fileFilter,
    limits:{
        fieldSize: 5 * 1024 * 1024
    }
});  