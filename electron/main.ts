import { app, ipcMain } from "electron";
import * as cameraWatcher from "./camera-watcher";
import { WindowManager } from "./window-manager";
import { KeylightManager } from "./keylight-manager";

const windowManager = new WindowManager();
const keylightManager = new KeylightManager();

app.on("ready", () => {
  const mainWindow = windowManager.createWindow();
  keylightManager.setMainWindow(mainWindow);
  cameraWatcher.start(keylightManager);
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

ipcMain.on("keylight-control", async (_event, args) => {
  try {
    switch (args.action) {
      case "updateConfig":
        await keylightManager.updateConfig(args.config);
        windowManager.hideConfigWindow();
        break;
      case "setAutoMode":
        await keylightManager.setAutoMode(args.enabled);
        break;
      case "turnOn":
        await keylightManager.turnOn();
        break;
      case "turnOff":
        await keylightManager.turnOff();
        break;
      case "setBrightness":
        await keylightManager.setBrightness(args.value);
        break;
      case "setTemperature":
        await keylightManager.setTemperature(args.value);
        break;
      case "updatePreset":
        await keylightManager.updatePreset(args.preset, args.value);
        break;
      case "showConfig":
        const config = await keylightManager.getConfig();
        windowManager.showConfigWindow({
          host: config.host || "",
          port: config.port?.toString() || "",
        });
        break;
      case "hideConfig":
        windowManager.hideConfigWindow();
        break;
    }
    await keylightManager.syncState();
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Failed to execute action:", message);
    await keylightManager.syncState();
  }
});
