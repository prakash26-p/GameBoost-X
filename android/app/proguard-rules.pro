# ProGuard / R8 Rules for GameBoost X
# Package: com.prakashrox.gameboostx

# Preserve JavaScript Interface methods
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Unity LevelPlay Mediation Rules
-keepclassmembers class com.ironsource.sdk.** { *; }
-keep class com.ironsource.** { *; }
-dontwarn com.ironsource.**
-keepattributes JavascriptInterface
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}
-keepattributes *Annotation*
