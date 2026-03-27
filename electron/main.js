const { app, BrowserWindow, dialog, ipcMain, Menu, nativeImage } = require("electron");
const fs = require("node:fs");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const { spawn } = require("node:child_process");
const {
  createCbzArchiveBuffer,
  createZipArchiveBuffer,
  extractPagedDocumentToCache,
  getPagedDocumentKind,
  isSupportedPagedDocumentFile,
} = require("./paged_document_helper");

const BACKEND_URL = "http://127.0.0.1:8765";
const BACKEND_PORT = "8765";
const APP_USER_MODEL_ID = "com.chawa.manga-translate-studio";
const PROJECT_FILE_EXTENSION = "mtsproj";
const PROJECT_MIME_TYPE = "application/vnd.manga-translate-project+json";
const RECENT_FILES_LIMIT = 10;
const PAGED_DOCUMENT_KINDS = new Set(["pdf", "epub", "cbz", "zip", "cbr", "rar"]);
const backendDir = path.join(__dirname, "..", "backend");
const entryHtml = path.join(__dirname, "index.html");

let backendProcess = null;
let mainWindow = null;
let isWindowReady = false;
let pendingOpenFilePath = null;

const hasSingleInstanceLock = app.requestSingleInstanceLock();
if (!hasSingleInstanceLock) {
  app.quit();
}

if (process.platform === "win32") {
  app.setAppUserModelId(APP_USER_MODEL_ID);
}

function lookupMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const map = {
    ".mtsproj": PROJECT_MIME_TYPE,
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
    ".gif": "image/gif",
    ".bmp": "image/bmp",
    ".pdf": "application/pdf",
    ".zip": "application/zip",
    ".cbz": "application/vnd.comicbook+zip",
    ".rar": "application/vnd.rar",
    ".cbr": "application/vnd.comicbook-rar",
    ".epub": "application/epub+zip",
  };
  return map[ext] || "application/octet-stream";
}

function lookupFileKind(filePath) {
  const ext = path.extname(String(filePath || "")).toLowerCase();
  if (ext === ".mtsproj") {
    return "project";
  }
  if (ext === ".pdf") {
    return "pdf";
  }
  if (ext === ".epub") {
    return "epub";
  }
  if (ext === ".cbz") {
    return "cbz";
  }
  if (ext === ".zip") {
    return "zip";
  }
  if (ext === ".cbr") {
    return "cbr";
  }
  if (ext === ".rar") {
    return "rar";
  }
  const mimeType = lookupMimeType(filePath);
  if (mimeType.startsWith("image/")) {
    return "image";
  }
  return "unknown";
}

function ensureFileExtension(filePath, extension) {
  const normalizedExtension = `.${String(extension || "").replace(/^\./, "").toLowerCase()}`;
  if (!normalizedExtension || String(filePath).toLowerCase().endsWith(normalizedExtension)) {
    return filePath;
  }
  return `${filePath}${normalizedExtension}`;
}

function isSupportedFile(filePath) {
  return lookupFileKind(filePath) !== "unknown";
}

function isPagedDocumentKind(kind) {
  return PAGED_DOCUMENT_KINDS.has(String(kind || "").toLowerCase());
}

function getDocumentCacheBaseDir() {
  return app.getPath("userData");
}

function getSafeImageInfo(buffer) {
  try {
    const image = nativeImage.createFromBuffer(buffer);
    const { width, height } = image.getSize();
    if (width > 0 && height > 0) {
      return { image, width, height };
    }
  } catch {
    // Ignore and fall through.
  }
  return { image: null, width: 0, height: 0 };
}

function buildImagePreviewPayload(buffer, thumbWidth) {
  const { image, width, height } = getSafeImageInfo(buffer);
  const resolvedThumbWidth = Math.max(48, Number(thumbWidth) || 200);
  let thumbnailBuffer = buffer;
  let thumbnailMimeType = "application/octet-stream";

  if (image && width > 0 && height > 0) {
    const thumbImage = width > resolvedThumbWidth ? image.resize({ width: resolvedThumbWidth }) : image;
    thumbnailBuffer = thumbImage.toPNG();
    thumbnailMimeType = "image/png";
  }

  return {
    width,
    height,
    thumbnail_base64: thumbnailBuffer.toString("base64"),
    thumbnail_mime_type: thumbnailMimeType,
  };
}

function buildRenderedPagePayload(buffer, mimeType = "application/octet-stream") {
  const { width, height } = getSafeImageInfo(buffer);
  return {
    image_width: width,
    image_height: height,
    image_base64: buffer.toString("base64"),
    image_mime_type: mimeType,
  };
}

function getImageExportFormatFromPath(filePath, fallback = "png") {
  const ext = path.extname(String(filePath || "")).toLowerCase();
  if (ext === ".psd") {
    return { extension: "psd", mimeType: "application/vnd.adobe.photoshop" };
  }
  if (ext === ".jpg" || ext === ".jpeg") {
    return { extension: "jpg", mimeType: "image/jpeg" };
  }
  if (ext === ".webp") {
    return { extension: "webp", mimeType: "image/webp" };
  }
  if (ext === ".png") {
    return { extension: "png", mimeType: "image/png" };
  }
  return getImageExportFormatFromPath(`.${fallback}`, "png");
}

function getPagedExportFormatFromPath(filePath, fallback = "pdf") {
  const ext = path.extname(String(filePath || "")).toLowerCase();
  if (ext === ".psd") {
    return "psd";
  }
  if (ext === ".cbz") {
    return "cbz";
  }
  if (ext === ".zip") {
    return "zip";
  }
  if (ext === ".pdf") {
    return "pdf";
  }
  return String(fallback || "pdf").toLowerCase();
}

function makeRecentKey(filePath) {
  return process.platform === "win32" ? String(filePath).toLowerCase() : String(filePath);
}

