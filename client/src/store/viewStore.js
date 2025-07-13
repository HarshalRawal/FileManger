import { create } from "zustand"
import { persist } from "zustand/middleware"

export const useViewStore = create(persist((set) => ({
  viewMode: "grid", // "grid" or "list"
  setViewMode: (mode) => set({ viewMode: mode }),
}), {
  name: "file-manager-view-settings",
}))
