const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("mangaStudio", {
  pickFile: () => ipcRenderer.invoke("pick-file"),
  getRecentFiles: () => ipcRenderer.invoke("get-recent-files"),
  openRecentFile: (payload) => ipcRenderer.invoke("open-recent-file", payload),
  removeRecentFile: (payload) => ipcRenderer.invoke("remove-recent-file", payload),
  clearRecentFiles: () => ipcRenderer.invoke("clear-recent-files"),
  consumePendingOpenFile: () => ipcRenderer.invoke("consume-pending-open-file"),
  onOpenExternalFile: (callback) => {
    const listener = (_event, payload) => callback(payload);
    ipcRenderer.on("open-external-file", listener);
    return () => ipcRenderer.removeListener("open-external-file", listener);
  },
  previewPdf: (payload) => ipcRenderer.invoke("preview-pdf", payload),
  renderPdfPage: (payload) => ipcRenderer.invoke("render-pdf-page", payload),
  previewPagedDocument: (payload) => ipcRenderer.invoke("preview-paged-document", payload),
  renderPagedDocumentPage: (payload) => ipcRenderer.invoke("render-paged-document-page", payload),
  ocrSourcePage: (payload) => ipcRenderer.invoke("ocr-source-page", payload),
  upsertTranslationMemory: (payload) => ipcRenderer.invoke("upsert-translation-memory", payload),
  translateImage: (payload) => ipcRenderer.invoke("translate-image", payload),
  cleanAndSuggest: (payload) => ipcRenderer.invoke("clean-and-suggest", payload),
  chooseImageExportPath: (payload) => ipcRenderer.invoke("choose-image-export-path", payload),
  saveExportFile: (payload) => ipcRenderer.invoke("save-export-file", payload),
  choosePagedExportPath: (payload) => ipcRenderer.invoke("choose-paged-export-path", payload),
  exportPagedDocument: (payload) => ipcRenderer.invoke("export-paged-document", payload),
  saveProject: (payload) => ipcRenderer.invoke("save-project", payload),
  editImage: (payload) => ipcRenderer.invoke("edit-image", payload),
  cleanOnly: (payload) => ipcRenderer.invoke("clean-only", payload),
  onTranslateProgress: (callback) => {
    const listener = (_event, data) => callback(data);
    ipcRenderer.on("translate-progress", listener);
    return () => ipcRenderer.removeListener("translate-progress", listener);
  },
  onMenuAction: (callback) => {
    const listener = (_event, action) => callback(action);
    ipcRenderer.on("menu-action", listener);
    return () => ipcRenderer.removeListener("menu-action", listener);
  },
  onBeforeClose: (callback) => {
    const listener = (_event) => callback();
    ipcRenderer.on("before-close", listener);
    return () => ipcRenderer.removeListener("before-close", listener);
  },
  confirmClose: (action) => ipcRenderer.send("close-confirmed", action),
});
