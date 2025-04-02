import { useState, useEffect } from 'react';

interface UserPreferences {
  showQuickStart: boolean;
}

const defaultPreferences: UserPreferences = {
  showQuickStart: true,
};

export function useUserPreferences() {
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);

  useEffect(() => {
    // Charger les préférences depuis le localStorage au montage
    const savedPreferences = localStorage.getItem('userPreferences');
    if (savedPreferences) {
      setPreferences(JSON.parse(savedPreferences));
    }
  }, []);

  const updatePreferences = (newPreferences: Partial<UserPreferences>) => {
    const updatedPreferences = { ...preferences, ...newPreferences };
    setPreferences(updatedPreferences);
    localStorage.setItem('userPreferences', JSON.stringify(updatedPreferences));
  };

  return {
    preferences,
    updatePreferences,
  };
} 