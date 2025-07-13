import { NavLink } from "react-router-dom"
import { HardDrive, Star, Clock, Trash2, Share2, Cloud, FileText, ImageIcon, Film, Music } from "lucide-react"

export default function Sidebar() {
  const menuItems = [
    { icon: <HardDrive className="h-5 w-5" />, label: "My Drive", to: "/folders" },
    { icon: <Star className="h-5 w-5" />, label: "Starred", to: "/starred" },
    { icon: <Clock className="h-5 w-5" />, label: "Recent", to: "/recent" },
    { icon: <Trash2 className="h-5 w-5" />, label: "Trash", to: "/trash" },
    { icon: <Share2 className="h-5 w-5" />, label: "Shared with me", to: "/shared" },
    { icon: <Cloud className="h-5 w-5" />, label: "Storage", to: "/storage" },
  ]

  const categories = [
    { icon: <FileText className="h-5 w-5" />, label: "Documents", to: "/category/documents" },
    { icon: <ImageIcon className="h-5 w-5" />, label: "Images", to: "/category/images" },
    { icon: <Film className="h-5 w-5" />, label: "Videos", to: "/category/videos" },
    { icon: <Music className="h-5 w-5" />, label: "Audio", to: "/category/audio" },
  ]

  return (
    <aside className="hidden w-64 flex-shrink-0 border-r bg-background md:block">
      <div className="flex h-full flex-col p-4">
        <div className="space-y-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              className={({ isActive }) =>
                `flex w-full items-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-secondary text-secondary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`
              }
            >
              {item.icon}
              <span className="ml-2">{item.label}</span>
            </NavLink>
          ))}
        </div>

        <div className="mt-6">
          <h3 className="mb-2 px-4 text-sm font-medium text-muted-foreground">Categories</h3>
          <div className="space-y-1">
            {categories.map((category) => (
              <NavLink
                key={category.label}
                to={category.to}
                className={({ isActive }) =>
                  `flex w-full items-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-secondary text-secondary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`
                }
              >
                {category.icon}
                <span className="ml-2">{category.label}</span>
              </NavLink>
            ))}
          </div>
        </div>

        <div className="mt-auto p-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Storage</span>
              <span className="text-xs text-muted-foreground">7.5GB / 15GB</span>
            </div>
            <div className="h-2 rounded-full bg-muted">
              <div className="h-full w-1/2 rounded-full bg-primary"></div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
