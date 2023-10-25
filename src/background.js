'use strict'

import { app, protocol, BrowserWindow, screen, dialog, ipcMain, ipcRenderer } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS3_DEVTOOLS } from 'electron-devtools-installer'
import { autoUpdater } from "electron-updater";
import { event } from 'jquery';

// import { postRequest } from './utils/http'
// import path from "path";
const isDevelopment = process.env.NODE_ENV !== 'production'

const { exec } = require('child_process')
    // Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
    { scheme: 'app', privileges: { secure: true, standard: true } }
])

async function createWindow() {
    // Create the browser window.
    let width = screen.getPrimaryDisplay().workAreaSize.width;
    let height = screen.getPrimaryDisplay().workAreaSize.height;
    // Menu.setApplicationMenu(null); // 去除菜单栏
    const win = new BrowserWindow({
        width: width - 100,
        height: height - 100,
        webPreferences: {
            // Use pluginOptions.nodeIntegration, leave this alone
            // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
            nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
            contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION,
            enableremotemodule: true,
        },
    })
    win.setMenu(null);
    if (process.env.WEBPACK_DEV_SERVER_URL) {
        // Load the url of the dev server if in development mode
        await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
        if (!process.env.IS_TEST) win.webContents.openDevTools()
    } else {
        createProtocol('app')
            // Load the index.html when not in development
        win.loadURL('app://./index.html')
    }
    win.webContents.on('did-finish-load', () => {
        exec("start " + process.cwd() + "/resources/dist/app/app.exe")
    })

    function handleUpdate() {
        const returnData = {
            error: { status: -1, msg: "检测更新异常" },
            checking: { status: 0, msg: "正在检查应用程序更新" },
            updateAva: { status: 1, msg: "检测到新版本，正在下载请稍后" },
            updateNotAva: { status: 2, msg: "您现在使用的版本为最新版本,无需更新!" }
        };
        autoUpdater.autoDownload = false;
        //vue.config.json配置的一样
        autoUpdater.setFeedURL(
            "https://app-1305188540.cos.ap-guangzhou.myqcloud.com/"
        ); //地址我就不写了，上面有说

        //更新错误
        autoUpdater.on("error", function(error) {
            sendUpdateMessage(returnData.error);
        });

        //检查中
        autoUpdater.on("checking-for-update", function() {
            sendUpdateMessage(returnData.checking);
        });

        //发现新版本
        //当发现一个可用更新的时候，更新包下载会自动开始
        autoUpdater.on("update-available", function(info) {
            let msg = {
                version: info.version,
                releaseNotes: info.releaseNotes,
                releaseDate: info.releaseDate
            }
            sendUpdateMessage({ status: 1, msg: msg });
        });
        autoUpdater.on('update-downloaded', (event, releaseNotes, releaseName) => {
            sendUpdateMessage({ status: 5, msg: "下载完成" });
            setTimeout(function() {
                autoUpdater.quitAndInstall();
            }, 2000);
        });
        autoUpdater.on('download-progress', (progressObj) => {
            let msg = {
                percent: progressObj.percent,
                speed: progressObj.bytesPerSecond,
            }
            sendUpdateProgress(msg);
        })

        //当前版本为最新版本
        autoUpdater.on("update-not-available", function(info) {
            setTimeout(function() {
                sendUpdateMessage(returnData.updateNotAva);
            }, 1000);
        });
    }
    // 通过main进程发送事件给renderer进程，提示更新信息
    function sendUpdateMessage(text) {
        if (win) {
            win.webContents.send("message", text);
        }
    }

    function sendUpdateProgress(text) {
        if (win) {
            win.webContents.send("progress", text);
        }
    }
    // 检查更新
    ipcMain.on("checkForUpdate", (event, data) => {
        autoUpdater.checkForUpdates();
    });
    ipcMain.on("updateStart", (event, data) => {
        autoUpdater.downloadUpdate();
    })
    ipcMain.on("removeListen", (event, data) => {
        ipcMain.removeAllListeners("checkForUpdate");
    })
    handleUpdate()
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
        exec('taskkill /f /im app.exe')
    }
})

app.allowRendererProcessReuse = true

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async() => {
        if (isDevelopment && !process.env.IS_TEST) {
            // Install Vue Devtools
            try {
                await installExtension(VUEJS3_DEVTOOLS)
            } catch (e) {
                console.error('Vue Devtools failed to install:', e.toString())
            }
        }
        createWindow();
        ipcMain.handle("dialog:openFile", handleFileOpen)

    })
    // 新增：处理打开文件对话框的函数
async function handleFileOpen() {
    const options = {
        title: 'Select a Folder',
        properties: ['openDirectory']
    };
    const { canceled, filePaths } = await dialog.showOpenDialog(options)
    if (canceled) {
        return "canceled"
    } else {
        return filePaths[0]
    }
}


// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
    if (process.platform === 'win32') {
        process.on('message', (data) => {
            if (data === 'graceful-exit') {
                app.quit()
                exec('taskkill /f /im app.exe')
            }
        })
    } else {
        process.on('SIGTERM', () => {
            app.quit()
            exec('taskkill /f /im app.exe')
        })
    }
}

//处理更新操作