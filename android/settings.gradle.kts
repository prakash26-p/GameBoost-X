pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}

dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
        // IronSource / Unity LevelPlay Maven repository
        maven {
            url = uri("https://android-sdk.is.com/")
        }
    }
}

rootProject.name = "GameBoostX"
include(":app")
