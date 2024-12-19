import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electron", {
  sendMessage: (channel: string, args: any) => {
    ipcRenderer.send(channel, args);
  },
});

// Add this type declaration
declare global {
  interface Window {
    electron: {
      sendMessage: (channel: string, args: any) => void;
    };
  }
}
