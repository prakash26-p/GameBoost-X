import React, { useState } from 'react';
import {
  History as HistoryIcon,
  Trash2,
  Download,
  Wifi,
  Zap,
  Play,
  Calendar,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { HistoryRecord } from '../../types';

interface HistoryScreenProps {
  historyRecords: HistoryRecord[];
  onClearHistory: () => void;
}

export const HistoryScreen: React.FC<HistoryScreenProps> = ({
  historyRecords,
  onClearHistory
}) => {
  const [filterType, setFilterType] = useState<'all' | 'network_test' | 'safe_boost' | 'game_launch'>('all');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const filtered = historyRecords.filter((record) => {
    if (filterType === 'all') return true;
    return record.type === filterType;
  });

  const exportHistoryJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(historyRecords, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `gameboostx_history_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const getIconForType = (type: HistoryRecord['type']) => {
    switch (type) {
      case 'network_test':
        return <Wifi className="w-4 h-4 text-[#39FF88]" />;
      case 'safe_boost':
        return <Zap className="w-4 h-4 text-[#FFC857]" />;
      case 'game_launch':
        return <Play className="w-4 h-4 text-[#69B7FF]" />;
    }
  };

  return (
    <div className="space-y-4 pb-20 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold font-display text-white">
            Activity & Metrics History
          </h1>
          <p className="text-[11px] text-[#7E8B82]">
            Local audit log of network diagnostics, optimizations, and launches
          </p>
        </div>

        <div className="flex items-center gap-2">
          {historyRecords.length > 0 && (
            <>
              <button
                onClick={exportHistoryJSON}
                className="w-8 h-8 rounded-xl bg-[#151C18] border border-[#29382F] flex items-center justify-center text-[#B7C4BC] hover:text-white transition-colors cursor-pointer"
                title="Export history JSON"
                aria-label="Export history JSON"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowClearConfirm(true)}
                className="w-8 h-8 rounded-xl bg-[#151C18] border border-[#29382F] flex items-center justify-center text-[#7E8B82] hover:text-[#FF5C68] hover:bg-[#FF5C68]/10 transition-colors cursor-pointer"
                title="Clear all history"
                aria-label="Clear history"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'all', label: 'All Events' },
          { id: 'network_test', label: 'Network Pings' },
          { id: 'safe_boost', label: 'Safe Boosts' },
          { id: 'game_launch', label: 'Game Launches' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterType(tab.id as any)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
              filterType === tab.id
                ? 'bg-[#39FF88] text-black font-semibold'
                : 'bg-[#151C18] text-[#7E8B82] hover:text-[#B7C4BC] border border-[#29382F]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* History Records List */}
      {filtered.length === 0 ? (
        <div className="bg-[#151C18] border border-[#29382F] rounded-2xl p-8 text-center">
          <div className="w-12 h-12 rounded-xl bg-[#1B241F] text-[#7E8B82] mx-auto flex items-center justify-center text-xl mb-3">
            <HistoryIcon className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white mb-1">
            No Records Logged Yet
          </h3>
          <p className="text-xs text-[#B7C4BC] max-w-xs mx-auto">
            Run a network diagnostic, start a safe boost, or launch a game to view authentic session history.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="bg-[#151C18] border border-[#29382F] rounded-xl p-3 flex items-start justify-between gap-3 shadow-sm"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-[#101512] border border-[#29382F] flex items-center justify-center flex-shrink-0 mt-0.5">
                  {getIconForType(item.type)}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white truncate">
                      {item.title}
                    </span>
                    {item.badge && (
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#101512] text-[#39FF88] border border-[#39FF88]/30">
                        {item.badge}
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-[#B7C4BC] leading-relaxed mt-0.5">
                    {item.details}
                  </p>

                  <div className="text-[10px] font-mono text-[#7E8B82] mt-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(item.timestamp).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in"
        >
          <div className="bg-[#151C18] border border-[#29382F] rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FF5C68]/10 text-[#FF5C68] border border-[#FF5C68]/30 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm font-display">
                  Clear All History Records?
                </h3>
                <p className="text-xs text-[#7E8B82]">
                  This will remove all logged network tests and session logs.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-3 py-1.5 text-xs text-[#B7C4BC] hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onClearHistory();
                  setShowClearConfirm(false);
                }}
                className="px-4 py-2 bg-[#FF5C68] hover:bg-[#FF5C68]/90 text-white font-medium text-xs rounded-xl transition-colors cursor-pointer shadow-md"
              >
                Clear History
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
