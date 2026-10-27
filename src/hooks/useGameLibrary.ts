import { useState, useEffect, useCallback } from 'react';
import { GameRecord } from '../types';
import {
  INITIAL_USER_LIBRARY,
  DEV_SAMPLE_CATALOG,
  deduplicateGames
} from '../utils/gameLibraryUtils';
import { nativeBridge } from '../services/nativeBridge';

const STORAGE_KEY = 'gbx_saved_games_v2';
const DEV_MODE_STORAGE_KEY = 'gbx_dev_sample_mode';

export function useGameLibrary() {
  const [isDevMode, setIsDevMode] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(DEV_MODE_STORAGE_KEY) === 'true';
  });

  const [games, setGames] = useState<GameRecord[]>(() => {
    if (typeof window === 'undefined') return INITIAL_USER_LIBRARY;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not read saved games from localStorage:', e);
    }
    return INITIAL_USER_LIBRARY;
  });

  const [selectedGameId, setSelectedGameId] = useState<string | null>(() => {
    return games[0]?.id || null;
  });

  // Revalidate installed status on native devices on mount
  useEffect(() => {
    if (nativeBridge.isNativeAvailable() && games.length > 0) {
      setGames((prev) =>
        prev.map((game) => {
          if (game.packageName) {
            const installed = nativeBridge.isPackageInstalled(game.packageName);
            if (installed !== null) {
              return { ...game, isVerifiedInstalled: installed };
            }
          }
          return game;
        })
      );
    }
  }, []);

  // Update selectedGameId when games change
  useEffect(() => {
    if (games.length === 0) {
      setSelectedGameId(null);
    } else if (!games.some((g) => g.id === selectedGameId)) {
      setSelectedGameId(games[0].id);
    }
  }, [games, selectedGameId]);

  // Persist whenever games change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(games));
      } catch (e) {
        console.error('Failed to persist games:', e);
      }
    }
  }, [games]);

  // Persist dev mode toggle
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(DEV_MODE_STORAGE_KEY, isDevMode ? 'true' : 'false');
    }
  }, [isDevMode]);

  const addGamesToLibrary = useCallback((newGames: GameRecord[]) => {
    setGames((prev) => {
      const uniqueNew = deduplicateGames(prev, newGames);
      return [...uniqueNew, ...prev];
    });
  }, []);

  const removeGameFromLibrary = useCallback((gameId: string) => {
    setGames((prev) => {
      const filtered = prev.filter((g) => g.id !== gameId);
      return filtered;
    });
    setSelectedGameId((current) => (current === gameId ? null : current));
  }, []);

  const recordGameLaunch = useCallback((gameId: string) => {
    const now = new Date().toISOString();
    setGames((prev) =>
      prev.map((g) => {
        if (g.id === gameId) {
          return {
            ...g,
            lastLaunchedAt: now,
            playCount: (g.playCount || 0) + 1
          };
        }
        return g;
      })
    );
  }, []);

  const clearLibrary = useCallback(() => {
    setGames([]);
    setSelectedGameId(null);
  }, []);

  const toggleDevSampleMode = useCallback(() => {
    setIsDevMode((prev) => {
      const next = !prev;
      if (next) {
        // Load dev preview catalog
        setGames(DEV_SAMPLE_CATALOG);
        setSelectedGameId(DEV_SAMPLE_CATALOG[0]?.id || null);
      } else {
        // Restore empty production library
        setGames([]);
        setSelectedGameId(null);
      }
      return next;
    });
  }, []);

  const selectedGame = games.find((g) => g.id === selectedGameId) || games[0] || null;

  return {
    games,
    selectedGame,
    selectedGameId,
    setSelectedGameId,
    addGamesToLibrary,
    removeGameFromLibrary,
    recordGameLaunch,
    clearLibrary,
    resetToDefaultLibrary: clearLibrary,
    isDevMode,
    toggleDevSampleMode
  };
}
