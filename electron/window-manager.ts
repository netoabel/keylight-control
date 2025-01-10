import { app, BrowserWindow } from "electron";
import * as path from "path";
import windowStateKeeper from "electron-window-state";

export class WindowManager {
  private mainWindow: BrowserWindow | null = null;

  constructor() {}

  createWindow() {
    const mainWindowState = windowStateKeeper({
      defaultWidth: 360,
      defaultHeight: 420,
    });

    this.mainWindow = new BrowserWindow({
      x: mainWindowState.x,
      y: mainWindowState.y,
      width: 360,
      height: 420,
      show: false,
      frame: false,
      resizable: false,
      fullscreenable: false,
      focusable: false,
      webPreferences: {
        preload: path.join(__dirname, "preload.js"),
      },
    });

    mainWindowState.manage(this.mainWindow);

    if (process.env.NODE_ENV === "development") {
      this.mainWindow.loadURL("http://localhost:5173");
      this.mainWindow.webContents.openDevTools({
        mode: "detach",
      });
    } else {
      this.mainWindow.loadFile(path.join(__dirname, "..", "dist", "index.html"));
    }

    this.mainWindow.once("ready-to-show", () => {
      this.mainWindow?.show();
    });

    return this.mainWindow;
  }

  get window() {
    return this.mainWindow;
  }
}
