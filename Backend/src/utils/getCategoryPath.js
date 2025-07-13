import prisma from "../db/index.js";

export const getCategoryPath = async(categoryId)=>{
    try {
         let path = [];
         let currentCategory = await prisma.category.findUnique({
            where:{
                id:categoryId
            },
            select:{
                id:true,
                name:true,
                parentId:true,
            }
         })
         while(currentCategory){
            path.unshift(currentCategory.name);
            if(!currentCategory.parentId) break;
            currentCategory = await prisma.category.findUnique({
                where:{
                    id:currentCategory.parentId
                },
                select:{
                    id:true,
                    name:true,
                    parentId:true,
                }
            })
         }
         path = path.map((item)=>item.trim().replace(/ +/g, '_'));
         return path.join('/');
    } catch (error) {
        console.log(`Error getting current category path `,Error);
        return null;
    }
}

export const getAllChildren = async(id)=>{
    const children = []
    async function getChildren(id){
        const current = await prisma.category.findMany({
            where:{
                parentId:id
            },
            select:{
                id:true
            }
        })

       for(const child of current){
         children.push(child.id);
         await getChildren(child.id);
       } 
    }
    await getChildren(id);
    return children;
}