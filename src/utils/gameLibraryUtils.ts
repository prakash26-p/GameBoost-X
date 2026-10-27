import { GameRecord, GameCategory } from '../types';

/**
 * Strict Production Data Policy:
 * Initial library starts strictly empty. No automatically seeded or fake installed games.
 */
export const INITIAL_USER_LIBRARY: GameRecord[] = [];

/**
 * Development-only sample catalog for preview testing only.
 * This is NEVER automatically inserted into the production library.
 */
export const DEV_SAMPLE_CATALOG: GameRecord[] = [
  {
    id: 'dev-freefire-std',
    name: 'Garena Free Fire',
    packageName: 'com.dts.freefireth',
    category: 'Battle Royale',
    icon: '🔥',
    accentColor: '#FF5C38',
    isVerifiedInstalled: false,
    isLaunchSupported: true,
    addedAt: '2026-10-25T10:00:00.000Z',
    lastLaunchedAt: null,
    playCount: 0,
    packageSizeEstimate: '380 MB APK + 1.2 GB Obb',
    developer: 'Garena International I',
    region: 'Global / Southeast Asia'
  },
  {
    id: 'dev-freefire-max',
    name: 'Free Fire MAX',
    packageName: 'com.dts.freefiremax',
    category: 'Battle Royale',
    icon: '⚡',
    accentColor: '#FF8800',
    isVerifiedInstalled: false,
    isLaunchSupported: true,
    addedAt: '2026-10-25T10:00:00.000Z',
    lastLaunchedAt: null,
    playCount: 0,
    packageSizeEstimate: '590 MB APK + 1.8 GB Ultra Assets',
    developer: 'Garena International I',
    region: 'Global Ultra Specs'
  },
  {
    id: 'dev-bgmi',
    name: 'Battlegrounds Mobile India',
    packageName: 'com.pubg.imobile',
    category: 'Battle Royale',
    icon: '🎯',
    accentColor: '#FFD700',
    isVerifiedInstalled: false,
    isLaunchSupported: true,
    addedAt: '2026-10-25T10:00:00.000Z',
    lastLaunchedAt: null,
    playCount: 0,
    packageSizeEstimate: '750 MB APK + 2.1 GB HD Resources',
    developer: 'Krafton, Inc.',
    region: 'India'
  },
  {
    id: 'dev-cod-mobile',
    name: 'Call of Duty: Mobile',
    packageName: 'com.activision.callofduty.shooter',
    category: 'Shooter',
    icon: '🎖️',
    accentColor: '#4A90E2',
    isVerifiedInstalled: false,
    isLaunchSupported: true,
    addedAt: '2026-10-25T10:00:00.000Z',
    lastLaunchedAt: null,
    playCount: 0,
    packageSizeEstimate: '2.4 GB base + HD Shader Cache',
    developer: 'Activision Publishing',
    region: 'Global'
  }
];

/**
 * Verified Preset Catalog of popular Android games for candidate selection.
 * These are offered in the "Add Game" catalog picker, NOT pre-seeded into user library.
 */
