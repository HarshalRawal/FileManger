import { asyncHandler } from "../utils/asyncHandler.js";
import prisma from "../db/index.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";

export const create  = asyncHandler(async(req,res)=>{
    const {label,value,parentTagId} = req.body;

    if(parentTagId){
        const isExistingParent = await prisma.tag.findUnique({
            where:{
                id:parentTagId
            }
        })

        if(!isExistingParent){
            throw new ApiError(404,`Parent with id ${parentTagId} not found`);
        }
    }
    const existingTag = await  prisma.tag.findUnique({
        where:{
            value
        }
    })
    if (existingTag){
        throw new ApiError(409,"This tag already exists");
    }
    const newTag = await prisma.tag.create({
        data:{
            label,
            value,
            parentTagId:parentTagId||null
        }
    })
    if(!newTag){
        throw new ApiError(500,"Failed to create ")
    }
    return res.status(201).json(new ApiResponse(200,`New Tag created Successfully`,{
        newTag
    }));
})


export const getRoot = asyncHandler(async(req,res)=>{
    const rootTags = await prisma.tag.findMany({
        where:{
            parentTagId:null
        },
        include:{
            children:true
        },
        orderBy:{
            label:"asc"
        }
    })
    if(!rootTags){
        throw new ApiError(500,"Failed to get root level tags");
    }
    return res.status(200).json(new ApiResponse(200,`Successfully got all root level tags`,{
        rootTags
    }))
})

export const children = asyncHandler(async(req,res)=>{
    const {id} = req.params;

    const tag = await prisma.tag.findUnique({
        where:{
            id
        },
        include:{
            children:true
        }
    })

    if(!tag){
        throw new ApiError(404,`No Tag found with id ${id}`);
    } 
    return res.status(200).json(new ApiResponse(200,`Children Found for Tag with id ${id}`,{
        tag
    }))
})