function getRecentFilesStorePath() {
  return path.join(app.getPath("userData"), "recent-files.json");
}

// ─── Window Bounds Persistence ───
function getWindowBoundsPath() {
  return path.join(app.getPath("userData"), "window-bounds.json");
}

function loadWindowBounds() {
  try {
    const data = JSON.parse(fs.readFileSync(getWindowBoundsPath(), "utf8"));
    if (data && Number.isFinite(data.width) && Number.isFinite(data.height)) {
      return data;
    }
  } catch {
    // No saved bounds — use defaults.
  }
  return null;
}

function saveWindowBounds(bounds) {
  try {
    fs.writeFileSync(getWindowBoundsPath(), JSON.stringify(bounds, null, 2), "utf8");
  } catch {
    // Silent fail.
  }
}

function buildRecentFileEntry(filePath) {
  const kind = lookupFileKind(filePath);
  return {
    path: filePath,
    name: path.basename(filePath),
    directory: path.dirname(filePath),
    kind,
    openedAt: new Date().toISOString(),
  };
}

function readRecentFiles() {
  const storePath = getRecentFilesStorePath();
  try {
    if (!fs.existsSync(storePath)) {
      return [];
    }

    const parsed = JSON.parse(fs.readFileSync(storePath, "utf8"));
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter((item) => item && typeof item.path === "string")
      .map((item) => ({
        path: item.path,
        name: typeof item.name === "string" ? item.name : path.basename(item.path),
        directory: typeof item.directory === "string" ? item.directory : path.dirname(item.path),
        kind: ["project", "pdf", "image", "epub", "cbz", "zip", "cbr", "rar"].includes(item.kind)
          ? item.kind
          : "image",
        openedAt: typeof item.openedAt === "string" ? item.openedAt : "",
      }));
  } catch (error) {
    console.error("[recent-files] failed to read store:", error);
    return [];
  }
}

function writeRecentFiles(items) {
  const storePath = getRecentFilesStorePath();
  fs.mkdirSync(path.dirname(storePath), { recursive: true });
  fs.writeFileSync(storePath, JSON.stringify(items, null, 2), "utf8");
}

function listRecentFiles() {
  const storedRecentFiles = readRecentFiles();
  const recentFiles = storedRecentFiles.filter((item) => fs.existsSync(item.path) && isSupportedFile(item.path));
  const changed = recentFiles.length !== storedRecentFiles.length;
  if (changed) {
    writeRecentFiles(recentFiles);
  }
  return recentFiles;
}

function registerRecentFile(filePath) {
  if (!filePath || !fs.existsSync(filePath) || !isSupportedFile(filePath)) {
    return listRecentFiles();
  }

  const nextRecentFiles = [
    buildRecentFileEntry(filePath),
    ...listRecentFiles().filter((item) => makeRecentKey(item.path) !== makeRecentKey(filePath)),
  ].slice(0, RECENT_FILES_LIMIT);

  writeRecentFiles(nextRecentFiles);
  if (process.platform === "win32") {
    app.addRecentDocument(filePath);
  }
  return nextRecentFiles;
}

function removeRecentFile(filePath) {
  const nextRecentFiles = listRecentFiles().filter((item) => makeRecentKey(item.path) !== makeRecentKey(filePath));
  writeRecentFiles(nextRecentFiles);
  return nextRecentFiles;
}

function clearRecentFiles() {
  writeRecentFiles([]);
  if (process.platform === "win32") {
    app.clearRecentDocuments();
  }
  return [];
}

function serializeOpenFile(filePath, { registerRecent = true } = {}) {
  if (!filePath) {
    throw new Error("No file selected.");
  }
  if (!fs.existsSync(filePath)) {
    removeRecentFile(filePath);
    throw new Error(`File not found: ${filePath}`);
  }

  const mimeType = lookupMimeType(filePath);
  const kind = lookupFileKind(filePath);
  if (kind === "unknown") {
    throw new Error("Unsupported file type.");
  }

  if (registerRecent) {
    registerRecentFile(filePath);
  }

  if (kind === "project") {
    try {
      return {
        canceled: false,
        path: filePath,
        name: path.basename(filePath),
        kind,
        mimeType,
        projectData: JSON.parse(fs.readFileSync(filePath, "utf8")),
      };
    } catch (error) {
      throw new Error(`Project file is invalid: ${error.message}`);
    }
  }

  const buffer = fs.readFileSync(filePath);

  return {
    canceled: false,
    path: filePath,
    name: path.basename(filePath),
    kind,
    mimeType,
    dataUrl: kind === "image" || kind === "pdf" ? `data:${mimeType};base64,${buffer.toString("base64")}` : null,
    fileUrl: pathToFileURL(filePath).toString(),
  };
}

function extractOpenFilePath(argv) {
  const candidates = (argv || [])
    .slice(1)
    .filter((value) => value && !String(value).startsWith("-"));

  for (const candidate of candidates) {
    const resolved = path.resolve(candidate);
    if (fs.existsSync(resolved) && isSupportedFile(resolved)) {
      return resolved;
    }
  }

  return null;
}

function focusMainWindow() {
  if (!mainWindow || mainWindow.isDestroyed()) {
    return;
  }

  if (mainWindow.isMinimized()) {
    mainWindow.restore();
  }
  mainWindow.show();
  mainWindow.focus();
}

function dispatchOpenFileToRenderer(filePath) {
  if (!filePath) {
    return;
  }

  if (!mainWindow || mainWindow.isDestroyed() || !isWindowReady) {
    pendingOpenFilePath = filePath;
    return;
  }

  try {
    const payload = serializeOpenFile(filePath);
    mainWindow.webContents.send("open-external-file", payload);
    focusMainWindow();
  } catch (error) {
    dialog.showErrorBox("Open file failed", error.message);
  }
}

