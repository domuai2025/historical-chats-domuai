import React, { createContext, useContext, useState, useEffect } from 'react';

// Define the shape of our accessibility settings
type AccessibilitySettings = {
  highContrast: boolean;
  largeText: boolean;
  reducedMotion: boolean;
};

// Define the shape of our context
type AccessibilityContextType = {
  settings: AccessibilitySettings;
  toggleHighContrast: () => void;
  toggleLargeText: () => void;
  toggleReducedMotion: () => void;
  resetSettings: () => void;
};

// Define the default settings
const defaultSettings: AccessibilitySettings = {
  highContrast: false,
  largeText: false,
  reducedMotion: false,
};

// Create the context with default values
const AccessibilityContext = createContext<AccessibilityContextType>({
  settings: defaultSettings,
  toggleHighContrast: () => {},
  toggleLargeText: () => {},
  toggleReducedMotion: () => {},
  resetSettings: () => {},
});

// Custom hook to use the accessibility context
export const useAccessibility = () => useContext(AccessibilityContext);

// Provider component for the accessibility context
export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Try to get settings from localStorage or use defaults
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    const savedSettings = localStorage.getItem('accessibilitySettings');
    return savedSettings ? JSON.parse(savedSettings) : defaultSettings;
  });

  // Update the body classes when settings change
  useEffect(() => {
    // Apply high contrast mode
    if (settings.highContrast) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }

    // Apply large text mode
    if (settings.largeText) {
      document.body.classList.add('large-text');
    } else {
      document.body.classList.remove('large-text');
    }

    // Apply reduced motion mode
    if (settings.reducedMotion) {
      document.body.classList.add('reduced-motion');
    } else {
      document.body.classList.remove('reduced-motion');
    }

    // Save settings to localStorage
    localStorage.setItem('accessibilitySettings', JSON.stringify(settings));
  }, [settings]);

  // Toggle functions for each setting
  const toggleHighContrast = () => {
    setSettings((prev) => ({ ...prev, highContrast: !prev.highContrast }));
  };

  const toggleLargeText = () => {
    setSettings((prev) => ({ ...prev, largeText: !prev.largeText }));
  };

  const toggleReducedMotion = () => {
    setSettings((prev) => ({ ...prev, reducedMotion: !prev.reducedMotion }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  return (
    <AccessibilityContext.Provider
      value={{
        settings,
        toggleHighContrast,
        toggleLargeText,
        toggleReducedMotion,
        resetSettings,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};