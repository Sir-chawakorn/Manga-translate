const fs = require("node:fs/promises");
const path = require("node:path");
const crypto = require("node:crypto");
const { pathToFileURL } = require("node:url");

const JSZip = require("jszip");
const { XMLParser } = require("fast-xml-parser");
const { createExtractorFromData } = require("node-unrar-js");

const SUPPORTED_PAGED_DOCUMENT_EXTENSIONS = [".cbz", ".cbr", ".zip", ".rar", ".epub"];
const IMAGE_EXTENSIONS = new Set([
  ".avif",
  ".bmp",
  ".gif",
  ".heic",
  ".heif",
  ".jfif",
  ".jpeg",
  ".jpg",
  ".png",
  ".tif",
  ".tiff",
  ".webp",
]);
const ARCHIVE_EXTENSIONS = new Set([".cbz", ".cbr", ".zip", ".rar"]);
const ZIP_EXTENSIONS = new Set([".cbz", ".zip"]);
const RAR_EXTENSIONS = new Set([".cbr", ".rar"]);
const EPUB_EXTENSIONS = new Set([".epub"]);
const TEXT_ENCODER = new TextEncoder();
const TEXT_DECODER = new TextDecoder("utf-8", { fatal: false });
const NATURAL_COLLATOR = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" });
const XML_PARSER = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "",
  removeNSPrefix: true,
  parseTagValue: false,
  parseAttributeValue: false,
  allowBooleanAttributes: true,
});

function normalizeInputPath(filePath) {
  return path.resolve(String(filePath || ""));
}

function getExtension(filePath) {
  return path.extname(String(filePath || "")).toLowerCase();
}

function getPagedDocumentKind(filePath) {
  const ext = getExtension(filePath);
  if (!SUPPORTED_PAGED_DOCUMENT_EXTENSIONS.includes(ext)) {
    return "unknown";
  }
  if (ZIP_EXTENSIONS.has(ext)) {
    return "zip";
  }
  if (RAR_EXTENSIONS.has(ext)) {
    return "rar";
  }
  if (EPUB_EXTENSIONS.has(ext)) {
    return "epub";
  }
  return "unknown";
}

function isSupportedPagedDocumentFile(filePath) {
  return getPagedDocumentKind(filePath) !== "unknown";
}

function isImageFileName(fileName) {
  return IMAGE_EXTENSIONS.has(getExtension(fileName));
}

function naturalSortEntries(left, right) {
  const a = String(left?.name || left?.fileName || left?.path || left || "");
  const b = String(right?.name || right?.fileName || right?.path || right || "");
  return NATURAL_COLLATOR.compare(a, b);
}

function ensurePosixEntryName(entryName) {
  return String(entryName || "").replace(/\\/g, "/").replace(/^\/+/, "");
}

function pathToArchiveEntryName(fileName, index, extension) {
  const normalizedExtension = String(extension || "").toLowerCase() || ".png";
  return `page-${String(index).padStart(3, "0")}${normalizedExtension}`;
}

function guessImageExtension(fileName, fallback = ".png") {
  const ext = getExtension(fileName);
  if (IMAGE_EXTENSIONS.has(ext)) {
    return ext;
  }
  return fallback;
}

function bufferToArrayBuffer(buffer) {
  if (buffer instanceof ArrayBuffer) {
    return buffer;
  }
  if (Buffer.isBuffer(buffer)) {
    return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
  }
  if (ArrayBuffer.isView(buffer)) {
    return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
  }
  return null;
}

function normalizeDataUrl(dataUrl) {
  const match = /^data:([^;]+);base64,(.+)$/s.exec(String(dataUrl || ""));
  if (!match) {
    throw new Error("Invalid data URL.");
  }
  return {
    mimeType: match[1],
    buffer: Buffer.from(match[2], "base64"),
  };
}

function getMimeExtension(mimeType) {
  switch (String(mimeType || "").toLowerCase()) {
    case "image/jpeg":
    case "image/jpg":
      return ".jpg";
    case "image/png":
      return ".png";
    case "image/webp":
      return ".webp";
    case "image/gif":
      return ".gif";
    case "image/bmp":
      return ".bmp";
    case "image/avif":
      return ".avif";
    case "image/tiff":
      return ".tiff";
    default:
      return ".png";
  }
}

