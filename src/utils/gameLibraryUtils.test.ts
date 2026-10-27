import test from 'node:test';
import assert from 'node:assert/strict';
import {
  PRESET_POPULAR_GAMES,
  filterAndSortGames,
  deduplicateGames,
  isValidPackageName
} from './gameLibraryUtils.ts';
import { GameRecord } from '../types/index.ts';

test('isValidPackageName validates standard Android package naming conventions', () => {
  assert.equal(isValidPackageName('com.dts.freefireth'), true);
  assert.equal(isValidPackageName('com.pubg.imobile'), true);
  assert.equal(isValidPackageName('org.example.game_app'), true);

  assert.equal(isValidPackageName(''), false);
  assert.equal(isValidPackageName('freefire'), false); // No dot
  assert.equal(isValidPackageName('.com.game'), false); // Starts with dot
  assert.equal(isValidPackageName('123.game'), false); // Starts with number
});

test('filterAndSortGames filters accurately by query and category', () => {
  const games: GameRecord[] = [
    {
      id: 'g1',
      name: 'Garena Free Fire',
      packageName: 'com.dts.freefireth',
      category: 'Battle Royale',
      icon: '🔥',
      accentColor: '#FF5C38',
      isVerifiedInstalled: false,
      isLaunchSupported: true,
      addedAt: '2026-10-20T10:00:00.000Z',
      lastLaunchedAt: '2026-10-25T14:30:00.000Z',
      playCount: 10
    },
    {
      id: 'g2',
      name: 'Subway Surfers',
      packageName: 'com.kiloo.subwaysurf',
      category: 'Arcade',
      icon: '🛹',
      accentColor: '#39FF88',
      isVerifiedInstalled: false,
      isLaunchSupported: true,
      addedAt: '2026-10-21T10:00:00.000Z',
      lastLaunchedAt: null,
      playCount: 0
    }
  ];

  // Search by name
  const result1 = filterAndSortGames(games, 'free fire', 'All');
  assert.equal(result1.length, 1);
  assert.equal(result1[0].id, 'g1');

  // Search by package name
  const result2 = filterAndSortGames(games, 'kiloo', 'All');
  assert.equal(result2.length, 1);
  assert.equal(result2[0].id, 'g2');

  // Filter by category
  const result3 = filterAndSortGames(games, '', 'Arcade');
  assert.equal(result3.length, 1);
  assert.equal(result3[0].id, 'g2');
});

test('deduplicateGames prevents adding duplicates by ID or package', () => {
  const existing: GameRecord[] = [PRESET_POPULAR_GAMES[0]]; // Free Fire
  const candidateList: GameRecord[] = [
    PRESET_POPULAR_GAMES[0], // Duplicate ID & Package
    PRESET_POPULAR_GAMES[1]  // Free Fire MAX (Unique)
  ];

  const deduped = deduplicateGames(existing, candidateList);
  assert.equal(deduped.length, 1);
  assert.equal(deduped[0].id, PRESET_POPULAR_GAMES[1].id);
});

test('filterAndSortGames handles itemType separation between games and apps', () => {
  const mixed: GameRecord[] = [
    {
      id: 'game-1',
      name: 'Free Fire',
      packageName: 'com.dts.freefireth',
      category: 'Battle Royale',
      itemType: 'game',
      icon: '🔥',
      accentColor: '#FF5C38',
      isVerifiedInstalled: false,
      isLaunchSupported: true,
      addedAt: '2026-10-20T10:00:00.000Z',
      lastLaunchedAt: null,
      playCount: 0
    },
    {
      id: 'app-1',
      name: 'Discord',
      packageName: 'com.discord',
      category: 'Communication',
      itemType: 'app',
      icon: '💬',
      accentColor: '#5865F2',
      isVerifiedInstalled: false,
      isLaunchSupported: true,
      addedAt: '2026-10-20T10:00:00.000Z',
      lastLaunchedAt: null,
      playCount: 0
    }
  ];

  const gamesOnly = filterAndSortGames(mixed, '', 'All', 'name', 'game');
  assert.equal(gamesOnly.length, 1);
  assert.equal(gamesOnly[0].id, 'game-1');

  const appsOnly = filterAndSortGames(mixed, '', 'All', 'name', 'app');
  assert.equal(appsOnly.length, 1);
  assert.equal(appsOnly[0].id, 'app-1');
});
