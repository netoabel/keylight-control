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
  },
});

const keylight =
  process.env.NODE_ENV === "development" ? new KeyLight() : new KeyLight("localhost", 9123);

let mainWindow: BrowserWindow | null = null;
let autoModeEnabled = store.get("autoModeEnabled");

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
    const indexPath = path.join(__dirname, "..", "dist", "index.html");
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
        await syncKeylightState();
        break;
      case "setAutoMode":
        console.log("setAutoMode", args.enabled);
        autoModeEnabled = args.enabled;
        store.set("autoModeEnabled", args.enabled);
        break;
      default:
        console.error("Unknown action:", args.action);
    }
  } catch (error) {
    console.error("Failed to control Keylight:", error);
  }
});

async function syncKeylightState() {
  try {
    const state = await keylight.getCurrentState();
    mainWindow?.webContents.send("keylight-state", {
      on: state.on === 1,
      brightness: state.brightness,
      autoMode: autoModeEnabled,
    });
  } catch (error) {
    console.error("Failed to get Keylight state:", error);
  }
}

function updateKeylightState(newState: string): void {
  if (!autoModeEnabled) return;

  worker.run({
    action: async () => {
      await keylight.setState({ on: toBinary(newState) });
      await syncKeylightState();
    },
  });
}

function toBinary(state: string): number {
  return state === "On" ? 1 : 0;
}
