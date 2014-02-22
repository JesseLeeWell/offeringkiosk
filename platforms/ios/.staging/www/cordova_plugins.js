cordova.define('cordova/plugin_list', function(require, exports, module) {
module.exports = [
    {
        "file": "plugins/com.continuetogive.unimag/www/unimag.js",
        "id": "com.continuetogive.unimag.UniMag",
        "clobbers": [
            "UniMag"
        ]
    },
    {
        "file": "plugins/org.apache.cordova.console/www/console-via-logger.js",
        "id": "org.apache.cordova.console.console",
        "clobbers": [
            "console"
        ]
    },
    {
        "file": "plugins/org.apache.cordova.console/www/logger.js",
        "id": "org.apache.cordova.console.logger",
        "clobbers": [
            "cordova.logger"
        ]
    },
    {
        "file": "plugins/org.apache.cordova.device/www/device.js",
        "id": "org.apache.cordova.device.device",
        "clobbers": [
            "device"
        ]
    },
    {
        "file": "plugins/org.apache.cordova.inappbrowser/www/InAppBrowser.js",
        "id": "org.apache.cordova.inappbrowser.InAppBrowser",
        "clobbers": [
            "window.open"
        ]
    },
    {
        "file": "plugins/org.apache.cordova.splashscreen/www/splashscreen.js",
        "id": "org.apache.cordova.splashscreen.SplashScreen",
        "clobbers": [
            "navigator.splashscreen"
        ]
    }
];
module.exports.metadata = 
// TOP OF METADATA
{
    "com.continuetogive.unimag": "0.2.8",
    "org.apache.cordova.console": "0.2.7",
    "org.apache.cordova.device": "0.2.8",
    "org.apache.cordova.inappbrowser": "0.3.1",
    "org.apache.cordova.splashscreen": "0.2.7"
}
// BOTTOM OF METADATA
});