export const PRESET_POPULAR_GAMES: GameRecord[] = [
  {
    id: 'catalog-freefire-std',
    name: 'Garena Free Fire',
    packageName: 'com.dts.freefireth',
    category: 'Battle Royale',
    icon: '🔥',
    accentColor: '#FF5C38',
    isVerifiedInstalled: false,
    isLaunchSupported: true,
    addedAt: '2026-10-25T10:00:00.000Z',
    lastLaunchedAt: null,
    playCount: 0,
    packageSizeEstimate: '380 MB APK + 1.2 GB Obb',
    developer: 'Garena International I',
    region: 'Global / Southeast Asia'
  },
  {
    id: 'catalog-freefire-max',
    name: 'Free Fire MAX',
    packageName: 'com.dts.freefiremax',
    category: 'Battle Royale',
    icon: '⚡',
    accentColor: '#FF8800',
    isVerifiedInstalled: false,
    isLaunchSupported: true,
    addedAt: '2026-10-25T10:00:00.000Z',
    lastLaunchedAt: null,
    playCount: 0,
    packageSizeEstimate: '590 MB APK + 1.8 GB Ultra Assets',
    developer: 'Garena International I',
    region: 'Global Ultra Specs'
  },
  {
    id: 'catalog-bgmi',
    name: 'Battlegrounds Mobile India',
    packageName: 'com.pubg.imobile',
    category: 'Battle Royale',
    icon: '🎯',
    accentColor: '#FFD700',
    isVerifiedInstalled: false,
    isLaunchSupported: true,
    addedAt: '2026-10-25T10:00:00.000Z',
    lastLaunchedAt: null,
    playCount: 0,
    packageSizeEstimate: '750 MB APK + 2.1 GB HD Resources',
    developer: 'Krafton, Inc.',
    region: 'India'
  },
  {
    id: 'catalog-cod-mobile',
    name: 'Call of Duty: Mobile',
    packageName: 'com.activision.callofduty.shooter',
    category: 'Shooter',
    icon: '🎖️',
    accentColor: '#4A90E2',
    isVerifiedInstalled: false,
    isLaunchSupported: true,
    addedAt: '2026-10-25T10:00:00.000Z',
    lastLaunchedAt: null,
    playCount: 0,
    packageSizeEstimate: '2.4 GB base + HD Shader Cache',
    developer: 'Activision Publishing',
    region: 'Global'
  },
  {
    id: 'catalog-pubg-mobile',
    name: 'PUBG Mobile',
    packageName: 'com.tencent.ig',
    category: 'Battle Royale',
    icon: '🪂',
    accentColor: '#E65100',
    isVerifiedInstalled: false,
    isLaunchSupported: true,
    addedAt: '2026-10-25T10:00:00.000Z',
    lastLaunchedAt: null,
    playCount: 0,
    packageSizeEstimate: '1.8 GB base',
    developer: 'Level Infinite',
    region: 'Global'
  },
  {
    id: 'catalog-genshin',
    name: 'Genshin Impact',
    packageName: 'com.miHoYo.GenshinImpact',
    category: 'RPG',
    icon: '⚔️',
    accentColor: '#9C27B0',
    isVerifiedInstalled: false,
    isLaunchSupported: true,
    addedAt: '2026-10-25T10:00:00.000Z',
    lastLaunchedAt: null,
    playCount: 0,
    packageSizeEstimate: '3.5 GB APK + 20 GB Resources',
    developer: 'COGNOSPHERE PTE. LTD.',
    region: 'Global'
  },
  {
    id: 'catalog-asphalt9',
    name: 'Asphalt 9: Legends',
    packageName: 'com.gameloft.android.ANMP.GloftA9HM',
    category: 'Racing',
    icon: '🏎️',
    accentColor: '#E91E63',
    isVerifiedInstalled: false,
    isLaunchSupported: true,
    addedAt: '2026-10-25T10:00:00.000Z',
    lastLaunchedAt: null,
    playCount: 0,
    packageSizeEstimate: '2.6 GB',
    developer: 'Gameloft SE',
    region: 'Global'
  },
  {
    id: 'catalog-subway',
    name: 'Subway Surfers',
    packageName: 'com.kiloo.subwaysurf',
    category: 'Arcade',
    itemType: 'game',
    icon: '🛹',
    accentColor: '#4CAF50',
    isVerifiedInstalled: false,
    isLaunchSupported: true,
    addedAt: '2026-10-25T10:00:00.000Z',
    lastLaunchedAt: null,
    playCount: 0,
    packageSizeEstimate: '180 MB',
    developer: 'SYBO Games',
    region: 'Global'
  }
];

/**
 * Verified Preset Catalog of popular Android non-game applications (tools, media, system apps)
 * for the dedicated "Add App" functionality.
 */
export const PRESET_POPULAR_APPS: GameRecord[] = [
  {
    id: 'catalog-discord',
    name: 'Discord: Talk, Chat & Hang Out',
    packageName: 'com.discord',
    category: 'Communication',
    itemType: 'app',
    icon: '💬',
    accentColor: '#5865F2',
    isVerifiedInstalled: false,
    isLaunchSupported: true,
    addedAt: '2026-10-25T10:00:00.000Z',
    lastLaunchedAt: null,
    playCount: 0,
    packageSizeEstimate: '95 MB',
    developer: 'Discord Inc.',
    region: 'Global'
  },
  {
    id: 'catalog-youtube-gaming',
    name: 'YouTube',
    packageName: 'com.google.android.youtube',
    category: 'Media',
    itemType: 'app',
    icon: '▶️',
    accentColor: '#FF0000',
    isVerifiedInstalled: false,
    isLaunchSupported: true,
    addedAt: '2026-10-25T10:00:00.000Z',
    lastLaunchedAt: null,
    playCount: 0,
    packageSizeEstimate: '120 MB',
    developer: 'Google LLC',
    region: 'Global'
  },
  {
    id: 'catalog-twitch',
    name: 'Twitch: Live Game Streaming',
    packageName: 'tv.twitch.android.app',
    category: 'Streaming' as any,
    itemType: 'app',
    icon: '🟣',
    accentColor: '#9146FF',
    isVerifiedInstalled: false,
    isLaunchSupported: true,
    addedAt: '2026-10-25T10:00:00.000Z',
    lastLaunchedAt: null,
    playCount: 0,
    packageSizeEstimate: '85 MB',
    developer: 'Twitch Interactive, Inc.',
    region: 'Global'
  },
  {
    id: 'catalog-spotify',
    name: 'Spotify: Music and Podcasts',
    packageName: 'com.spotify.music',
    category: 'Media',
    itemType: 'app',
    icon: '🎵',
    accentColor: '#1DB954',
    isVerifiedInstalled: false,
    isLaunchSupported: true,
    addedAt: '2026-10-25T10:00:00.000Z',
    lastLaunchedAt: null,
    playCount: 0,
    packageSizeEstimate: '75 MB',
    developer: 'Spotify AB',
    region: 'Global'
  },
  {
    id: 'catalog-calculator',
    name: 'Android Calculator',
    packageName: 'com.google.android.calculator',
    category: 'Tools',
    itemType: 'app',
    icon: '🧮',
    accentColor: '#39FF70',
    isVerifiedInstalled: false,
    isLaunchSupported: true,
    addedAt: '2026-10-25T10:00:00.000Z',
    lastLaunchedAt: null,
    playCount: 0,
    packageSizeEstimate: '12 MB',
    developer: 'Google LLC',
    region: 'System Pre-installed'
  },
  {
    id: 'catalog-clock',
    name: 'Clock & Timer',
    packageName: 'com.google.android.deskclock',
    category: 'Tools',
    itemType: 'app',
    icon: '⏰',
    accentColor: '#69B7FF',
    isVerifiedInstalled: false,
    isLaunchSupported: true,
    addedAt: '2026-10-25T10:00:00.000Z',
    lastLaunchedAt: null,
    playCount: 0,
    packageSizeEstimate: '18 MB',
    developer: 'Google LLC',
    region: 'System Pre-installed'
  },
  {
    id: 'catalog-files',
    name: 'Files by Google',
    packageName: 'com.google.android.apps.nbu.files',
    category: 'System',
    itemType: 'app',
    icon: '📁',
    accentColor: '#4285F4',
    isVerifiedInstalled: false,
    isLaunchSupported: true,
    addedAt: '2026-10-25T10:00:00.000Z',
    lastLaunchedAt: null,
    playCount: 0,
    packageSizeEstimate: '35 MB',
    developer: 'Google LLC',
    region: 'System Tool'
  },
  {
    id: 'catalog-chrome',
    name: 'Google Chrome Browser',
    packageName: 'com.android.chrome',
    category: 'Productivity',
    itemType: 'app',
    icon: '🌐',
    accentColor: '#EA4335',
    isVerifiedInstalled: false,
    isLaunchSupported: true,
    addedAt: '2026-10-25T10:00:00.000Z',
    lastLaunchedAt: null,
    playCount: 0,
    packageSizeEstimate: '98 MB',
    developer: 'Google LLC',
    region: 'Global'
  }
];

