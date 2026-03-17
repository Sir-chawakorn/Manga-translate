const { app, BrowserWindow, dialog, ipcMain } = require("electron");
const fs = require("node:fs");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const { spawn } = require("node:child_process");

const BACKEND_URL = "http://127.0.0.1:8765";
const BACKEND_PORT = "8765";
const backendDir = path.join(__dirname, "..", "backend");
const entryHtml = path.join(__dirname, "index.html");

let backendProcess = null;

function lookupMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const map = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
    ".gif": "image/gif",
    ".bmp": "image/bmp",
    ".pdf": "application/pdf",
  };
  return map[ext] || "application/octet-stream";
}

function parseDataUrl(dataUrl) {
  const match = /^data:([^;]+);base64,(.+)$/s.exec(dataUrl || "");
  if (!match) {
    throw new Error("Invalid file payload.");
  }

  return {
    mimeType: match[1],
    buffer: Buffer.from(match[2], "base64"),
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

  backendProcess.on("exit", () => {
    backendProcess = null;
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

function createWindow() {
  const window = new BrowserWindow({
    width: 1500,
    height: 980,
    minWidth: 1100,
    minHeight: 720,
    backgroundColor: "#f4efe6",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  window.loadFile(entryHtml);
}

ipcMain.handle("pick-file", async () => {
  const result = await dialog.showOpenDialog({
    title: "Open manga image or PDF",
    properties: ["openFile"],
    filters: [
      {
        name: "Images and PDF",
        extensions: ["png", "jpg", "jpeg", "webp", "gif", "bmp", "pdf"],
      },
      {
        name: "Images",
        extensions: ["png", "jpg", "jpeg", "webp", "gif", "bmp"],
      },
      {
        name: "PDF",
        extensions: ["pdf"],
      },
    ],
  });

  if (result.canceled || result.filePaths.length === 0) {
    return { canceled: true };
  }

  const filePath = result.filePaths[0];
  const mimeType = lookupMimeType(filePath);
  const buffer = fs.readFileSync(filePath);
  const kind = mimeType === "application/pdf" ? "pdf" : "image";

  return {
    canceled: false,
    path: filePath,
    name: path.basename(filePath),
    kind,
    mimeType,
    dataUrl: `data:${mimeType};base64,${buffer.toString("base64")}`,
    fileUrl: pathToFileURL(filePath).toString(),
  };
});

ipcMain.handle("translate-image", async (_event, payload) => {
  const { filePath, imageDataUrl, fileName, apiKey, model } = payload || {};
  if (!filePath && !imageDataUrl) {
    throw new Error("No image selected.");
  }

  await waitForBackend();

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
  form.append("model", model || "gemini-2.5-flash-image");
  if (apiKey) {
    form.append("api_key", apiKey);
  }

  const response = await fetch(`${BACKEND_URL}/api/translate`, {
    method: "POST",
    body: form,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || "Translation failed.");
  }

  return data;
});

ipcMain.handle("save-export", async (_event, payload) => {
  const { dataUrl, suggestedName } = payload || {};
  if (!dataUrl) {
    throw new Error("Nothing to export.");
  }

  const { canceled, filePath } = await dialog.showSaveDialog({
    title: "Export translated manga page",
    defaultPath: suggestedName || "translated-page.png",
    filters: [
      {
        name: "PNG Image",
        extensions: ["png"],
      },
    ],
  });

  if (canceled || !filePath) {
    return { canceled: true };
  }

  const [, base64Data] = dataUrl.split(",", 2);
  fs.writeFileSync(filePath, Buffer.from(base64Data, "base64"));
  return { canceled: false, path: filePath };
});

app.whenReady().then(async () => {
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
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("before-quit", () => {
  if (backendProcess) {
    backendProcess.kill();
  }
});
