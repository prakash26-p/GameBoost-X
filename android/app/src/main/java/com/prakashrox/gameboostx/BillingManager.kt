package com.prakashrox.gameboostx

import android.app.Activity
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.util.Log
import android.webkit.WebView
import com.android.billingclient.api.*
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.json.JSONArray
import org.json.JSONObject

/**
 * BillingManager
 * Official Google Play Billing Integration for GameBoost X Ad-Free Subscriptions.
 * Package: com.prakashrox.gameboostx
 *
 * Implements Google Play Billing Library 7.x:
 * - Real Subscription Product IDs configured in Google Play Console.
 * - Secure acknowledgement and server-side verification readiness.
 * - Suppresses advertisements when an active verified entitlement exists.
 * - Handles pending, purchased, cancelled, and restored states.
 */
class BillingManager(
    private val context: Context,
    private val activity: Activity,
    private val webView: WebView?,
    private val onAdFreeEntitlementChanged: (Boolean) -> Unit
) : PurchasesUpdatedListener {

    companion object {
        private const val TAG = "GameBoostX_Billing"

        // Real Google Play Console Subscription Product IDs
        const val PRODUCT_ID_DAILY = "gameboostx_adfree_daily"
        const val PRODUCT_ID_WEEKLY = "gameboostx_adfree_weekly"
        const val PRODUCT_ID_MONTHLY = "gameboostx_adfree_monthly"
        const val PRODUCT_ID_ANNUAL = "gameboostx_adfree_annual"
        const val PRODUCT_ID_QUARTERLY = "gameboostx_adfree_quarterly"

        val ALL_SUBSCRIPTION_IDS = listOf(
            PRODUCT_ID_DAILY,
            PRODUCT_ID_WEEKLY,
            PRODUCT_ID_MONTHLY,
            PRODUCT_ID_ANNUAL,
            PRODUCT_ID_QUARTERLY
        )
    }

    private var billingClient: BillingClient = BillingClient.newBuilder(context)
        .setListener(this)
        .enablePendingPurchases(
            PendingPurchasesParams.newBuilder()
                .enableOneTimeProducts()
                .build()
        )
        .build()

    private val productDetailsMap = mutableMapOf<String, ProductDetails>()
    private var isConnected = false

    fun startConnection(onConnected: (() -> Unit)? = null) {
        billingClient.startConnection(object : BillingClientStateListener {
            override fun onBillingSetupFinished(billingResult: BillingResult) {
                if (billingResult.responseCode == BillingClient.BillingResponseCode.OK) {
                    isConnected = true
                    Log.i(TAG, "Google Play Billing Client connected successfully.")
                    queryAvailableSubscriptions()
                    queryActivePurchases()
                    onConnected?.invoke()
                } else {
                    Log.w(TAG, "Billing setup finished with code: ${billingResult.responseCode} - ${billingResult.debugMessage}")
                    isConnected = false
                }
            }

            override fun onBillingServiceDisconnected() {
                isConnected = false
                Log.w(TAG, "Billing service disconnected. Will retry on next request.")
            }
        })
    }

    /**
     * Query subscription and in-app product details configured in Google Play Console
     */
    fun queryAvailableSubscriptions() {
        if (!isConnected) return

        // 1. Query as Subscriptions (P1W, P1M, P3M, P1Y, prepaid)
        val subsList = ALL_SUBSCRIPTION_IDS.map { productId ->
            QueryProductDetailsParams.Product.newBuilder()
                .setProductId(productId)
                .setProductType(BillingClient.ProductType.SUBS)
                .build()
        }

        val subsParams = QueryProductDetailsParams.newBuilder()
            .setProductList(subsList)
            .build()

        billingClient.queryProductDetailsAsync(subsParams) { billingResult, productDetailsList ->
            if (billingResult.responseCode == BillingClient.BillingResponseCode.OK) {
                for (details in productDetailsList) {
                    productDetailsMap[details.productId] = details
                }
                Log.i(TAG, "Loaded ${productDetailsList.size} subscription products from Google Play Console.")
                notifyFrontendCatalogUpdated()
            } else {
                Log.w(TAG, "Subscription query returned code: ${billingResult.responseCode} - ${billingResult.debugMessage}")
            }
        }

        // 2. Also query daily pass as INAPP (one-time purchase / 24-hr pass) if configured as in-app in Play Console
        val inAppList = listOf(
            QueryProductDetailsParams.Product.newBuilder()
                .setProductId(PRODUCT_ID_DAILY)
                .setProductType(BillingClient.ProductType.INAPP)
                .build()
        )
        val inAppParams = QueryProductDetailsParams.newBuilder()
            .setProductList(inAppList)
            .build()

        billingClient.queryProductDetailsAsync(inAppParams) { billingResult, productDetailsList ->
            if (billingResult.responseCode == BillingClient.BillingResponseCode.OK) {
                for (details in productDetailsList) {
                    productDetailsMap[details.productId] = details
                }
                Log.i(TAG, "Loaded ${productDetailsList.size} in-app products from Google Play Console.")
                notifyFrontendCatalogUpdated()
            }
        }
    }

    /**
     * Return verified product details and real localized prices to frontend
     */
    fun getProductDetailsJson(): String {
        val array = JSONArray()
        for ((productId, details) in productDetailsMap) {
            val obj = JSONObject()
            obj.put("productId", productId)
            obj.put("title", details.title)
            obj.put("productType", details.productType)

            var formattedPrice = ""
            if (details.productType == BillingClient.ProductType.SUBS) {
                val offers = details.subscriptionOfferDetails
                if (!offers.isNullOrEmpty()) {
                    val phases = offers[0].pricingPhases.pricingPhaseList
                    if (phases.isNotEmpty()) {
                        formattedPrice = phases[0].formattedPrice
                    }
                }
            } else if (details.productType == BillingClient.ProductType.INAPP) {
                formattedPrice = details.oneTimePurchaseOfferDetails?.formattedPrice ?: ""
            }

            obj.put("formattedPrice", formattedPrice)
            obj.put("isConfiguredInPlayConsole", true)
            array.put(obj)
        }
        return array.toString()
    }

    private fun notifyFrontendCatalogUpdated() {
        val json = getProductDetailsJson()
        webView?.post {
            webView.evaluateJavascript(
                "window.onPlayCatalogUpdated && window.onPlayCatalogUpdated($json);",
                null
            )
        }
    }

    /**
     * Launch official Google Play purchase flow for selected subscription or pass
     */
    fun launchPurchaseFlow(productId: String): Boolean {
        val productDetails = productDetailsMap[productId]
        if (productDetails == null) {
            Log.w(TAG, "ProductDetails not found for $productId in Google Play Console. Re-querying...")
            queryAvailableSubscriptions()
            return false
        }

        val productDetailsParamsBuilder = BillingFlowParams.ProductDetailsParams.newBuilder()
            .setProductDetails(productDetails)

        if (productDetails.productType == BillingClient.ProductType.SUBS) {
            val subscriptionOfferDetails = productDetails.subscriptionOfferDetails
            if (subscriptionOfferDetails.isNullOrEmpty()) {
                Log.w(TAG, "No subscription offer details available for $productId.")
                return false
            }
            val offerToken = subscriptionOfferDetails[0].offerToken
            productDetailsParamsBuilder.setOfferToken(offerToken)
        }

        val billingFlowParams = BillingFlowParams.newBuilder()
            .setProductDetailsParamsList(listOf(productDetailsParamsBuilder.build()))
            .build()

        val result = billingClient.launchBillingFlow(activity, billingFlowParams)
        return result.responseCode == BillingClient.BillingResponseCode.OK
    }

    override fun onPurchasesUpdated(billingResult: BillingResult, purchases: List<Purchase>?) {
        when (billingResult.responseCode) {
            BillingClient.BillingResponseCode.OK -> {
                if (purchases != null) {
                    for (purchase in purchases) {
                        handlePurchase(purchase)
                    }
                }
            }
            BillingClient.BillingResponseCode.USER_CANCELED -> {
                Log.i(TAG, "User cancelled the Google Play purchase flow.")
                notifyFrontend("CANCELLED", "User cancelled Google Play subscription checkout.")
            }
            BillingClient.BillingResponseCode.ITEM_ALREADY_OWNED -> {
                Log.i(TAG, "Subscription already owned. Restoring entitlement...")
                queryActivePurchases()
            }
            else -> {
                Log.e(TAG, "Purchase failed: ${billingResult.responseCode} - ${billingResult.debugMessage}")
                notifyFrontend("ERROR", "Google Play purchase failed: ${billingResult.debugMessage}")
            }
        }
    }

    /**
     * Handle received purchase: check state, acknowledge if necessary, enable entitlement
     */
    private fun handlePurchase(purchase: Purchase) {
        if (purchase.purchaseState == Purchase.PurchaseState.PURCHASED) {
            // Verify and acknowledge within 3 days (done immediately here)
            if (!purchase.isAcknowledged) {
                val acknowledgePurchaseParams = AcknowledgePurchaseParams.newBuilder()
                    .setPurchaseToken(purchase.purchaseToken)
                    .build()

                CoroutineScope(Dispatchers.IO).launch {
                    val ackResult = billingClient.acknowledgePurchase(acknowledgePurchaseParams)
                    withContext(Dispatchers.Main) {
                        if (ackResult.responseCode == BillingClient.BillingResponseCode.OK) {
                            Log.i(TAG, "Purchase successfully acknowledged: ${purchase.orderId}")
                            onAdFreeEntitlementChanged(true)
                            notifyFrontendPurchaseSuccess(purchase)
                        } else {
                            Log.e(TAG, "Failed to acknowledge purchase: ${ackResult.debugMessage}")
                        }
                    }
                }
            } else {
                onAdFreeEntitlementChanged(true)
                notifyFrontendPurchaseSuccess(purchase)
            }
        } else if (purchase.purchaseState == Purchase.PurchaseState.PENDING) {
            Log.i(TAG, "Purchase is pending (e.g. offline cash payment, parental approval).")
            notifyFrontend("PENDING", "Google Play purchase is pending completion.")
        }
    }

    /**
     * Query currently active subscription purchases on device
     */
    fun queryActivePurchases(): String {
        if (!isConnected) {
            return JSONObject().apply {
                put("hasActiveEntitlement", false)
                put("error", "Billing service disconnected")
                put("purchases", JSONArray())
            }.toString()
        }

        val params = QueryPurchasesParams.newBuilder()
            .setProductType(BillingClient.ProductType.SUBS)
            .build()

        var hasActive = false
        val purchasesArray = JSONArray()

        billingClient.queryPurchasesAsync(params) { billingResult, purchasesList ->
            if (billingResult.responseCode == BillingClient.BillingResponseCode.OK) {
                for (p in purchasesList) {
                    if (p.purchaseState == Purchase.PurchaseState.PURCHASED) {
                        hasActive = true
                        val obj = JSONObject().apply {
                            put("orderId", p.orderId)
                            put("purchaseToken", p.purchaseToken)
                            put("purchaseTime", p.purchaseTime)
                            put("isAcknowledged", p.isAcknowledged)
                            put("products", JSONArray(p.products))
                        }
                        purchasesArray.put(obj)
                    }
                }
                onAdFreeEntitlementChanged(hasActive)
            }
        }

        val resultJson = JSONObject().apply {
            put("hasActiveEntitlement", hasActive)
            put("purchases", purchasesArray)
        }
        return resultJson.toString()
    }

    /**
     * Restore previous valid purchases (e.g. new phone or app reinstalled)
     */
    fun restorePurchases(): Boolean {
        if (!isConnected) {
            startConnection {
                queryActivePurchases()
            }
            return false
        }
        queryActivePurchases()
        return true
    }

    /**
     * Open official Google Play Store Subscriptions management center
     */
    fun manageSubscriptions(productId: String? = null) {
        val uri = if (productId != null) {
            Uri.parse("https://play.google.com/store/account/subscriptions?package=${context.packageName}&sku=$productId")
        } else {
            Uri.parse("https://play.google.com/store/account/subscriptions?package=${context.packageName}")
        }
        val intent = Intent(Intent.ACTION_VIEW, uri).apply {
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        context.startActivity(intent)
    }

    private fun notifyFrontendPurchaseSuccess(purchase: Purchase) {
        val json = JSONObject().apply {
            put("status", "SUCCESS")
            put("orderId", purchase.orderId ?: "")
            put("purchaseToken", purchase.purchaseToken)
            put("purchaseTime", purchase.purchaseTime)
            put("products", JSONArray(purchase.products))
        }
        webView?.post {
            webView.evaluateJavascript(
                "window.onPlayBillingPurchased && window.onPlayBillingPurchased(${json.toString()});",
                null
            )
        }
    }

    private fun notifyFrontend(status: String, message: String) {
        webView?.post {
            webView.evaluateJavascript(
                "window.onPlayBillingStatus && window.onPlayBillingStatus('$status', '$message');",
                null
            )
        }
    }

    fun destroy() {
        if (billingClient.isReady) {
            billingClient.endConnection()
        }
    }
}
