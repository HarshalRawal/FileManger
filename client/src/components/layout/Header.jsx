import { useState, useEffect } from "react";
import { useFileStore } from "../../store/fileStore";
import { useViewStore } from "../../store/viewStore";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Search, Grid, List, Moon, Sun, Bell, Settings, HelpCircle, X } from "lucide-react";
import { useTheme } from "../Theme/Theme-Provider";
import { useLocation } from "react-router-dom";

export default function Header() {
  const { searchQuery, setSearchQuery, search, getRootFolders } = useFileStore();
  const { viewMode, setViewMode } = useViewStore();
  const { theme, setTheme } = useTheme();
  const [searchValue, setSearchValue] = useState(searchQuery);
  const location = useLocation(); // ← NEW

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchValue);

      if (searchValue.trim() === "") {
        // ✅ Only reset to root folders if current route is exactly /folders
        if (location.pathname === "/folders") {
          getRootFolders();
        }
      } else {
        search(searchValue.trim());
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchValue, setSearchQuery, search, getRootFolders, location.pathname]);

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background px-4">
      {/* Left Section - Logo */}
      <div className="flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
          >
            <path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z"></path>
          </svg>
        </div>
        <h1 className="text-xl font-bold">FileManager</h1>
      </div>

      {/* Middle - Search */}
      <div className="relative mx-4 flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-10 pr-10"
          placeholder="Search files and folders..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
        />
        {searchValue && (
          <X
            className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 cursor-pointer text-muted-foreground"
            onClick={() => setSearchValue("")}
          />
        )}
      </div>

      {/* Right - Controls */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
          title={viewMode === "grid" ? "List view" : "Grid view"}
        >
          {viewMode === "grid" ? <List className="h-5 w-5" /> : <Grid className="h-5 w-5" />}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          title={theme === "dark" ? "Light mode" : "Dark mode"}
        >
          {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>

        <Button variant="ghost" size="icon" title="Notifications">
          <Bell className="h-5 w-5" />
        </Button>

        <Button variant="ghost" size="icon" title="Settings">
          <Settings className="h-5 w-5" />
        </Button>

        <Button variant="ghost" size="icon" title="Help">
          <HelpCircle className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
