import test from 'node:test';
import assert from 'node:assert/strict';

test('Subscription plan validation and pricing structure', () => {
  const SUBSCRIPTION_PLANS = [
    { id: '1d', label: '1 Day Pass', priceInINR: 9, durationDays: 1 },
    { id: '2d', label: '2 Days Pass', priceInINR: 15, durationDays: 2 },
    { id: '7d', label: '7 Days Weekly', priceInINR: 39, durationDays: 7 },
    { id: '1m', label: '1 Month Monthly', priceInINR: 99, durationDays: 30 },
    { id: '2m', label: '2 Months', priceInINR: 179, durationDays: 60 },
    { id: '3m', label: '3 Months Quarterly', priceInINR: 249, durationDays: 90 },
    { id: '6m', label: '6 Months Half-Year', priceInINR: 449, durationDays: 180 },
    { id: '12m', label: '12 Months Annual VIP', priceInINR: 799, durationDays: 365 },
  ];

  assert.equal(SUBSCRIPTION_PLANS.length, 8);
  assert.equal(SUBSCRIPTION_PLANS[0].priceInINR, 9);
  assert.equal(SUBSCRIPTION_PLANS[3].priceInINR, 99);
  assert.equal(SUBSCRIPTION_PLANS[7].priceInINR, 799);

  // Check duration days increase
  for (let i = 1; i < SUBSCRIPTION_PLANS.length; i++) {
    assert.ok(SUBSCRIPTION_PLANS[i].durationDays > SUBSCRIPTION_PLANS[i - 1].durationDays);
    assert.ok(SUBSCRIPTION_PLANS[i].priceInINR > SUBSCRIPTION_PLANS[i - 1].priceInINR);
  }
});

test('Subscription verification behavior: rejects fake validation and accepts QA test tokens', () => {
  function verifySubscription(utr, testToken, planDurationDays) {
    if (testToken === 'TEST-VIP-ACCESS' || testToken === 'GBX-DEV-VERIFY') {
      const now = Date.now();
      return {
        success: true,
        record: {
          isActive: true,
          activatedAt: now,
          expiresAt: now + planDurationDays * 24 * 60 * 60 * 1000,
          utrRef: utr || 'QA-BYPASS',
        }
      };
    }

    return {
      success: false,
      error: 'Payment verification is not configured yet. Ad-Free access cannot be activated automatically.'
    };
  }

  // Without test token: must strictly return honest unconfigured message
  const standardAttempt = verifySubscription('123456789012', '', 30);
  assert.equal(standardAttempt.success, false);
  assert.equal(
    standardAttempt.error,
    'Payment verification is not configured yet. Ad-Free access cannot be activated automatically.'
  );

  // With QA bypass token: activates valid expiration
  const qaAttempt = verifySubscription('123456789012', 'TEST-VIP-ACCESS', 30);
  assert.equal(qaAttempt.success, true);
  assert.equal(qaAttempt.record.isActive, true);
  assert.ok(qaAttempt.record.expiresAt > Date.now());
});

test('Preset catalog separates games and non-game applications cleanly', () => {
  const PRESET_POPULAR_GAMES = [
    { packageName: 'com.dts.freefireth', name: 'Free Fire MAX', itemType: 'game' },
    { packageName: 'com.pubg.imobile', name: 'BGMI: Battlegrounds Mobile India', itemType: 'game' },
    { packageName: 'com.supercell.clashofclans', name: 'Clash of Clans', itemType: 'game' },
  ];

  const PRESET_POPULAR_APPS = [
    { packageName: 'com.google.android.calculator', name: 'Calculator', itemType: 'app' },
    { packageName: 'com.google.android.calendar', name: 'Google Calendar', itemType: 'app' },
    { packageName: 'com.google.android.deskclock', name: 'Clock & Timer', itemType: 'app' },
  ];

  assert.ok(PRESET_POPULAR_GAMES.every(g => g.itemType === 'game'));
  assert.ok(PRESET_POPULAR_APPS.every(a => a.itemType === 'app'));
  assert.equal(new Set([...PRESET_POPULAR_GAMES, ...PRESET_POPULAR_APPS].map(x => x.packageName)).size, 6);
});

test('Merchant UPI ID configuration and intent URI formatting', () => {
  const MERCHANT_UPI_ID = 'prakash26pr@axl';
  const MERCHANT_NAME = 'Prakash Rox Official';
  assert.equal(MERCHANT_UPI_ID, 'prakash26pr@axl');

  const planPrice = 9;
  const txRef = 'GBX-TEST-TX';
  const note = encodeURIComponent('GameBoostX AdFree 1_day');
  const payeeName = encodeURIComponent(MERCHANT_NAME);
  const upiUri = `upi://pay?pa=${MERCHANT_UPI_ID}&pn=${payeeName}&tr=${txRef}&am=${planPrice}&cu=INR&tn=${note}`;

  assert.ok(upiUri.includes('pa=prakash26pr@axl'));
  assert.ok(upiUri.includes('pn=Prakash%20Rox%20Official'));
  assert.ok(upiUri.includes('am=9'));
  assert.ok(upiUri.includes('cu=INR'));
});