function parseDataUrl(dataUrl) {
  const match = /^data:([^;]+);base64,(.+)$/s.exec(dataUrl || "");
  if (!match) {
    throw new Error("Invalid file payload.");
  }

  const buffer = Buffer.from(match[2], "base64");
  if (buffer.length === 0) {
    throw new Error("Data URL contains empty or invalid base64 data.");
  }

  return {
    mimeType: match[1],
    buffer,
  };
}

function resolvePythonCommand() {
  const venvPython = process.platform === "win32"
    ? path.join(__dirname, "..", ".venv", "Scripts", "python.exe")
    : path.join(__dirname, "..", ".venv", "bin", "python");
  if (fs.existsSync(venvPython)) {
    return venvPython;
  }
  return process.platform === "win32" ? "python" : "python3";
}

function startBackend() {
  if (backendProcess) {
    return;
  }

  const python = resolvePythonCommand();
  backendProcess = spawn(
    python,
    ["-m", "uvicorn", "app.main:app", "--host", "127.0.0.1", "--port", BACKEND_PORT],
    {
      cwd: backendDir,
      windowsHide: true,
      env: {
        ...process.env,
      },
    }
  );

  backendProcess.stdout.on("data", (chunk) => {
    process.stdout.write(`[backend] ${chunk}`);
  });

  backendProcess.stderr.on("data", (chunk) => {
    process.stderr.write(`[backend] ${chunk}`);
  });

  backendProcess.on("exit", (code) => {
    backendProcess = null;
    // Auto-restart backend if it crashed (non-zero exit) and app is still running.
    if (code !== 0 && code !== null && !app.isQuitting) {
      console.error(`[backend] Process exited with code ${code}, restarting in 2s...`);
      setTimeout(() => startBackend(), 2000);
    }
  });
}

async function waitForBackend(timeoutMs = 30000) {
  startBackend();
  const deadline = Date.now() + timeoutMs;
  let lastError = null;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${BACKEND_URL}/health`);
      if (response.ok) {
        return;
      }
      lastError = new Error(`Healthcheck returned ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  throw lastError || new Error("Backend did not start in time.");
}

async function postMultipart(route, form) {
  await waitForBackend();

  const response = await fetch(`${BACKEND_URL}${route}`, {
    method: "POST",
    body: form,
    signal: AbortSignal.timeout(600_000),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || "Request failed.");
  }
  return data;
}

async function postMultipartBinary(route, form) {
  await waitForBackend();

  const response = await fetch(`${BACKEND_URL}${route}`, {
    method: "POST",
    body: form,
    signal: AbortSignal.timeout(600_000),
  });

  const buffer = Buffer.from(await response.arrayBuffer());
  if (!response.ok) {
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      try {
        const data = JSON.parse(buffer.toString("utf8"));
        throw new Error(data.detail || "Request failed.");
      } catch (error) {
        if (error instanceof SyntaxError) {
          // Fall back to the plain-text error path below when the backend did not return valid JSON.
        } else if (error instanceof Error) {
          throw error;
        }
      }
    }

    const message = buffer.toString("utf8").trim();
    throw new Error(message || "Request failed.");
  }

  return buffer;
}

function createWindow() {
  const saved = loadWindowBounds();
  const opts = {
    width: saved?.width || 1500,
    height: saved?.height || 980,
    minWidth: 1180,
    minHeight: 760,
    backgroundColor: "#efe8dc",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  };
  if (saved && Number.isFinite(saved.x) && Number.isFinite(saved.y)) {
    opts.x = saved.x;
    opts.y = saved.y;
  }
  if (saved?.maximized) {
    // Start at normal size first, then maximize after creation.
  }

  const window = new BrowserWindow(opts);

  if (saved?.maximized) {
    window.maximize();
  }

  mainWindow = window;
  isWindowReady = false;

  // Save bounds on resize/move (debounced).
  let boundsTimer = null;
  function scheduleSaveBounds() {
    if (boundsTimer) clearTimeout(boundsTimer);
    boundsTimer = setTimeout(() => {
      if (!window.isDestroyed()) {
        const isMax = window.isMaximized();
        const bounds = isMax ? (loadWindowBounds() || window.getNormalBounds()) : window.getBounds();
        saveWindowBounds({ ...bounds, maximized: isMax });
      }
    }, 500);
  }
  window.on("resize", scheduleSaveBounds);
  window.on("move", scheduleSaveBounds);
  window.on("maximize", scheduleSaveBounds);
  window.on("unmaximize", scheduleSaveBounds);

  // Ask renderer whether to save before closing.
  let closeConfirmed = false;
  window.on("close", (e) => {
    if (closeConfirmed || app.isQuitting) return;
    e.preventDefault();
    window.webContents.send("before-close");
  });

  ipcMain.on("close-confirmed", (_event, action) => {
    // action: "save", "discard", or "cancel"
    if (action === "cancel") return;
    closeConfirmed = true;
    window.close();
  });

  window.on("closed", () => {
    if (boundsTimer) clearTimeout(boundsTimer);
    ipcMain.removeAllListeners("close-confirmed");
    if (mainWindow === window) {
      mainWindow = null;
      isWindowReady = false;
    }
  });
  window.webContents.on("did-finish-load", () => {
    if (mainWindow === window) {
      isWindowReady = true;
    }
  });
  window.loadFile(entryHtml);
}

ipcMain.handle("pick-file", async () => {
  const result = await dialog.showOpenDialog({
    title: "Open manga image, document, or project",
    properties: ["openFile"],
    filters: [
      {
        name: "Manga Translate Project",
        extensions: [PROJECT_FILE_EXTENSION],
      },
      {
        name: "Images and Documents",
        extensions: ["png", "jpg", "jpeg", "webp", "gif", "bmp", "pdf", "zip", "cbz", "rar", "cbr", "epub"],
      },
      {
        name: "Images",
        extensions: ["png", "jpg", "jpeg", "webp", "gif", "bmp"],
      },
      {
        name: "Paged Documents",
        extensions: ["pdf", "zip", "cbz", "rar", "cbr", "epub"],
      },
    ],
  });

  if (result.canceled || result.filePaths.length === 0) {
    return { canceled: true };
  }

  return serializeOpenFile(result.filePaths[0]);
});

