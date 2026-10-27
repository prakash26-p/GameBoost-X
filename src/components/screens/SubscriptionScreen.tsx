import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Crown,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Zap,
  Lock,
  QrCode,
  Copy,
  ExternalLink,
  AlertTriangle,
  RotateCcw,
  Check,
  Clock,
  Play,
  Info
} from 'lucide-react';
import {
  SubscriptionPlan,
  SubscriptionPlanId,
  SubscriptionRecord,
  PlayBillingPlan,
  PlaySubscriptionProductId
} from '../../types';
import { nativeBridge } from '../../services/nativeBridge';

// Official Google Play Console Subscription & Pass Product IDs
export const PLAY_BILLING_PLANS: PlayBillingPlan[] = [
  {
    productId: 'gameboostx_adfree_daily',
    title: '1 Day Pass',
    priceFormatted: '₹9.00 / 24 hrs',
    priceInr: 9,
    billingPeriod: '24 Hours',
    durationDays: 1,
    savingsBadge: 'Quick Boost',
    productType: 'inapp',
    renewalTerms:
      'One-time 24-hour pass. Entitlement activates immediately upon verified Google Play purchase and expires automatically after 24 hours.',
    cancellationPolicy:
      'No recurring billing. Entitlement concludes automatically after 24 hours without further charges.'
  },
  {
    productId: 'gameboostx_adfree_weekly',
    title: '7 Days Pass',
    priceFormatted: '₹39.00 / week',
    priceInr: 39,
    billingPeriod: '1 Week',
    durationDays: 7,
    popular: true,
    savingsBadge: 'Popular Weekly',
    productType: 'subs',
    renewalTerms:
      'Renews automatically every 7 days at ₹39 until cancelled via your Google Play account.',
    cancellationPolicy:
      'Cancel anytime in Google Play Store -> Account -> Payments & Subscriptions -> Subscriptions.'
  },
  {
    productId: 'gameboostx_adfree_monthly',
    title: '1 Month Pro',
    priceFormatted: '₹99.00 / month',
    priceInr: 99,
    billingPeriod: '1 Month',
    durationDays: 30,
    productType: 'subs',
    renewalTerms:
      'Renews automatically every month at ₹99 until cancelled via your Google Play account.',
    cancellationPolicy:
      'Cancel anytime in Google Play Store -> Account -> Payments & Subscriptions -> Subscriptions.'
  },
  {
    productId: 'gameboostx_adfree_annual',
    title: '12 Months VIP Annual',
    priceFormatted: '₹799.00 / year',
    priceInr: 799,
    billingPeriod: '1 Year',
    durationDays: 365,
    bestValue: true,
    savingsBadge: 'Best Value — 33% Off',
    productType: 'subs',
    renewalTerms:
      'Renews automatically annually at ₹799 until cancelled via your Google Play account.',
    cancellationPolicy:
      'Cancel anytime in Google Play Store -> Account -> Payments & Subscriptions -> Subscriptions.'
  }
];

// Fixed plans for direct Merchant UPI option
export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: '1_day',
    title: '1 Day Pass',
    durationDays: 1,
    priceInr: 9,
    description: 'Instant 24-hour ad-free gaming experience.'
  },
  {
    id: '2_days',
    title: '2 Days Pass',
    durationDays: 2,
    priceInr: 15,
    description: 'Weekend gaming without banner or interstitial ads.'
  },
  {
    id: '7_days',
    title: '7 Days Weekly',
    durationDays: 7,
    priceInr: 39,
    description: 'Full week of uninterrupted device monitoring & launch.'
  },
  {
    id: '1_month',
    title: '1 Month Pro',
    durationDays: 30,
    priceInr: 99,
    popular: true,
    description: '30 days VIP status with zero ads & priority boost.'
  },
  {
    id: '2_months',
    title: '2 Months Duo',
    durationDays: 60,
    priceInr: 179,
    description: 'Two full months of premium ad-free launcher utility.'
  },
  {
    id: '3_months',
    title: '3 Months Quarter',
    durationDays: 90,
    priceInr: 249,
    savingsBadge: 'Save 16%',
    description: 'Quarterly gamer subscription with full features unlocked.'
  },
  {
    id: '6_months',
    title: '6 Months Half-Year',
    durationDays: 180,
    priceInr: 449,
    savingsBadge: 'Save 24%',
    description: 'Half-year ultra gaming shield & verified zero telemetry.'
  },
  {
    id: '12_months',
    title: '12 Months Annual',
    durationDays: 365,
    priceInr: 799,
    bestValue: true,
    savingsBadge: 'Best Value — 33% Off',
    description: 'Full 365 days of continuous GameBoost X VIP Ad-Free access.'
  }
];