function asArray(value) {
  if (Array.isArray(value)) {
    return value;
  }
  if (value === undefined || value === null) {
    return [];
  }
  return [value];
}

function readXmlDocument(xmlText) {
  return XML_PARSER.parse(String(xmlText || ""));
}

function getAttribute(node, key) {
  if (!node || typeof node !== "object") {
    return undefined;
  }
  return node[key] ?? node[key.toLowerCase()] ?? node[key.replace(/-/g, "")] ?? undefined;
}

function getManifestNodes(parsedPackage) {
  const manifest = parsedPackage?.manifest;
  return asArray(manifest?.item);
}

function getSpineNodes(parsedPackage) {
  const spine = parsedPackage?.spine;
  return asArray(spine?.itemref);
}

function resolveZipRelativePath(baseEntryName, relativePath) {
  const baseDir = path.posix.dirname(ensurePosixEntryName(baseEntryName));
  return path.posix.normalize(path.posix.join(baseDir, ensurePosixEntryName(relativePath)));
}

function getEntryText(zip, entryName) {
  const entry = zip.file(ensurePosixEntryName(entryName));
  if (!entry) {
    return null;
  }
  return entry.async("text");
}

function getEntryBuffer(zip, entryName) {
  const entry = zip.file(ensurePosixEntryName(entryName));
  if (!entry) {
    return null;
  }
  return entry.async("nodebuffer");
}

function extractImageSourceFromHtml(htmlText) {
  const text = String(htmlText || "");
  const patterns = [
    /<(?:img|image)\b[^>]*(?:src|href|xlink:href)=["']([^"']+)["']/i,
    /<meta\b[^>]*(?:property|name)=["'][^"']*(?:image|cover)[^"']*["'][^>]*content=["']([^"']+)["']/i,
  ];
  for (const pattern of patterns) {
    const match = pattern.exec(text);
    if (match?.[1]) {
      return match[1];
    }
  }
  return null;
}

function buildSourceSignature(sourcePath, stat, kind) {
  return crypto
    .createHash("sha1")
    .update([normalizeInputPath(sourcePath), String(stat.size), String(stat.mtimeMs), kind].join("|"))
    .digest("hex");
}

function getCacheRoot(cacheBaseDir) {
  if (!cacheBaseDir) {
    throw new Error("cacheBaseDir is required.");
  }
  return path.join(path.resolve(String(cacheBaseDir)), "paged-document-cache");
}

async function removeDirectorySafe(dirPath) {
  await fs.rm(dirPath, { recursive: true, force: true });
}

async function ensureDirectoryClean(dirPath) {
  await removeDirectorySafe(dirPath);
  await fs.mkdir(dirPath, { recursive: true });
}

async function writeManifest(manifestPath, manifest) {
  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2), "utf8");
}

