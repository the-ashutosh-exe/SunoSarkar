import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeMode = 'gis-dark' | 'amoled' | 'light' | 'genz-light';
export type AiSensitivity = 'strict' | 'balanced' | 'verbose';

interface SettingsState {
  themeMode: ThemeMode;
  aiSensitivity: AiSensitivity;
  gpsTracking: boolean;
  dispatchAlerts: boolean;
  setThemeMode: (mode: ThemeMode) => void;
  setAiSensitivity: (sensitivity: AiSensitivity) => void;
  setGpsTracking: (enabled: boolean) => void;
  setDispatchAlerts: (enabled: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      themeMode: 'gis-dark',
      aiSensitivity: 'balanced',
      gpsTracking: true,
      dispatchAlerts: true,
      setThemeMode: (mode) => {
        set({ themeMode: mode });
        document.documentElement.setAttribute('data-theme', mode);
      },
      setAiSensitivity: (sensitivity) => set({ aiSensitivity: sensitivity }),
      setGpsTracking: (enabled) => set({ gpsTracking: enabled }),
      setDispatchAlerts: (enabled) => set({ dispatchAlerts: enabled }),
    }),
    {
      name: 'civicpulse-settings-storage',
      onRehydrateStorage: () => (state) => {
        if (state?.themeMode) {
          document.documentElement.setAttribute('data-theme', state.themeMode);
        }
      },
    }
  )
);