export const ALL_PRESET_ITEMS: GameRecord[] = [
  ...PRESET_POPULAR_GAMES.map((g) => ({ ...g, itemType: 'game' as const })),
  ...PRESET_POPULAR_APPS.map((a) => ({ ...a, itemType: 'app' as const }))
];

/**
 * Validates an Android package identifier format (e.g. com.example.game)
 */
export function isValidPackageName(pkg: string): boolean {
  if (!pkg || typeof pkg !== 'string') return false;
  const trimmed = pkg.trim();
  // Android package name regex: starts with letter, contains at least one dot, segments start with letter
  const regex = /^[a-zA-Z][a-zA-Z0-9_]*(\.[a-zA-Z][a-zA-Z0-9_]*)+$/;
  return regex.test(trimmed);
}

/**
 * Filter and sort games and apps by search term, category, itemType and sorting criteria
 */
export function filterAndSortGames(
  games: GameRecord[],
  searchQuery: string,
  categoryFilter: string,
  sortBy: 'lastPlayed' | 'name' | 'recentlyAdded' = 'lastPlayed',
  itemTypeFilter: 'all' | 'game' | 'app' = 'all'
): GameRecord[] {
  const query = searchQuery.trim().toLowerCase();

  return games
    .filter((game) => {
      if (itemTypeFilter !== 'all') {
        const itemType = game.itemType || 'game';
        if (itemType !== itemTypeFilter) return false;
      }

      const matchesSearch =
        !query ||
        game.name.toLowerCase().includes(query) ||
        (game.packageName && game.packageName.toLowerCase().includes(query)) ||
        game.category.toLowerCase().includes(query);

      const matchesCategory =
        categoryFilter === 'All' || game.category.toLowerCase() === categoryFilter.toLowerCase();

      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'lastPlayed') {
        const aTime = a.lastLaunchedAt ? new Date(a.lastLaunchedAt).getTime() : 0;
        const bTime = b.lastLaunchedAt ? new Date(b.lastLaunchedAt).getTime() : 0;
        if (bTime !== aTime) return bTime - aTime;
        return a.name.localeCompare(b.name);
      }
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === 'recentlyAdded') {
        const aTime = new Date(a.addedAt).getTime();
        const bTime = new Date(b.addedAt).getTime();
        return bTime - aTime;
      }
      return 0;
    });
}

/**
 * Deduplicates candidate games against existing library by ID and package name
 */
export function deduplicateGames(existingGames: GameRecord[], newGames: GameRecord[]): GameRecord[] {
  const existingIds = new Set(existingGames.map((g) => g.id.toLowerCase()));
  const existingPackages = new Set(
    existingGames.map((g) => g.packageName?.toLowerCase()).filter(Boolean)
  );

  return newGames.filter((game) => {
    if (existingIds.has(game.id.toLowerCase())) return false;
    if (game.packageName && existingPackages.has(game.packageName.toLowerCase())) return false;
    return true;
  });
}