export const MERCHANT_UPI_ID = 'prakash26pr@axl';
export const MERCHANT_NAME = 'Prakash Rox Official';

interface SubscriptionScreenProps {
  subscription: SubscriptionRecord;
  onBack: () => void;
  onActivateSubscription: (record: SubscriptionRecord) => void;
  onRestorePurchases: () => Promise<boolean>;
}

export const SubscriptionScreen: React.FC<SubscriptionScreenProps> = ({
  subscription,
  onBack,
  onActivateSubscription,
  onRestorePurchases
}) => {
  const [activeTab, setActiveTab] = useState<'play_billing' | 'merchant_upi'>('play_billing');

  // Google Play Billing states
  const [selectedPlaySku, setSelectedPlaySku] = useState<PlaySubscriptionProductId>(
    'gameboostx_adfree_daily'
  );
  const [billingFlowStatus, setBillingFlowStatus] = useState<
    'idle' | 'initiating' | 'pending' | 'success' | 'cancelled' | 'error' | 'preview_notice'
  >('idle');
  const [billingMessage, setBillingMessage] = useState('');

  // Real localized prices synced from Google Play Billing Client
  const [catalogPrices, setCatalogPrices] = useState<Record<string, string>>({});
  const [configuredSkus, setConfiguredSkus] = useState<Set<string>>(new Set());

  // UPI states
  const [selectedPlanId, setSelectedPlanId] = useState<SubscriptionPlanId>('1_month');
  const [isCopied, setIsCopied] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [utrInput, setUtrInput] = useState('');
  const [verificationStatus, setVerificationStatus] = useState<
    'idle' | 'verifying' | 'unconfigured' | 'success' | 'error'
  >('idle');
  const [statusMessage, setStatusMessage] = useState('');

  const [timeRemaining, setTimeRemaining] = useState<string>('');

  const selectedPlayPlan =
    PLAY_BILLING_PLANS.find((p) => p.productId === selectedPlaySku) || PLAY_BILLING_PLANS[0];
  const selectedUpiPlan =
    SUBSCRIPTION_PLANS.find((p) => p.id === selectedPlanId) || SUBSCRIPTION_PLANS[3];

  // Sync localized prices from Google Play Billing if on Android
  useEffect(() => {
    const updateFromCatalog = (products: any[]) => {
      if (Array.isArray(products) && products.length > 0) {
        const prices: Record<string, string> = {};
        const skus = new Set<string>();
        for (const p of products) {
          if (p.productId && p.formattedPrice) {
            prices[p.productId] = p.formattedPrice;
            skus.add(p.productId);
          }
        }
        setCatalogPrices((prev) => ({ ...prev, ...prices }));
        setConfiguredSkus(skus);
      }
    };

    if (nativeBridge.isNativeAvailable()) {
      const initial = nativeBridge.getProductDetails();
      updateFromCatalog(initial);
    }

    if (typeof window !== 'undefined') {
      window.onPlayCatalogUpdated = (products: any[]) => {
        updateFromCatalog(products);
      };
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.onPlayCatalogUpdated = undefined;
      }
    };
  }, []);

  // Expiration countdown
  useEffect(() => {
    if (!subscription.isActive || !subscription.expiresAt) return;

    const updateTimer = () => {
      const now = Date.now();
      const expires = new Date(subscription.expiresAt!).getTime();
      const diff = expires - now;

      if (diff <= 0) {
        setTimeRemaining('Expired');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (days > 0) {
        setTimeRemaining(`${days}d ${hours}h ${minutes}m`);
      } else {
        setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [subscription]);

  // Hook into native Google Play Billing callbacks when running in Android WebView
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.onPlayBillingPurchased = (data: any) => {
        setBillingFlowStatus('success');
        setBillingMessage('Google Play purchase verified! Ad-Free VIP active.');
        const matchingPlan =
          PLAY_BILLING_PLANS.find(
            (p) => data.products && data.products.includes(p.productId)
          ) || selectedPlayPlan;

        onActivateSubscription({
          isActive: true,
          planId: matchingPlan.productId,
          productId: matchingPlan.productId,
          planTitle: matchingPlan.title,
          activatedAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + matchingPlan.durationDays * 86400000).toISOString(),
          transactionRef: data.orderId || data.purchaseToken || `GPA-${Date.now()}`,
          verificationMethod: 'google_play',
          billingProvider: 'google_play',
          purchaseToken: data.purchaseToken,
          orderId: data.orderId,
          purchaseState: 'PURCHASED',
          isAcknowledged: true,
          renewalTerms: matchingPlan.renewalTerms,
          merchantUpi: MERCHANT_UPI_ID
        });
      };

      window.onPlayBillingStatus = (status: string, message: string) => {
        if (status === 'CANCELLED') {
          setBillingFlowStatus('cancelled');
          setBillingMessage('Google Play subscription checkout cancelled.');
        } else if (status === 'PENDING') {
          setBillingFlowStatus('pending');
          setBillingMessage(
            'Google Play payment is pending (e.g. offline cash payment or parental approval). Entitlement activates once payment is settled.'
          );
        } else {
          setBillingFlowStatus('error');
          setBillingMessage(message || 'Google Play Billing encountered an error.');
        }
      };
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.onPlayBillingPurchased = undefined;
        window.onPlayBillingStatus = undefined;
      }
    };
  }, [selectedPlayPlan, onActivateSubscription]);

  // Start official Google Play Billing purchase flow directly
  const handleSubscribePlayBilling = () => {
    setBillingMessage('');

    if (nativeBridge.isNativeAvailable()) {
      setBillingFlowStatus('initiating');
      const res = nativeBridge.launchPlayBillingFlow(selectedPlayPlan.productId);
      if (!res.success) {
        setBillingFlowStatus('error');
        setBillingMessage(res.message);
      }
    } else {
      setBillingFlowStatus('preview_notice');
      setBillingMessage(
        'Google Play Billing requires running inside the signed Android APK build on a device with Google Play Services. In this desktop browser preview, official Google Play checkout dialogs cannot be invoked directly.'
      );
    }
  };

  // Restore Purchases via Google Play Billing
  const handleRestorePlayBilling = async () => {
    setBillingFlowStatus('initiating');
    setBillingMessage('Checking Google Play account for previous purchases...');

    if (nativeBridge.isNativeAvailable()) {
      const res = nativeBridge.restorePurchases();
      if (res.success) {
        setBillingFlowStatus('success');
        setBillingMessage('Checked Google Play account. Restoring active entitlements...');
      } else {
        setBillingFlowStatus('error');
        setBillingMessage(res.message);
      }
    } else {
      const restored = await onRestorePurchases();
      if (restored) {
        setBillingFlowStatus('success');
        setBillingMessage('Valid subscription restored from device records.');
      } else {
        setBillingFlowStatus('error');
        setBillingMessage('No active Google Play subscription found for this account.');
      }
    }
  };

  // Manage Subscription in Google Play
  const handleManagePlaySubscription = () => {
    nativeBridge.manageSubscription(selectedPlayPlan.productId);
  };

  // UPI Helpers
  const generateUpiUri = () => {
    const txRef = `GBX-${Date.now().toString(36).toUpperCase()}-${Math.floor(
      1000 + Math.random() * 9000
    )}`;
    const note = encodeURIComponent(`GameBoostX AdFree ${selectedUpiPlan.id}`);
    const payeeName = encodeURIComponent(MERCHANT_NAME);
    return `upi://pay?pa=${MERCHANT_UPI_ID}&pn=${payeeName}&tr=${txRef}&am=${selectedUpiPlan.priceInr}&cu=INR&tn=${note}`;
  };

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(MERCHANT_UPI_ID);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleOpenUpiApp = () => {
    window.location.href = generateUpiUri();
  };

  const handleVerifyUpiPayment = async () => {
    setVerificationStatus('verifying');
    setStatusMessage('');

    try {
      const res = await fetch('/api/verify-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: selectedUpiPlan.id,
          utr: utrInput.trim(),
          merchantUpi: MERCHANT_UPI_ID
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.status === 'verified') {
          setVerificationStatus('success');
          setStatusMessage('Payment verified successfully! Ad-Free VIP mode active.');
          onActivateSubscription({
            isActive: true,
            planId: selectedUpiPlan.id,
            planTitle: selectedUpiPlan.title,
            activatedAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + selectedUpiPlan.durationDays * 86400000).toISOString(),
            transactionRef: utrInput || data.transactionRef,
            verificationMethod: 'bank_webhook',
            billingProvider: 'merchant_upi',
            merchantUpi: MERCHANT_UPI_ID
          });
          return;
        }
      }

      setVerificationStatus('unconfigured');
      setStatusMessage(
        'Payment verification is not configured yet. Ad-Free access cannot be activated automatically.'
      );
    } catch {
      setVerificationStatus('unconfigured');
      setStatusMessage(
        'Payment verification is not configured yet. Ad-Free access cannot be activated automatically.'
      );
    }
  };

  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-200">
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-2 border-b border-[#285C38]">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="w-8 h-8 rounded-xl bg-[#101712] border border-[#285C38] flex items-center justify-center text-[#B7C6BA] hover:text-[#39FF70] transition-colors cursor-pointer"
            aria-label="Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-base font-bold font-display text-white tracking-wide flex items-center gap-1.5">
              <span>AD-FREE VIP SUBSCRIPTION</span>
              <Crown className="w-4 h-4 text-[#FFD700]" />
            </h1>
            <p className="text-[10px] text-[#6B7C70]">
              GameBoost X • Official Google Play Billing Integration
            </p>
          </div>
        </div>

        <button
          onClick={handleRestorePlayBilling}
          className="text-[11px] font-mono text-[#39FF70] hover:underline flex items-center gap-1 cursor-pointer"
          title="Restore active subscription"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Restore</span>
        </button>
      </div>

      {/* Active Subscription Status Banner if already VIP */}
      {subscription.isActive && (
        <div className="bg-gradient-to-r from-[#1A2E1F] via-[#122116] to-[#0A140C] border-2 border-[#39FF70] rounded-2xl p-4 shadow-[0_0_25px_rgba(57,255,112,0.25)] relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-[#39FF70]/10 blur-xl pointer-events-none" />
          <div className="flex items-start justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#39FF70]/20 text-[#39FF70] text-[10px] font-mono font-bold tracking-wider mb-1">
                <Crown className="w-3 h-3 text-[#FFD700]" />
                ACTIVE AD-FREE VIP
              </div>
              <h2 className="text-base font-bold font-display text-white">
                {subscription.planTitle || 'Premium Plan'}
              </h2>
              <div className="flex items-center gap-2 text-xs text-[#B7C6BA] mt-1 font-mono">
                <Clock className="w-3.5 h-3.5 text-[#39FF70]" />
                <span>
                  Expires / Renews in: <strong className="text-white">{timeRemaining}</strong>
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[9px] font-mono text-[#6B7C70] block">Billing Provider</span>
              <span className="text-[10px] font-mono text-[#39FF70] uppercase font-bold">
                {subscription.billingProvider === 'google_play' ? 'Google Play' : 'Merchant UPI'}
              </span>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-[#285C38]/60 flex items-center justify-between text-[11px] text-[#B7C6BA]">
            <span className="flex items-center gap-1 text-[#39FF70]">
              <CheckCircle2 className="w-3.5 h-3.5" /> All Banner & Interstitial Ads Suppressed
            </span>
            <button
              onClick={handleManagePlaySubscription}
              className="text-[10px] font-mono text-[#FFD700] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Manage in Play Store</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* VIP Member Privileges */}
      <div className="bg-[#101712] border border-[#285C38] rounded-2xl p-4 space-y-2.5">
        <h3 className="text-xs font-bold font-display tracking-wider text-white flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#39FF70]" />
          VIP MEMBER PRIVILEGES
        </h3>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 rounded-xl bg-[#050806] border border-[#285C38] flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#39FF70] flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-white text-[11px]">100% Zero Ads</div>
              <div className="text-[9px] text-[#6B7C70]">Banner, interstitial & native ads suppressed</div>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-[#050806] border border-[#285C38] flex items-start gap-2">
            <Zap className="w-4 h-4 text-[#39FF70] flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-white text-[11px]">Instant Launch</div>
              <div className="text-[9px] text-[#6B7C70]">Skip post-optimization interstitial countdowns</div>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-[#050806] border border-[#285C38] flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-[#39FF70] flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-white text-[11px]">Verified Security</div>
              <div className="text-[9px] text-[#6B7C70]">Zero telemetry, official Play Store billing</div>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-[#050806] border border-[#285C38] flex items-start gap-2">
            <Crown className="w-4 h-4 text-[#FFD700] flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-white text-[11px]">VIP Launcher Badge</div>
              <div className="text-[9px] text-[#6B7C70]">Gold PRO designation on header & dashboard</div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Provider Selector Tabs */}
      <div className="grid grid-cols-2 gap-2 p-1 bg-[#101712] border border-[#285C38] rounded-xl">
        <button
          onClick={() => setActiveTab('play_billing')}
          className={`py-2 px-3 rounded-lg flex items-center justify-center gap-2 text-xs font-display font-bold transition-all cursor-pointer ${
            activeTab === 'play_billing'
              ? 'bg-[#39FF70] text-black shadow-[0_0_12px_rgba(57,255,112,0.3)]'
              : 'text-[#B7C6BA] hover:text-white'
          }`}
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>GOOGLE PLAY BILLING</span>
        </button>

        <button
          onClick={() => setActiveTab('merchant_upi')}
          className={`py-2 px-3 rounded-lg flex items-center justify-center gap-2 text-xs font-display font-bold transition-all cursor-pointer ${
            activeTab === 'merchant_upi'
              ? 'bg-[#39FF70] text-black shadow-[0_0_12px_rgba(57,255,112,0.3)]'
              : 'text-[#B7C6BA] hover:text-white'
          }`}
        >
          <QrCode className="w-3.5 h-3.5" />
          <span>DIRECT MERCHANT UPI</span>
        </button>
      </div>

      {/* ==================== TAB 1: GOOGLE PLAY BILLING ==================== */}
      {activeTab === 'play_billing' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* Plan Selection Cards */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold font-display tracking-wider text-white">
                GOOGLE PLAY CONSOLE SUBSCRIPTION PLANS
              </h3>
              <span className="text-[10px] text-[#39FF70] font-mono">Official In-App Billing</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {PLAY_BILLING_PLANS.map((plan) => {
                const isSelected = selectedPlaySku === plan.productId;
                const dynamicPrice = catalogPrices[plan.productId] || plan.priceFormatted;

                return (
                  <div
                    key={plan.productId}
                    onClick={() => setSelectedPlaySku(plan.productId)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[#152319] border-[#39FF70] shadow-[0_0_15px_rgba(57,255,112,0.2)]'
                        : 'bg-[#101712] border-[#285C38] hover:border-[#39FF70]/50'
                    }`}
                  >
                    {plan.popular && (
                      <span className="absolute -top-2 right-2 px-1.5 py-0.5 rounded-md bg-[#39FF70] text-black text-[9px] font-bold font-mono uppercase tracking-wider">
                        Popular
                      </span>
                    )}
                    {plan.bestValue && (
                      <span className="absolute -top-2 right-2 px-1.5 py-0.5 rounded-md bg-[#FFD700] text-black text-[9px] font-bold font-mono uppercase tracking-wider">
                        Best Value
                      </span>
                    )}
                    {plan.savingsBadge && !plan.bestValue && !plan.popular && (
                      <span className="absolute -top-2 right-2 px-1.5 py-0.5 rounded-md bg-[#1C2D22] border border-[#39FF70]/40 text-[#39FF70] text-[8px] font-bold font-mono">
                        {plan.savingsBadge}
                      </span>
                    )}

                    <div>
                      <div className="text-xs font-bold font-display text-white">{plan.title}</div>
                      <div className="text-[10px] font-mono text-[#6B7C70] mt-0.5 truncate">
                        ID: {plan.productId}
                      </div>
                      <div className="text-[9px] text-[#B7C6BA] mt-0.5">
                        {plan.durationDays === 1 ? 'Genuine 24 Hours' : `${plan.durationDays} Days Entitlement`}
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-[#285C38]/40">
                      <div className="text-base font-extrabold font-mono text-[#39FF70]">
                        {dynamicPrice}
                      </div>
                      <div className="text-[9px] text-[#B7C6BA] font-mono">
                        {plan.billingPeriod}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Plan Details, Renewal Terms, and Cancellation Policy */}
          <div className="bg-[#101712] border border-[#285C38] rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#285C38]/60">
              <div>
                <span className="text-xs font-bold font-display text-white">
                  {selectedPlayPlan.title}
                </span>
                <span className="text-[10px] font-mono text-[#39FF70] block">
                  Product ID: {selectedPlayPlan.productId}
                </span>
              </div>
              <div className="text-right">
                <span className="text-base font-extrabold font-mono text-[#39FF70]">
                  {catalogPrices[selectedPlayPlan.productId] || selectedPlayPlan.priceFormatted}
                </span>
              </div>
            </div>

            {/* Terms of Service & Auto-Renewal Disclosure */}
            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-[#050806] border border-[#285C38] space-y-1">
                <div className="text-[10px] uppercase font-mono font-bold text-[#B7C6BA]">
                  Billing & Duration Policy
                </div>
                <p className="text-[11px] text-[#6B7C70] leading-relaxed">
                  {selectedPlayPlan.renewalTerms}
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-[#050806] border border-[#285C38] space-y-1">
                <div className="text-[10px] uppercase font-mono font-bold text-[#B7C6BA]">
                  Cancellation Instructions
                </div>
                <p className="text-[11px] text-[#6B7C70] leading-relaxed">
                  {selectedPlayPlan.cancellationPolicy}
                </p>
              </div>
            </div>

            {/* Official Subscribe Action Button */}
            <button
              onClick={handleSubscribePlayBilling}
              disabled={billingFlowStatus === 'initiating'}
              className="w-full py-3 bg-gradient-to-r from-[#39FF70] to-[#20C65A] text-black font-display font-extrabold text-xs rounded-xl shadow-[0_0_20px_rgba(57,255,112,0.35)] hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <Play className="w-4 h-4 fill-black" />
              <span>
                {billingFlowStatus === 'initiating'
                  ? 'STARTING GOOGLE PLAY CHECKOUT...'
                  : `SUBSCRIBE WITH GOOGLE PLAY — ${selectedPlayPlan.title.toUpperCase()}`}
              </span>
            </button>

            {/* Secondary actions: Manage & Restore */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={handleManagePlaySubscription}
                className="py-2 px-3 rounded-lg bg-[#151F18] border border-[#285C38] hover:border-[#39FF70] text-[#B7C6BA] hover:text-white text-[11px] font-mono transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5 text-[#39FF70]" />
                <span>Manage Subscriptions</span>
              </button>

              <button
                onClick={handleRestorePlayBilling}
                className="py-2 px-3 rounded-lg bg-[#151F18] border border-[#285C38] hover:border-[#39FF70] text-[#B7C6BA] hover:text-white text-[11px] font-mono transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#39FF70]" />
                <span>Restore Purchases</span>
              </button>
            </div>

            {/* Security Guarantee */}
            <div className="p-2.5 rounded-xl bg-[#FF5C68]/10 border border-[#FF5C68]/30 text-[10px] text-[#FF5C68] flex items-start gap-2">
              <Lock className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Security Protection:</strong> GameBoost X never requests or stores your Google password, credit card credentials, or UPI PIN. All checkout transactions are executed strictly by Google Play.
              </span>
            </div>
          </div>

          {/* Clean Lifecycle Status Feedback (Production-only, no debug inputs) */}
          {billingFlowStatus === 'preview_notice' && (
            <div className="p-3 rounded-xl bg-[#101712] border border-[#285C38] text-xs space-y-1">
              <div className="flex items-center gap-2 text-[#39FF70] font-semibold">
                <Info className="w-4 h-4 text-[#39FF70] flex-shrink-0" />
                <span>Google Play Checkout Environment</span>
              </div>
              <p className="text-[11px] text-[#B7C6BA] leading-relaxed">
                {billingMessage}
              </p>
            </div>
          )}

          {billingFlowStatus === 'success' && (
            <div className="p-3 rounded-xl bg-[#39FF70]/10 border border-[#39FF70]/40 text-[#39FF70] text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#39FF70] flex-shrink-0" />
              <span>{billingMessage}</span>
            </div>
          )}

          {billingFlowStatus === 'pending' && (
            <div className="p-3 rounded-xl bg-[#FFC857]/10 border border-[#FFC857]/40 text-[#FFC857] text-xs flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#FFC857] flex-shrink-0" />
              <span>{billingMessage}</span>
            </div>
          )}

          {billingFlowStatus === 'cancelled' && (
            <div className="p-3 rounded-xl bg-[#6B7C70]/10 border border-[#6B7C70]/40 text-[#B7C6BA] text-xs flex items-center gap-2">
              <Info className="w-4 h-4 text-[#6B7C70] flex-shrink-0" />
              <span>{billingMessage}</span>
            </div>
          )}

          {billingFlowStatus === 'error' && (
            <div className="p-3 rounded-xl bg-[#FF5C68]/10 border border-[#FF5C68]/40 text-[#FF5C68] text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#FF5C68] flex-shrink-0" />
              <span>{billingMessage}</span>
            </div>
          )}
        </div>
      )}

      {/* ==================== TAB 2: DIRECT MERCHANT UPI ==================== */}
      {activeTab === 'merchant_upi' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* 8 Fixed-Duration Subscription Plans */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold font-display tracking-wider text-white">
                SELECT FIXED PLAN DURATION
              </h3>
              <span className="text-[10px] text-[#6B7C70] font-mono">8 Fixed Plans Available</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {SUBSCRIPTION_PLANS.map((plan) => {
                const isSelected = selectedPlanId === plan.id;
                return (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedPlanId(plan.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[#152319] border-[#39FF70] shadow-[0_0_15px_rgba(57,255,112,0.2)]'
                        : 'bg-[#101712] border-[#285C38] hover:border-[#39FF70]/50'
                    }`}
                  >
                    {plan.popular && (
                      <span className="absolute -top-2 right-2 px-1.5 py-0.5 rounded-md bg-[#39FF70] text-black text-[9px] font-bold font-mono uppercase tracking-wider">
                        Popular
                      </span>
                    )}
                    {plan.bestValue && (
                      <span className="absolute -top-2 right-2 px-1.5 py-0.5 rounded-md bg-[#FFD700] text-black text-[9px] font-bold font-mono uppercase tracking-wider">
                        Best Value
                      </span>
                    )}
                    {plan.savingsBadge && !plan.bestValue && !plan.popular && (
                      <span className="absolute -top-2 right-2 px-1.5 py-0.5 rounded-md bg-[#1C2D22] border border-[#39FF70]/40 text-[#39FF70] text-[8px] font-bold font-mono">
                        {plan.savingsBadge}
                      </span>
                    )}

                    <div>
                      <div className="text-xs font-bold font-display text-white">{plan.title}</div>
                      <p className="text-[9px] text-[#6B7C70] line-clamp-1 mt-0.5">{plan.description}</p>
                    </div>

                    <div className="mt-2 pt-2 border-t border-[#285C38]/40 flex items-baseline justify-between">
                      <div className="text-base font-extrabold font-mono text-[#39FF70]">
                        ₹{plan.priceInr}
                      </div>
                      <span className="text-[9px] text-[#B7C6BA] font-mono">
                        {plan.durationDays} {plan.durationDays === 1 ? 'day' : 'days'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Merchant Payment Details & UPI Intent */}
          <div className="bg-[#101712] border border-[#285C38] rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold font-display text-white">MERCHANT PAYMENT DETAILS</div>
              <span className="text-[10px] font-mono text-[#FFD700] bg-[#FFD700]/10 border border-[#FFD700]/30 px-2 py-0.5 rounded">
                Amount: ₹{selectedUpiPlan.priceInr}
              </span>
            </div>

            {/* UPI Merchant Card with updated prakash26pr@axl */}
            <div className="bg-[#050806] border border-[#285C38] rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[#6B7C70] uppercase font-mono">Official Payee</span>
                <span className="text-xs font-bold text-white">{MERCHANT_NAME}</span>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-[#285C38]/40">
                <div>
                  <span className="text-[9px] text-[#6B7C70] uppercase font-mono block">Verified Merchant UPI ID</span>
                  <span className="text-xs font-mono font-bold text-[#39FF70]">{MERCHANT_UPI_ID}</span>
                </div>
                <button
                  onClick={handleCopyUpi}
                  className="p-1.5 rounded-lg bg-[#151F18] border border-[#285C38] text-[#B7C6BA] hover:text-[#39FF70] transition-colors flex items-center gap-1 text-[10px] cursor-pointer"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-[#39FF70]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{isCopied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Action Buttons: Pay via App & QR Code */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleOpenUpiApp}
                className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#39FF70] to-[#20C65A] text-black font-display font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(57,255,112,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              >
                <Zap className="w-4 h-4 fill-black" />
                <span>PAY WITH UPI APP</span>
              </button>

              <button
                onClick={() => setShowQrModal(true)}
                className="py-2.5 px-3 rounded-xl bg-[#151F18] border border-[#285C38] text-white hover:border-[#39FF70] font-display font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <QrCode className="w-4 h-4 text-[#39FF70]" />
                <span>SHOW QR CODE</span>
              </button>
            </div>

            {/* Security Rule Disclosure */}
            <div className="p-2.5 rounded-xl bg-[#FF5C68]/10 border border-[#FF5C68]/30 text-[10px] text-[#FF5C68] flex items-start gap-2">
              <Lock className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Security Rule:</strong> GameBoost X never collects, intercepts, or stores your UPI PIN. Never enter your UPI PIN anywhere except inside your official bank-certified UPI application.
              </span>
            </div>
          </div>

          {/* Payment Verification Section */}
          <div className="bg-[#101712] border border-[#285C38] rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold font-display text-white">VERIFY UPI TRANSACTION</div>
              <span className="text-[10px] text-[#6B7C70] font-mono">12-Digit UTR Required</span>
            </div>

            <p className="text-[11px] text-[#B7C6BA] leading-relaxed">
              Returning to GameBoost X after opening PhonePe or GPay does not activate your subscription. Enter the 12-digit UTR transaction reference from your bank statement to verify.
            </p>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={utrInput}
                onChange={(e) => setUtrInput(e.target.value)}
                placeholder="Enter 12-digit UTR (e.g. 429381028471)"
                className="flex-1 bg-[#050806] border border-[#285C38] focus:border-[#39FF70] rounded-xl px-3 py-2 text-xs font-mono text-white placeholder-[#6B7C70] outline-none"
              />
              <button
                onClick={handleVerifyUpiPayment}
                disabled={verificationStatus === 'verifying'}
                className="px-4 py-2 bg-[#1C2D22] border border-[#39FF70]/50 hover:border-[#39FF70] hover:bg-[#39FF70] hover:text-black text-[#39FF70] font-display font-bold text-xs rounded-xl transition-all cursor-pointer disabled:opacity-50"
              >
                {verificationStatus === 'verifying' ? 'Verifying...' : 'VERIFY'}
              </button>
            </div>

            {verificationStatus === 'unconfigured' && (
              <div className="p-3 rounded-xl bg-[#FFC857]/10 border border-[#FFC857]/40 text-[#FFC857] text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-[#FFC857]" />
                <div>
                  <div className="font-semibold text-white">Payment Verification Status</div>
                  <p className="text-[11px] mt-0.5 leading-relaxed text-[#FFC857]">
                    Payment verification is not configured yet. Ad-Free access cannot be activated automatically.
                  </p>
                </div>
              </div>
            )}

            {verificationStatus === 'success' && (
              <div className="p-3 rounded-xl bg-[#39FF70]/10 border border-[#39FF70]/40 text-[#39FF70] text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#39FF70]" />
                <span>{statusMessage}</span>
              </div>
            )}

            {verificationStatus === 'error' && (
              <div className="p-3 rounded-xl bg-[#FF5C68]/10 border border-[#FF5C68]/40 text-[#FF5C68] text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[#FF5C68]" />
                <span>{statusMessage}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* QR Code Modal for UPI */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#101712] border-2 border-[#39FF70] rounded-2xl p-5 max-w-sm w-full space-y-4 animate-in zoom-in-95 duration-150">
            <div className="text-center space-y-1">
              <h3 className="text-sm font-bold font-display text-white">SCAN & PAY WITH ANY UPI APP</h3>
              <p className="text-[10px] text-[#6B7C70] font-mono">
                GPay • PhonePe • Paytm • Amazon Pay • BHIM
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl flex flex-col items-center justify-center shadow-lg mx-auto w-56 h-56">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                  generateUpiUri()
                )}`}
                alt="UPI Payment QR Code"
                className="w-48 h-48"
                loading="eager"
              />
            </div>

            <div className="text-center font-mono text-xs">
              <span className="text-[#6B7C70]">Pay to: </span>
              <strong className="text-[#39FF70]">{MERCHANT_UPI_ID}</strong>
              <div className="text-[#B7C6BA] text-[11px] mt-1">
                Amount: <strong className="text-white">₹{selectedUpiPlan.priceInr}</strong> ({selectedUpiPlan.title})
              </div>
            </div>

            <button
              onClick={() => setShowQrModal(false)}
              className="w-full py-2 bg-[#1C2D22] border border-[#285C38] text-white hover:text-[#39FF70] font-display text-xs rounded-xl cursor-pointer"
            >
              CLOSE
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
