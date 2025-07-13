// "use client"

// import { useState } from "react"
// import { useFileStore } from "../store/fileStore"
// import { useViewStore } from "../store/viewStore"
// import Header from "../components/layout/Header"
// import Sidebar from "../components/layout/Sidebar"
// import Breadcrumbs from "../components/layout/Breadcrumbs"
// import FileGrid from "../components/files/FileGrid"
// import FileList from "../components/files/FileList"
// import CreateFolderDialog from "../components/dialogs/CreateFolderDialog"
// import FileUploadDialog from "../components/dialogs/FileUploadDialog"
// import FilePreviewDialog from "../components/dialogs/FilePreviewDialog"
// import FileMetadataDialog from "../components/dialogs/FileMetadataDialog"
// import { Button } from "../components/ui/button"
// import { Plus, Loader2, ArrowLeft } from "lucide-react"
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "../components/ui/dropdown-menu"

// export default function HomePage() {
//   const { currentItems, currentFolder, breadcrumbs, searchQuery, isLoading, navigateToFolder, navigateBack } =
//     useFileStore()
//   const { viewMode } = useViewStore()
//   const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false)
//   const [isFileUploadOpen, setIsFileUploadOpen] = useState(false)
//   const [selectedFile, setSelectedFile] = useState(null)
//   const [fileForMetadata, setFileForMetadata] = useState(null)

//   // REMOVED THE PROBLEMATIC useEffect THAT WAS CALLING getRootFolders()
//   // This was causing the extra API call

//   const handleFileClick = async (file) => {
//     if (file.type === "folder") {
//       console.log("Navigating to folder:", file.name)
//       await navigateToFolder(file.id)
//     } else {
//       setSelectedFile(file)
//     }
//   }

//   const handleMetadataEdit = (file) => {
//     setFileForMetadata(file)
//   }

//   const handleBackClick = async () => {
//     await navigateBack()
//   }

//   // Ensure currentItems is always an array before filtering
//   const safeCurrentItems = Array.isArray(currentItems) ? currentItems : []

//   // Filter items based on search query
//   const filteredItems = searchQuery
//     ? safeCurrentItems.filter(
//         (item) => item && item.name && item.name.toLowerCase().includes(searchQuery.toLowerCase()),
//       )
//     : safeCurrentItems

//   // Sort items to display folders first, then files
//   const sortedItems = [...filteredItems].sort((a, b) => {
//     if (!a || !b) return 0
//     // If both are folders or both are files, sort alphabetically
//     if ((a.type === "folder" && b.type === "folder") || (a.type !== "folder" && b.type !== "folder")) {
//       return (a.name || "").localeCompare(b.name || "")
//     }
//     // Folders come before files
//     return a.type === "folder" ? -1 : 1
//   })

//   const canGoBack = breadcrumbs && breadcrumbs.length > 1

//   return (
//     <div className="flex h-screen flex-col">
//       <Header />
//       <div className="flex flex-1 overflow-hidden">
//         <Sidebar />

//         <main className="flex-1 overflow-auto p-4">
//           <div className="mb-4 flex items-center justify-between">
//             <div className="flex items-center gap-2">
//               {canGoBack && (
//                 <Button variant="ghost" size="icon" onClick={handleBackClick} disabled={isLoading} className="mr-2">
//                   <ArrowLeft className="h-4 w-4" />
//                 </Button>
//               )}
//               <div>
//                 <h1 className="text-2xl font-bold">{currentFolder ? currentFolder.name : "My Drive"}</h1>
//                 {currentFolder && (
//                   <p className="text-sm text-muted-foreground">
//                     {currentFolder.noOfChildren || 0} folders, {currentFolder.noOfFiles || 0} files
//                   </p>
//                 )}
//               </div>
//               {isLoading && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
//             </div>

//             <div className="flex items-center gap-2">
//               <DropdownMenu>
//                 <DropdownMenuTrigger asChild>
//                   <Button variant="outline" disabled={isLoading}>
//                     <Plus className="mr-2 h-4 w-4" />
//                     New
//                   </Button>
//                 </DropdownMenuTrigger>
//                 <DropdownMenuContent align="end">
//                   <DropdownMenuItem onClick={() => setIsCreateFolderOpen(true)}>New Folder</DropdownMenuItem>
//                   <DropdownMenuItem onClick={() => setIsFileUploadOpen(true)}>File Upload</DropdownMenuItem>
//                 </DropdownMenuContent>
//               </DropdownMenu>
//             </div>
//           </div>

//           <Breadcrumbs />

//           {isLoading && sortedItems.length === 0 ? (
//             <div className="flex h-[50vh] flex-col items-center justify-center text-center">
//               <Loader2 className="mb-4 h-10 w-10 animate-spin text-primary" />
//               <h3 className="mb-2 text-xl font-semibold">Loading...</h3>
//               <p className="text-muted-foreground">Fetching folder contents</p>
//             </div>
//           ) : sortedItems.length === 0 ? (
//             <div className="flex h-[50vh] flex-col items-center justify-center text-center">
//               <div className="mb-4 rounded-full bg-muted p-6">
//                 <svg
//                   className="h-10 w-10 text-muted-foreground"
//                   fill="none"
//                   height="24"
//                   stroke="currentColor"
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth="2"
//                   viewBox="0 0 24 24"
//                   width="24"
//                   xmlns="http://www.w3.org/2000/svg"
//                 >
//                   <path d="M5 8h14M5 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM19 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
//                   <path d="M19 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
//                   <path d="M12 16a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
//                   <path d="M5 16a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
//                   <path d="M5 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
//                   <path d="M12 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
//                   <path d="M19 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
//                 </svg>
//               </div>
//               <h3 className="mb-2 text-xl font-semibold">{currentFolder ? "Empty folder" : "No files or folders"}</h3>
//               <p className="mb-4 text-muted-foreground">
//                 {currentFolder
//                   ? "This folder is empty. Create a new folder or upload files to get started."
//                   : "Create a new folder or upload files to get started"}
//               </p>
//               <div className="flex gap-2">
//                 <Button onClick={() => setIsCreateFolderOpen(true)}>Create Folder</Button>
//                 <Button variant="outline" onClick={() => setIsFileUploadOpen(true)}>
//                   Upload Files
//                 </Button>
//               </div>
//             </div>
//           ) : viewMode === "grid" ? (
//             <FileGrid items={sortedItems} onFileClick={handleFileClick} onMetadataEdit={handleMetadataEdit} />
//           ) : (
//             <FileList items={sortedItems} onFileClick={handleFileClick} onMetadataEdit={handleMetadataEdit} />
//           )}
//         </main>
//       </div>
//       <CreateFolderDialog open={isCreateFolderOpen} onOpenChange={setIsCreateFolderOpen} />
//       <FileUploadDialog
//         open={isFileUploadOpen}
//         onOpenChange={setIsFileUploadOpen}
//         onMetadataEdit={handleMetadataEdit}
//       />
//       {selectedFile && (
//         <FilePreviewDialog file={selectedFile} open={!!selectedFile} onOpenChange={() => setSelectedFile(null)} />
//       )}
//       {fileForMetadata && (
//         <FileMetadataDialog
//           file={fileForMetadata}
//           open={!!fileForMetadata}
//           onOpenChange={() => setFileForMetadata(null)}
//         />
//       )}
//     </div>
//   )
// }
