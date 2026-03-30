import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'dark' | 'light';
export type MenuPosition = 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
export type SubNavStyle = 'numbered' | 'chevron';

interface PreferencesStore {
  theme: Theme;
  menuPosition: MenuPosition;
  subNavStyle: SubNavStyle;
  setTheme: (theme: Theme) => void;
  setMenuPosition: (position: MenuPosition) => void;
  setSubNavStyle: (style: SubNavStyle) => void;
}

export const usePreferencesStore = create<PreferencesStore>()(
  persist(
    (set) => ({
      theme: 'dark',
      menuPosition: 'bottom-left',
      subNavStyle: 'numbered',
      setTheme: (theme) => set({ theme }),
      setMenuPosition: (position) => set({ menuPosition: position }),
      setSubNavStyle: (style) => set({ subNavStyle: style }),
    }),
    { name: 'proto-explorer-preferences' },
  ),
);
