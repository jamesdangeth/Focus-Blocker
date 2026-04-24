import { create } from 'zustand';
import { persist, StateStorage, createJSONStorage } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  plan: 'free' | 'premium' | 'lifetime';
}

const chromeStorageAdapter: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      return new Promise((resolve) => {
        chrome.storage.local.get([name], (result) => resolve((result[name] as string) || null));
      });
    }
    return null; // Fallback for non-extension environments, NO localStorage
  },
  setItem: async (name: string, value: string): Promise<void> => {
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      return new Promise((resolve) => {
        chrome.storage.local.set({ [name]: value }, () => resolve());
      });
    }
  },
  removeItem: async (name: string): Promise<void> => {
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      return new Promise((resolve) => {
        chrome.storage.local.remove([name], () => resolve());
      });
    }
  },
};

interface FocusState {
  user: User | null;
  isActive: boolean;
  mode: 'deep' | 'light' | 'meeting';
  sessionEndTime: number | null;
  initialTime: number; // total time for current session
  blockedSites: string[];
  sessions: any[];
  dailyFocusTime: number;
  onboardingLevel: number;
  
  setUser: (user: User | null) => void;
  startSession: (mode: FocusState['mode'], durationMinutes: number) => void;
  stopSession: () => void;
  addBlockedSite: (url: string) => void;
  removeBlockedSite: (url: string) => void;
}

export const useStore = create<FocusState>()(
  persist(
    (set) => ({
      user: null,
      isActive: false,
      mode: 'deep',
      sessionEndTime: null,
      initialTime: 0,
      blockedSites: ['facebook.com', 'instagram.com', 'twitter.com', 'youtube.com', 'tiktok.com', 'reddit.com'],
      sessions: [],
      dailyFocusTime: 0,
      onboardingLevel: 1,

      setUser: (user) => set({ user }),
      
      startSession: (mode, durationMinutes) => {
        const ms = durationMinutes * 60 * 1000;
        set({
          isActive: true,
          mode,
          initialTime: durationMinutes * 60,
          sessionEndTime: Date.now() + ms
        });
        if (typeof chrome !== 'undefined' && chrome.alarms) {
          chrome.alarms.create('focusSession', { when: Date.now() + ms });
        }
      },

      stopSession: () => {
        set({ isActive: false, sessionEndTime: null });
        if (typeof chrome !== 'undefined' && chrome.alarms) {
          chrome.alarms.clear('focusSession');
        }
      },

      addBlockedSite: (url) => set((state) => ({
        blockedSites: [...state.blockedSites, url.toLowerCase()]
      })),

      removeBlockedSite: (url) => set((state) => ({
        blockedSites: state.blockedSites.filter(s => s !== url.toLowerCase())
      }))
    }),
    { 
      name: 'smart-focus-storage',
      storage: createJSONStorage(() => chromeStorageAdapter)
    }
  )
);

// Add cross-tab synchronization listener
if (typeof chrome !== 'undefined' && chrome.storage?.onChanged) {
  let syncTimeout: any = null;
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local' && changes['smart-focus-storage']) {
      const newValue = changes['smart-focus-storage'].newValue as string;
      if (newValue) {
        if (syncTimeout) clearTimeout(syncTimeout);
        // Debounce to prevent rapid loop
        syncTimeout = setTimeout(() => {
          try {
            const parsed = JSON.parse(newValue);
            if (parsed && parsed.state) {
              const currentState = useStore.getState();
              const nextState = parsed.state;
              
              const hasChanges = 
                currentState.isActive !== nextState.isActive ||
                currentState.mode !== nextState.mode ||
                currentState.sessionEndTime !== nextState.sessionEndTime ||
                currentState.dailyFocusTime !== nextState.dailyFocusTime ||
                currentState.onboardingLevel !== nextState.onboardingLevel ||
                (currentState.blockedSites && nextState.blockedSites ? currentState.blockedSites.join(',') !== nextState.blockedSites.join(',') : currentState.blockedSites !== nextState.blockedSites);

              if (hasChanges) {
                useStore.setState(nextState);
              }
            }
          } catch (e) {
            console.error("Error syncing store state from chrome.storage", e);
          }
        }, 150); // 150ms debounce
      }
    }
  });
}

