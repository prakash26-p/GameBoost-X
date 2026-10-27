package com.prakashrox.gameboostx

import android.annotation.SuppressLint
import android.content.Intent
import android.os.Bundle
import android.webkit.WebChromeClient
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.OnBackPressedCallback
import androidx.appcompat.app.AppCompatActivity

/**
 * MainActivity
 * Package: com.prakashrox.gameboostx
 * Developer: Prakash Rox Official
 */
class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private lateinit var discoveryManager: AppDiscoveryManager
    private lateinit var adController: LevelPlayAdController
    private lateinit var upiManager: UpiPaymentManager
    private lateinit var billingManager: BillingManager
    private lateinit var bridge: GameBoostBridge

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Configure WebView first
        webView = WebView(this)
        setContentView(webView)

        with(webView.settings) {
            javaScriptEnabled = true
            domStorageEnabled = true
            databaseEnabled = true
            cacheMode = WebSettings.LOAD_DEFAULT
            allowFileAccess = false
            allowContentAccess = false
            loadsImagesAutomatically = true
        }

        // Initialize managers
        discoveryManager = AppDiscoveryManager(this)
        adController = LevelPlayAdController(this)
        upiManager = UpiPaymentManager(this)
        billingManager = BillingManager(this, this, webView) { isAdFree ->
            adController.setAdFreeStatus(isAdFree)
        }
        bridge = GameBoostBridge(this, discoveryManager, adController, upiManager, billingManager)

        // Start Google Play Billing connection
        billingManager.startConnection()

        // Initialize Unity LevelPlay SDK with App Key
        adController.initialize(appKey = "1b8e495cd", testMode = true)

        // Attach secure JavascriptInterface bridge for both namespace aliases
        webView.addJavascriptInterface(bridge, "GameBoostNative")
        webView.addJavascriptInterface(bridge, "AndroidBridge")

        webView.webViewClient = WebViewClient()
        webView.webChromeClient = WebChromeClient()

        // Load production local assets or dev server
        webView.loadUrl("file:///android_asset/dist/index.html")

        // Handle back button smoothly
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (webView.canGoBack()) {
                    webView.goBack()
                } else {
                    isEnabled = false
                    onBackPressedDispatcher.onBackPressed()
                }
            }
        })
    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        if (requestCode == UpiPaymentManager.UPI_PAYMENT_REQUEST_CODE) {
            val response = data?.getStringExtra("response") ?: "No UPI response data"
            // Notify webview that payment intent returned, prompting transaction verification
            webView.evaluateJavascript(
                "window.onUpiIntentReturned && window.onUpiIntentReturned('$response');",
                null
            )
        }
    }

    override fun onResume() {
        super.onResume()
        adController.loadBanner()
    }

    override fun onDestroy() {
        billingManager.destroy()
        adController.destroyBanner()
        super.onDestroy()
    }
}
