import { create } from 'zustand';

const useUIStore = create((set) => ({
  isSidebarOpen: true,
  theme: 'light',
  isLoading: false,
  
  // Toggle sidebar
  toggleSidebar: () => {
    set((state) => ({ 
      isSidebarOpen: !state.isSidebarOpen 
    }));
  },
  
  // Set sidebar state
  setSidebarOpen: (isOpen) => {
    set({ isSidebarOpen: isOpen });
  },
  
  // Set theme
  setTheme: (theme) => {
    set({ theme });
    // Save theme preference to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', theme);
    }
  },
  
  // Toggle theme
  toggleTheme: () => {
    set((state) => {
      const newTheme = state.theme === 'light' ? 'dark' : 'light';
      // Save theme preference to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('theme', newTheme);
      }
      return { theme: newTheme };
    });
  },
  
  // Set loading state
  setLoading: (isLoading) => {
    set({ isLoading });
  }
}));

// Initialize theme from localStorage on client-side
if (typeof window !== 'undefined') {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    useUIStore.getState().setTheme(savedTheme);
  }
}

export default useUIStore;
