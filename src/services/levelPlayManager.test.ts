import test from 'node:test';
import assert from 'node:assert/strict';
import { AdFrequencyController } from './levelPlayManager.ts';

test('AdFrequencyController respects minimum interval between interstitials', () => {
  const controller = new AdFrequencyController(10, 3); // 10s cooldown, max 3

  // Initially can show
  assert.equal(controller.canShowInterstitial(), true);

  // Show 1
  controller.recordInterstitialShown();
  assert.equal(controller.getSessionCount(), 1);

  // Immediately after, should be blocked by cooldown
  assert.equal(controller.canShowInterstitial(), false);
  assert.ok(controller.getTimeUntilNextEligibleSec() > 0);
});

test('AdFrequencyController enforces maximum ads per session cap', () => {
  const controller = new AdFrequencyController(0, 2); // 0s cooldown, max 2

  assert.equal(controller.canShowInterstitial(), true);
  controller.recordInterstitialShown();
  assert.equal(controller.canShowInterstitial(), true);
  controller.recordInterstitialShown();

  // Exceeded max 2 per session
  assert.equal(controller.getSessionCount(), 2);
  assert.equal(controller.canShowInterstitial(), false);

  // Reset session
  controller.resetSession();
  assert.equal(controller.getSessionCount(), 0);
  assert.equal(controller.canShowInterstitial(), true);
});
