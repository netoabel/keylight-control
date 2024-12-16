"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld("electron", {
    sendMessage: (channel, args) => {
        electron_1.ipcRenderer.send(channel, args);
    },
    // Add any other methods you need to expose to the renderer
});
