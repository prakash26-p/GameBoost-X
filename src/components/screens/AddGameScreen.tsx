import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeft,
  Search,
  Plus,
  Check,
  CheckSquare,
  Square,
  AlertTriangle,
  Info,
  Sparkles,
  Smartphone,
  Gamepad2,
  LayoutGrid,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Layers
} from 'lucide-react';
import { GameRecord, GameCategory, LibraryItemType } from '../../types';
import { nativeBridge } from '../../services/nativeBridge';
import { isValidPackageName } from '../../utils/gameLibraryUtils';

interface AddGameScreenProps {
  existingGames: GameRecord[];
  initialMode?: LibraryItemType;
  onBack: () => void;
  onAddGames: (gamesToAdd: GameRecord[]) => void;
}

export const AddGameScreen: React.FC<AddGameScreenProps> = ({
  existingGames,
  onBack,
  onAddGames
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [nativeApps, setNativeApps] = useState<GameRecord[]>([]);
  const [bridgeError, setBridgeError] = useState<string | null>(null);
  const [isBridgeAvailable, setIsBridgeAvailable] = useState(false);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'game' | 'app'>('all');
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());

  // Manual package entry form state
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualTitle, setManualTitle] = useState('');
  const [manualPackage, setManualPackage] = useState('');
  const [manualCategory, setManualCategory] = useState<GameCategory>('Action');
  const [manualType, setManualType] = useState<LibraryItemType>('game');
  const [manualIcon, setManualIcon] = useState('🎮');
  const [manualError, setManualError] = useState<string | null>(null);

  // Scan for installed apps via Android PackageManager
  const scanInstalledPackages = () => {
    setIsScanning(true);
    setBridgeError(null);

    const available = nativeBridge.isNativeAvailable();
    setIsBridgeAvailable(available);

    if (available) {
      const result = nativeBridge.getInstalledApplications();
      if (result.error) {
        setBridgeError(result.error);
        setNativeApps([]);
      } else {
        setNativeApps(result.apps);
      }
    } else {
      setNativeApps([]);
      setBridgeError(
        'Native Android bridge is not active in this web browser preview. Real package discovery requires running GameBoost X inside the Android APK.'
      );
    }
    setIsScanning(false);
  };

  useEffect(() => {
    scanInstalledPackages();
  }, []);

  const existingPackageSet = useMemo(() => {
    return new Set(existingGames.map((g) => g.packageName?.toLowerCase()).filter(Boolean));
  }, [existingGames]);

  const existingIdSet = useMemo(() => {
    return new Set(existingGames.map((g) => g.id.toLowerCase()));
  }, [existingGames]);

  // Filter candidates according to user search and tab
  const filteredCandidates = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return nativeApps.filter((item) => {
      // Type filter
      if (filterType === 'game' && item.itemType !== 'game') return false;
      if (filterType === 'app' && item.itemType !== 'app') return false;

      // Search query
      if (!query) return true;
      return (
        item.name.toLowerCase().includes(query) ||
        (item.packageName && item.packageName.toLowerCase().includes(query)) ||
        item.category.toLowerCase().includes(query)
      );
    });
  }, [nativeApps, filterType, searchQuery]);

  const toggleSelect = (itemId: string) => {
    setSelectedItemIds((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    const available = filteredCandidates.filter(
      (g) => !existingIdSet.has(g.id.toLowerCase()) && !existingPackageSet.has(g.packageName?.toLowerCase())
    );
    if (selectedItemIds.size === available.length) {
      setSelectedItemIds(new Set());
    } else {
      setSelectedItemIds(new Set(available.map((g) => g.id)));
    }
  };

  const handleConfirmAdd = () => {
    const toAdd = nativeApps.filter((g) => selectedItemIds.has(g.id));
    if (toAdd.length > 0) {
      onAddGames(toAdd);
      onBack();
    }
  };

  const handleAddManualPackage = (e: React.FormEvent) => {
    e.preventDefault();
    setManualError(null);

    const name = manualTitle.trim();
    const pkg = manualPackage.trim();

    if (!name) {
      setManualError('Application label is required.');
      return;
    }

    if (!pkg) {
      setManualError('Android package identifier is required.');
      return;
    }

    if (!isValidPackageName(pkg)) {
      setManualError('Invalid Android package identifier. Example: com.example.game');
      return;
    }

    if (existingPackageSet.has(pkg.toLowerCase())) {
      setManualError(`An item with package '${pkg}' is already in your GameBoost X launcher.`);
      return;
    }

    const newItem: GameRecord = {
      id: `manual-${pkg}`,
      name,
      packageName: pkg,
      category: manualCategory,
      itemType: manualType,
      icon: manualIcon,
      accentColor: manualType === 'game' ? '#39FF70' : '#69B7FF',
      isVerifiedInstalled: isBridgeAvailable ? (nativeBridge.launchApplication(pkg).success) : false,
      isLaunchSupported: true,
      addedAt: new Date().toISOString(),
      lastLaunchedAt: null,
      playCount: 0,
      developer: 'Manual Android Package'
    };

    onAddGames([newItem]);
    onBack();
  };

  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-200">
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-2 border-b border-[#285C38]">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="w-8 h-8 rounded-xl bg-[#101712] border border-[#285C38] flex items-center justify-center text-[#B7C6BA] hover:text-[#39FF70] transition-colors cursor-pointer"
            aria-label="Back to home"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-base font-bold font-display text-white tracking-wide">
              INSTALLED APPS & GAMES
            </h1>
            <p className="text-[10px] text-[#6B7C70]">
              Discover real launchable applications on this device
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={scanInstalledPackages}
            disabled={isScanning}
            className="p-2 rounded-lg bg-[#101712] border border-[#285C38] hover:border-[#39FF70] text-[#39FF70] transition-colors cursor-pointer disabled:opacity-50"
            title="Rescan installed apps"
            aria-label="Rescan packages"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => setShowManualForm(!showManualForm)}
            className={`text-xs px-2.5 py-1.5 rounded-lg border transition-colors cursor-pointer flex items-center gap-1 ${
              showManualForm
                ? 'bg-[#39FF70] text-black border-[#39FF70] font-bold'
                : 'bg-[#101712] text-[#39FF70] border-[#285C38] hover:border-[#39FF70]/40'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{showManualForm ? 'List' : 'Enter Package'}</span>
          </button>
        </div>
      </div>

      {/* Manual Package Entry Drawer */}
      {showManualForm && (
        <form
          onSubmit={handleAddManualPackage}
          className="bg-[#101712] border-2 border-[#39FF70]/60 rounded-2xl p-4 space-y-3 shadow-xl"
        >
          <div className="flex items-center justify-between pb-2 border-b border-[#285C38]">
            <span className="text-xs font-bold font-display text-white flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#39FF70]" />
              Add Specific Installed Android Package
            </span>
            <span className="text-[9px] font-mono text-[#6B7C70]">Direct Package Intent</span>
          </div>

          {manualError && (
            <div className="p-2.5 rounded-lg bg-[#FF5C68]/10 border border-[#FF5C68]/30 text-xs text-[#FF5C68] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{manualError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-[#B7C6BA] mb-1">
              Application Label <span className="text-[#39FF70]">*</span>
            </label>
            <input
              type="text"
              value={manualTitle}
              onChange={(e) => setManualTitle(e.target.value)}
              placeholder="e.g. Free Fire, YouTube, Calculator"
              className="w-full bg-[#050806] border border-[#285C38] focus:border-[#39FF70] rounded-xl px-3 py-2 text-xs text-white placeholder-[#6B7C70] outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#B7C6BA] mb-1">
              Android Package Identifier <span className="text-[#39FF70]">*</span>
            </label>
            <input
              type="text"
              value={manualPackage}
              onChange={(e) => setManualPackage(e.target.value)}
              placeholder="e.g. com.dts.freefireth, com.google.android.calculator"
              className="w-full bg-[#050806] border border-[#285C38] focus:border-[#39FF70] rounded-xl px-3 py-2 text-xs font-mono text-white placeholder-[#6B7C70] outline-none"
              required
            />
            <p className="text-[10px] text-[#6B7C70] mt-1">
              Must be an installed package with a launchable MAIN activity.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-[#B7C6BA] mb-1">Type</label>
              <select
                value={manualType}
                onChange={(e) => setManualType(e.target.value as LibraryItemType)}
                className="w-full bg-[#050806] border border-[#285C38] focus:border-[#39FF70] rounded-xl px-3 py-2 text-xs text-white outline-none"
              >
                <option value="game">Game</option>
                <option value="app">Application</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#B7C6BA] mb-1">Category</label>
              <select
                value={manualCategory}
                onChange={(e) => setManualCategory(e.target.value as GameCategory)}
                className="w-full bg-[#050806] border border-[#285C38] focus:border-[#39FF70] rounded-xl px-3 py-2 text-xs text-white outline-none"
              >
                <option value="Battle Royale">Battle Royale</option>
                <option value="Action">Action</option>
                <option value="Shooter">Shooter</option>
                <option value="Racing">Racing</option>
                <option value="RPG">RPG</option>
                <option value="Tools">Tools</option>
                <option value="Media">Media</option>
                <option value="System">System</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#285C38]/40">
            <button
              type="button"
              onClick={() => setShowManualForm(false)}
              className="px-3 py-1.5 text-xs text-[#B7C6BA] hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#39FF70] text-black font-display font-bold text-xs rounded-xl hover:bg-[#20C65A] transition-colors cursor-pointer"
            >
              ADD TO LAUNCHER
            </button>
          </div>
        </form>
      )}

      {/* Real Data Policy Transparency Notice */}
      {!isBridgeAvailable ? (
        <div className="bg-[#101712] border-2 border-[#FFC857]/40 rounded-2xl p-4 space-y-2.5">
          <div className="flex items-start gap-2.5">
            <Smartphone className="w-5 h-5 text-[#FFC857] flex-shrink-0 mt-0.5" />
            <div>
              <h2 className="text-xs font-bold font-display text-white">
                NATIVE ANDROID BRIDGE REQUIRED FOR LIVE DISCOVERY
              </h2>
              <p className="text-[11px] text-[#B7C6BA] mt-1 leading-relaxed">
                You are currently viewing GameBoost X in a desktop web browser preview. Android package discovery uses <code className="text-[#39FF70] bg-black/50 px-1 py-0.5 rounded">PackageManager.queryIntentActivities</code> via the native bridge (<code className="text-[#39FF70] bg-black/50 px-1 py-0.5 rounded">GameBoostNative</code>).
              </p>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-[#050806] border border-[#285C38] text-[10px] text-[#6B7C70] space-y-1">
            <div className="flex items-center gap-1.5 text-[#39FF70] font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Strict No-Fake-Data Policy Enforced:</span>
            </div>
            <p>
              • GameBoost X never displays fictional, hardcoded, or demo games.
            </p>
            <p>
              • If Free Fire, YouTube, or Calculator is not actually installed on the Android device, it will not appear in the discovery list.
            </p>
            <p>
              • To test launching real packages right now, tap <strong>Enter Package</strong> above and enter any Android package name.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-[#101712] border border-[#39FF70]/40 rounded-xl p-3 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#39FF70] animate-pulse" />
            <span className="font-mono text-[#39FF70] font-bold">Android PackageManager Active</span>
            <span className="text-[10px] text-[#B7C6BA]">({nativeApps.length} launchable packages found)</span>
          </div>
          <span className="text-[10px] font-mono text-[#6B7C70]">com.prakashrox.gameboostx</span>
        </div>
      )}

      {/* Filter Tabs: ALL, GAMES ONLY, APPS ONLY */}
      <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#101712] border border-[#285C38] rounded-xl">
        <button
          onClick={() => setFilterType('all')}
          className={`py-2 px-2 rounded-lg text-xs font-display font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            filterType === 'all'
              ? 'bg-[#39FF70] text-black shadow-[0_0_12px_rgba(57,255,112,0.3)]'
              : 'text-[#B7C6BA] hover:text-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>ALL</span>
        </button>

        <button
          onClick={() => setFilterType('game')}
          className={`py-2 px-2 rounded-lg text-xs font-display font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            filterType === 'game'
              ? 'bg-[#39FF70] text-black shadow-[0_0_12px_rgba(57,255,112,0.3)]'
              : 'text-[#B7C6BA] hover:text-white'
          }`}
        >
          <Gamepad2 className="w-3.5 h-3.5" />
          <span>GAMES</span>
        </button>

        <button
          onClick={() => setFilterType('app')}
          className={`py-2 px-2 rounded-lg text-xs font-display font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            filterType === 'app'
              ? 'bg-[#39FF70] text-black shadow-[0_0_12px_rgba(57,255,112,0.3)]'
              : 'text-[#B7C6BA] hover:text-white'
          }`}
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          <span>APPS</span>
        </button>
      </div>

      {/* Search Input Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-[#6B7C70] absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search installed applications or package name..."
          className="w-full bg-[#101712] border border-[#285C38] focus:border-[#39FF70] rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-[#6B7C70] outline-none transition-colors"
        />
      </div>

      {/* Select All & Selection Count Bar */}
      {filteredCandidates.length > 0 && (
        <div className="flex items-center justify-between text-xs text-[#6B7C70] px-1">
          <button
            onClick={handleSelectAll}
            className="flex items-center gap-1.5 text-xs text-[#B7C6BA] hover:text-white transition-colors cursor-pointer"
          >
            {selectedItemIds.size > 0 && selectedItemIds.size === filteredCandidates.length ? (
              <CheckSquare className="w-4 h-4 text-[#39FF70]" />
            ) : (
              <Square className="w-4 h-4" />
            )}
            <span>Select All Available</span>
          </button>

          <span>{selectedItemIds.size} selected</span>
        </div>
      )}

      {/* Discovered Items List */}
      <div className="space-y-2">
        {filteredCandidates.map((item) => {
          const isAlreadyInLibrary =
            existingIdSet.has(item.id.toLowerCase()) ||
            existingPackageSet.has(item.packageName?.toLowerCase());
          const isSelected = selectedItemIds.has(item.id);

          return (
            <div
              key={item.id}
              onClick={() => {
                if (!isAlreadyInLibrary) toggleSelect(item.id);
              }}
              className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                isAlreadyInLibrary
                  ? 'bg-[#050806] border-[#285C38]/40 opacity-60 cursor-not-allowed'
                  : isSelected
                  ? 'bg-[#152319] border-[#39FF70] shadow-[0_0_12px_rgba(57,255,112,0.2)] cursor-pointer'
                  : 'bg-[#101712] border-[#285C38] hover:border-[#39FF70]/30 cursor-pointer'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* Real App Icon or Emoji */}
                <div className="w-10 h-10 rounded-xl bg-[#151F18] border border-[#285C38] flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {item.iconBase64 ? (
                    <img
                      src={item.iconBase64}
                      alt={item.name}
                      className="w-8 h-8 rounded-lg object-contain"
                    />
                  ) : (
                    <span className="text-xl">{item.icon}</span>
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-white truncate">
                      {item.name}
                    </span>
                    {isAlreadyInLibrary && (
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#285C38] text-[#B7C6BA]">
                        In Launcher
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] font-mono text-[#6B7C70] truncate">
                    {item.packageName}
                  </div>
                  <div className="text-[10px] text-[#B7C6BA] truncate mt-0.5">
                    {item.category} • {item.itemType === 'game' ? 'Game' : 'Application'}
                  </div>
                </div>
              </div>

              <div className="flex-shrink-0 ml-2">
                {isAlreadyInLibrary ? (
                  <div className="w-5 h-5 rounded-md bg-[#285C38] flex items-center justify-center text-[#B7C6BA]">
                    <Check className="w-3 h-3" />
                  </div>
                ) : (
                  <div
                    className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'bg-[#39FF70] border-[#39FF70] text-black'
                        : 'border-[#6B7C70] bg-transparent'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Empty state when no candidate is available or in web preview without manual entry */}
        {filteredCandidates.length === 0 && (
          <div className="text-center py-10 px-4 bg-[#101712] rounded-2xl border border-[#285C38] space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#151F18] border border-[#285C38] text-[#39FF70] flex items-center justify-center mx-auto">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm font-bold text-white font-display">
                {isBridgeAvailable
                  ? 'No matching installed applications found.'
                  : 'No verified applications discoverable in web mode.'}
              </div>
              <p className="text-xs text-[#6B7C70] max-w-sm mx-auto mt-1">
                {isBridgeAvailable
                  ? 'Try searching with a different keyword or rescan the device.'
                  : 'In this browser preview, native Android PackageManager cannot be accessed directly. Tap Enter Package below to manually test launching an installed Android package.'}
              </p>
            </div>
            <button
              onClick={() => setShowManualForm(true)}
              className="px-4 py-2 bg-[#39FF70] text-black font-display font-bold text-xs rounded-xl shadow-[0_0_15px_rgba(57,255,112,0.3)] hover:scale-105 active:scale-95 transition-all cursor-pointer inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>Enter Package Manually</span>
            </button>
          </div>
        )}
      </div>

      {/* Floating Action Confirmation Bar */}
      {selectedItemIds.size > 0 && (
        <div className="fixed bottom-16 left-0 right-0 max-w-lg mx-auto px-4 z-40">
          <div className="bg-[#101712] border-2 border-[#39FF70] rounded-2xl p-3 shadow-2xl flex items-center justify-between animate-in slide-in-from-bottom duration-200">
            <div className="text-xs text-white">
              <span className="font-bold text-[#39FF70]">{selectedItemIds.size}</span> item(s) selected
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedItemIds(new Set())}
                className="px-3 py-1.5 text-xs text-[#6B7C70] hover:text-white transition-colors cursor-pointer"
              >
                Clear
              </button>
              <button
                onClick={handleConfirmAdd}
                className="px-4 py-2 bg-[#39FF70] text-black font-display font-bold text-xs rounded-xl hover:bg-[#20C65A] transition-all shadow-[0_0_15px_rgba(57,255,112,0.3)] cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>ADD TO LAUNCHER</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