ipcMain.handle("get-recent-files", () => {
  return listRecentFiles();
});

ipcMain.handle("open-recent-file", (_event, payload) => {
  const filePath = payload?.filePath;
  return serializeOpenFile(filePath);
});

ipcMain.handle("remove-recent-file", (_event, payload) => {
  const filePath = payload?.filePath;
  if (!filePath) {
    return listRecentFiles();
  }
  return removeRecentFile(filePath);
});

ipcMain.handle("clear-recent-files", () => {
  return clearRecentFiles();
});

ipcMain.handle("consume-pending-open-file", () => {
  if (!pendingOpenFilePath) {
    return null;
  }

  const filePath = pendingOpenFilePath;
  pendingOpenFilePath = null;
  return serializeOpenFile(filePath, { registerRecent: true });
});

ipcMain.handle("preview-pdf", async (_event, payload) => {
  const { filePath, fileDataUrl, fileName, thumbWidth } = payload || {};
  if (!filePath && !fileDataUrl) {
    throw new Error("No PDF selected.");
  }

  const fileBuffer = fileDataUrl
    ? parseDataUrl(fileDataUrl).buffer
    : fs.readFileSync(filePath);
  const form = new FormData();
  form.append("file", new Blob([fileBuffer], { type: "application/pdf" }), fileName || path.basename(filePath));
  form.append("thumb_width", String(thumbWidth || 420));
  return postMultipart("/api/pdf/preview", form);
});

ipcMain.handle("render-pdf-page", async (_event, payload) => {
  const { filePath, fileDataUrl, fileName, pageNumber, pageWidth } = payload || {};
  if (!filePath && !fileDataUrl) {
    throw new Error("No PDF selected.");
  }
  if (!Number.isFinite(pageNumber)) {
    throw new Error("Invalid PDF page number.");
  }

  const fileBuffer = fileDataUrl
    ? parseDataUrl(fileDataUrl).buffer
    : fs.readFileSync(filePath);
  const form = new FormData();
  form.append("file", new Blob([fileBuffer], { type: "application/pdf" }), fileName || path.basename(filePath));
  form.append("page_number", String(pageNumber));
  form.append("page_width", String(pageWidth || 1600));
  return postMultipart("/api/pdf/render-page", form);
});

ipcMain.handle("preview-paged-document", async (_event, payload) => {
  const { filePath, fileName, thumbWidth } = payload || {};
  if (!filePath) {
    throw new Error("No document selected.");
  }
  if (!isSupportedPagedDocumentFile(filePath)) {
    throw new Error("Unsupported paged document type.");
  }

  const extracted = await extractPagedDocumentToCache({
    filePath,
    cacheBaseDir: getDocumentCacheBaseDir(),
  });

  const pages = [];
  for (const page of extracted.pages) {
    const buffer = fs.readFileSync(page.filePath);
    const preview = buildImagePreviewPayload(buffer, thumbWidth || 150);
    pages.push({
      page_number: page.pageNumber,
      width: preview.width,
      height: preview.height,
      thumbnail_base64: preview.thumbnail_base64,
      thumbnail_mime_type: preview.thumbnail_mime_type,
      file_name: page.fileName,
      file_url: page.fileUrl,
    });
  }

  return {
    file_name: fileName || path.basename(filePath),
    page_count: pages.length,
    selected_page: pages.length > 0 ? 1 : null,
    pages,
    warnings: extracted.warnings || [],
  };
});

ipcMain.handle("render-paged-document-page", async (_event, payload) => {
  const { filePath, fileName, pageNumber } = payload || {};
  if (!filePath) {
    throw new Error("No document selected.");
  }
  if (!Number.isFinite(pageNumber)) {
    throw new Error("Invalid document page number.");
  }

  const extracted = await extractPagedDocumentToCache({
    filePath,
    cacheBaseDir: getDocumentCacheBaseDir(),
  });
  const normalizedPageNumber = Math.max(1, Math.round(pageNumber));
  const page = extracted.pages.find((item) => Number(item.pageNumber) === normalizedPageNumber);
  if (!page) {
    throw new Error(`Page number ${normalizedPageNumber} is out of range.`);
  }

  const buffer = fs.readFileSync(page.filePath);
  const rendered = buildRenderedPagePayload(buffer, lookupMimeType(page.fileName || page.filePath || "page.png"));
  return {
    file_name: fileName || path.basename(filePath),
    page_number: normalizedPageNumber,
    image_width: rendered.image_width,
    image_height: rendered.image_height,
    image_base64: rendered.image_base64,
    image_mime_type: rendered.image_mime_type,
    page_file_name: page.fileName,
    page_file_url: page.fileUrl,
  };
});

