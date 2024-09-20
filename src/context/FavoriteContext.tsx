import React, { createContext, useState, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

interface FavoriteContextType {
  favorites: string[];
  toggleFavorite: (id: string | string[]) => void; // Accept both single ID and array of IDs
}

export const FavoriteContext = createContext<FavoriteContextType | undefined>(undefined);

export const FavoriteProvider = ({ children }: { children: ReactNode }) => {
  const [favorites, setFavorites] = useState<string[]>([]);

  // Load favorites from AsyncStorage
  const loadFavorites = async () => {
    try {
      const storedFavorites = await AsyncStorage.getItem('favorites');
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites));
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  // Toggle favorite status (supports single or multiple IDs)
  const toggleFavorite = async (id: string | string[]) => {
    setFavorites((prevFavorites) => {
      let updatedFavorites;

      if (Array.isArray(id)) {
        // Handle batch removal
        updatedFavorites = prevFavorites.filter(favId => !id.includes(favId));
      } else {
        // Handle single item toggle
        updatedFavorites = prevFavorites.includes(id)
          ? prevFavorites.filter(favId => favId !== id)
          : [...prevFavorites, id];
      }

      // Save updated favorites to AsyncStorage
      AsyncStorage.setItem('favorites', JSON.stringify(updatedFavorites)).catch((error) => {
        console.error('Error updating favorites:', error);
      });

      return updatedFavorites;
    });
  };

  useEffect(() => {
    loadFavorites();
  }, []);

  return (
    <FavoriteContext.Provider value={{ favorites, toggleFavorite }}>
      {children}
    </FavoriteContext.Provider>
  );
};
