import React from 'react';
import {
  ArrowLeft,
  Shield,
  Key,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Lock
} from 'lucide-react';

interface PermissionsScreenProps {
  onBack: () => void;
}

export const PermissionsScreen: React.FC<PermissionsScreenProps> = ({ onBack }) => {
  const permissionsList = [
    {
      name: 'android.permission.INTERNET',
      title: 'Internet Access',
      status: 'Granted (Standard)',
      level: 'Normal',
      purpose: 'Required to perform monotonic ping probes, measure network jitter, and verify reachability to configured game endpoints.',
      isRequired: true
    },
    {
      name: 'android.permission.ACCESS_NETWORK_STATE',
      title: 'Network State Monitor',
      status: 'Granted (Standard)',
      level: 'Normal',
      purpose: 'Used to determine whether the device is connected to 4G LTE, 5G, or Wi-Fi, and detect online/offline state changes.',
      isRequired: true
    },
    {
      name: 'android.permission.QUERY_ALL_PACKAGES / <queries>',
      title: 'Package Visibility Query',
      status: 'Restricted (Native Android 11+)',
      level: 'Scoped Queries',
      purpose: 'Allows GameBoost X to detect installed game packages (such as Free Fire, BGMI, COD) and launch their main activity. GameBoost X strictly specifies `<queries>` intents rather than blanket permissions.',
      isRequired: false
    },
    {
      name: 'android.permission.PACKAGE_USAGE_STATS',
      title: 'App Usage Statistics',
      status: 'Special System Setting',
      level: 'User Opt-in',
      purpose: 'Optional permission required by Android to read foreground application launch times and duration. Not required for basic launcher functionality.',
      isRequired: false
    },
    {
      name: 'BATTERY_STATS / BatteryManager',
      title: 'Battery Diagnostics',
      status: 'Native Broadcast Intent',
      level: 'Normal',
      purpose: 'Standard system broadcast (`Intent.ACTION_BATTERY_CHANGED`) used to read device battery percentage and charging status without accessing personal data.',
      isRequired: true
    }
  ];

  return (
    <div className="space-y-4 pb-20 animate-in fade-in duration-200">
      {/* Top Bar */}
      <div className="flex items-center gap-2">
        <button
          onClick={onBack}
          className="w-8 h-8 rounded-xl bg-[#151C18] border border-[#29382F] flex items-center justify-center text-[#B7C4BC] hover:text-white transition-colors cursor-pointer"
          aria-label="Go back"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-lg font-bold font-display text-white">
            Permission Transparency
          </h1>
          <p className="text-[11px] text-[#7E8B82]">
            Transparent disclosure of Android permissions & least-privilege principles
          </p>
        </div>
      </div>

      {/* Manifesto */}
      <div className="bg-[#151C18] border border-[#29382F] rounded-2xl p-4 flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#39FF88]/10 text-[#39FF88] border border-[#39FF88]/30 flex items-center justify-center flex-shrink-0">
          <Shield className="w-5 h-5" />
        </div>
        <div className="text-xs space-y-1">
          <div className="font-bold text-white font-display">
            Least Privilege Principle
          </div>
          <p className="text-[#B7C4BC] leading-relaxed">
            GameBoost X operates strictly within standard user-space boundaries. We never ask for Root access, Accessibility Services abuse, or device administrator elevation.
          </p>
        </div>
      </div>

      {/* Permissions Breakdown */}
      <div className="space-y-2.5">
        {permissionsList.map((perm) => (
          <div
            key={perm.name}
            className="bg-[#151C18] border border-[#29382F] rounded-xl p-3.5 space-y-2"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-xs font-bold text-white font-display flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-[#39FF88]" />
                  <span>{perm.title}</span>
                </div>
                <div className="text-[10px] font-mono text-[#7E8B82] mt-0.5">
                  {perm.name}
                </div>
              </div>

              <span
                className={`text-[9px] font-mono px-2 py-0.5 rounded border whitespace-nowrap ${
                  perm.isRequired
                    ? 'text-[#39FF88] bg-[#39FF88]/10 border-[#39FF88]/30'
                    : 'text-[#69B7FF] bg-[#69B7FF]/10 border-[#69B7FF]/30'
                }`}
              >
                {perm.level}
              </span>
            </div>

            <p className="text-xs text-[#B7C4BC] leading-relaxed">
              {perm.purpose}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