async function buildSourcePageImageAsset(payload) {
  const {
    sourceKind,
    filePath,
    fileDataUrl,
    imageDataUrl,
    fileName,
    pageNumber,
  } = payload || {};
  const normalizedKind = String(sourceKind || "").toLowerCase();

  if (imageDataUrl) {
    const parsed = parseDataUrl(imageDataUrl);
    return {
      buffer: parsed.buffer,
      mimeType: parsed.mimeType,
      fileName: fileName || "page.png",
      pageNumber: Number.isFinite(pageNumber) ? Math.max(1, Math.round(pageNumber)) : null,
    };
  }

  if (normalizedKind === "pdf") {
    if (!filePath && !fileDataUrl) {
      throw new Error("No PDF selected.");
    }
    if (!Number.isFinite(pageNumber)) {
      throw new Error("Invalid PDF page number.");
    }

    const pdfBuffer = fileDataUrl
      ? parseDataUrl(fileDataUrl).buffer
      : fs.readFileSync(filePath);
    const form = new FormData();
    const normalizedPageNumber = Math.max(1, Math.round(pageNumber));
    form.append("file", new Blob([pdfBuffer], { type: "application/pdf" }), fileName || path.basename(filePath || "document.pdf"));
    form.append("page_number", String(normalizedPageNumber));
    form.append("page_width", "1600");

    const rendered = await postMultipart("/api/pdf/render-page", form);
    return {
      buffer: Buffer.from(rendered.image_base64, "base64"),
      mimeType: rendered.image_mime_type || "image/png",
      fileName: rendered.page_file_name || `${path.basename(fileName || filePath || "document")}-page-${String(normalizedPageNumber).padStart(3, "0")}.png`,
      pageNumber: normalizedPageNumber,
    };
  }

  if (["epub", "cbz", "zip", "cbr", "rar"].includes(normalizedKind)) {
    if (!filePath) {
      throw new Error("No paged document selected.");
    }
    if (!Number.isFinite(pageNumber)) {
      throw new Error("Invalid document page number.");
    }

    const extracted = await extractPagedDocumentToCache({
      filePath,
      cacheBaseDir: getDocumentCacheBaseDir(),
    });
    const normalizedPageNumber = Math.max(1, Math.round(pageNumber));
    const page = extracted.pages.find((item) => Number(item.pageNumber) === normalizedPageNumber);
    if (!page) {
      throw new Error(`Page number ${normalizedPageNumber} is out of range.`);
    }

    return {
      buffer: fs.readFileSync(page.filePath),
      mimeType: lookupMimeType(page.fileName || page.filePath || "page.png"),
      fileName: page.fileName || `page-${String(normalizedPageNumber).padStart(3, "0")}.png`,
      pageNumber: normalizedPageNumber,
    };
  }

  if (fileDataUrl) {
    const parsed = parseDataUrl(fileDataUrl);
    return {
      buffer: parsed.buffer,
      mimeType: parsed.mimeType,
      fileName: fileName || "page.png",
      pageNumber: Number.isFinite(pageNumber) ? Math.max(1, Math.round(pageNumber)) : null,
    };
  }

  if (!filePath) {
    throw new Error("No image selected.");
  }

  return {
    buffer: fs.readFileSync(filePath),
    mimeType: lookupMimeType(filePath),
    fileName: fileName || path.basename(filePath),
    pageNumber: Number.isFinite(pageNumber) ? Math.max(1, Math.round(pageNumber)) : null,
  };
}

ipcMain.handle("ocr-source-page", async (_event, payload) => {
  const { apiKey, documentKey } = payload || {};
  const imageAsset = await buildSourcePageImageAsset(payload);
  const form = new FormData();
  form.append("file", new Blob([imageAsset.buffer], { type: imageAsset.mimeType }), imageAsset.fileName);
  if (Number.isFinite(imageAsset.pageNumber)) {
    form.append("page_number", String(imageAsset.pageNumber));
  }
  if (apiKey) {
    form.append("api_key", apiKey);
  }
  if (documentKey) {
    form.append("document_key", documentKey);
  }
  return postMultipart("/api/ocr/page", form);
});

ipcMain.handle("upsert-translation-memory", async (_event, payload) => {
  const {
    documentKey,
    sourceKind,
    sourcePath,
    sourceName,
    projectPath,
    entries,
  } = payload || {};

  const form = new FormData();
  if (documentKey) {
    form.append("document_key", documentKey);
  }
  if (sourceKind) {
    form.append("source_kind", sourceKind);
  }
  if (sourcePath) {
    form.append("source_path", sourcePath);
  }
  if (sourceName) {
    form.append("source_name", sourceName);
  }
  if (projectPath) {
    form.append("project_path", projectPath);
  }
  form.append("entries_json", JSON.stringify(Array.isArray(entries) ? entries : []));
  return postMultipart("/api/rag/translation-memory/upsert", form);
});

ipcMain.handle("translate-image", async (_event, payload) => {
  const { filePath, imageDataUrl, fileName, apiKey, model } = payload || {};
  if (!filePath && !imageDataUrl) {
    throw new Error("No image selected.");
  }

  let fileBuffer;
  let mimeType;
  let resolvedFileName;

  if (imageDataUrl) {
    const parsed = parseDataUrl(imageDataUrl);
    fileBuffer = parsed.buffer;
    mimeType = parsed.mimeType;
    resolvedFileName = fileName || "page.png";
  } else {
    fileBuffer = fs.readFileSync(filePath);
    mimeType = lookupMimeType(filePath);
    resolvedFileName = path.basename(filePath);
  }

  const form = new FormData();
  form.append("file", new Blob([fileBuffer], { type: mimeType }), resolvedFileName);
  if (model) {
    form.append("model", model);
  }
  if (apiKey) {
    form.append("api_key", apiKey);
  }

  // Use SSE streaming endpoint for real-time progress.
  await waitForBackend();

  const response = await fetch(`${BACKEND_URL}/api/translate-stream`, {
    method: "POST",
    body: form,
    signal: AbortSignal.timeout(600_000),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.detail || "Translation request failed.");
  }

  // Read SSE stream in real-time using chunked reading.
  if (!response.body) {
    throw new Error("Server returned an empty response body.");
  }
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let finalResult = null;
  let streamError = null;

  function processSseMessages(raw) {
    const messages = raw.split("\n\n");
    const remainder = messages.pop(); // Keep incomplete last chunk.

    for (const msg of messages) {
      if (!msg.trim()) continue;
      const lines = msg.split("\n");
      let eventType = "";
      let dataStr = "";

      for (const line of lines) {
        if (line.startsWith("event: ")) eventType = line.slice(7);
        else if (line.startsWith("data: ")) dataStr += (dataStr ? "\n" : "") + line.slice(6);
      }

      if (!dataStr) continue;

      try {
        const parsed = JSON.parse(dataStr);
        if (eventType === "progress") {
          if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send("translate-progress", parsed);
          }
        } else if (eventType === "result") {
          finalResult = parsed;
        } else if (eventType === "error") {
          streamError = parsed.error || "Translation failed.";
        }
      } catch (parseErr) {
        console.warn("SSE parse error:", parseErr.message, "data:", dataStr.slice(0, 200));
      }
    }

    return remainder;
  }

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    buffer = processSseMessages(buffer);
  }

  // Flush any remaining data in the buffer after the stream closes.
  if (buffer.trim()) {
    processSseMessages(buffer + "\n\n");
  }

  if (streamError) {
    throw new Error(streamError);
  }
  if (!finalResult) {
    throw new Error("No translation result received from backend.");
  }

  // Log translation result summary for debugging.
  const regionCount = Array.isArray(finalResult.regions) ? finalResult.regions.length : 0;
  const hasClean = Boolean(finalResult.cleaned_image_base64);
  const modelUsed = finalResult.model_used || "unknown";
  const warningCount = Array.isArray(finalResult.warnings) ? finalResult.warnings.length : 0;
  console.log(`[translate] Done: ${regionCount} regions, clean=${hasClean}, model=${modelUsed}, warnings=${warningCount}`);
  if (regionCount === 0) {
    console.warn("[translate] WARNING: 0 regions returned. Warnings:", finalResult.warnings);
  }

  return finalResult;
});

