package com.prakashrox.gameboostx

import android.app.Activity
import android.content.Intent
import android.net.Uri
import android.widget.Toast

/**
 * UpiPaymentManager
 * Strict, secure UPI Intent integration for GameBoost X Ad-Free subscriptions.
 *
 * CRITICAL SECURITY DISCLOSURE:
 * GameBoost X NEVER asks for, handles, intercepts, or logs UPI PIN or sensitive banking data.
 * All authentication occurs strictly within the official, bank-certified external UPI app.
 */
class UpiPaymentManager(private val activity: Activity) {

    companion object {
        const val MERCHANT_UPI_ID = "prakash26pr@axl"
        const val MERCHANT_NAME = "Prakash Rox Official"
        const val UPI_PAYMENT_REQUEST_CODE = 8842
    }

    fun initiateUpiPayment(
        planId: String,
        amountInr: Double,
        transactionRef: String
    ): Boolean {
        val uriString = buildUpiUri(planId, amountInr, transactionRef)
        val uri = Uri.parse(uriString)

        val intent = Intent(Intent.ACTION_VIEW).apply {
            data = uri
        }

        val chooser = Intent.createChooser(intent, "Pay via UPI App")
        return try {
            if (intent.resolveActivity(activity.packageManager) != null) {
                activity.startActivityForResult(chooser, UPI_PAYMENT_REQUEST_CODE)
                true
            } else {
                Toast.makeText(
                    activity,
                    "No supported UPI payment app found. Please scan the QR code.",
                    Toast.LENGTH_LONG
                ).show()
                false
            }
        } catch (e: Exception) {
            e.printStackTrace()
            false
        }
    }

    fun buildUpiUri(planId: String, amount: Double, txRef: String): String {
        return Uri.Builder()
            .scheme("upi")
            .authority("pay")
            .appendQueryParameter("pa", MERCHANT_UPI_ID)
            .appendQueryParameter("pn", MERCHANT_NAME)
            .appendQueryParameter("tr", txRef)
            .appendQueryParameter("am", String.format("%.2f", amount))
            .appendQueryParameter("cu", "INR")
            .appendQueryParameter("tn", "GameBoostX AdFree $planId")
            .build()
            .toString()
    }
}
