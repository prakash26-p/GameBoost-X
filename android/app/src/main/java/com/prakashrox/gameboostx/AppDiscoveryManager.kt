package com.prakashrox.gameboostx

import android.content.Context
import android.content.Intent
import android.content.pm.ApplicationInfo
import android.content.pm.PackageManager
import android.os.Build
import org.json.JSONArray
import org.json.JSONObject

/**
 * AppDiscoveryManager
 * Real installed package discovery using Android PackageManager.
 * Strict No-Fake-Data Policy: Only queries and returns packages that physically exist on device.
 */
class AppDiscoveryManager(private val context: Context) {

    data class DiscoveredApp(
        val id: String,
        val name: String,
        val packageName: String,
        val isGame: Boolean,
        val category: String,
        val isLaunchSupported: Boolean,
        val iconBase64: String? = null
    )

    fun getInstalledLaunchableItems(): List<DiscoveredApp> {
        val pm = context.packageManager
        val intent = Intent(Intent.ACTION_MAIN, null).apply {
            addCategory(Intent.CATEGORY_LAUNCHER)
        }

        val resolveInfos = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            pm.queryIntentActivities(intent, PackageManager.ResolveInfoFlags.of(0))
        } else {
            @Suppress("DEPRECATION")
            pm.queryIntentActivities(intent, 0)
        }

        val discovered = mutableListOf<DiscoveredApp>()

        for (info in resolveInfos) {
            val pkg = info.activityInfo.packageName
            // Skip self package
            if (pkg == context.packageName) continue

            val appName = info.loadLabel(pm).toString()
            val isGame = isPackageGame(info.activityInfo.applicationInfo)
            val iconDataUri = try {
                val drawable = info.loadIcon(pm)
                drawableToBase64(drawable)
            } catch (e: Exception) {
                null
            }

            discovered.add(
                DiscoveredApp(
                    id = "native-$pkg",
                    name = appName,
                    packageName = pkg,
                    isGame = isGame,
                    category = if (isGame) "Mobile Game" else "Application",
                    isLaunchSupported = true,
                    iconBase64 = iconDataUri
                )
            )
        }

        return discovered
    }

    private fun drawableToBase64(drawable: android.graphics.drawable.Drawable): String? {
        return try {
            val width = if (drawable.intrinsicWidth > 0) drawable.intrinsicWidth.coerceAtMost(96) else 72
            val height = if (drawable.intrinsicHeight > 0) drawable.intrinsicHeight.coerceAtMost(96) else 72
            val bmp = android.graphics.Bitmap.createBitmap(width, height, android.graphics.Bitmap.Config.ARGB_8888)
            val canvas = android.graphics.Canvas(bmp)
            drawable.setBounds(0, 0, canvas.width, canvas.height)
            drawable.draw(canvas)

            val stream = java.io.ByteArrayOutputStream()
            bmp.compress(android.graphics.Bitmap.CompressFormat.PNG, 85, stream)
            val bytes = stream.toByteArray()
            "data:image/png;base64," + android.util.Base64.encodeToString(bytes, android.util.Base64.NO_WRAP)
        } catch (e: Exception) {
            null
        }
    }

    private fun isPackageGame(appInfo: ApplicationInfo): Boolean {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            appInfo.category == ApplicationInfo.CATEGORY_GAME
        } else {
            @Suppress("DEPRECATION")
            (appInfo.flags and ApplicationInfo.FLAG_IS_GAME) != 0
        }
    }

    fun launchPackage(packageName: String): Boolean {
        return try {
            val pm = context.packageManager
            val intent = pm.getLaunchIntentForPackage(packageName)
            if (intent != null) {
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                context.startActivity(intent)
                true
            } else {
                false
            }
        } catch (e: Exception) {
            e.printStackTrace()
            false
        }
    }

    fun toJson(items: List<DiscoveredApp>): String {
        val jsonArray = JSONArray()
        for (item in items) {
            val obj = JSONObject().apply {
                put("id", item.id)
                put("name", item.name)
                put("packageName", item.packageName)
                put("isGame", item.isGame)
                put("category", item.category)
                put("isLaunchSupported", item.isLaunchSupported)
                if (item.iconBase64 != null) {
                    put("iconBase64", item.iconBase64)
                }
            }
            jsonArray.put(obj)
        }
        return jsonArray.toString()
    }
}