ipcMain.handle("clean-and-suggest", async (_event, payload) => {
  const {
    imageDataUrl,
    fileName,
    apiKey,
    cleanModel,
    suggestionModel,
    documentKey,
    sourceKind,
    sourcePath,
    sourceName,
    projectPath,
    pageNumber,
    currentOcrPage,
    nearbyOcrPages,
    translationMemory,
    approvedTranslations,
    glossaryEntries,
  } = payload || {};
  if (!imageDataUrl) {
    throw new Error("No image provided.");
  }

  const parsed = parseDataUrl(imageDataUrl);
  const form = new FormData();
  form.append("file", new Blob([parsed.buffer], { type: parsed.mimeType }), fileName || "clean-suggest.png");
  if (cleanModel) {
    form.append("clean_model", cleanModel);
  }
  if (suggestionModel) {
    form.append("suggestion_model", suggestionModel);
  }
  if (documentKey) {
    form.append("document_key", documentKey);
  }
  if (sourceKind) {
    form.append("source_kind", sourceKind);
  }
  if (sourcePath) {
    form.append("source_path", sourcePath);
  }
  if (sourceName) {
    form.append("source_name", sourceName);
  }
  if (projectPath) {
    form.append("project_path", projectPath);
  }
  if (Number.isFinite(pageNumber)) {
    form.append("page_number", String(pageNumber));
  }
  if (apiKey) {
    form.append("api_key", apiKey);
  }
  form.append("current_ocr_json", JSON.stringify(currentOcrPage || null));
  form.append("nearby_ocr_json", JSON.stringify(Array.isArray(nearbyOcrPages) ? nearbyOcrPages : []));
  form.append("translation_memory_json", JSON.stringify(Array.isArray(translationMemory) ? translationMemory : []));
  form.append("approved_translations_json", JSON.stringify(Array.isArray(approvedTranslations) ? approvedTranslations : []));
  form.append("glossary_json", JSON.stringify(Array.isArray(glossaryEntries) ? glossaryEntries : []));
  return postMultipart("/api/clean-suggest", form);
});

ipcMain.handle("edit-image", async (_event, payload) => {
  const { imageDataUrl, prompt, apiKey, model } = payload || {};
  if (!imageDataUrl) {
    throw new Error("No image provided.");
  }
  if (!prompt) {
    throw new Error("No edit prompt provided.");
  }

  const parsed = parseDataUrl(imageDataUrl);
  const form = new FormData();
  form.append("file", new Blob([parsed.buffer], { type: parsed.mimeType }), "edit.png");
  form.append("prompt", prompt);
  if (model) {
    form.append("model", model);
  }
  if (apiKey) {
    form.append("api_key", apiKey);
  }

  return postMultipart("/api/edit-image", form);
});

ipcMain.handle("clean-only", async (_event, payload) => {
  const { imageDataUrl, apiKey, model } = payload || {};
  if (!imageDataUrl) {
    throw new Error("No image provided.");
  }

  const parsed = parseDataUrl(imageDataUrl);
  const form = new FormData();
  form.append("file", new Blob([parsed.buffer], { type: parsed.mimeType }), "clean.png");
  if (model) {
    form.append("model", model);
  }
  if (apiKey) {
    form.append("api_key", apiKey);
  }

  return postMultipart("/api/clean-only", form);
});

ipcMain.handle("choose-image-export-path", async (_event, payload) => {
  const { suggestedName } = payload || {};
  const { canceled, filePath } = await dialog.showSaveDialog({
    title: "Export translated manga page",
    defaultPath: suggestedName || "translated-page.png",
    filters: [
      { name: "PNG Image", extensions: ["png"] },
      { name: "JPEG Image", extensions: ["jpg", "jpeg"] },
      { name: "WebP Image", extensions: ["webp"] },
      { name: "Photoshop Document", extensions: ["psd"] },
    ],
  });

  if (canceled || !filePath) {
    return { canceled: true };
  }

  const format = getImageExportFormatFromPath(filePath);
  const resolvedOutputPath = ensureFileExtension(filePath, format.extension);
  return {
    canceled: false,
    path: resolvedOutputPath,
    format: format.extension,
    mimeType: format.mimeType,
  };
});

