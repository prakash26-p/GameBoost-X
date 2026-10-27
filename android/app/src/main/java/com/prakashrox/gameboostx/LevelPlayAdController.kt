package com.prakashrox.gameboostx

import android.app.Activity
import android.util.Log
import com.ironsource.mediationsdk.IronSource
import com.ironsource.mediationsdk.IronSourceBannerLayout
import com.ironsource.mediationsdk.ISBannerSize
import com.ironsource.mediationsdk.integration.IntegrationHelper
import com.ironsource.mediationsdk.logger.IronSourceError
import com.ironsource.mediationsdk.sdk.BannerListener
import com.ironsource.mediationsdk.sdk.InterstitialListener

/**
 * LevelPlayAdController
 * Unity LevelPlay mediation integration for GameBoost X.
 * Package: com.prakashrox.gameboostx
 * Developer: Prakash Rox Official
 */
class LevelPlayAdController(private val activity: Activity) {

    companion object {
        private const val TAG = "GameBoostX_LevelPlay"

        // Verified Unity LevelPlay Ad Unit Identifiers
        const val BANNER_AD_UNIT_ID = "rm9wn28m9hwlk81n"
        const val INTERSTITIAL_AD_UNIT_ID = "a41guoa3mv1ridan"
        const val NATIVE_AD_UNIT_ID = "uljl02ubr3jc5xu8"

        // Frequency Cap Rules
        const val MIN_INTERVAL_MS = 120_000L // 120 seconds cooldown
        const val MAX_PER_SESSION = 3
    }

    private var isAdFreeActive: Boolean = false
    private var isInitialized: Boolean = false
    private var lastInterstitialTime: Long = 0
    private var sessionAdCount: Int = 0
    private var bannerLayout: IronSourceBannerLayout? = null

    fun initialize(appKey: String, testMode: Boolean = true) {
        if (isAdFreeActive) {
            Log.d(TAG, "Ad-Free VIP mode active. Skipping LevelPlay initialization.")
            return
        }

        IronSource.init(activity, appKey, IronSource.AD_UNIT.INTERSTITIAL, IronSource.AD_UNIT.BANNER)
        if (testMode) {
            IntegrationHelper.validateIntegration(activity)
        }
        setupListeners()
        isInitialized = true
        Log.d(TAG, "LevelPlay initialized with AppKey: $appKey")
    }

    fun setAdFreeStatus(active: Boolean) {
        this.isAdFreeActive = active
        if (active) {
            destroyBanner()
            Log.d(TAG, "Ad-Free mode turned ON: Suppressing all LevelPlay ads.")
        }
    }

    private fun setupListeners() {
        IronSource.setInterstitialListener(object : InterstitialListener {
            override fun onInterstitialAdReady() {
                Log.d(TAG, "LevelPlay Interstitial ready: $INTERSTITIAL_AD_UNIT_ID")
            }

            override fun onInterstitialAdLoadFailed(error: IronSourceError?) {
                Log.w(TAG, "LevelPlay Interstitial load failed: ${error?.errorMessage}")
            }

            override fun onInterstitialAdOpened() {
                lastInterstitialTime = System.currentTimeMillis()
                sessionAdCount++
                Log.d(TAG, "Interstitial opened (Session total: $sessionAdCount)")
            }

            override fun onInterstitialAdClosed() {
                Log.d(TAG, "Interstitial closed")
            }

            override fun onInterstitialAdShowSucceeded() {}
            override fun onInterstitialAdShowFailed(error: IronSourceError?) {
                Log.w(TAG, "Interstitial show failed: ${error?.errorMessage}")
            }
            override fun onInterstitialAdClicked() {}
        })
    }

    fun loadBanner(): IronSourceBannerLayout? {
        if (isAdFreeActive || !isInitialized) return null

        destroyBanner()
        val banner = IronSource.createBanner(activity, ISBannerSize.BANNER)
        banner.bannerListener = object : BannerListener {
            override fun onBannerAdLoaded() {
                Log.d(TAG, "LevelPlay Banner loaded: $BANNER_AD_UNIT_ID")
            }

            override fun onBannerAdLoadFailed(error: IronSourceError?) {
                Log.w(TAG, "Banner load failed: ${error?.errorMessage}")
            }

            override fun onBannerAdClicked() {}
            override fun onBannerAdScreenPresented() {}
            override fun onBannerAdScreenDismissed() {}
            override fun onBannerAdLeftApplication() {}
        }

        IronSource.loadBanner(banner, BANNER_AD_UNIT_ID)
        this.bannerLayout = banner
        return banner
    }

    fun canShowInterstitial(): Boolean {
        if (isAdFreeActive) return false
        if (sessionAdCount >= MAX_PER_SESSION) return false

        val elapsed = System.currentTimeMillis() - lastInterstitialTime
        return elapsed >= MIN_INTERVAL_MS
    }

    fun showInterstitial(placementName: String = "Default"): Boolean {
        if (!canShowInterstitial()) {
            Log.d(TAG, "Interstitial blocked by cooldown/frequency policy or VIP status.")
            return false
        }

        if (IronSource.isInterstitialReady()) {
            IronSource.showInterstitial(INTERSTITIAL_AD_UNIT_ID)
            return true
        } else {
            IronSource.loadInterstitial()
            return false
        }
    }

    fun destroyBanner() {
        bannerLayout?.let {
            IronSource.destroyBanner(it)
            bannerLayout = null
        }
    }
}
