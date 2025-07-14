import { create } from "zustand"
import { axiosInstance } from "@/lib/axios"
import { toast } from "sonner"

export const useFileStore = create((set, get) => ({
  rootTags:[],
  isTagsLoading:false,
  isChildrenTagsLoading:false,
  childrenTags:{},
  rootItems: [],
  currentItems: [], // Items currently being displayed
  allItems: [], // All items (for filtering)
  currentFolder: null,
  navigationHistory: [],
  breadcrumbs: [],
  isLoading: false,
  searchQuery: "",
  filters: {
    fileTypes: [],
    tags: [],
    dateRange: { from: null, to: null },
    sizeRange: { min: "", max: "" },
    owner: "",
    searchInContent: false,
    includeSubfolders: true,
  },
  isFiltering: false,
  fetchRootTags: async () => {
    try {
      set((state) => ({ ...state, isTagsLoading: true }));
  
      const { data } = await axiosInstance.get("/tags/root");
      const rawRootTags = data.data.rootTags;
  
      // Step 1: Extract children
      const childrenMap = {};
      const cleanedRootTags = rawRootTags.map((tag) => {
        if (tag.children && tag.children.length > 0) {
          childrenMap[tag.id] = tag.children;
        }
        // Return tag without children array
        return { ...tag, hasChildren: tag.children?.length > 0 };
      });
  
      // Step 2: Set root tags and child tags
      set((state) => ({
        ...state,
        rootTags: cleanedRootTags,
        childrenTags: { ...state.childrenTags, ...childrenMap },
      }));
    } catch (error) {
      console.error("Error getting root tags", error);
    } finally {
      set((state) => ({ ...state, isTagsLoading: false }));
    }
  }, 
  fetchChildrenTags: async (id) => {
    try {
      set((state) => ({ ...state, isChildrenTagsLoading: true }));
      console.log(`fetching children for id ${id}`);
      const { data } = await axiosInstance.get(`/tags/children/${id}`);
      const children = data.data.tag.children;
  
      set((state) => ({
        ...state,
        childrenTags: {
          ...state.childrenTags,
          [id]: children.map((child) => ({
            ...child,
            hasChildren: false, // you'll update this dynamically later if needed
          })),
        },
      }));
    } catch (err) {
      console.error("Failed to fetch children for tag id", id, err);
    } finally {
      set((state) => ({ ...state, isChildrenTagsLoading: false }));
    }
  }
  ,
  getRootFolders: async () => {
    try {
      set({ isLoading: true })
      console.log("🕵️‍♂️ getRootFolders() called")
      console.trace("Stack trace for getRootFolders")
      const res = await axiosInstance.get("/category/get-root-category")
      console.log("Root folders response:", res.data)

      if (res.data && res.data.success && res.data.data && res.data.data.rootCategories) {
        // Transform the API data to match our component expectations
        const transformedData = res.data.data.rootCategories.map((category) => ({
          id: category.id,
          name: category.name || "Unnamed Folder",
          type: "folder",
          parentId: category.parentId,
          createdAt: category.createdAt,
          updatedAt: category.updatedAt,
          modifiedAt: category.updatedAt,
          starred: false,
          itemCount: (category.children?.length || 0) + (category.file?.length || 0),
          children: category.children || [],
          files: category.file || [],
        }))

        set({
          rootItems: transformedData,
          currentItems: transformedData,
          allItems: transformedData,
          currentFolder: null,
          breadcrumbs: [{ id: null, name: "My Drive" }],
          navigationHistory: [],
        })
      } else {
        set({
          rootItems: [],
          currentItems: [],
          allItems: [],
          currentFolder: null,
          breadcrumbs: [{ id: null, name: "My Drive" }],
          navigationHistory: [],
        })
      }
    } catch (error) {
      console.log(`Error getting root folder`, error)
      toast.error("Error getting root folders")
      set({
        rootItems: [],
        currentItems: [],
        allItems: [],
        currentFolder: null,
        breadcrumbs: [{ id: null, name: "My Drive" }],
        navigationHistory: [],
      })
    } finally {
      set({ isLoading: false })
    }
  },

  getFolderContents: async (folderId) => {
    try {
      // Validate folderId
      if (!folderId || folderId === "undefined" || folderId === "null") {
        console.error("Invalid folderId provided:", folderId)
        toast.error("Invalid folder ID")
        return false
      }

      set({ isLoading: true })
      console.log("Fetching folder contents for ID:", folderId)

      const res = await axiosInstance.get(`/category/get-category/${folderId}`)
      console.log("Folder contents response:", res.data)

      if (res.data && res.data.success && res.data.data && res.data.data.CategoryData) {
        const categoryData = res.data.data.CategoryData

        // Transform children folders
        const folders = (categoryData.children || []).map((child) => ({
          id: child.id,
          name: child.name || "Unnamed Folder",
          type: "folder",
          parentId: child.parentId,
          createdAt: child.createdAt,
          updatedAt: child.updatedAt,
          modifiedAt: child.modifiedAt,
          starred: false,
          itemCount: 0,
        }))

        // Transform files
        const files = (categoryData.file || []).map((file) => ({
          id: file.id,
          name: file.originalName || "Unnamed File",
          type: getFileTypeFromExtension(file.originalName) || getFileTypeFromMimeType(file.mimeType) || "file",
          size: Number.parseInt(file.size) || 0,
          parentId: categoryData.id,
          createdAt: file.uploadedAt,
          updatedAt: file.updatedAt,
          modifiedAt: file.modifiedAt,
          uploadedAt: file.uploadedAt,
          starred: false,
          url: file.path,
          path: file.path,
          description: file.description,
          tags:file.tags.map((tag)=> tag.label),
          mimeType: file.mimeType,
          documentType: file.documentType,
          storedName: file.storedName,
          sapId: file.sapId,
          categoryId: file.categoryId,
        }))

        // Combine folders and files
        const allItems = [...folders, ...files]

        // Build proper breadcrumb trail
        const state = get()
        let newBreadcrumbs = []

        // Always start with root
        newBreadcrumbs.push({ id: null, name: "My Drive" })

        // Build breadcrumb trail from the category data
        if (categoryData.parent) {
          // If there's parent data, build the trail recursively
          const buildBreadcrumbTrail = (category) => {
            const trail = []
            let current = category

            while (current && current.id) {
              trail.unshift({
                id: current.id,
                name: current.name || "Unnamed Folder",
                parentId: current.parentId,
              })
              current = current.parent
            }

            return trail
          }

          const trail = buildBreadcrumbTrail(categoryData)
          newBreadcrumbs = [{ id: null, name: "My Drive" }, ...trail]
        } else {
          // If no parent data, just add current folder
          newBreadcrumbs.push({
            id: categoryData.id,
            name: categoryData.name || "Unnamed Folder",
            parentId: categoryData.parentId,
          })
        }

        set({
          currentItems: allItems,
          allItems: allItems,
          currentFolder: {
            id: categoryData.id,
            name: categoryData.name || "Unnamed Folder",
            parentId: categoryData.parentId,
            parent: categoryData.parent,
            noOfChildren: res.data.data.noOfChildern || 0,
            noOfFiles: res.data.data.noOfFiles || 0,
          },
          breadcrumbs: newBreadcrumbs,
          navigationHistory: [...state.navigationHistory, { folderId, items: state.currentItems }],
        })

        return true
      } else {
        console.error("Invalid API response structure:", res.data)
        toast.error("Invalid response from server")
        return false
      }
    } catch (error) {
      console.log(`Error getting folder contents`, error)
      toast.error("Error loading folder contents")
      return false
    } finally {
      set({ isLoading: false })
    }
  },

  navigateToFolder: async (folderId) => {
    const success = await get().getFolderContents(folderId)
    return success
  },

  navigateBack: async () => {
    const state = get()

    if (!state.breadcrumbs || state.breadcrumbs.length <= 1) {
      // Already at root
      return
    }

    // Remove current breadcrumb
    const newBreadcrumbs = [...state.breadcrumbs]
    newBreadcrumbs.pop()

    const parentBreadcrumb = newBreadcrumbs[newBreadcrumbs.length - 1]

    if (parentBreadcrumb.id === null) {
      // Going back to root
      console.log("Going back to root !!! hi ")
      await get().getRootFolders()
    } else {
      // Going back to parent folder
      await get().getFolderContents(parentBreadcrumb.id)
    }
  },

  navigateToBreadcrumb: async (breadcrumbIndex) => {
    const state = get()
    if (!state.breadcrumbs || breadcrumbIndex >= state.breadcrumbs.length) return

    const targetBreadcrumb = state.breadcrumbs[breadcrumbIndex]

    if (targetBreadcrumb.id === null) {
      // Navigate to root
      await get().getRootFolders()
    } else {
      // Navigate to specific folder
      await get().getFolderContents(targetBreadcrumb.id)
    }
  },

  setSearchQuery: (query) => set({ searchQuery: query }),

  createFolder: async (name, parentId = null) => {
    try {
      set({ isLoading: true })
      const state = get()
      const actualParentId = parentId || state.currentFolder?.id || null

      const payload = { name }
      if (actualParentId) {
        payload.parentId = actualParentId
      }

      console.log("Creating folder with payload:", payload)
      const res = await axiosInstance.post("/category/create-category", payload)
      console.log("Create folder response:", res.data)

      if (res.data && res.data.success && res.data.data) {
        const folderData = res.data.data.newCategory

        // Validate that we have a proper ID
        if (!folderData.id) {
          console.error("Created folder has no ID:", folderData)
          toast.error("Error: Created folder has no ID")
          return false
        }

        // Transform the new folder data
        const newFolder = {
          id: folderData.id,
          name: folderData.name || name,
          type: "folder",
          parentId: folderData.parentId,
          createdAt: folderData.createdAt,
          updatedAt: folderData.updatedAt,
          modifiedAt: folderData.updatedAt || folderData.createdAt,
          starred: false,
          itemCount: 0,
        }

        console.log("New folder object:", newFolder)

        // Validate the new folder object
        if (!newFolder.id) {
          console.error("New folder object has no ID:", newFolder)
          toast.error("Error: Failed to create folder with valid ID")
          return false
        }

        // Add the new folder to current items
        set((state) => ({
          currentItems: [newFolder, ...(state.currentItems || [])],
          allItems: [newFolder, ...(state.allItems || [])],
        }))

        // Update folder counts if we have a current folder
        if (state.currentFolder) {
          set((state) => ({
            currentFolder: {
              ...state.currentFolder,
              noOfChildren: (state.currentFolder.noOfChildren || 0) + 1,
            },
          }))
        }

        toast.success(`Folder "${name}" created successfully`)
        return true
      } else {
        console.error("Invalid create folder response:", res.data)
        toast.error("Error: Invalid response from server")
        return false
      }
    } catch (error) {
      console.log(`Error creating folder`, error)
      toast.error("Error creating folder")
      return false
    } finally {
      set({ isLoading: false })
    }
  },

  uploadFiles: async (files, categoryId = null, metadata = []) => {
    try {
      set({ isLoading: true })
      const state = get()
      const actualCategoryId = categoryId || state.currentFolder?.id || null

      const formData = new FormData()
      files.forEach((fileObj) => {
        formData.append("files", fileObj.file)
      })
      formData.append("metadata", JSON.stringify(metadata))
      // Determine the correct endpoint based on whether we have a category ID
      let endpoint = "/files/upload"
      if (actualCategoryId) {
        endpoint = `/files/upload/${actualCategoryId}`
      } 

      const res = await axiosInstance.post(endpoint, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
       console.log('Response ',res.data.data)
      if (res.data && res.data.success) {
        // Handle the new response structure
        const uploadedFiles = res.data.data.files || []

        const transformedFiles = uploadedFiles.map((file) => ({
          id: file.id,
          name: file.originalName || "Unnamed File",
          type: getFileTypeFromExtension(file.originalName) || getFileTypeFromMimeType(file.mimeType) || "file",
          size: Number.parseInt(file.size) || 0,
          parentId: file.categoryId,
          createdAt: file.uploadedAt,
          updatedAt: file.uploadedAt,
          modifiedAt: file.modifiedAt,
          uploadedAt: file.uploadedAt,
          starred: false,
          url: file.path,
          path: file.path,
          description: file.description,
          tags :file.tags.map((t)=>t.tag.label),
          mimeType: file.mimeType,
          documentType: file.documentType,
          storedName: file.storedName,
          sapId: file.sapId,
          categoryId: file.categoryId,
        }))

        set((state) => ({
          currentItems: [...transformedFiles, ...(state.currentItems || [])],
          allItems: [...transformedFiles, ...(state.allItems || [])],
        }))

        toast.success(`${files.length} ${files.length === 1 ? "file" : "files"} uploaded successfully`)
        return true
      }
    } catch (error) {
      console.log(`Error uploading files`, error)
      toast.error("Error uploading files")
      return false
    } finally {
      set({ isLoading: false })
    }
  },
   
  updateFileMetadata: async (fileId, updates) => {
    try {
      set({ isLoading: true })
      let url = `/files/update/${fileId}`
      console.log(`UPDATES = ${JSON.stringify(updates)}`)
      const res = await axiosInstance.put(url,{updates});
      const state = get()
      if (res.data && res.data.success) {
        const {id,originalName,description} = res.data.data.newFile

        const updatedState = (state.currentItems||[]).map((item)=> 
          item.id===id
        ? {...item,name:originalName,description:description}:item)
        set(({currentItems:updatedState}))
        toast.success("File details updated successfully")
        return true
      }
    } catch (error) {
      console.log(`Error updating file metadata`, error)
      toast.error("Error updating file metadata")
      return false
    } finally {
      set({ isLoading: false })
    }
  },
  renameFolder:async(categoryId,newName)=>{
   try {
      const {data} = await axiosInstance.patch("/category/rename-category",{
        id:categoryId,
        newName})
       if(data){
        const{id,name} = data.data.updatedCategory;
        const state = get()
        const updatedCurrentState = (state.currentItems||[]).map((item)=> 
          item.id===id? {...item,name:name}:item)
        set({currentItems:updatedCurrentState}) 
        toast.success("Successfully updated folder name")
       }
   } catch (error) {
    console.log(`Error updating folder name `, error)
    toast.error("Error updating folder name")
   }
  },
  toggleStarred: async (id) => {
    try {
      const state = get()
      const items = state.currentItems || []
      const item = items.find((item) => item.id === id)

      if (!item) return

      // Optimistically update the UI first
      set((state) => ({
        currentItems: (state.currentItems || []).map((item) =>
          item.id === id ? { ...item, starred: !item.starred } : item,
        ),
        allItems: (state.allItems || []).map((item) => (item.id === id ? { ...item, starred: !item.starred } : item)),
      }))

      const res = await axiosInstance.put(`/${item.type === "folder" ? "category" : "file"}/toggle-star/${id}`)

      if (!res.data || !res.data.success) {
        // Revert the optimistic update if the API call failed
        set((state) => ({
          currentItems: (state.currentItems || []).map((item) =>
            item.id === id ? { ...item, starred: !item.starred } : item,
          ),
          allItems: (state.allItems || []).map((item) => (item.id === id ? { ...item, starred: !item.starred } : item)),
        }))
        toast.error("Error updating starred status")
      }
    } catch (error) {
      console.log(`Error toggling starred status`, error)
      // Revert the optimistic update
      set((state) => ({
        currentItems: (state.currentItems || []).map((item) =>
          item.id === id ? { ...item, starred: !item.starred } : item,
        ),
        allItems: (state.allItems || []).map((item) => (item.id === id ? { ...item, starred: !item.starred } : item)),
      }))
      toast.error("Error updating starred status")
    }
  },

  deleteItem: async (id) => {
    try {
      const state = get()
      const items = state.currentItems || []
      const item = items.find((item) => item.id === id)

      if (!item) return

      set({ isLoading: true })

      const res = await axiosInstance.delete(`/${item.type === "folder" ? "category" : "files"}/delete/${id}`)

      if (res.data && res.data.success) {
        set((state) => ({
          currentItems: (state.currentItems || []).filter((item) => item.id !== id),
          allItems: (state.allItems || []).filter((item) => item.id !== id),
        }))
        toast.success(`${item.name} deleted successfully`)
        return true
      }
    } catch (error) {
      console.log(`Error deleting item`, error)
      toast.error("Error deleting item")
      return false
    } finally {
      set({ isLoading: false })
    }
  },

  clearData: () => {
    set({
      rootItems: [],
      currentItems: [],
      allItems: [],
      currentFolder: null,
      navigationHistory: [],
      breadcrumbs: [{ id: null, name: "My Drive" }],
      searchQuery: "",
      isLoading: false,
    })
  },

  // Filter methods
  setFilters: (newFilters) => {
    set({ filters: newFilters })
  },

  clearFilters: () => {
    set({
      filters: {
        fileTypes: [],
        tags: [],
        dateRange: { from: null, to: null },
        sizeRange: { min: "", max: "" },
        owner: "",
        searchInContent: false,
        includeSubfolders: true,
      },
    })
    // Reset to show all items
    const state = get()
    set({ currentItems: state.allItems })
  },

  filterFiles: async (categoryId, tagIds = []) => {
    try {
      set({ isLoading: true });
      console.log(typeof tagIds)
      const url = categoryId
  ? `/files/filter/${categoryId}?tags=${tagIds.join(",")}`
  : `/files/filter?tags=${tagIds.join(",")}`; // no trailing slash here
  
      const { data } = await axiosInstance.get(url);
  
      const files = data?.data?.files || [];
  
      // Transform as needed
      const transformed = files.map((file) => ({
        id: file.id,
        name: file.originalName,
        type: getFileTypeFromExtension(file.originalName) || getFileTypeFromMimeType(file.mimeType) || "file",
        size: Number(file.size),
        path: file.path,
        categoryId: file.categoryId,
        uploadedAt: file.uploadedAt,
        description:file.description,
        tags: file.tags.map((t)=> t.tagLabel),
      }));
  
      set({
        filteredItems: transformed,
        currentItems: transformed, // Optional: update view
      });
  
      console.log("✅ Filtered files loaded:", transformed);
    } catch (err) {
      console.error("❌ Error filtering files", err);
    } finally {
      set({ isLoading: false });
    }
  },
  search : async(query)=>{
    try {
        const response = await axiosInstance.get(`/files/search?query=${query}`);
        console.log(response.data);
        if(response.data){
          const files = response.data.data.files.map((file)=>({
            id: file.id,
            name: file.originalName || "Unnamed File",
            type: getFileTypeFromExtension(file.originalName) || getFileTypeFromMimeType(file.mimeType) || "file",
            size: Number.parseInt(file.size) || 0,
            parentId: file.categoryId,
            createdAt: file.uploadedAt,
            updatedAt: file.uploadedAt,
            modifiedAt: file.modifiedAt,
            uploadedAt: file.uploadedAt,
            starred: false,
            url: file.path,
            path: file.path,
            description: file.description,
            tags :file.tags.map((t)=>t.tag.label),
            mimeType: file.mimeType,
            documentType: file.documentType,
            storedName: file.storedName,
            sapId: file.sapId,
            categoryId: file.categoryId,
          }))
          set({currentItems:files })
          toast.success(response.data.message);
        }
       
    } catch (error) {
       console.error("Error",error);
       const errorMessage = error?.response?.data?.message || "Something went wrong while searching";
       toast.error(errorMessage)
    }
  },
}))

// Helper function to determine file type from extension
const getFileTypeFromExtension = (filename) => {
  if (!filename) return "file"
  const extension = filename.slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2)
  switch (extension.toLowerCase()) {
    case "pdf":
      return "pdf"
    case "doc":
    case "docx":
      return "document"
    case "xls":
    case "xlsx":
      return "excel"
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
      return "image"
    case "mp4":
    case "avi":
    case "mov":
      return "video"
    case "zip":
    case "rar":
      return "archive"
    default:
      return "file"
  }
}

const getFileTypeFromMimeType = (mimeType) => {
  if (!mimeType) return "file"

  if (mimeType.startsWith("image/")) {
    return "image"
  } else if (mimeType.startsWith("video/")) {
    return "video"
  } else if (mimeType === "application/pdf") {
    return "pdf"
  } else if (
    mimeType === "application/msword" ||
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    return "document"
  } else if (
    mimeType === "application/vnd.ms-excel" ||
    mimeType === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  ) {
    return "excel"
  } else if (mimeType === "application/zip" || mimeType === "application/x-rar-compressed") {
    return "archive"
  }

  return "file"
}