ipcMain.handle("save-export-file", async (_event, payload) => {
  const { dataUrl, outputPath } = payload || {};
  if (!dataUrl) {
    throw new Error("Nothing to export.");
  }
  if (!outputPath) {
    throw new Error("No export destination selected.");
  }

  const { buffer } = parseDataUrl(dataUrl);
  if (buffer.length === 0) {
    throw new Error("Export image data is empty.");
  }
  fs.writeFileSync(outputPath, buffer);
  return { canceled: false, path: outputPath };
});

ipcMain.handle("choose-paged-export-path", async (_event, payload) => {
  const { sourceKind, suggestedName, allowPsd = false } = payload || {};
  const pagedKind = String(sourceKind || "").toLowerCase();
  const allowPdf = pagedKind === "pdf";
  const filters = allowPdf
    ? [
        { name: "PDF Document", extensions: ["pdf"] },
        { name: "CBZ Archive", extensions: ["cbz"] },
        { name: "ZIP Archive", extensions: ["zip"] },
      ]
    : [
        { name: "CBZ Archive", extensions: ["cbz"] },
        { name: "ZIP Archive", extensions: ["zip"] },
      ];
  if (allowPsd) {
    filters.push({ name: "Photoshop Document", extensions: ["psd"] });
  }

  const { canceled, filePath } = await dialog.showSaveDialog({
    title: "Export translated document",
    defaultPath: suggestedName || `translated-document.${allowPdf ? "pdf" : "cbz"}`,
    filters,
  });

  if (canceled || !filePath) {
    return { canceled: true };
  }

  const fallbackFormat = allowPdf ? "pdf" : "cbz";
  const format = getPagedExportFormatFromPath(filePath, fallbackFormat);
  const resolvedOutputPath = ensureFileExtension(filePath, format);
  return {
    canceled: false,
    path: resolvedOutputPath,
    format,
  };
});

ipcMain.handle("export-paged-document", async (_event, payload) => {
  const { sourceKind, filePath, fileDataUrl, fileName, pages, outputPath, format } = payload || {};
  if (!Array.isArray(pages) || pages.length === 0) {
    throw new Error("No document pages are ready to export.");
  }
  if (!outputPath) {
    throw new Error("No export destination selected.");
  }

  const normalizedFormat = String(format || "").toLowerCase();
  if (normalizedFormat === "pdf") {
    if (String(sourceKind || "").toLowerCase() !== "pdf") {
      throw new Error("PDF export is only available for PDF sources right now.");
    }
    if (!filePath && !fileDataUrl) {
      throw new Error("No PDF selected.");
    }

    const resolvedFileName = fileName || path.basename(filePath || "document.pdf");
    const pdfBuffer = fileDataUrl
      ? parseDataUrl(fileDataUrl).buffer
      : fs.readFileSync(filePath);
    const pageNumbers = [];
    const form = new FormData();
    form.append("file", new Blob([pdfBuffer], { type: "application/pdf" }), resolvedFileName);

    for (const [index, page] of pages.entries()) {
      const pageNumber = Number(page?.pageNumber);
      if (!Number.isFinite(pageNumber)) {
        throw new Error(`Invalid PDF export page at index ${index + 1}.`);
      }
      if (!page?.imageDataUrl) {
        throw new Error(`Missing rendered image for PDF page ${pageNumber}.`);
      }

      const { mimeType, buffer } = parseDataUrl(page.imageDataUrl);
      const normalizedPageNumber = Math.round(pageNumber);
      pageNumbers.push(normalizedPageNumber);
      form.append(
        "images",
        new Blob([buffer], { type: mimeType || "image/png" }),
        `page-${String(normalizedPageNumber).padStart(3, "0")}.png`
      );
    }

    form.append("page_numbers_json", JSON.stringify(pageNumbers));
    const exportBuffer = await postMultipartBinary("/api/pdf/export", form);
    fs.writeFileSync(outputPath, exportBuffer);
    return {
      canceled: false,
      path: outputPath,
      pageCount: pageNumbers.length,
      format: "pdf",
    };
  }

  const archivePages = pages.map((page, index) => {
    if (!page?.imageDataUrl) {
      throw new Error(`Missing rendered image for page ${page?.pageNumber || index + 1}.`);
    }
    const { mimeType, buffer } = parseDataUrl(page.imageDataUrl);
    return {
      pageNumber: Number(page?.pageNumber) || index + 1,
      buffer,
      mimeType,
      fileName: page?.fileName || page?.name || `page-${index + 1}.png`,
    };
  });

  const archive = normalizedFormat === "zip"
    ? await createZipArchiveBuffer({ pages: archivePages, archiveName: path.basename(outputPath) })
    : await createCbzArchiveBuffer({ pages: archivePages, archiveName: path.basename(outputPath) });
  fs.writeFileSync(outputPath, archive.buffer);
  return {
    canceled: false,
    path: outputPath,
    pageCount: archive.pageCount,
    format: archive.format,
  };
});

ipcMain.handle("save-project", async (_event, payload) => {
  const { projectData, projectPath, suggestedName, saveAs } = payload || {};
  if (!projectData || typeof projectData !== "object") {
    throw new Error("Nothing to save.");
  }

  let resolvedPath = projectPath || null;
  if (!resolvedPath || saveAs) {
    const { canceled, filePath } = await dialog.showSaveDialog({
      title: "Save manga project",
      defaultPath: suggestedName || `untitled.${PROJECT_FILE_EXTENSION}`,
      filters: [
        {
          name: "Manga Translate Project",
          extensions: [PROJECT_FILE_EXTENSION],
        },
      ],
    });

    if (canceled || !filePath) {
      return { canceled: true };
    }

    resolvedPath = ensureFileExtension(filePath, PROJECT_FILE_EXTENSION);
  }

  fs.writeFileSync(resolvedPath, JSON.stringify(projectData, null, 2), "utf8");
  registerRecentFile(resolvedPath);
  return {
    canceled: false,
    path: resolvedPath,
    name: path.basename(resolvedPath),
  };
});

