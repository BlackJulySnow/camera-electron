const crypto = require('crypto');

/**
 * md4 algorithm is not available anymore in NodeJS 17+ (because of lib SSL 3).
 * In that case, silently replace md4 by md5 algorithm.
 */
try {
    crypto.createHash('md4');
} catch (e) {
    console.warn('Crypto "md4" is not supported anymore by this Node version');
    const origCreateHash = crypto.createHash;
    crypto.createHash = (alg, opts) => {
        return origCreateHash(alg === 'md4' ? 'md5' : alg, opts);
    };
}
const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
    transpileDependencies: true,
    lintOnSave: false,
    filenameHashing: false,
    configureWebpack: {},

})
module.exports = {
    pluginOptions: {
        electronBuilder: {
            builderOptions: {
                appId: "com.huochacha.video",
                copyright: "huochacha",
                productName: "货查查视频追溯系统",
                nsis: {
                    oneClick: false,
                    allowToChangeInstallationDirectory: true,
                    createDesktopShortcut: true,
                    createStartMenuShortcut: true
                },
                mac: {
                    "target": [
                        "dmg",
                        "zip"
                    ],
                    "category": "public.app-category.utilities"
                },
                win: {
                    "icon": "/src/assets/logo.png",
                    "target": [{
                        "target": "nsis"
                    }]
                },
                "extraResources": [
                    "./dist/**"
                ]
            }
        }
    },
}