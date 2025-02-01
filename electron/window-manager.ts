import { app, BrowserWindow } from "electron";
import * as path from "path";
import windowStateKeeper from "electron-window-state";

export class WindowManager {
  private mainWindow: BrowserWindow | null = null;
  private configWindow: BrowserWindow | null = null;

  constructor() {}

  createWindow() {
    const mainWindowState = windowStateKeeper({
      defaultWidth: 360,
      defaultHeight: 480,
    });

    this.mainWindow = new BrowserWindow({
      x: mainWindowState.x,
      y: mainWindowState.y,
      width: 360,
      height: 480,
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

  showConfigWindow(config: { host: string; port: string }) {
    if (this.configWindow) {
      this.configWindow.focus();
      return;
    }

    this.configWindow = new BrowserWindow({
      width: 360,
      height: 480,
      show: false,
      frame: false,
      resizable: false,
      fullscreenable: false,
      focusable: true,
      parent: this.mainWindow!,
      modal: true,
      webPreferences: {
        preload: path.join(__dirname, "preload.js"),
      },
    });

    const searchParams = new URLSearchParams({
      config: "true",
      host: config.host || "",
      port: config.port || "",
    });

    if (process.env.NODE_ENV === "development") {
      this.configWindow.loadURL(`http://localhost:5173?${searchParams.toString()}`);
    } else {
      this.configWindow.loadFile(path.join(__dirname, "..", "dist", "index.html"), {
        search: searchParams.toString()
      });
    }

    this.configWindow.once("ready-to-show", () => {
      this.configWindow?.show();
    });

    this.configWindow.on("closed", () => {
      this.configWindow = null;
    });
  }

  hideConfigWindow() {
    if (this.configWindow) {
      this.configWindow.close();
      this.configWindow = null;
    }
  }

  get window() {
    return this.mainWindow;
  }
}
