"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
function createWindow() {
    const win = new electron_1.BrowserWindow({
        width: 400,
        height: 600,
        webPreferences: {
            preload: path_1.default.join(__dirname, "preload.js"),
            contextIsolation: true,
            nodeIntegration: false,
        },
    });
    if (electron_1.app.isPackaged) {
        win.loadURL("file://${__dirname}/../build/index.html");
    }
    else {
        win.loadURL("http://localhost:3000");
    }
}
electron_1.app.whenReady().then(createWindow);
electron_1.app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        electron_1.app.quit();
    }
});
electron_1.app.on("activate", () => {
    if (electron_1.BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
electron_1.ipcMain.on("keylight-control", (event, args) => {
    console.log("Keylight Control:", args);
    // Here you would implement the actual control of the keylight
    // For now, we'll just log the actions
    switch (args.action) {
        case "turnOn":
            console.log("Turning keylight on");
            break;
        case "turnOff":
            console.log("Turning keylight off");
            break;
        case "setBrightness":
            console.log(`Setting brightness to ${args.value}%`);
            break;
    }
});
