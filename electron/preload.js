const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("mangaStudio", {
  pickFile: () => ipcRenderer.invoke("pick-file"),
  translateImage: (payload) => ipcRenderer.invoke("translate-image", payload),
  saveExport: (payload) => ipcRenderer.invoke("save-export", payload),
});