function buildThaiMenu() {
  const isMac = process.platform === "darwin";

  const template = [
    // ─── ไฟล์ ───
    {
      label: "ไฟล์",
      submenu: [
        {
          label: "เปิดไฟล์...",
          accelerator: "CmdOrCtrl+O",
          click: () => {
            if (mainWindow && !mainWindow.isDestroyed()) {
              mainWindow.webContents.send("menu-action", "open-file");
            }
          },
        },
        {
          label: "บันทึกโปรเจค",
          accelerator: "CmdOrCtrl+S",
          click: () => {
            if (mainWindow && !mainWindow.isDestroyed()) {
              mainWindow.webContents.send("menu-action", "save");
            }
          },
        },
        {
          label: "บันทึกเป็น...",
          accelerator: "CmdOrCtrl+Shift+S",
          click: () => {
            if (mainWindow && !mainWindow.isDestroyed()) {
              mainWindow.webContents.send("menu-action", "save-as");
            }
          },
        },
        { type: "separator" },
          {
            label: "Export...",
            click: () => {
              if (mainWindow && !mainWindow.isDestroyed()) {
                mainWindow.webContents.send("menu-action", "export");
            }
          },
        },
        { type: "separator" },
        isMac ? { label: "ปิด", role: "close" } : { label: "ออกจากโปรแกรม", role: "quit" },
      ],
    },
    // ─── แก้ไข ───
    {
      label: "แก้ไข",
      submenu: [
        { label: "เลิกทำ", accelerator: "CmdOrCtrl+Z", role: "undo" },
        { label: "ทำซ้ำ", accelerator: "CmdOrCtrl+Y", role: "redo" },
        { type: "separator" },
        { label: "ตัด", accelerator: "CmdOrCtrl+X", role: "cut" },
        { label: "คัดลอก", accelerator: "CmdOrCtrl+C", role: "copy" },
        { label: "วาง", accelerator: "CmdOrCtrl+V", role: "paste" },
        { label: "เลือกทั้งหมด", accelerator: "CmdOrCtrl+A", role: "selectAll" },
      ],
    },
    // ─── มุมมอง ───
    {
      label: "มุมมอง",
      submenu: [
        { label: "โหลดใหม่", accelerator: "CmdOrCtrl+R", role: "reload" },
        { label: "โหลดใหม่ (ล้าง cache)", accelerator: "CmdOrCtrl+Shift+R", role: "forceReload" },
        { type: "separator" },
        { label: "ซูมเข้า", accelerator: "CmdOrCtrl+=", role: "zoomIn" },
        { label: "ซูมออก", accelerator: "CmdOrCtrl+-", role: "zoomOut" },
        { label: "ขนาดปกติ", accelerator: "CmdOrCtrl+0", role: "resetZoom" },
        { type: "separator" },
        { label: "เต็มจอ", accelerator: "F11", role: "togglefullscreen" },
        { type: "separator" },
        { label: "เครื่องมือนักพัฒนา", accelerator: "F12", role: "toggleDevTools" },
      ],
    },
    // ─── หน้าต่าง ───
    {
      label: "หน้าต่าง",
      submenu: [
        { label: "ย่อหน้าต่าง", role: "minimize" },
        { label: "ขยายหน้าต่าง", role: "zoom" },
        ...(isMac ? [{ type: "separator" }, { label: "เอามาหน้า", role: "front" }] : []),
        { label: "ปิดหน้าต่าง", role: "close" },
      ],
    },
    // ─── ช่วยเหลือ ───
    {
      label: "ช่วยเหลือ",
      role: "help",
      submenu: [
        {
          label: "คู่มือการใช้งาน",
          accelerator: "F1",
          click: () => {
            if (mainWindow && !mainWindow.isDestroyed()) {
              mainWindow.webContents.send("menu-action", "show-guide");
            }
          },
        },
        { type: "separator" },
        {
          label: "เกี่ยวกับ Manga Translate Studio",
          click: () => {
            if (mainWindow && !mainWindow.isDestroyed()) {
              dialog.showMessageBox(mainWindow, {
                type: "info",
                title: "เกี่ยวกับ",
                message: "Manga Translate Studio",
                detail: "โปรแกรมแปลมังงะด้วย Gemini AI\nแปลภาษาญี่ปุ่นเป็นภาษาไทยอัตโนมัติ",
              });
            }
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

app.whenReady().then(async () => {
  if (process.platform !== "darwin") {
    pendingOpenFilePath = extractOpenFilePath(process.argv);
  }

  buildThaiMenu();
  createWindow();
  try {
    await waitForBackend();
  } catch (error) {
    dialog.showErrorBox(
      "Python backend failed to start",
      `${error.message}\n\nInstall Python dependencies first, then reopen the app.`
    );
  }

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
      return;
    }
    focusMainWindow();
  });
});

app.on("second-instance", (_event, commandLine) => {
  const requestedFilePath = extractOpenFilePath(commandLine);
  if (requestedFilePath) {
    dispatchOpenFileToRenderer(requestedFilePath);
  } else {
    focusMainWindow();
  }
});

app.on("open-file", (event, filePath) => {
  event.preventDefault();
  if (filePath) {
    dispatchOpenFileToRenderer(filePath);
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("before-quit", () => {
  app.isQuitting = true;
  if (backendProcess) {
    try {
      // Try graceful SIGTERM first, force kill after 3s.
      backendProcess.kill("SIGTERM");
      setTimeout(() => {
        try { backendProcess?.kill("SIGKILL"); } catch { /* already dead */ }
      }, 3000);
    } catch { /* already dead */ }
  }
});
