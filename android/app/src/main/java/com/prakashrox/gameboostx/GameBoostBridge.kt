package com.prakashrox.gameboostx

import android.app.ActivityManager
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.os.BatteryManager
import android.os.Build
import android.webkit.JavascriptInterface
import org.json.JSONObject

/**
 * GameBoostBridge
 * Secure JavascriptInterface connecting the HTML/React frontend with Android native APIs.
 */
class GameBoostBridge(
    private val activity: MainActivity,
    private val discoveryManager: AppDiscoveryManager,
    private val adController: LevelPlayAdController,
    private val upiManager: UpiPaymentManager,
    private val billingManager: BillingManager
) {

    @JavascriptInterface
    fun isNativeEnvironment(): Boolean {
        return true
    }

    @JavascriptInterface
    fun getInstalledApplications(): String {
        val items = discoveryManager.getInstalledLaunchableItems()
        return discoveryManager.toJson(items)
    }

    @JavascriptInterface
    fun launchApplication(packageName: String): Boolean {
        return discoveryManager.launchPackage(packageName)
    }

    // Google Play Billing Official API
    @JavascriptInterface
    fun launchPlayBillingFlow(productId: String): Boolean {
        return billingManager.launchPurchaseFlow(productId)
    }

    @JavascriptInterface
    fun queryActivePurchases(): String {
        return billingManager.queryActivePurchases()
    }

    @JavascriptInterface
    fun restorePurchases(): Boolean {
        return billingManager.restorePurchases()
    }

    @JavascriptInterface
    fun manageSubscription(productId: String): Boolean {
        billingManager.manageSubscriptions(productId.ifBlank { null })
        return true
    }

    @JavascriptInterface
    fun getProductDetails(): String {
        return billingManager.getProductDetailsJson()
    }

    // Legacy Merchant UPI
    @JavascriptInterface
    fun initiateUpiPayment(planId: String, amount: Double, txRef: String): Boolean {
        return upiManager.initiateUpiPayment(planId, amount, txRef)
    }

    @JavascriptInterface
    fun showLevelPlayInterstitial(placement: String): Boolean {
        return adController.showInterstitial(placement)
    }

    @JavascriptInterface
    fun setAdFreeStatus(active: Boolean) {
        adController.setAdFreeStatus(active)
    }

    @JavascriptInterface
    fun getDeviceMetrics(): String {
        val json = JSONObject()

        // 1. Genuine RAM metrics
        val actManager = activity.getSystemService(Context.ACTIVITY_SERVICE) as ActivityManager
        val memInfo = ActivityManager.MemoryInfo()
        actManager.getMemoryInfo(memInfo)

        val totalGb = memInfo.totalMem.toDouble() / (1024 * 1024 * 1024)
        val availGb = memInfo.availMem.toDouble() / (1024 * 1024 * 1024)
        val usedGb = totalGb - availGb

        json.put("ramTotalGb", String.format("%.2f", totalGb).toDouble())
        json.put("ramAvailableGb", String.format("%.2f", availGb).toDouble())
        json.put("ramUsedGb", String.format("%.2f", usedGb).toDouble())
        json.put("ramUsagePercent", ((usedGb / totalGb) * 100).toInt())
        json.put("isLowMemory", memInfo.lowMemory)

        // 2. Genuine Battery metrics
        val batteryIntent = activity.registerReceiver(null, IntentFilter(Intent.ACTION_BATTERY_CHANGED))
        if (batteryIntent != null) {
            val level = batteryIntent.getIntExtra(BatteryManager.EXTRA_LEVEL, -1)
            val scale = batteryIntent.getIntExtra(BatteryManager.EXTRA_SCALE, -1)
            val status = batteryIntent.getIntExtra(BatteryManager.EXTRA_STATUS, -1)
            val tempTenths = batteryIntent.getIntExtra(BatteryManager.EXTRA_TEMPERATURE, -1)

            val batteryPct = if (level >= 0 && scale > 0) (level * 100 / scale) else null
            val isCharging = status == BatteryManager.BATTERY_STATUS_CHARGING ||
                             status == BatteryManager.BATTERY_STATUS_FULL
            val tempC = if (tempTenths > 0) tempTenths / 10.0 else null

            json.put("batteryPercent", batteryPct)
            json.put("isCharging", isCharging)
            json.put("batteryTempC", tempC)
        }

        // 3. Display Refresh Rate
        val windowManager = activity.windowManager
        val display = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            activity.display
        } else {
            @Suppress("DEPRECATION")
            windowManager.defaultDisplay
        }
        json.put("displayRefreshRateHz", display?.refreshRate?.toInt() ?: 60)

        // Honest: in-game FPS cannot be read externally without root or privileged instrumentation
        json.put("gameFps", JSONObject.NULL)

        return json.toString()
    }
}
