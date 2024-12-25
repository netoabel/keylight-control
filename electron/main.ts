import { app, BrowserWindow, ipcMain } from "electron";
import * as path from "path";
import { KeyLight } from "elgato-keylight";
import * as camera from "camera-watch";
import * as worker from "./worker";
const Store = require("electron-store");

const store = new Store({
  defaults: {
    autoModeEnabled: false,
    windowBounds: {
      x: undefined,
      y: undefined,
    },
    presets: {
      low: 10,
      high: 30,
    },
  },
});

const keylight =
  process.env.NODE_ENV === "development" ? new KeyLight("localhost", 9123) : new KeyLight();

let mainWindow: BrowserWindow | null = null;
let autoModeEnabled = store.get("autoModeEnabled");
let isConnected = false;

function createWindow(): void {
  const { x, y } = store.get("windowBounds");

  mainWindow = new BrowserWindow({
    width: 362,
    height: 310,
    x,
    y,
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

  const isDev = process.env.NODE_ENV === "development" || !app.isPackaged;
  if (isDev) {
    mainWindow.loadURL("http://localhost:5173");
  } else {
    const indexPath = path.join(__dirname, "../dist/index.html");
    mainWindow.loadFile(indexPath);
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  mainWindow.on("moved", () => {
    const bounds = mainWindow?.getBounds();
    store.set("windowBounds", {
      x: bounds?.x,
      y: bounds?.y,
    });
  });

  syncKeylightState();
}

app
  .whenReady()
  .then(createWindow)
  .then(() => {
    camera.watch({
      onChange: updateKeylightState,
      onError: (error) => console.error(error),
    });
  });

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});

ipcMain.on("keylight-control", async (_event, args) => {
  try {
    switch (args.action) {
      case "turnOn":
        console.log("turnOn");
        await keylight.setState({ on: 1 });
        await syncKeylightState();
        break;
      case "turnOff":
        console.log("turnOff");
        await keylight.setState({ on: 0 });
        await syncKeylightState();
        break;
      case "setBrightness":
        console.log("setBrightness", args.value);
        await keylight.setBrightness(args.value);
        await syncKeylightState();
        break;
      case "getState":
      case "retry":
        await syncKeylightState();
        break;
      case "setAutoMode":
        console.log("setAutoMode", args.enabled);
        autoModeEnabled = args.enabled;
        store.set("autoModeEnabled", args.enabled);
        await syncKeylightState();
        break;
      case "updatePreset": {
        const currentPresets = store.get("presets");
        const newPresets = {
          ...currentPresets,
          [args.preset]: args.value,
        };
        store.set("presets", newPresets);
        await syncKeylightState();
        break;
      }
      default:
        console.error("Unknown action:", args.action);
    }
  } catch (error) {
    console.error("Failed to control Keylight:", error);
    // Send disconnected state when any operation fails
    isConnected = false;
    mainWindow?.webContents.send("keylight-state", {
      connected: false,
      error: "Could not connect to keylight",
    });
  }
});

async function syncKeylightState() {
  try {
    const state = await keylight.getCurrentState();
    isConnected = true;
    mainWindow?.webContents.send("keylight-state", {
      connected: true,
      on: state.on === 1,
      brightness: state.brightness,
      autoMode: autoModeEnabled,
      presets: store.get("presets"),
    });
  } catch (error) {
    console.error("Failed to get Keylight state:", error);
    isConnected = false;
    mainWindow?.webContents.send("keylight-state", {
      connected: false,
      error: "Could not connect to keylight",
    });
  }
}

function updateKeylightState(newState: string): void {
  if (!autoModeEnabled) return;

  worker.run({
    action: async () => {
      try {
        await keylight.setState({ on: toBinary(newState) });
        await syncKeylightState();
      } catch (error) {
        console.error("Failed to update keylight state:", error);
        isConnected = false;
        mainWindow?.webContents.send("keylight-state", {
          connected: false,
          error: "Could not connect to keylight",
        });
      }
    },
  });
}

function toBinary(state: string): number {
  return state === "On" ? 1 : 0;
}
