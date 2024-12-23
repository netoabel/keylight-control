import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electron", {
  sendMessage: (channel: string, args: any) => {
    ipcRenderer.send(channel, args);
  },
  onMessage: (channel: string, callback: (args: any) => void) => {
    ipcRenderer.on(channel, (_event, args) => callback(args));
  },
});

// Add this type declaration
declare global {
  interface Window {
    electron: {
      sendMessage: (channel: string, args: any) => void;
      onMessage: (channel: string, callback: (args: any) => void) => void;
    };
  }
}
