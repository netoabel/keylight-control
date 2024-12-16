"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path = __importStar(require("path"));
let mainWindow = null;
function createWindow() {
    mainWindow = new electron_1.BrowserWindow({
        width: 362,
        height: 273,
        titleBarStyle: "customButtonsOnHover",
        frame: false,
        resizable: false,
        minimizable: true,
        maximizable: false,
        backgroundColor: "#1C1C1C",
        trafficLightPosition: { x: 10, y: 10 },
        icon: path.join(__dirname, "../assets/icon.png"),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, "preload.js"),
        },
    });
    const isDev = process.env.NODE_ENV === "development" || !electron_1.app.isPackaged;
    if (isDev) {
        mainWindow.loadURL("http://localhost:5173");
    }
    else {
        const indexPath = path.join(__dirname, "..", "dist", "index.html");
        mainWindow.loadFile(indexPath);
    }
    mainWindow.on("closed", () => {
        mainWindow = null;
    });
}
electron_1.app.whenReady().then(createWindow);
electron_1.app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        electron_1.app.quit();
    }
});
electron_1.app.on("activate", () => {
    if (mainWindow === null) {
        createWindow();
    }
});
electron_1.ipcMain.on("keylight-control", (_event, args) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        switch (args.action) {
            //Call the keylight methods
            case "turnOn":
                // await setState({ on: 1 });
                break;
            case "turnOff":
                // await setState({ on: 0 });
                break;
            case "setBrightness":
                // await setBrightness(args.value);
                break;
            default:
                console.error("Unknown action:", args.action);
        }
    }
    catch (error) {
        console.error("Failed to control Keylight:", error);
    }
}));
