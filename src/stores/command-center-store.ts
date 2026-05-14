"use client";

import { create } from "zustand";
import type { CommandCenterPageId } from "@/lib/command-center/types";

type Density = "comfortable" | "compact";

type CommandCenterState = {
  sidebarCollapsed: boolean;
  commandOpen: boolean;
  essentialMode: boolean;
  query: string;
  selectedDepartment: string;
  density: Density;
  lastVisitedPage: CommandCenterPageId;
  toggleSidebar: () => void;
  toggleEssentialMode: () => void;
  setSidebarCollapsed: (value: boolean) => void;
  setCommandOpen: (value: boolean) => void;
  setQuery: (value: string) => void;
  setSelectedDepartment: (value: string) => void;
  setDensity: (value: Density) => void;
  setLastVisitedPage: (value: CommandCenterPageId) => void;
};

export const useCommandCenterStore = create<CommandCenterState>((set) => ({
  sidebarCollapsed: false,
  commandOpen: false,
  essentialMode: true,
  query: "",
  selectedDepartment: "all",
  density: "comfortable",
  lastVisitedPage: "dashboard",
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  toggleEssentialMode: () => set((state) => ({ essentialMode: !state.essentialMode })),
  setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
  setCommandOpen: (commandOpen) => set({ commandOpen }),
  setQuery: (query) => set({ query }),
  setSelectedDepartment: (selectedDepartment) => set({ selectedDepartment }),
  setDensity: (density) => set({ density }),
  setLastVisitedPage: (lastVisitedPage) => set({ lastVisitedPage }),
}));
