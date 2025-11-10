import { createContext, useContext, useEffect, useState } from 'react';

// Create a context for the theme
const ThemeContext = createContext(undefined);

export function ThemeProvider({ children, defaultTheme = 'light', storageKey = 'vite-ui-theme', ...props }) {
  // Initialize theme state with the value from localStorage or use the default
  const [theme, setTheme] = useState(() => {
    // Check if we're on the client side before accessing localStorage
    if (typeof window !== 'undefined') {
      return localStorage.getItem(storageKey) || defaultTheme;
    }
    return defaultTheme;
  });

  // Apply the theme class to the document element
  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove any existing theme classes
    root.classList.remove('light', 'dark');
    
    // Add the current theme class
    root.classList.add(theme);
    
    // Save the theme preference to localStorage
    try {
      localStorage.setItem(storageKey, theme);
    } catch (e) {
      console.error('Failed to save theme preference:', e);
    }
  }, [theme, storageKey]);

  // Toggle between light and dark theme
  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider
      {...props}
      value={{
        theme,
        setTheme,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

// Custom hook to use the theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeProvider;
