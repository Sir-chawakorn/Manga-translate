const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("mangaStudio", {
  pickImage: () => ipcRenderer.invoke("pick-image"),
  translateImage: (payload) => ipcRenderer.invoke("translate-image", payload),
  saveExport: (payload) => ipcRenderer.invoke("save-export", payload),
});
