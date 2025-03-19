import { KeyLight } from "elgato-keylight";
import { BrowserWindow } from "electron";
import Store from "electron-store";
import { keylightConfig } from "./shared/keylight-config";
import { temperatureUtils } from "./shared/temperature-utils";

type StoreSchema = {
  autoModeEnabled: boolean;
  presets: typeof keylightConfig.presets;
  keylight: { host: string; port: number };
};

export class KeylightManager {
  private keylight: KeyLight;
  private isConnected: boolean = false;
  private mainWindow: BrowserWindow | null = null;
  private store: Store<StoreSchema> = new Store<StoreSchema>({
    defaults: {
      autoModeEnabled: false,
      presets: keylightConfig.presets,
      keylight: {
        host: keylightConfig.default.host,
        port: keylightConfig.default.port,
      },
    },
  });

  constructor(mainWindow: BrowserWindow | null = null) {
    this.mainWindow = mainWindow;
    this.keylight = this.createKeylight();
  }

  private createKeylight() {
    const { host, port } = this.store.get("keylight") as { host: string; port: number };
    return new KeyLight(host, port);
  }

  setMainWindow(window: BrowserWindow) {
    this.mainWindow = window;
  }

  async syncState() {
    try {
      const state = await this.keylight.getCurrentState();
      this.isConnected = true;
      this.mainWindow?.webContents.send("keylight-state", {
        connected: true,
        on: state.on === 1,
        brightness: state.brightness,
        temperature: temperatureUtils.toKelvin(state.temperature),
        autoMode: this.store.get("autoModeEnabled"),
        presets: this.store.get("presets"),
        config: this.store.get("keylight"),
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error("Failed to get Keylight state:", message);
      this.isConnected = false;
      this.mainWindow?.webContents.send("keylight-state", {
        connected: false,
        error: "Could not connect to keylight",
        config: this.store.get("keylight"),
        presets: this.store.get("presets"),
      });
    }
  }

  async updateConfig(config: { host: string; port: number }) {
    this.store.set("keylight", config);
    this.keylight = this.createKeylight();
    await this.syncState();
  }

  async turnOn() {
    await this.keylight.setState({ on: 1 });
  }

  async turnOff() {
    await this.keylight.setState({ on: 0 });
  }

  async setBrightness(brightness: number) {
    await this.keylight.setBrightness(brightness);
  }

  async setTemperature(value: number) {
    await this.keylight.setTemperature(temperatureUtils.toDeviceValue(value));
  }

  async updatePreset(preset: string, value: number) {
    const currentPresets = this.store.get("presets") as typeof keylightConfig.presets;
    const updatedPresets = { ...currentPresets, [preset]: value };
    this.store.set("presets", updatedPresets);
    // Sync state to ensure the UI gets the updated presets
    await this.syncState();
  }

  get connected() {
    return this.isConnected;
  }

  isAutoModeEnabled(): boolean {
    return this.store.get("autoModeEnabled") as boolean;
  }

  setAutoMode(enabled: boolean) {
    this.store.set("autoModeEnabled", enabled);
  }

  async getConfig() {
    const { host, port } = this.store.get("keylight") as { host: string; port: number };
    return {
      host,
      port,
    };
  }
}
