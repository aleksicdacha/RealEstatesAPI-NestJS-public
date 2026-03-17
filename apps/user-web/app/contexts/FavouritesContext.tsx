'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Cookies from 'js-cookie';

const FAVOURITES_COOKIE_KEY = 'favourite_properties';
const COOKIE_EXPIRES_DAYS = 30;

interface FavouritesContextType {
  favourites: string[];
  addFavourite: (propertyId: string) => void;
  removeFavourite: (propertyId: string) => void;
  toggleFavourite: (propertyId: string) => void;
  isFavourite: (propertyId: string) => boolean;
}

const FavouritesContext = createContext<FavouritesContextType | undefined>(undefined);

export function FavouritesProvider({ children }: { children: ReactNode }) {
  const [favourites, setFavourites] = useState<string[]>([]);

  useEffect(() => {
    // Load favourites from cookies on mount
    const stored = Cookies.get(FAVOURITES_COOKIE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setFavourites(parsed);
        }
      } catch (error) {
        console.error('Error parsing favourites from cookies:', error);
      }
    }
  }, []);

  const addFavourite = (propertyId: string) => {
    setFavourites(prev => {
      const newFavs = [...new Set([...prev, propertyId])];
      Cookies.set(FAVOURITES_COOKIE_KEY, JSON.stringify(newFavs), { expires: COOKIE_EXPIRES_DAYS });
      return newFavs;
    });
  };

  const removeFavourite = (propertyId: string) => {
    setFavourites(prev => {
      const newFavs = prev.filter(id => id !== propertyId);
      Cookies.set(FAVOURITES_COOKIE_KEY, JSON.stringify(newFavs), { expires: COOKIE_EXPIRES_DAYS });
      return newFavs;
    });
  };

  const toggleFavourite = (propertyId: string) => {
    if (favourites.includes(propertyId)) {
      removeFavourite(propertyId);
    } else {
      addFavourite(propertyId);
    }
  };

  const isFavourite = (propertyId: string) => favourites.includes(propertyId);

  return (
    <FavouritesContext.Provider value={{
      favourites,
      addFavourite,
      removeFavourite,
      toggleFavourite,
      isFavourite,
    }}>
      {children}
    </FavouritesContext.Provider>
  );
}

export function useFavourites() {
  const context = useContext(FavouritesContext);
  if (context === undefined) {
    throw new Error('useFavourites must be used within a FavouritesProvider');
  }
  return context;
}