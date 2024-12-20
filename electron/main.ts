import { app, BrowserWindow, ipcMain } from "electron";
import * as path from "path";
import { KeyLight } from "elgato-keylight";
import * as camera from "camera-watch";
import * as worker from "./worker";

const keylight = new KeyLight();

let mainWindow: BrowserWindow | null = null;
let autoModeEnabled = false;

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 362,
    height: 310,
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
        break;
      case "turnOff":
        console.log("turnOff");
        await keylight.setState({ on: 0 });
        break;
      case "setBrightness":
        console.log("setBrightness", args.value);
        await keylight.setBrightness(args.value);
        break;
      case "setAutoMode":
        console.log("setAutoMode", args.enabled);
        autoModeEnabled = args.enabled;
        break;
      default:
        console.error("Unknown action:", args.action);
    }
  } catch (error) {
    console.error("Failed to control Keylight:", error);
  }
});

function updateKeylightState(newState: string): void {
  if (!autoModeEnabled) return;

  worker.run({
    action: async () => {
      await keylight.setState({ on: toBinary(newState) });
    },
  });
}

function toBinary(state: string): number {
  return state === "On" ? 1 : 0;
}