async function readManifest(manifestPath) {
  try {
    const raw = await fs.readFile(manifestPath, "utf8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function validateCachedManifest(manifest, sourcePath, stat, kind) {
  if (!manifest || typeof manifest !== "object") {
    return false;
  }
  if (manifest.version !== 1) {
    return false;
  }
  if (manifest.kind !== kind) {
    return false;
  }
  if (manifest.source?.path !== normalizeInputPath(sourcePath)) {
    return false;
  }
  if (String(manifest.source?.size) !== String(stat.size)) {
    return false;
  }
  if (String(manifest.source?.mtimeMs) !== String(stat.mtimeMs)) {
    return false;
  }
  if (!Array.isArray(manifest.pages) || manifest.pages.length === 0) {
    return false;
  }

  for (const page of manifest.pages) {
    if (!page || typeof page !== "object") {
      return false;
    }
    if (!page.filePath || !page.fileUrl) {
      return false;
    }
    try {
      await fs.access(page.filePath);
    } catch {
      return false;
    }
  }

  return true;
}

async function writePageFile(targetDir, pageNumber, sourceName, buffer) {
  const extension = guessImageExtension(sourceName, ".png");
  const fileName = pathToArchiveEntryName(sourceName, pageNumber, extension);
  const filePath = path.join(targetDir, fileName);
  await fs.writeFile(filePath, buffer);
  return {
    pageNumber,
    fileName,
    filePath,
    fileUrl: pathToFileURL(filePath).href,
    sourceEntryName: ensurePosixEntryName(sourceName),
    sourceName: sourceName || fileName,
    extension,
  };
}

async function extractZipLikeDocument(filePath, cachePagesDir, kind, warnings) {
  const fileBuffer = await fs.readFile(filePath);
  const zip = await JSZip.loadAsync(fileBuffer);
  const pageEntries = [];

  if (kind === "epub") {
    const containerText = await getEntryText(zip, "META-INF/container.xml");
    if (!containerText) {
      throw new Error("EPUB container.xml is missing.");
    }

    const container = readXmlDocument(containerText);
    const rootfiles = asArray(container?.container?.rootfiles?.rootfile);
    const rootfile = rootfiles[0];
    const opfPath = getAttribute(rootfile, "full-path") || getAttribute(rootfile, "fullPath");
    if (!opfPath) {
      throw new Error("EPUB rootfile path was not found.");
    }

    const opfText = await getEntryText(zip, opfPath);
    if (!opfText) {
      throw new Error(`EPUB package file not found: ${opfPath}`);
    }

    const opf = readXmlDocument(opfText);
    const packageNode = opf?.package || opf?.opf || opf;
    const manifestItems = getManifestNodes(packageNode);
    const spineItems = getSpineNodes(packageNode);
    const manifestById = new Map();

    for (const item of manifestItems) {
      const id = getAttribute(item, "id");
      if (!id) {
        continue;
      }
      manifestById.set(id, item);
    }

    let pageIndex = 0;
    for (const spineItem of spineItems) {
      const idref = getAttribute(spineItem, "idref");
      if (!idref) {
        continue;
      }
      const manifestItem = manifestById.get(idref);
      if (!manifestItem) {
        warnings.push(`EPUB spine item ${idref} was not found in the manifest.`);
        continue;
      }

      const href = getAttribute(manifestItem, "href");
      const mediaType = getAttribute(manifestItem, "media-type") || getAttribute(manifestItem, "mediaType") || "";
      const properties = String(getAttribute(manifestItem, "properties") || "");
      if (!href) {
        continue;
      }
      if (properties.includes("nav")) {
        continue;
      }

      if (String(mediaType).toLowerCase().startsWith("image/")) {
        const entryName = resolveZipRelativePath(opfPath, href);
        const imageBuffer = await getEntryBuffer(zip, entryName);
        if (!imageBuffer) {
          warnings.push(`Missing EPUB image entry: ${entryName}`);
          continue;
        }
        pageIndex += 1;
        pageEntries.push(await writePageFile(cachePagesDir, pageIndex, entryName, imageBuffer));
        continue;
      }

      if (/^(application\/xhtml\+xml|text\/html|application\/html)$/i.test(String(mediaType))) {
        const xhtmlEntryName = resolveZipRelativePath(opfPath, href);
        const xhtmlText = await getEntryText(zip, xhtmlEntryName);
        if (!xhtmlText) {
          warnings.push(`Missing EPUB XHTML entry: ${xhtmlEntryName}`);
          continue;
        }

        const imageRef = extractImageSourceFromHtml(xhtmlText);
        if (!imageRef) {
          warnings.push(`No image reference found in EPUB page: ${xhtmlEntryName}`);
          continue;
        }

        const imageEntryName = resolveZipRelativePath(xhtmlEntryName, imageRef);
        const imageBuffer = await getEntryBuffer(zip, imageEntryName);
        if (!imageBuffer) {
          warnings.push(`Missing EPUB image entry: ${imageEntryName}`);
          continue;
        }

        pageIndex += 1;
        pageEntries.push(await writePageFile(cachePagesDir, pageIndex, imageEntryName, imageBuffer));
        continue;
      }

      warnings.push(`Skipped unsupported EPUB spine item: ${href}`);
    }

    if (pageEntries.length === 0) {
      const fallbackEntries = [];
      zip.forEach((relativePath, entry) => {
        if (!entry.dir && isImageFileName(relativePath)) {
          fallbackEntries.push(relativePath);
        }
      });
      fallbackEntries.sort(naturalSortEntries);

      for (const entryName of fallbackEntries) {
        const imageBuffer = await getEntryBuffer(zip, entryName);
        if (!imageBuffer) {
          continue;
        }
        pageIndex += 1;
        pageEntries.push(await writePageFile(cachePagesDir, pageIndex, entryName, imageBuffer));
      }
    }

    return pageEntries;
  }

  const imageEntries = [];
  zip.forEach((relativePath, entry) => {
    if (!entry.dir && isImageFileName(relativePath)) {
      imageEntries.push(ensurePosixEntryName(relativePath));
    }
  });

  imageEntries.sort((left, right) => naturalSortEntries({ name: left }, { name: right }));

  let pageIndex = 0;
  for (const entryName of imageEntries) {
    const imageBuffer = await getEntryBuffer(zip, entryName);
    if (!imageBuffer) {
      continue;
    }
    pageIndex += 1;
    pageEntries.push(await writePageFile(cachePagesDir, pageIndex, entryName, imageBuffer));
  }

  return pageEntries;
}

async function extractRarDocument(filePath, cachePagesDir, warnings, password = "") {
  const archiveData = bufferToArrayBuffer(await fs.readFile(filePath));
  if (!archiveData) {
    throw new Error("Unable to read RAR archive.");
  }

  const extractor = await createExtractorFromData({
    data: archiveData,
    password: password || undefined,
  });

  const list = extractor.getFileList();
  const fileHeaders = [...(list?.fileHeaders || [])].filter((header) => header && !header.flags?.directory && isImageFileName(header.name));
  fileHeaders.sort((left, right) => naturalSortEntries({ name: left.name }, { name: right.name }));

  const selectedNames = fileHeaders.map((header) => header.name);
  if (selectedNames.length === 0) {
    return [];
  }

  const extracted = extractor.extract({
    files: selectedNames,
    password: password || undefined,
  });

  const files = [...(extracted?.files || [])];
  const extractedByName = new Map();
  for (const file of files) {
    const name = file?.fileHeader?.name;
    const bytes = file?.extraction;
    if (name && bytes) {
      extractedByName.set(name, Buffer.from(bytes));
    }
  }

  const pageEntries = [];
  let pageIndex = 0;
  for (const header of fileHeaders) {
    const buffer = extractedByName.get(header.name);
    if (!buffer) {
      warnings.push(`Missing RAR image entry: ${header.name}`);
      continue;
    }
    pageIndex += 1;
    pageEntries.push(await writePageFile(cachePagesDir, pageIndex, header.name, buffer));
  }

  return pageEntries;
}

async function extractPagedDocumentToCache({
  filePath,
  cacheBaseDir,
  password = "",
} = {}) {
  const resolvedFilePath = normalizeInputPath(filePath);
  const kind = getPagedDocumentKind(resolvedFilePath);
  if (kind === "unknown") {
    throw new Error("Unsupported paged document type.");
  }

  const stat = await fs.stat(resolvedFilePath);
  const cacheRoot = getCacheRoot(cacheBaseDir);
  const cacheKey = buildSourceSignature(resolvedFilePath, stat, kind);
  const cacheDir = path.join(cacheRoot, kind, cacheKey);
  const manifestPath = path.join(cacheDir, "manifest.json");
  const existingManifest = await readManifest(manifestPath);

  if (await validateCachedManifest(existingManifest, resolvedFilePath, stat, kind)) {
    return {
      kind,
      cacheDir,
      manifestPath,
      pages: existingManifest.pages,
      warnings: Array.isArray(existingManifest.warnings) ? existingManifest.warnings : [],
      source: existingManifest.source,
      reusedCache: true,
    };
  }

  await ensureDirectoryClean(cacheDir);
  const cachePagesDir = path.join(cacheDir, "pages");
  await fs.mkdir(cachePagesDir, { recursive: true });

  const warnings = [];
  let pages = [];

  if (ARCHIVE_EXTENSIONS.has(getExtension(resolvedFilePath))) {
    if (ZIP_EXTENSIONS.has(getExtension(resolvedFilePath))) {
      pages = await extractZipLikeDocument(resolvedFilePath, cachePagesDir, "zip", warnings);
    } else if (RAR_EXTENSIONS.has(getExtension(resolvedFilePath))) {
      pages = await extractRarDocument(resolvedFilePath, cachePagesDir, warnings, password);
    }
  } else if (kind === "epub") {
    pages = await extractZipLikeDocument(resolvedFilePath, cachePagesDir, "epub", warnings);
  }

  if (!pages.length) {
    await removeDirectorySafe(cacheDir);
    throw new Error("No image pages were found in this document.");
  }

  const manifest = {
    version: 1,
    kind,
    source: {
      path: resolvedFilePath,
      size: stat.size,
      mtimeMs: stat.mtimeMs,
    },
    pages,
    warnings,
    createdAt: new Date().toISOString(),
  };

  await writeManifest(manifestPath, manifest);

  return {
    kind,
    cacheDir,
    manifestPath,
    pages,
    warnings,
    source: manifest.source,
    reusedCache: false,
  };
}

async function resolveRenderedPageBuffer(page) {
  if (!page || typeof page !== "object") {
    throw new Error("Invalid rendered page payload.");
  }

  if (Buffer.isBuffer(page.buffer)) {
    return page.buffer;
  }
  if (page.buffer instanceof Uint8Array) {
    return Buffer.from(page.buffer);
  }
  if (page.dataUrl) {
    return normalizeDataUrl(page.dataUrl).buffer;
  }
  if (page.filePath) {
    return fs.readFile(page.filePath);
  }
  if (page.base64) {
    return Buffer.from(String(page.base64), "base64");
  }

  throw new Error("Rendered page is missing buffer or dataUrl.");
}

function comparePageOrder(left, right) {
  const leftNumber = Number(left?.pageNumber);
  const rightNumber = Number(right?.pageNumber);
  if (Number.isFinite(leftNumber) && Number.isFinite(rightNumber)) {
    return leftNumber - rightNumber;
  }
  if (Number.isFinite(leftNumber)) {
    return -1;
  }
  if (Number.isFinite(rightNumber)) {
    return 1;
  }
  return naturalSortEntries(left, right);
}

async function createImageArchiveBuffer({
  pages = [],
  archiveName = "translated.cbz",
  format = "cbz",
} = {}) {
  if (!Array.isArray(pages) || pages.length === 0) {
    throw new Error("At least one rendered page is required.");
  }

  const zip = new JSZip();
  const orderedPages = [...pages].sort(comparePageOrder);

  for (let index = 0; index < orderedPages.length; index += 1) {
    const page = orderedPages[index];
    const buffer = await resolveRenderedPageBuffer(page);
    const sourceName = page.fileName || page.name || page.filename || page.path || `page-${index + 1}.png`;
    const extension = guessImageExtension(sourceName, page.mimeType ? getMimeExtension(page.mimeType) : ".png");
    const entryName = pathToArchiveEntryName(sourceName, index + 1, extension);
    zip.file(entryName, buffer, { binary: true, compression: "DEFLATE" });
  }

  const buffer = await zip.generateAsync({
    type: "nodebuffer",
    compression: "DEFLATE",
    compressionOptions: { level: 9 },
  });

  const normalizedFormat = String(format || "cbz").toLowerCase();
  const resolvedArchiveName = archiveName || `translated.${normalizedFormat === "zip" ? "zip" : "cbz"}`;

  return {
    buffer,
    archiveName: resolvedArchiveName,
    format: normalizedFormat === "zip" ? "zip" : "cbz",
    pageCount: orderedPages.length,
  };
}

async function createCbzArchiveBuffer(options = {}) {
  return createImageArchiveBuffer({ ...options, format: "cbz" });
}

async function createZipArchiveBuffer(options = {}) {
  return createImageArchiveBuffer({ ...options, format: "zip" });
}

module.exports = {
  SUPPORTED_PAGED_DOCUMENT_EXTENSIONS,
  IMAGE_EXTENSIONS,
  getPagedDocumentKind,
  isSupportedPagedDocumentFile,
  isImageFileName,
  naturalSortEntries,
  extractPagedDocumentToCache,
  createImageArchiveBuffer,
  createCbzArchiveBuffer,
  createZipArchiveBuffer,
  guessImageExtension,
  getMimeExtension,
};