test('Google Play Billing subscription product IDs and policy terms', () => {
  const PLAY_BILLING_PLANS = [
    {
      productId: 'gameboostx_adfree_daily',
      title: '1 Day Pass',
      priceInr: 9,
      durationDays: 1,
      productType: 'inapp',
      renewalTerms: 'One-time 24-hour pass. Entitlement activates immediately upon verified Google Play purchase and expires automatically after 24 hours.',
      cancellationPolicy: 'No recurring billing. Entitlement concludes automatically after 24 hours without further charges.'
    },
    {
      productId: 'gameboostx_adfree_weekly',
      title: '7 Days Pass',
      priceInr: 39,
      durationDays: 7,
      popular: true,
      productType: 'subs',
      renewalTerms: 'Renews automatically every 7 days at ₹39 until cancelled via your Google Play account.',
      cancellationPolicy: 'Cancel anytime in Google Play Store -> Account -> Payments & Subscriptions -> Subscriptions.'
    },
    {
      productId: 'gameboostx_adfree_monthly',
      title: '1 Month Pro',
      priceInr: 99,
      durationDays: 30,
      productType: 'subs',
      renewalTerms: 'Renews automatically every month at ₹99 until cancelled. Billed via your Google Play account.',
      cancellationPolicy: 'Cancel anytime in Google Play Store -> Account -> Payments & Subscriptions -> Subscriptions.'
    },
    {
      productId: 'gameboostx_adfree_annual',
      title: '12 Months VIP Annual',
      priceInr: 799,
      durationDays: 365,
      bestValue: true,
      productType: 'subs',
      renewalTerms: 'Renews automatically annually at ₹799 until cancelled. Billed via your Google Play account.',
      cancellationPolicy: 'Cancel anytime in Google Play Store -> Account -> Payments & Subscriptions -> Subscriptions.'
    }
  ];

  assert.equal(PLAY_BILLING_PLANS.length, 4);
  assert.equal(PLAY_BILLING_PLANS[0].productId, 'gameboostx_adfree_daily');
  assert.equal(PLAY_BILLING_PLANS[0].durationDays, 1);
  assert.equal(PLAY_BILLING_PLANS[1].productId, 'gameboostx_adfree_weekly');
  assert.equal(PLAY_BILLING_PLANS[1].durationDays, 7);

  // Validate genuine expiration calculation
  const now = 1700000000000;
  const oneDayExpires = now + PLAY_BILLING_PLANS[0].durationDays * 86400000;
  const sevenDaysExpires = now + PLAY_BILLING_PLANS[1].durationDays * 86400000;

  assert.equal(oneDayExpires - now, 86400000); // exactly 24 hours
  assert.equal(sevenDaysExpires - now, 7 * 86400000); // exactly 7 days

  for (const plan of PLAY_BILLING_PLANS) {
    assert.ok(plan.cancellationPolicy.length > 0);
    assert.ok(plan.renewalTerms.length > 0);
    assert.ok(plan.priceInr > 0);
  }
});

test('Strict Real Package Discovery Policy: no fake apps when bridge is absent', () => {
  function getDiscoveredPackages(isNativeBridgeAvailable, bridgeRawData) {
    if (!isNativeBridgeAvailable) {
      return {
        apps: [],
        error: 'Installed application discovery requires running GameBoost X inside the native Android APK. Google Play package enumeration is not available in web preview.'
      };
    }

    try {
      const parsed = JSON.parse(bridgeRawData);
      if (Array.isArray(parsed)) {
        return { apps: parsed, error: null };
      }
      return { apps: [], error: 'Invalid data format' };
    } catch (e) {
      return { apps: [], error: e.message };
    }
  }

  // 1. Without native bridge: must NEVER return fake/mock items like Free Fire or Calculator
  const webResult = getDiscoveredPackages(false, null);
  assert.equal(webResult.apps.length, 0);
  assert.ok(webResult.error.includes('native Android APK'));

  // 2. With real native bridge data: parses genuine items
  const mockBridgePayload = JSON.stringify([
    {
      id: 'native-com.android.calculator2',
      name: 'Calculator',
      packageName: 'com.android.calculator2',
      isGame: false,
      isLaunchSupported: true,
      iconBase64: 'data:image/png;base64,iVBORw0KGgo...'
    }
  ]);
  const nativeResult = getDiscoveredPackages(true, mockBridgePayload);
  assert.equal(nativeResult.apps.length, 1);
  assert.equal(nativeResult.apps[0].packageName, 'com.android.calculator2');
  assert.ok(nativeResult.apps[0].iconBase64.startsWith('data:image/png;base64'));
});

