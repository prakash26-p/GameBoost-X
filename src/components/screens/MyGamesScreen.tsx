import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Play,
  Trash2,
  AlertTriangle,
  ArrowUpDown,
  ExternalLink,
  ChevronRight,
  Info
} from 'lucide-react';
import { GameRecord, ScreenId, GameCategory } from '../../types';
import { filterAndSortGames } from '../../utils/gameLibraryUtils';

interface MyGamesScreenProps {
  games: GameRecord[];
  onNavigate: (screen: ScreenId) => void;
  onSelectGame: (game: GameRecord) => void;
  onQuickPlay: (game: GameRecord) => void;
  onRemoveGame: (gameId: string) => void;
}

export const MyGamesScreen: React.FC<MyGamesScreenProps> = ({
  games,
  onNavigate,
  onSelectGame,
  onQuickPlay,
  onRemoveGame
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sortBy, setSortBy] = useState<'lastPlayed' | 'name' | 'recentlyAdded'>('lastPlayed');

  // Deletion modal confirmation state
  const [gameToRemove, setGameToRemove] = useState<GameRecord | null>(null);

  const categories = useMemo(() => {
    const set = new Set<string>();
    games.forEach((g) => set.add(g.category));
    return ['All', ...Array.from(set)];
  }, [games]);

  const filteredGames = useMemo(() => {
    return filterAndSortGames(games, searchQuery, categoryFilter, sortBy);
  }, [games, searchQuery, categoryFilter, sortBy]);

  const confirmRemove = () => {
    if (gameToRemove) {
      onRemoveGame(gameToRemove.id);
      setGameToRemove(null);
    }
  };

  return (
    <div className="space-y-4 pb-20 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold font-display text-white">
              My Games Library
            </h1>
            <span className="text-xs font-mono text-[#39FF88] bg-[#39FF88]/10 border border-[#39FF88]/30 px-2 py-0.5 rounded-md">
              {games.length} Saved
            </span>
          </div>
          <p className="text-[11px] text-[#7E8B82]">
            Organize, monitor, and launch your mobile games
          </p>
        </div>

        <button
          onClick={() => onNavigate('add-game')}
          className="flex items-center gap-1.5 px-3 py-2 bg-[#39FF88] text-black text-xs font-bold font-display rounded-xl hover:bg-[#20C76B] transition-all shadow-md shadow-[#39FF88]/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>ADD GAME</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#7E8B82] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search your library..."
              className="w-full bg-[#151C18] border border-[#29382F] focus:border-[#39FF88] rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-[#7E8B82] outline-none transition-colors"
            />
          </div>

          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-[#151C18] border border-[#29382F] focus:border-[#39FF88] rounded-xl px-3 py-2 text-xs text-[#B7C4BC] outline-none cursor-pointer"
            >
              <option value="lastPlayed">Recently Played</option>
              <option value="name">Name (A-Z)</option>
              <option value="recentlyAdded">Recently Added</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition-colors cursor-pointer ${
                categoryFilter === cat
                  ? 'bg-[#39FF88] text-black font-semibold'
                  : 'bg-[#151C18] text-[#7E8B82] hover:text-[#B7C4BC] border border-[#29382F]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Games List or Empty State */}
      {filteredGames.length === 0 ? (
        <div className="bg-[#151C18] border border-[#29382F] rounded-2xl p-8 text-center">
          <div className="w-12 h-12 rounded-xl bg-[#1B241F] text-[#39FF88] mx-auto flex items-center justify-center text-xl mb-3">
            🎮
          </div>
          <h3 className="text-base font-bold text-white mb-1">
            No Games Found
          </h3>
          <p className="text-xs text-[#B7C4BC] max-w-xs mx-auto mb-4">
            {searchQuery
              ? `No games matching "${searchQuery}". Try a different keyword.`
              : 'Add games to build your personal gaming launcher library.'}
          </p>
          <button
            onClick={() => onNavigate('add-game')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#39FF88] text-black text-xs font-bold font-display rounded-xl hover:bg-[#20C76B] transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>ADD GAME NOW</span>
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredGames.map((game) => (
            <div
              key={game.id}
              onClick={() => onSelectGame(game)}
              className="bg-[#151C18] border border-[#29382F] hover:border-[#39FF88]/40 rounded-xl p-3.5 flex items-center justify-between transition-all group cursor-pointer shadow-sm"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 border border-[#29382F] shadow-inner"
                  style={{ backgroundColor: `${game.accentColor}18` }}
                >
                  {game.icon}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-white truncate group-hover:text-[#39FF88] transition-colors">
                      {game.name}
                    </h3>
                  </div>

                  <div className="text-[11px] font-mono text-[#7E8B82] truncate">
                    {game.packageName || 'Custom Application'}
                  </div>

                  <div className="text-[10px] text-[#B7C4BC] flex items-center gap-2 mt-0.5">
                    <span>{game.category}</span>
                    <span>·</span>
                    <span>{game.playCount} launches</span>
                    {game.lastLaunchedAt && (
                      <>
                        <span>·</span>
                        <span>
                          {new Date(game.lastLaunchedAt).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setGameToRemove(game);
                  }}
                  className="w-8 h-8 rounded-lg bg-[#1B241F] text-[#7E8B82] hover:text-[#FF5C68] hover:bg-[#FF5C68]/10 border border-[#29382F] flex items-center justify-center transition-colors cursor-pointer"
                  title="Remove from GameBoost X"
                  aria-label={`Remove ${game.name} from library`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onQuickPlay(game);
                  }}
                  className="w-9 h-9 rounded-xl bg-[#39FF88] hover:bg-[#20C76B] text-black flex items-center justify-center transition-all shadow-md shadow-[#39FF88]/20 cursor-pointer"
                  title={`Launch ${game.name}`}
                  aria-label={`Launch ${game.name}`}
                >
                  <Play className="w-4 h-4 fill-black ml-0.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Removal Confirmation Dialog */}
      {gameToRemove && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in duration-200"
        >
          <div className="bg-[#151C18] border border-[#29382F] rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FF5C68]/10 text-[#FF5C68] border border-[#FF5C68]/30 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm font-display">
                  Remove from GameBoost X?
                </h3>
                <p className="text-xs text-[#B7C4BC] font-medium">
                  {gameToRemove.name}
                </p>
              </div>
            </div>

            <div className="bg-[#101512] border border-[#29382F] rounded-xl p-3 text-xs text-[#7E8B82] leading-relaxed">
              <span className="text-white font-medium">Note:</span> Removing this entry only removes it from your GameBoost X launcher dashboard. It will <strong className="text-white">NOT</strong> uninstall or delete the actual game from your Android device.
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                onClick={() => setGameToRemove(null)}
                className="px-3 py-1.5 text-xs text-[#B7C4BC] hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmRemove}
                className="px-4 py-2 bg-[#FF5C68] hover:bg-[#FF5C68]/90 text-white font-medium text-xs rounded-xl transition-colors cursor-pointer shadow-md"
              >
                Confirm Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
