const DEFAULT_MODEL_BADGE = "backend default";
const THAI_FONT_FAMILY = "\"Noto Sans Thai\", \"Sarabun\", \"Noto Sans JP\", \"Segoe UI\", sans-serif";
const TEXT_PADDING_X = 10;
const TEXT_PADDING_Y = 8;
const MIN_TEXT_FONT_SIZE = 12;
const MAX_TEXT_FONT_SIZE = 120;

const FONT_OPTIONS = [
  // ─── Sans-Serif ไทย (Google Fonts) ───
  { label: "Noto Sans Thai", value: "\"Noto Sans Thai\", sans-serif" },
  { label: "Sarabun", value: "\"Sarabun\", sans-serif" },
  { label: "Kanit", value: "\"Kanit\", sans-serif" },
  { label: "Prompt", value: "\"Prompt\", sans-serif" },
  { label: "K2D", value: "\"K2D\", sans-serif" },
  { label: "Chakra Petch", value: "\"Chakra Petch\", sans-serif" },
  { label: "Athiti", value: "\"Athiti\", sans-serif" },
  { label: "Bai Jamjuree", value: "\"Bai Jamjuree\", sans-serif" },
  { label: "Kodchasan", value: "\"Kodchasan\", sans-serif" },
  { label: "KoHo", value: "\"KoHo\", sans-serif" },
  { label: "Krub", value: "\"Krub\", sans-serif" },
  { label: "Mitr", value: "\"Mitr\", sans-serif" },
  { label: "Niramit", value: "\"Niramit\", sans-serif" },
  { label: "Thasadith", value: "\"Thasadith\", sans-serif" },
  { label: "Noto Sans Thai Looped", value: "\"Noto Sans Thai Looped\", sans-serif" },
  { label: "Fah Kwang", value: "\"Fah Kwang\", sans-serif" },
  { label: "Anuphan", value: "\"Anuphan\", sans-serif" },
  { label: "IBM Plex Sans Thai", value: "\"IBM Plex Sans Thai\", sans-serif" },
  { label: "IBM Plex Sans Thai Looped", value: "\"IBM Plex Sans Thai Looped\", sans-serif" },
  // ─── เหมาะกับ Manga (ลายมือ / Display) ───
  { label: "🖊 Itim (ลายมือ)", value: "\"Itim\", cursive" },
  { label: "🖊 Sriracha (ลายมือ)", value: "\"Sriracha\", cursive" },
  { label: "🖊 Charmonman (ลายมือ)", value: "\"Charmonman\", cursive" },
  { label: "🖊 Mali (ลายมือ)", value: "\"Mali\", cursive" },
  { label: "🖊 Purisa (ลายมือ)", value: "\"Purisa\", cursive" },
  { label: "🔥 Chonburi (หนา/Display)", value: "\"Chonburi\", sans-serif" },
  { label: "🔥 Pattaya (Display)", value: "\"Pattaya\", sans-serif" },
  // ─── Serif / ตกแต่ง (Google Fonts) ───
  { label: "Noto Serif Thai", value: "\"Noto Serif Thai\", serif" },
  { label: "Charm", value: "\"Charm\", cursive" },
  { label: "Maitree (Serif)", value: "\"Maitree\", serif" },
  { label: "Pridi (Serif)", value: "\"Pridi\", serif" },
  { label: "Srisakdi", value: "\"Srisakdi\", serif" },
  { label: "Taviraj (Serif)", value: "\"Taviraj\", serif" },
  { label: "Trirong (Serif)", value: "\"Trirong\", serif" },
  // ─── NECTEC / TLWG ───
  { label: "Garuda", value: "\"Garuda\", sans-serif" },
  { label: "Loma", value: "\"Loma\", sans-serif" },
  { label: "Norasi (Serif)", value: "\"Norasi\", serif" },
  { label: "Kinnari (Serif)", value: "\"Kinnari\", serif" },
  { label: "Sawasdee", value: "\"Sawasdee\", sans-serif" },
  { label: "Waree", value: "\"Waree\", sans-serif" },
  { label: "Umpush", value: "\"Umpush\", sans-serif" },
  { label: "Laksaman (Serif)", value: "\"Laksaman\", serif" },
  { label: "TlwgMono (Mono)", value: "\"TlwgMono\", monospace" },
  { label: "TlwgTypo", value: "\"TlwgTypo\", sans-serif" },
  // ─── DIP-SIPA (ราชการ) ───
  { label: "⭐ TH Sarabun New (ทางการ)", value: "\"TH Sarabun New\", sans-serif" },
  // ─── TEPC ───
  { label: "Aksaramatee", value: "\"Aksaramatee\", serif" },
  { label: "ChulaNarak", value: "\"ChulaNarak\", serif" },
  { label: "CmPrasanmit", value: "\"CmPrasanmit\", serif" },
  { label: "Nakaracha", value: "\"Nakaracha\", serif" },
  { label: "KaniGa", value: "\"KaniGa\", serif" },
  { label: "FonLeb", value: "\"FonLeb\", serif" },
  { label: "Himmaparnt", value: "\"Himmaparnt\", serif" },
  { label: "DC-Palamongkol", value: "\"DC-Palamongkol\", serif" },
  { label: "SR-FahMai", value: "\"SR-FahMai\", serif" },
  // ─── JS Technology ───
  { label: "JS Chanok", value: "\"JS Chanok\", sans-serif" },
  { label: "JS Likhit", value: "\"JS Likhit\", sans-serif" },
  { label: "JS Pumpuang", value: "\"JS Pumpuang\", sans-serif" },
  { label: "JS Rapee", value: "\"JS Rapee\", sans-serif" },
  { label: "JS Saksit", value: "\"JS Saksit\", sans-serif" },
  { label: "JS Jindara", value: "\"JS Jindara\", sans-serif" },
  { label: "JS Pisit", value: "\"JS Pisit\", sans-serif" },
  { label: "JS Neeno", value: "\"JS Neeno\", sans-serif" },
  { label: "JS Obsaward", value: "\"JS Obsaward\", sans-serif" },
  { label: "JS Tina", value: "\"JS Tina\", sans-serif" },
  { label: "JS Chusri", value: "\"JS Chusri\", sans-serif" },
  { label: "JS Charnchai", value: "\"JS Charnchai\", sans-serif" },
  { label: "JS Mookravee", value: "\"JS Mookravee\", sans-serif" },
  { label: "JS Korakhot", value: "\"JS Korakhot\", sans-serif" },
  { label: "JS 75 Pumpuang", value: "\"JS 75 Pumpuang\", sans-serif" },
  { label: "JS Amphan", value: "\"JS Amphan\", sans-serif" },
  { label: "JS Angsumalin", value: "\"JS Angsumalin\", sans-serif" },
  { label: "JS Arisa", value: "\"JS Arisa\", sans-serif" },
  { label: "JS Boaboon", value: "\"JS Boaboon\", sans-serif" },
  { label: "JS Chaimongkol", value: "\"JS Chaimongkol\", sans-serif" },
  { label: "JS Chalit", value: "\"JS Chalit\", sans-serif" },
  { label: "JS Chawlewhieng", value: "\"JS Chawlewhieng\", sans-serif" },
  { label: "JS Chodok", value: "\"JS Chodok\", sans-serif" },
  { label: "JS Chulee", value: "\"JS Chulee\", sans-serif" },
  { label: "JS Duangta", value: "\"JS Duangta\", sans-serif" },
  { label: "JS Giat", value: "\"JS Giat\", sans-serif" },
  { label: "JS Hariphan", value: "\"JS Hariphan\", sans-serif" },
  { label: "JS Jetarin", value: "\"JS Jetarin\", sans-serif" },
  { label: "JS Jukaphan", value: "\"JS Jukaphan\", sans-serif" },
  { label: "JS Junkaew", value: "\"JS Junkaew\", sans-serif" },
  { label: "JS Karabow", value: "\"JS Karabow\", sans-serif" },
  { label: "JS Khunwai", value: "\"JS Khunwai\", sans-serif" },
  { label: "JS Kobori", value: "\"JS Kobori\", sans-serif" },
  { label: "JS Laongdao", value: "\"JS Laongdao\", sans-serif" },
  { label: "JS Macha", value: "\"JS Macha\", sans-serif" },
  { label: "JS Ninja", value: "\"JS Ninja\", sans-serif" },
  { label: "JS Noklae", value: "\"JS Noklae\", sans-serif" },
  { label: "JS Oobboon", value: "\"JS Oobboon\", sans-serif" },
  { label: "JS Padachamai", value: "\"JS Padachamai\", sans-serif" },
  { label: "JS Pitsamai", value: "\"JS Pitsamai\", sans-serif" },
  { label: "JS Pitsanu", value: "\"JS Pitsanu\", sans-serif" },
  { label: "JS Prajuk", value: "\"JS Prajuk\", sans-serif" },
  { label: "JS Pranee", value: "\"JS Pranee\", sans-serif" },
  { label: "JS Prapakorn", value: "\"JS Prapakorn\", sans-serif" },
  { label: "JS Prasoplarp", value: "\"JS Prasoplarp\", sans-serif" },
  { label: "JS Puchong", value: "\"JS Puchong\", sans-serif" },
  { label: "JS Pudgrong", value: "\"JS Pudgrong\", sans-serif" },
  { label: "JS Puriphop", value: "\"JS Puriphop\", sans-serif" },
  { label: "JS Sadayu", value: "\"JS Sadayu\", sans-serif" },
  { label: "JS Samurai", value: "\"JS Samurai\", sans-serif" },
  { label: "JS Sangravee", value: "\"JS Sangravee\", sans-serif" },
  { label: "JS Saowapark", value: "\"JS Saowapark\", sans-serif" },
  { label: "JS Sarunya", value: "\"JS Sarunya\", sans-serif" },
  { label: "JS Setha", value: "\"JS Setha\", sans-serif" },
  { label: "JS Sirium", value: "\"JS Sirium\", sans-serif" },
  { label: "JS Sunsanee", value: "\"JS Sunsanee\", sans-serif" },
  { label: "JS Synjai", value: "\"JS Synjai\", sans-serif" },
  { label: "JS Thanaporn", value: "\"JS Thanaporn\", sans-serif" },
  { label: "JS Toomtam", value: "\"JS Toomtam\", sans-serif" },
  { label: "JS Wanida", value: "\"JS Wanida\", sans-serif" },
  { label: "JS Wannaree", value: "\"JS Wannaree\", sans-serif" },
  { label: "JS Wansika", value: "\"JS Wansika\", sans-serif" },
  { label: "JS Yodthida", value: "\"JS Yodthida\", sans-serif" },
  // ─── เพิ่มเติมจากแหล่งอื่น ───
  { label: "🖊 Playpen Sans Thai (ลายมือ 2024)", value: "\"Playpen Sans Thai\", cursive" },
  { label: "BoonBaan (ไทย-ลาว)", value: "\"BoonBaan\", sans-serif" },
  { label: "ThaiSans Neue", value: "\"ThaiSans Neue\", sans-serif" },
  { label: "Boon", value: "\"Boon\", sans-serif" },
  { label: "🖊 BoonJot (Comic Sans ไทย)", value: "\"BoonJot\", cursive" },
  { label: "🔥 BoonTook (หนาสุด)", value: "\"BoonTook\", sans-serif" },
  // ─── System / Latin ───
  { label: "Tahoma", value: "\"Tahoma\", sans-serif" },
  { label: "Arial", value: "\"Arial\", \"Helvetica\", sans-serif" },
  { label: "Comic Sans MS", value: "\"Comic Sans MS\", cursive" },
  { label: "Georgia (Serif)", value: "\"Georgia\", \"Times New Roman\", serif" },
  { label: "Courier (Mono)", value: "\"Courier New\", \"Consolas\", monospace" },
];

const FONT_SIZE_PRESETS = [10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72, 80, 96, 120];
const BACKGROUND_PRESETS = [
  { value: "transparent", label: "โปร่งใส" },
  { value: "rgba(255,255,255,0.92)", label: "ขาวนุ่ม" },
  { value: "rgba(17,17,17,0.82)", label: "ดำโปร่ง" },
  { value: "rgba(255,244,214,0.95)", label: "ครีมอ่อน" },
  { value: "rgba(255,235,140,0.96)", label: "เหลืองอ่อน" },
];

const FONT_STYLE_MAP = {
  shout: '"Chonburi", sans-serif',
  whisper: '"Itim", cursive',
  narration: '"Sarabun", sans-serif',
  handwritten: '"Sriracha", cursive',
  comic: '"BoonJot", cursive',
  bold_display: '"Chonburi", sans-serif',
  normal: null,
};

let textMeasureContext = null;
let toastSequence = 0;
const _ipcCleanups = [];  // Store IPC listener cleanup functions.
let _stageResizeObserver = null;
let _pdfPageRequestId = 0;  // Increments on each openPdfPage to discard stale responses.
let _pendingUnsavedDialogResolve = null;
let _lastRegionPointerRegionId = null;
let _lastRegionPointerAt = 0;
let _pendingTranslationModeResolve = null;
let _historyPersistTimer = null;
let _ocrIndexRunId = 0;
const _ocrPendingRequests = new Map();
let _translationMemorySyncTimer = null;
let _translationMemorySyncInFlight = null;
let _queuedTranslationMemorySyncOptions = null;
const _translationMemorySyncFingerprints = new Map();

const state = {
  apiKey: localStorage.getItem("geminiApiKey") || "",
  theme: localStorage.getItem("uiTheme") || "dark",
  projectPath: null,
  source: null,
  image: null,
  pdf: null,
  cleanedImageUrl: null,
  recentFiles: [],
  regions: [],
  selectedRegionId: null,
  dragContext: null,
  inlineEditingRegionId: null,
  pendingInlineFocusRegionId: null,
  pendingInlineSelectAllRegionId: null,
  isBusy: false,
  warnings: [],
  stageMetrics: null,
  undoStack: [],
  redoStack: [],
  zoomLevel: 1,
  inspectorDrawerOpen: false,
  userNotes: {},      // { [pageNumber]: "note text" }
  editHistory: [],    // [{ prompt, timestamp, pageNumber }]
  activityLog: [],    // Detailed action history for current source/project
  cacheIndex: {},     // { [pageKey]: { ...cache metadata } }
  ocrIndex: {},       // { [pageKey]: local OCR index + status }
  historySnapshots: {},      // { [activityId]: timeline snapshot }
  historyPageVersions: {},   // { [versionId]: page-state snapshot }
  historyAssets: {},         // { [assetId]: dataUrl }
  historyCurrentVersionMap: {}, // { [pageKey]: versionId }
  historyCursorId: "",
  translationPreferences: {
    mode: "current",
    customPagesInput: "",
    glossaryEntries: [],
  },
  isDirty: false,     // true when unsaved changes exist
};

const MAX_UNDO_STEPS = 50;
const ZOOM_MIN = 0.25;
const ZOOM_MAX = 4;
const ZOOM_STEP = 0.1;
const REGION_DOUBLE_CLICK_MS = 320;
const PAGED_SOURCE_KINDS = new Set(["pdf", "epub", "cbz", "zip", "cbr", "rar"]);
const ACTIVITY_LOG_LIMIT = 500;
const CACHE_PAGE_LIMIT = 400;
const HISTORY_STORAGE_PREFIX = "mangaStudio_history_cache_v1::";
const HISTORY_MERGE_WINDOW_MS = 1200;
const HISTORY_SNAPSHOT_LIMIT = 160;
const HISTORY_SNAPSHOT_VERSION = 1;
const OCR_BACKGROUND_DELAY_MS = 180;
const OCR_WARMUP_DISTANCE = 2;
const TM_SYNC_DEBOUNCE_MS = 900;
const TM_SYNC_PAGE_LIMIT = 96;
const TM_SYNC_ALL_PAGES_LIMIT = 320;
const IMAGE_EXPORT_FORMATS = {
  png: { mimeType: "image/png", extension: "png", label: "PNG" },
  jpg: { mimeType: "image/jpeg", extension: "jpg", label: "JPEG", quality: 0.92 },
  webp: { mimeType: "image/webp", extension: "webp", label: "WebP", quality: 0.92 },
  psd: { mimeType: "application/vnd.adobe.photoshop", extension: "psd", label: "PSD", binary: true },
};

const elements = {
  apiKeyInput: document.getElementById("apiKeyInput"),
  latestModelValue: document.getElementById("latestModelValue"),
  themeToggleButton: document.getElementById("themeToggleButton"),
  openButton: document.getElementById("openButton"),
  translateButton: document.getElementById("translateButton"),
  translateModeButton: document.getElementById("translateModeButton"),
  cleanOnlyButton: document.getElementById("cleanOnlyButton"),
  cleanSuggestButton: document.getElementById("cleanSuggestButton"),
  addRegionButton: document.getElementById("addRegionButton"),
  saveButton: document.getElementById("saveButton"),
  exportButton: document.getElementById("exportButton"),
  historyCacheButton: document.getElementById("historyCacheButton"),
  cleanPreviewToggle: document.getElementById("cleanPreviewToggle"),
  cleanOpacitySlider: document.getElementById("cleanOpacitySlider"),
  cleanOpacityValue: document.getElementById("cleanOpacityValue"),
  originalImage: document.getElementById("originalImage"),
  recentFilesSection: document.getElementById("recentFilesSection"),
  recentFilesList: document.getElementById("recentFilesList"),
  recentFilesEmpty: document.getElementById("recentFilesEmpty"),
  recentFilesClearButton: document.getElementById("recentFilesClearButton"),
  fileNameLabel: document.getElementById("fileNameLabel"),
  statusBanner: document.getElementById("statusBanner"),
  toastHost: document.getElementById("toastHost"),
  warningsBox: document.getElementById("warningsBox"),
  stageEmpty: document.getElementById("stageEmpty"),
  pdfPanel: document.getElementById("pdfPanel"),
  pdfMetaLabel: document.getElementById("pdfMetaLabel"),
  pdfSelectedLabel: document.getElementById("pdfSelectedLabel"),
  pdfSelectedCountPill: document.getElementById("pdfSelectedCountPill"),
  pdfActivePagePill: document.getElementById("pdfActivePagePill"),
  pdfPageGrid: document.getElementById("pdfPageGrid"),
  pdfPrevButton: document.getElementById("pdfPrevButton"),
  pdfNextButton: document.getElementById("pdfNextButton"),
  pdfPageInput: document.getElementById("pdfPageInput"),
  pdfJumpButton: document.getElementById("pdfJumpButton"),
  pdfClearSelectionButton: document.getElementById("pdfClearSelectionButton"),
  baseImage: document.getElementById("baseImage"),
  overlayLayer: document.getElementById("overlayLayer"),
  regionList: document.getElementById("regionList"),
  regionCountPill: document.getElementById("regionCountPill"),
  inspectorSection: document.getElementById("inspectorSection"),
  emptyInspector: document.getElementById("emptyInspector"),
  inspectorFields: document.getElementById("inspectorFields"),
  inspectorDrawer: null,
  inspectorToggleButton: null,
  acceptSuggestionButton: document.getElementById("acceptSuggestionButton"),
  deleteRegionButton: document.getElementById("deleteRegionButton"),
  kindInput: document.getElementById("kindInput"),
  sourceInput: document.getElementById("sourceInput"),
  translatedInput: document.getElementById("translatedInput"),
  fontFamilyInput: document.getElementById("fontFamilyInput"),
  fontPicker: document.getElementById("fontPicker"),
  fontPickerTrigger: document.getElementById("fontPickerTrigger"),
  fontPickerLabel: document.getElementById("fontPickerLabel"),
  fontPickerDropdown: document.getElementById("fontPickerDropdown"),
  fontPickerSearch: document.getElementById("fontPickerSearch"),
  fontPickerList: document.getElementById("fontPickerList"),
  fontSizeInput: document.getElementById("fontSizeInput"),
  fontSizeCustomInput: document.getElementById("fontSizeCustomInput"),
  alignmentInput: document.getElementById("alignmentInput"),
  textColorInput: document.getElementById("textColorInput"),
  backgroundColorInput: document.getElementById("backgroundColorInput"),
  textStrokeColorInput: document.getElementById("textStrokeColorInput"),
  textStrokeWidthInput: document.getElementById("textStrokeWidthInput"),
  textShadowColorInput: document.getElementById("textShadowColorInput"),
  textShadowBlurInput: document.getElementById("textShadowBlurInput"),
  notesInput: document.getElementById("notesInput"),
  userNoteInput: document.getElementById("userNoteInput"),
  undoButton: document.getElementById("undoButton"),
  redoButton: document.getElementById("redoButton"),
  autoSaveToggle: document.getElementById("autoSaveToggle"),
  autoSaveInterval: document.getElementById("autoSaveInterval"),
  previewButton: document.getElementById("previewButton"),
  previewModal: document.getElementById("previewModal"),
  previewBefore: document.getElementById("previewBefore"),
  previewAfter: document.getElementById("previewAfter"),
  previewSlider: document.getElementById("previewSlider"),
  previewCompare: document.getElementById("previewCompare"),
  previewExportButton: document.getElementById("previewExportButton"),
  previewCloseButton: document.getElementById("previewCloseButton"),
  translatingOverlay: document.getElementById("translatingOverlay"),
  translatingLabel: document.getElementById("translatingLabel"),
  translatingProgressBar: document.getElementById("translatingProgressBar"),
  translatingPercent: document.getElementById("translatingPercent"),
  translatingStep: document.getElementById("translatingStep"),
  closeDialog: document.getElementById("closeDialog"),
  closeDialogTitle: document.querySelector("#closeDialog .close-dialog__title"),
  closeDialogMessage: document.querySelector("#closeDialog .close-dialog__message"),
  closeSaveButton: document.getElementById("closeSaveBtn"),
  closeDiscardButton: document.getElementById("closeDiscardBtn"),
  closeCancelButton: document.getElementById("closeCancelBtn"),
  translationModeModal: document.getElementById("translationModeModal"),
  translationModeCloseButton: document.getElementById("translationModeCloseButton"),
  translationModeCancelButton: document.getElementById("translationModeCancelButton"),
  translationModeConfirmButton: document.getElementById("translationModeConfirmButton"),
  translationPagesInput: document.getElementById("translationPagesInput"),
  historyCacheDrawer: document.getElementById("historyCacheDrawer"),
  historyCacheCloseButton: document.getElementById("historyCacheCloseButton"),
  historyActionList: document.getElementById("historyActionList"),
  historyCacheList: document.querySelector("#historyCacheDrawer .history-cache-grid"),
  historyCacheSize: document.getElementById("historyCacheSize"),
  historyScopeBadge: document.getElementById("historyScopeBadge"),
  historyActionCount: document.getElementById("historyActionCount"),
  historyCacheCount: document.getElementById("historyCacheItems"),
  historyRenderedPages: document.getElementById("historyRenderedPages"),
  historySnapshots: document.getElementById("historySnapshots"),
  historyRecentCount: document.getElementById("historyRecentCount"),
  historyLastSync: document.getElementById("historyLastSync"),
};

function applyTheme() {
  document.body.dataset.theme = state.theme;
  elements.themeToggleButton.textContent = state.theme === "light" ? "โหมดมืด" : "โหมดสว่าง";
  elements.themeToggleButton.setAttribute("aria-pressed", String(state.theme === "dark"));
}

function toggleTheme() {
  state.theme = state.theme === "light" ? "dark" : "light";
  localStorage.setItem("uiTheme", state.theme);
  applyTheme();
}

function syncSuggestProviderControls() {
  // Suggest now always uses Gemini OCR + SQL RAG.
}

function getModelBadgeLabel() {
  return `${DEFAULT_MODEL_BADGE} + SQL RAG`;
}

function syncInspectorDrawer() {
  const isOpen = Boolean(state.inspectorDrawerOpen);

  if (elements.inspectorDrawer) {
    elements.inspectorDrawer.classList.toggle("hidden", !isOpen);
  }

  if (elements.inspectorToggleButton) {
    elements.inspectorToggleButton.textContent = isOpen ? "-" : "+";
    elements.inspectorToggleButton.classList.toggle("is-open", isOpen);
    elements.inspectorToggleButton.setAttribute("aria-expanded", String(isOpen));
    elements.inspectorToggleButton.dataset.tip = isOpen ? "ซ่อนแผงแก้ไข" : "แสดงแผงแก้ไข";
  }
}

function toggleInspectorDrawer(forceOpen = null) {
  state.inspectorDrawerOpen = typeof forceOpen === "boolean"
    ? forceOpen
    : !state.inspectorDrawerOpen;

  syncInspectorDrawer();

  if (state.inspectorDrawerOpen) {
    renderInspector();
  }
}

function setupInspectorDrawer() {
  const inspectorSection = elements.inspectorSection;
  const regionsSection = elements.regionList?.closest(".editor__section");
  const regionsHead = regionsSection?.querySelector(".editor__head");

  if (!inspectorSection || !regionsSection || !regionsHead) {
    return;
  }

  let actions = regionsHead.querySelector(".editor__head-actions");
  if (!actions) {
    actions = document.createElement("div");
    actions.className = "editor__head-actions";
    regionsHead.appendChild(actions);
  }

  let toggleButton = document.getElementById("inspectorToggleButton");
  if (!toggleButton) {
    toggleButton = document.createElement("button");
    toggleButton.id = "inspectorToggleButton";
    toggleButton.type = "button";
    toggleButton.className = "btn btn--ghost btn--xs editor__head-toggle";
    actions.appendChild(toggleButton);
  }

  let drawer = document.getElementById("inspectorDrawer");
  if (!drawer) {
    drawer = document.createElement("div");
    drawer.id = "inspectorDrawer";
    drawer.className = "editor__inspector-drawer hidden";
    regionsHead.insertAdjacentElement("afterend", drawer);
  }

  elements.inspectorDrawer = drawer;
  elements.inspectorToggleButton = toggleButton;

  regionsHead.classList.add("editor__head--regions");
  inspectorSection.classList.remove("editor__section");
  inspectorSection.classList.add("editor__inspector");
  inspectorSection.querySelector(".editor__head")?.classList.add("editor__head--inspector");

  if (inspectorSection.parentElement !== drawer) {
    drawer.appendChild(inspectorSection);
  }

  toggleButton.addEventListener("click", () => toggleInspectorDrawer());
  syncInspectorDrawer();
}

function setStatus(message, tone = "default") {
  elements.statusBanner.textContent = message;
  if (tone === "error") {
    elements.statusBanner.style.background = "var(--danger-soft)";
    elements.statusBanner.style.color = "var(--danger)";
    return;
  }
  if (tone === "success") {
    elements.statusBanner.style.background = "var(--success-soft)";
    elements.statusBanner.style.color = "var(--success)";
    return;
  }
  elements.statusBanner.style.background = "var(--accent-soft)";
  elements.statusBanner.style.color = "var(--accent-text)";
}

function showToast({ title, message, tone = "success", duration = 5200 } = {}) {
  if (!elements.toastHost || !message) {
    return;
  }

  const toast = document.createElement("div");
  toast.className = `toast toast--${tone}`;
  toast.dataset.toastId = `toast_${toastSequence += 1}`;
  toast.setAttribute("role", "status");

  const body = document.createElement("div");
  body.className = "toast__body";

  if (title) {
    const titleElement = document.createElement("div");
    titleElement.className = "toast__title";
    titleElement.textContent = title;
    body.appendChild(titleElement);
  }

  const messageElement = document.createElement("div");
  messageElement.className = "toast__message";
  messageElement.textContent = message;
  body.appendChild(messageElement);

  const closeButton = document.createElement("button");
  closeButton.type = "button";
  closeButton.className = "toast__close";
  closeButton.setAttribute("aria-label", "Dismiss notification");
  closeButton.textContent = "×";

  let removed = false;
  const removeToast = () => {
    if (removed) {
      return;
    }
    removed = true;
    toast.classList.remove("toast--visible");
    window.setTimeout(() => {
      toast.remove();
    }, 180);
  };

  closeButton.addEventListener("click", removeToast);
  toast.append(body, closeButton);
  elements.toastHost.appendChild(toast);

  while (elements.toastHost.children.length > 3) {
    elements.toastHost.firstElementChild?.remove();
  }

  window.requestAnimationFrame(() => {
    toast.classList.add("toast--visible");
  });

  if (duration > 0) {
    window.setTimeout(removeToast, duration);
  }
}

function renderWarnings() {
  if (state.warnings.length === 0) {
    elements.warningsBox.classList.add("hidden");
    elements.warningsBox.innerHTML = "";
    return;
  }

  elements.warningsBox.classList.remove("hidden");
  elements.warningsBox.innerHTML = state.warnings
    .map((warning) => `<div>${escapeHtml(String(warning))}</div>`)
    .join("");
}

function setWarnings(warnings) {
  state.warnings = Array.isArray(warnings) ? warnings.map((warning) => String(warning)) : [];
  renderWarnings();
  persistActivePdfPageState();
}

function isTransparentColor(value) {
  const normalized = String(value || "").trim().toLowerCase().replace(/\s+/g, "");
  return !normalized || normalized === "transparent" || normalized === "rgba(0,0,0,0)" || normalized === "rgba(255,255,255,0)";
}

function shouldPaintRegionBackground(region, { usingCleanBase = false, forExport = false } = {}) {
  if (!region || isTransparentColor(region.background_color)) {
    return false;
  }
  // For export/preview canvas: never paint background when using clean base.
  if (usingCleanBase && forExport) {
    return false;
  }
  // When using clean base, don't paint background.
  if (usingCleanBase) {
    return false;
  }
  return true;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#39;");
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function getTextMeasureContext() {
  if (!textMeasureContext) {
    const canvas = document.createElement("canvas");
    textMeasureContext = canvas.getContext("2d");
  }
  return textMeasureContext;
}

function stripExtension(fileName) {
  return String(fileName || "page").replace(/\.[^.]+$/, "");
}

function normalizeRecentFile(file, index) {
  return {
    id: file.id || `recent_${index + 1}`,
    path: String(file.path || ""),
    name: String(file.name || "Untitled"),
    directory: String(file.directory || ""),
    kind: ["project", "pdf", "image", "epub", "cbz", "zip", "cbr", "rar"].includes(file.kind) ? file.kind : "image",
    openedAt: String(file.openedAt || ""),
  };
}

function isPagedSourceKind(kind = state.source?.kind) {
  return PAGED_SOURCE_KINDS.has(String(kind || "").toLowerCase());
}

function getSourceKindLabel(kind) {
  const normalized = String(kind || "").toLowerCase();
  if (normalized === "project") return "โปรเจกต์";
  if (normalized === "pdf") return "PDF";
  if (normalized === "epub") return "EPUB";
  if (normalized === "cbz") return "CBZ";
  if (normalized === "zip") return "ZIP";
  if (normalized === "cbr") return "CBR";
  if (normalized === "rar") return "RAR";
  return "ภาพ";
}

function resetActivityTracking() {
  if (_historyPersistTimer) {
    clearTimeout(_historyPersistTimer);
    _historyPersistTimer = null;
  }
  state.activityLog = [];
  state.cacheIndex = {};
  state.historySnapshots = {};
  state.historyPageVersions = {};
  state.historyAssets = {};
  state.historyCurrentVersionMap = {};
  state.historyCursorId = "";
}

function resetOcrTracking() {
  _ocrIndexRunId += 1;
  _ocrPendingRequests.clear();
  state.ocrIndex = {};
}

function getSourceHistoryStorageKey() {
  if (!state.source) {
    return "";
  }
  const sourceId = state.source.path || `${state.source.kind}:${state.source.name}`;
  return `${HISTORY_STORAGE_PREFIX}${state.source.kind}::${sourceId}`;
}

function loadHistoryCacheForCurrentSource() {
  resetActivityTracking();
  const storageKey = getSourceHistoryStorageKey();
  if (!storageKey) {
    return;
  }

  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) {
      return;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed.activityLog)) {
      state.activityLog = parsed.activityLog.slice(0, ACTIVITY_LOG_LIMIT);
    }
    if (parsed.cacheIndex && typeof parsed.cacheIndex === "object") {
      state.cacheIndex = { ...parsed.cacheIndex };
      trimCacheIndexEntries();
    }
  } catch (error) {
    console.warn("loadHistoryCacheForCurrentSource failed:", error);
    resetActivityTracking();
  }
}

function persistHistoryCacheForCurrentSource({ immediate = false } = {}) {
  const storageKey = getSourceHistoryStorageKey();
  if (!storageKey) {
    return;
  }

  const doPersist = () => {
    try {
      localStorage.setItem(storageKey, JSON.stringify({
        version: 1,
        savedAt: new Date().toISOString(),
        source: state.source
          ? {
              path: state.source.path || "",
              name: state.source.name || "",
              kind: state.source.kind || "",
            }
          : null,
        activityLog: state.activityLog.slice(0, ACTIVITY_LOG_LIMIT),
        cacheIndex: state.cacheIndex,
      }));
    } catch (error) {
      console.warn("persistHistoryCacheForCurrentSource failed:", error);
    }
  };

  if (immediate) {
    if (_historyPersistTimer) {
      clearTimeout(_historyPersistTimer);
      _historyPersistTimer = null;
    }
    doPersist();
    return;
  }

  if (_historyPersistTimer) {
    clearTimeout(_historyPersistTimer);
  }
  _historyPersistTimer = setTimeout(() => {
    _historyPersistTimer = null;
    doPersist();
  }, 250);
}

function getPageCacheKey(pageNumber = null) {
  if (!isPagedSourceKind()) {
    return "single";
  }

  const normalizedPageNumber = Number(pageNumber || state.pdf?.activePageNumber || 1);
  return String(Number.isFinite(normalizedPageNumber) ? normalizedPageNumber : 1);
}

function getRagSourceMetadata(pageNumber = getCurrentPageNumber()) {
  const normalizedPageNumber = Math.max(1, Math.round(Number(pageNumber || 1)));
  const sourceKind = String(state.source?.kind || "image").toLowerCase();
  const sourcePath = String(state.source?.path || "").trim();
  const sourceName = String(state.source?.name || state.image?.name || "page").trim();
  const projectPath = String(state.projectPath || "").trim();
  const identity = sourcePath || projectPath || `${sourceKind}:${sourceName}`;
  return {
    documentKey: `${sourceKind}|${identity}`,
    sourceKind,
    sourcePath,
    sourceName,
    projectPath,
    pageNumber: normalizedPageNumber,
  };
}

function getCacheEntry(pageKey = getPageCacheKey(), { create = false } = {}) {
  const normalizedKey = String(pageKey || "single");
  if (!state.cacheIndex[normalizedKey] && create) {
    state.cacheIndex[normalizedKey] = {
      pageKey: normalizedKey,
      pageNumber: normalizedKey === "single" ? 1 : Number(normalizedKey),
      pageLabel: normalizedKey === "single" ? "ภาพหลัก" : `หน้า ${normalizedKey}`,
      translatedAt: "",
      cleanedAt: "",
      lastActionAt: "",
      lastAction: "",
      lastActionDetails: "",
      modelUsed: "",
      regionsCount: 0,
      manualEditCount: 0,
      noteCount: 0,
      exports: [],
      modifications: [],
      hasCleanedImage: false,
      hasRenderedImage: false,
      hasSuggestedRegions: false,
      suggestedRegionCount: 0,
      ocrStatus: "idle",
      ocrIndexedAt: "",
      ocrBlockCount: 0,
      ocrAvgConfidence: 0,
    };
  }
  return state.cacheIndex[normalizedKey] || null;
}

function trimList(list, maxItems) {
  if (!Array.isArray(list)) {
    return [];
  }
  return list.slice(0, maxItems);
}

function trimCacheIndexEntries() {
  const entries = Object.entries(state.cacheIndex || {});
  if (entries.length <= CACHE_PAGE_LIMIT) {
    return;
  }

  const trimmedEntries = entries
    .sort((left, right) => {
      const leftAt = new Date(left[1]?.lastActionAt || 0).getTime();
      const rightAt = new Date(right[1]?.lastActionAt || 0).getTime();
      return rightAt - leftAt;
    })
    .slice(0, CACHE_PAGE_LIMIT);

  state.cacheIndex = Object.fromEntries(trimmedEntries);
}

function describeRegionPatch(patch) {
  if (!patch || typeof patch !== "object") {
    return "อัปเดตกล่องข้อความ";
  }

  const descriptions = [];
  if (Object.prototype.hasOwnProperty.call(patch, "translated_text")) {
    const preview = String(patch.translated_text || "").trim();
    descriptions.push(`ข้อความแปล: ${preview ? preview.slice(0, 60) : "(ว่าง)"}`);
  }
  if (Object.prototype.hasOwnProperty.call(patch, "kind")) {
    descriptions.push(`ประเภท: ${patch.kind || "dialogue"}`);
  }
  if (Object.prototype.hasOwnProperty.call(patch, "font_family")) {
    descriptions.push(`ฟอนต์: ${String(patch.font_family || THAI_FONT_FAMILY).replace(/"/g, "")}`);
  }
  if (Object.prototype.hasOwnProperty.call(patch, "font_size")) {
    descriptions.push(`ขนาดฟอนต์: ${patch.font_size}px`);
  }
  if (Object.prototype.hasOwnProperty.call(patch, "alignment")) {
    descriptions.push(`จัดวาง: ${patch.alignment}`);
  }
  if (Object.prototype.hasOwnProperty.call(patch, "text_color")) {
    descriptions.push(`สีข้อความ: ${patch.text_color}`);
  }
  if (Object.prototype.hasOwnProperty.call(patch, "background_color")) {
    descriptions.push(`สีพื้นหลัง: ${patch.background_color}`);
  }
  if (Object.prototype.hasOwnProperty.call(patch, "text_stroke_color")) {
    descriptions.push(`สีขอบ: ${patch.text_stroke_color}`);
  }
  if (Object.prototype.hasOwnProperty.call(patch, "text_stroke_width")) {
    descriptions.push(`ความหนาขอบ: ${patch.text_stroke_width}`);
  }
  if (Object.prototype.hasOwnProperty.call(patch, "text_shadow_color")) {
    descriptions.push(`สีเงา: ${patch.text_shadow_color}`);
  }
  if (Object.prototype.hasOwnProperty.call(patch, "text_shadow_blur")) {
    descriptions.push(`เงาเบลอ: ${patch.text_shadow_blur}`);
  }
  if (Object.prototype.hasOwnProperty.call(patch, "notes")) {
    descriptions.push(`โน้ตกล่อง: ${String(patch.notes || "").trim() || "(ล้างโน้ต)"}`);
  }

  return descriptions.length > 0 ? descriptions.join(" | ") : "อัปเดตกล่องข้อความ";
}

function updateCacheEntry(pageKey, updater) {
  const entry = getCacheEntry(pageKey, { create: true });
  if (!entry) {
    return null;
  }

  if (typeof updater === "function") {
    updater(entry);
  } else if (updater && typeof updater === "object") {
    Object.assign(entry, updater);
  }

  entry.lastActionAt = new Date().toISOString();
  trimCacheIndexEntries();
  persistHistoryCacheForCurrentSource();
  return entry;
}

function recordActivity(type, {
  title = type,
  details = "",
  pageKey = getPageCacheKey(),
  regionId = "",
  mergeKey = "",
  meta = {},
  snapshotPageState = null,
  captureSnapshot = true,
  capturePageVersion = true,
} = {}) {
  const now = Date.now();
  const entry = {
    id: `act_${now}_${Math.random().toString(36).slice(2, 8)}`,
    type,
    title,
    details,
    pageKey: String(pageKey || "single"),
    regionId: regionId || "",
    mergeKey: mergeKey || `${type}:${pageKey}:${regionId || "-"}`,
    timestamp: new Date(now).toISOString(),
    timestampMs: now,
    count: 1,
    meta: meta && typeof meta === "object" ? meta : {},
  };

  let targetEntry = entry;
  const previous = state.activityLog[0];
  if (
    previous
    && previous.mergeKey === entry.mergeKey
    && (now - Number(previous.timestampMs || 0)) <= HISTORY_MERGE_WINDOW_MS
  ) {
    previous.timestamp = entry.timestamp;
    previous.timestampMs = entry.timestampMs;
    previous.title = entry.title;
    previous.details = entry.details;
    previous.count = Number(previous.count || 1) + 1;
    previous.meta = { ...previous.meta, ...entry.meta };
    targetEntry = previous;
  } else {
    state.activityLog.unshift(entry);
    if (state.activityLog.length > ACTIVITY_LOG_LIMIT) {
      state.activityLog.length = ACTIVITY_LOG_LIMIT;
    }
  }

  const resolvedPageKey = String(targetEntry.pageKey || "single");
  const pageStateSnapshot = buildPageStateSnapshotForHistory(resolvedPageKey, snapshotPageState);

  updateCacheEntry(resolvedPageKey, (cacheEntry) => {
    cacheEntry.pageNumber = resolvedPageKey === "single" ? 1 : Number(resolvedPageKey) || cacheEntry.pageNumber || 1;
    cacheEntry.pageLabel = getHistoryPageLabel(resolvedPageKey);
    cacheEntry.lastAction = title;
    cacheEntry.lastActionDetails = details;
    cacheEntry.hasRenderedImage = Boolean(pageStateSnapshot?.image);
    cacheEntry.hasCleanedImage = Boolean(pageStateSnapshot?.cleanedImageUrl);
    cacheEntry.regionsCount = Array.isArray(pageStateSnapshot?.regions)
      ? pageStateSnapshot.regions.length
      : Number(cacheEntry.regionsCount || 0);
    cacheEntry.suggestedRegionCount = Array.isArray(pageStateSnapshot?.regions)
      ? pageStateSnapshot.regions.filter((region) => region?.review_state === "suggested").length
      : Number(cacheEntry.suggestedRegionCount || 0);
    cacheEntry.hasSuggestedRegions = Number(cacheEntry.suggestedRegionCount || 0) > 0;
    cacheEntry.noteCount = state.userNotes?.[resolvedPageKey] ? 1 : 0;
    if (type === "translate-success") {
      cacheEntry.translatedAt = entry.timestamp;
      cacheEntry.modelUsed = entry.meta.modelUsed || cacheEntry.modelUsed || "";
      cacheEntry.regionsCount = Number(entry.meta.regionsCount || cacheEntry.regionsCount || 0);
    }
    if (type === "clean-success") {
      cacheEntry.cleanedAt = entry.timestamp;
      cacheEntry.hasCleanedImage = true;
    }
    if (type === "clean-suggest") {
      cacheEntry.cleanedAt = entry.timestamp;
      cacheEntry.hasCleanedImage = true;
      cacheEntry.hasSuggestedRegions = true;
      cacheEntry.suggestedRegionCount = Number(entry.meta.suggestedRegions || cacheEntry.suggestedRegionCount || 0);
    }
    if (["region-edit", "region-add", "region-remove", "page-note", "suggest-review"].includes(type)) {
      cacheEntry.manualEditCount = Number(cacheEntry.manualEditCount || 0) + 1;
    }
    if (["region-edit", "region-add", "region-remove", "page-note", "translate-success", "clean-success", "clean-suggest", "suggest-review", "edit-image", "export"].includes(type)) {
      cacheEntry.modifications = trimList([
        `${entry.timestamp} - ${title}${details ? `: ${details}` : ""}`,
        ...(cacheEntry.modifications || []),
      ], 24);
    }
    if (type === "page-rendered") {
      cacheEntry.hasRenderedImage = true;
      cacheEntry.pageLabel = cacheEntry.pageLabel || `หน้า ${entry.pageKey}`;
    }
    if (type === "export") {
      const format = entry.meta.format || "";
      if (format) {
        cacheEntry.exports = trimList([format, ...(cacheEntry.exports || []).filter((item) => item !== format)], 8);
      }
    }
  });

  if (captureSnapshot) {
    storeHistorySnapshotForEntry(targetEntry, {
      pageKey: resolvedPageKey,
      snapshotPageState: pageStateSnapshot,
      capturePageVersion,
    });
  } else {
    state.historyCursorId = targetEntry.id;
  }

  persistHistoryCacheForCurrentSource();
  return targetEntry;
}

function estimateCacheSizeBytes() {
  let total = 0;
  if (state.image?.dataUrl) {
    total += Math.floor(state.image.dataUrl.length * 0.75);
  }
  if (state.cleanedImageUrl) {
    total += Math.floor(state.cleanedImageUrl.length * 0.75);
  }
  if (state.pdf?.pageStates) {
    for (const pageState of Object.values(state.pdf.pageStates)) {
      if (pageState?.image?.dataUrl) {
        total += Math.floor(pageState.image.dataUrl.length * 0.75);
      }
      if (pageState?.cleanedImageUrl) {
        total += Math.floor(pageState.cleanedImageUrl.length * 0.75);
      }
    }
  }
  if (state.historyAssets && typeof state.historyAssets === "object") {
    for (const assetDataUrl of Object.values(state.historyAssets)) {
      if (typeof assetDataUrl === "string" && assetDataUrl) {
        total += Math.floor(assetDataUrl.length * 0.75);
      }
    }
  }
  return total;
}

function formatBytes(value) {
  const bytes = Number(value || 0);
  if (bytes <= 0) {
    return "0 MB";
  }
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) {
    return `${mb.toFixed(1)} MB`;
  }
  return `${(bytes / 1024).toFixed(0)} KB`;
}

function formatHistoryTime(isoString) {
  if (!isoString) {
    return "-";
  }
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function renderHistoryCache() {
  if (elements.historyScopeBadge) {
    elements.historyScopeBadge.textContent = state.source
      ? `${getSourceKindLabel(state.source.kind)} • ${state.source.name}`
      : "Current project";
  }
  if (elements.historyActionCount) {
    elements.historyActionCount.textContent = String(state.activityLog.length);
  }
  if (elements.historyCacheCount) {
    elements.historyCacheCount.textContent = `${Object.keys(state.cacheIndex || {}).length} รายการ`;
  }
  if (elements.historyCacheSize) {
    elements.historyCacheSize.textContent = formatBytes(estimateCacheSizeBytes());
  }
  if (elements.historyRenderedPages) {
    const renderedCount = Object.values(state.cacheIndex || {}).filter((entry) => entry.hasRenderedImage).length;
    elements.historyRenderedPages.textContent = String(renderedCount);
  }
  if (elements.historySnapshots) {
    elements.historySnapshots.textContent = String(Object.keys(state.historySnapshots || {}).length);
  }
  if (elements.historyRecentCount) {
    elements.historyRecentCount.textContent = String(state.recentFiles.length);
  }
  if (elements.historyLastSync) {
    elements.historyLastSync.textContent = state.activityLog[0]?.timestamp
      ? formatHistoryTime(state.activityLog[0].timestamp)
      : "-";
  }

  if (elements.historyActionList) {
    if (state.activityLog.length === 0) {
      elements.historyActionList.innerHTML = `
        <article class="history-item">
          <span class="history-item__time">ตอนนี้</span>
          <div class="history-item__body">
            <strong>Ready</strong>
            <p>ยังไม่มี action ที่ถูกบันทึกในโปรเจกต์นี้</p>
          </div>
        </article>
      `;
    } else {
      elements.historyActionList.innerHTML = state.activityLog
        .slice(0, 80)
        .map((entry) => {
          const hasSnapshot = Boolean(state.historySnapshots?.[entry.id]);
          const isCurrent = entry.id === state.historyCursorId;
          const pageLabel = getHistoryPageLabel(entry.pageKey);
          const regionBadge = entry.regionId ? `Region ${entry.regionId.replace(/^region_/, "#")}` : "";
          return `
            <button
              type="button"
              class="history-item history-item--button${isCurrent ? " is-current" : ""}"
              data-history-entry-id="${escapeHtml(entry.id)}"
              ${hasSnapshot ? "" : "disabled"}
              title="${hasSnapshot ? "คลิกเพื่อย้อนกลับไปที่จุดนี้" : "รายการนี้ยังไม่มี snapshot"}"
            >
              <span class="history-item__time">${escapeHtml(formatHistoryTime(entry.timestamp))}</span>
              <div class="history-item__body">
                <div class="history-item__headline">
                  <strong>${escapeHtml(entry.title)}${entry.count > 1 ? ` ×${entry.count}` : ""}</strong>
                  <span class="history-item__restore">${isCurrent ? "ตอนนี้" : hasSnapshot ? "ย้อนกลับได้" : "บันทึกอย่างเดียว"}</span>
                </div>
                <p>${escapeHtml(entry.details || "ไม่มีรายละเอียดเพิ่มเติม")}</p>
                <div class="history-item__meta">
                  <span class="history-item__badge">${escapeHtml(pageLabel)}</span>
                  ${regionBadge ? `<span class="history-item__badge">${escapeHtml(regionBadge)}</span>` : ""}
                  <span class="history-item__badge">${escapeHtml(entry.type)}</span>
                </div>
              </div>
            </button>
          `;
        })
        .join("");
    }
  }

  if (elements.historyCacheList) {
    const cacheEntries = Object.values(state.cacheIndex || {})
      .sort((left, right) => String(left.pageKey).localeCompare(String(right.pageKey), undefined, { numeric: true }));

    if (cacheEntries.length === 0) {
      elements.historyCacheList.innerHTML = `
        <div class="history-cache-grid">
          <div class="history-metric">
            <span class="history-metric__label">Cache</span>
            <strong class="history-metric__value">ยังไม่มีข้อมูล</strong>
          </div>
        </div>
      `;
    } else {
      elements.historyCacheList.innerHTML = cacheEntries
        .map((entry) => `
          <div class="history-metric">
            <span class="history-metric__label">${escapeHtml(entry.pageLabel || `หน้า ${entry.pageKey}`)}</span>
            <strong class="history-metric__value">${escapeHtml(entry.lastAction || "ยังไม่ถูกแตะ")}</strong>
            <span class="history-stat__hint">
              regions ${escapeHtml(String(entry.regionsCount || 0))} • edits ${escapeHtml(String(entry.manualEditCount || 0))}
              ${entry.exports?.length ? `• export ${escapeHtml(entry.exports.join(", "))}` : ""}
            </span>
            ${entry.modifications?.length
              ? `<span class="history-stat__hint">${escapeHtml(entry.modifications[0])}</span>`
              : ""}
          </div>
        `)
        .join("");
    }
  }
}

function getHistoryEntryById(entryId) {
  return state.activityLog.find((entry) => entry.id === entryId) || null;
}

function getHistoryPageLabel(pageKey) {
  if (!pageKey || pageKey === "single") {
    return "ภาพหลัก";
  }
  return `หน้า ${pageKey}`;
}

function syncWorkspaceCacheStateFromCurrentState() {
  if (!state.source) {
    return;
  }

  if (!isPagedSourceKind()) {
    updateCacheEntry("single", {
      pageNumber: 1,
      pageLabel: "ภาพหลัก",
      regionsCount: state.regions.length,
      noteCount: state.userNotes?.single ? 1 : 0,
      hasCleanedImage: Boolean(state.cleanedImageUrl),
      hasRenderedImage: Boolean(state.image),
      suggestedRegionCount: state.regions.filter((region) => region?.review_state === "suggested").length,
      hasSuggestedRegions: state.regions.some((region) => region?.review_state === "suggested"),
    });
    return;
  }

  for (const [pageKey, pageState] of Object.entries(state.pdf?.pageStates || {})) {
    updateCacheEntry(pageKey, {
      pageNumber: Number(pageKey),
      pageLabel: `หน้า ${pageKey}`,
      regionsCount: Array.isArray(pageState?.regions) ? pageState.regions.length : 0,
      noteCount: state.userNotes?.[pageKey] ? 1 : 0,
      hasCleanedImage: Boolean(pageState?.cleanedImageUrl),
      hasRenderedImage: Boolean(pageState?.image),
      suggestedRegionCount: Array.isArray(pageState?.regions)
        ? pageState.regions.filter((region) => region?.review_state === "suggested").length
        : 0,
      hasSuggestedRegions: Array.isArray(pageState?.regions)
        ? pageState.regions.some((region) => region?.review_state === "suggested")
        : false,
    });
  }
}

function getCurrentPageNumber() {
  if (isPagedSourceKind()) {
    return Number(state.pdf?.activePageNumber || 1);
  }
  return Number(state.image?.pageNumber || 1);
}

function getOcrPageKey(pageNumber = null) {
  if (!isPagedSourceKind()) {
    return "single";
  }
  const normalizedPageNumber = Number(pageNumber || state.pdf?.activePageNumber || 1);
  return String(Number.isFinite(normalizedPageNumber) ? Math.max(1, Math.round(normalizedPageNumber)) : 1);
}

function normalizeOcrPageEntry(pageData, pageKey = getOcrPageKey()) {
  const normalizedKey = String(pageKey || "single");
  const normalizedPageNumber = normalizedKey === "single"
    ? 1
    : Math.max(1, Math.round(Number(pageData?.page_number || normalizedKey || 1)));
  const blocks = Array.isArray(pageData?.blocks)
    ? pageData.blocks
      .map((block, index) => ({
        id: block?.id || `ocr_${normalizedKey}_${index + 1}`,
        page_number: Number.isFinite(Number(block?.page_number))
          ? Math.max(1, Math.round(Number(block.page_number)))
          : normalizedPageNumber,
        text: String(block?.text || "").trim(),
        confidence: Math.max(0, Math.min(1, Number(block?.confidence || 0))),
        x: clamp(Number(block?.x) || 0, 0, 1000),
        y: clamp(Number(block?.y) || 0, 0, 1000),
        width: clamp(Number(block?.width) || 10, 1, 1000),
        height: clamp(Number(block?.height) || 10, 1, 1000),
        polygon: Array.isArray(block?.polygon)
          ? block.polygon
            .map((point) => Array.isArray(point) && point.length >= 2
              ? [clamp(Number(point[0]) || 0, 0, 1000), clamp(Number(point[1]) || 0, 0, 1000)]
              : null)
            .filter(Boolean)
          : [],
      }))
      .filter((block) => block.text)
    : [];

  return {
    pageKey: normalizedKey,
    page_number: normalizedPageNumber,
    image_width: Math.max(1, Math.round(Number(pageData?.image_width || state.image?.width || 1))),
    image_height: Math.max(1, Math.round(Number(pageData?.image_height || state.image?.height || 1))),
    raw_text: String(pageData?.raw_text || "").trim(),
    blocks,
    avg_confidence: Math.max(0, Math.min(1, Number(pageData?.avg_confidence || 0))),
    engine_used: String(pageData?.engine_used || "gemini-vision-ocr"),
    warnings: Array.isArray(pageData?.warnings) ? pageData.warnings.map((warning) => String(warning)) : [],
    status: blocks.length > 0 ? "ready" : "empty",
    indexedAt: new Date().toISOString(),
  };
}

function syncOcrCacheEntry(pageKey, ocrEntry) {
  const normalizedKey = String(pageKey || "single");
  updateCacheEntry(normalizedKey, {
    ocrStatus: String(ocrEntry?.status || "idle"),
    ocrIndexedAt: ocrEntry?.indexedAt || "",
    ocrBlockCount: Array.isArray(ocrEntry?.blocks) ? ocrEntry.blocks.length : 0,
    ocrAvgConfidence: Math.max(0, Math.min(1, Number(ocrEntry?.avg_confidence || 0))),
  });
}

async function requestOcrForSourcePage(pageNumber = getCurrentPageNumber()) {
  const normalizedPageNumber = Math.max(1, Math.round(Number(pageNumber || 1)));
  const apiKey = String(elements.apiKeyInput?.value || "").trim();
  const ragSource = getRagSourceMetadata(normalizedPageNumber);
  const payload = {
    sourceKind: state.source?.kind || "image",
    filePath: state.source?.path || "",
    fileDataUrl: state.source?.dataUrl || "",
    imageDataUrl: !isPagedSourceKind()
      ? (state.image?.dataUrl || state.source?.dataUrl || "")
      : (normalizedPageNumber === Number(state.pdf?.activePageNumber || 0) ? (state.image?.dataUrl || "") : ""),
    fileName: state.source?.name || state.image?.name || "page.png",
    pageNumber: normalizedPageNumber,
    apiKey,
    documentKey: ragSource.documentKey,
  };
  return window.mangaStudio.ocrSourcePage(payload);
}

async function ensureOcrForPage(pageNumber = getCurrentPageNumber(), { force = false } = {}) {
  if (!state.source) {
    return null;
  }

  const normalizedPageNumber = Math.max(1, Math.round(Number(pageNumber || 1)));
  const pageKey = getOcrPageKey(normalizedPageNumber);
  const existing = state.ocrIndex[pageKey];
  if (!force && existing && ["ready", "empty"].includes(existing.status)) {
    return existing;
  }

  const pendingRequest = _ocrPendingRequests.get(pageKey);
  if (pendingRequest) {
    return pendingRequest;
  }

  state.ocrIndex[pageKey] = {
    ...(existing || {}),
    pageKey,
    page_number: normalizedPageNumber,
    status: "processing",
    warnings: Array.isArray(existing?.warnings) ? existing.warnings : [],
  };
  syncOcrCacheEntry(pageKey, state.ocrIndex[pageKey]);
  const runId = _ocrIndexRunId;
  const sourceSignature = state.source
    ? `${state.source.kind}:${state.source.path || state.source.name || ""}`
    : "";

  const request = (async () => {
    try {
      const ocrPage = await requestOcrForSourcePage(normalizedPageNumber);
      const normalized = normalizeOcrPageEntry(ocrPage, pageKey);
      const currentSignature = state.source
        ? `${state.source.kind}:${state.source.path || state.source.name || ""}`
        : "";
      if (runId !== _ocrIndexRunId || currentSignature !== sourceSignature) {
        return normalized;
      }
      state.ocrIndex[pageKey] = normalized;
      syncOcrCacheEntry(pageKey, normalized);
      return normalized;
    } catch (error) {
      const currentSignature = state.source
        ? `${state.source.kind}:${state.source.path || state.source.name || ""}`
        : "";
      if (runId !== _ocrIndexRunId || currentSignature !== sourceSignature) {
        throw error;
      }
      const failedEntry = {
        ...(existing || {}),
        pageKey,
        page_number: normalizedPageNumber,
        status: "error",
        warnings: [error.message || "OCR failed"],
        indexedAt: new Date().toISOString(),
        blocks: Array.isArray(existing?.blocks) ? existing.blocks : [],
        raw_text: String(existing?.raw_text || ""),
        avg_confidence: Number(existing?.avg_confidence || 0),
      };
      state.ocrIndex[pageKey] = failedEntry;
      syncOcrCacheEntry(pageKey, failedEntry);
      throw error;
    } finally {
      _ocrPendingRequests.delete(pageKey);
    }
  })();

  _ocrPendingRequests.set(pageKey, request);
  return request;
}

function buildBackgroundOcrQueue() {
  const queue = [];
  const seen = new Set();
  const addPage = (pageNumber) => {
    const normalizedPageNumber = Math.round(Number(pageNumber));
    if (!Number.isFinite(normalizedPageNumber)) {
      return;
    }
    if (state.pdf && (normalizedPageNumber < 1 || normalizedPageNumber > state.pdf.pageCount)) {
      return;
    }
    if (seen.has(normalizedPageNumber)) {
      return;
    }
    seen.add(normalizedPageNumber);
    queue.push(normalizedPageNumber);
  };

  const activePageNumber = getCurrentPageNumber();
  addPage(activePageNumber);

  if (isPagedSourceKind() && state.pdf) {
    for (let offset = 1; offset <= OCR_WARMUP_DISTANCE; offset += 1) {
      addPage(activePageNumber - offset);
      addPage(activePageNumber + offset);
    }
    for (const selectedPage of getSelectedPdfPages()) {
      addPage(selectedPage);
    }
  }

  return queue.filter((pageNumber) => {
    const entry = state.ocrIndex[getOcrPageKey(pageNumber)];
    return !entry || !["ready", "empty"].includes(entry.status);
  });
}

function startBackgroundOcrIndexing() {
  const apiKey = String(elements.apiKeyInput?.value || "").trim();
  if (!state.source || !apiKey) {
    return;
  }

  const runId = ++_ocrIndexRunId;
  const queue = buildBackgroundOcrQueue();
  if (queue.length === 0) {
    return;
  }

  void (async () => {
    for (const pageNumber of queue) {
      if (runId !== _ocrIndexRunId || !state.source) {
        return;
      }
      try {
        await ensureOcrForPage(pageNumber);
      } catch (error) {
        console.warn(`background OCR failed for page ${pageNumber}:`, error);
      }
      if (queue.length > 1) {
        await new Promise((resolve) => setTimeout(resolve, OCR_BACKGROUND_DELAY_MS));
      }
    }
  })();
}

function collectTranslationMemoryEntries({ includeSuggested = false, limit = 32 } = {}) {
  const entries = [];
  const seen = new Set();
  const pushEntries = (regions, pageKey) => {
    for (const region of regions || []) {
      const sourceText = String(region?.source_text || "").trim();
      const translatedText = String(region?.translated_text || "").trim();
      const reviewState = region?.review_state === "suggested" ? "suggested" : "approved";
      if (!sourceText || !translatedText) {
        continue;
      }
      if (!includeSuggested && reviewState === "suggested") {
        continue;
      }
      const pairKey = `${sourceText}::${translatedText}`;
      if (seen.has(pairKey)) {
        continue;
      }
      seen.add(pairKey);
      entries.push({
        source_text: sourceText,
        translated_text: translatedText,
        kind: String(region?.kind || ""),
        page_key: String(pageKey || getCurrentPageKey()),
        notes: String(region?.notes || ""),
        review_state: reviewState,
      });
      if (entries.length >= limit) {
        break;
      }
    }
  };

  if (isPagedSourceKind() && state.pdf) {
    persistActivePdfPageState();
    const pageKeys = Object.keys(state.pdf.pageStates || {}).sort((left, right) => Number(left) - Number(right));
    for (const pageKey of pageKeys) {
      const pageState = state.pdf.pageStates[pageKey];
      pushEntries(pageState?.regions, pageKey);
      if (entries.length >= limit) {
        break;
      }
    }
  } else {
    pushEntries(state.regions, "single");
  }

  return entries.slice(0, limit);
}

function collectApprovedTranslationEntries({ limit = 24 } = {}) {
  return collectTranslationMemoryEntries({ includeSuggested: false, limit });
}

function getRegionsForTranslationMemoryPage(pageKey = getCurrentPageKey()) {
  const normalizedPageKey = String(pageKey || getCurrentPageKey());
  if (!isPagedSourceKind()) {
    return Array.isArray(state.regions) ? state.regions : [];
  }
  if (normalizedPageKey === getCurrentPageKey()) {
    return Array.isArray(state.regions) ? state.regions : [];
  }
  const pageNumber = Number(normalizedPageKey);
  if (!Number.isFinite(pageNumber)) {
    return [];
  }
  const pageState = getPdfPageState(pageNumber, { create: false });
  return Array.isArray(pageState?.regions) ? pageState.regions : [];
}

function collectTranslationMemorySyncEntries({
  includeSuggested = false,
  pageKeys = null,
  limit = TM_SYNC_PAGE_LIMIT,
} = {}) {
  const entries = [];
  const seen = new Set();
  const normalizedPageKeys = Array.isArray(pageKeys) && pageKeys.length > 0
    ? [...new Set(pageKeys.map((pageKey) => String(pageKey || "")).filter(Boolean))]
    : (isPagedSourceKind() && state.pdf)
      ? Object.keys(state.pdf.pageStates || {}).sort((left, right) => Number(left) - Number(right))
      : ["single"];

  if (isPagedSourceKind()) {
    persistActivePdfPageState();
  }

  for (const pageKey of normalizedPageKeys) {
    for (const region of getRegionsForTranslationMemoryPage(pageKey)) {
      const sourceText = String(region?.source_text || "").trim();
      const translatedText = String(region?.translated_text || "").trim();
      const reviewState = region?.review_state === "suggested" ? "suggested" : "approved";
      if (!sourceText || !translatedText) {
        continue;
      }
      if (!includeSuggested && reviewState === "suggested") {
        continue;
      }
      const pairKey = `${pageKey}::${sourceText}::${translatedText}`;
      if (seen.has(pairKey)) {
        continue;
      }
      seen.add(pairKey);
      entries.push({
        source_text: sourceText,
        translated_text: translatedText,
        kind: String(region?.kind || ""),
        page_key: pageKey,
        notes: String(region?.notes || ""),
        review_state: reviewState,
      });
      if (entries.length >= limit) {
        return entries;
      }
    }
  }

  return entries;
}

function mergeTranslationMemorySyncOptions(baseOptions = {}, nextOptions = {}) {
  const merged = {
    allPages: Boolean(baseOptions.allPages || nextOptions.allPages),
    immediate: Boolean(baseOptions.immediate || nextOptions.immediate),
    pageKey: String(nextOptions.pageKey || baseOptions.pageKey || getCurrentPageKey()),
  };
  if (merged.allPages) {
    merged.pageKey = "all";
  }
  return merged;
}

async function flushTranslationMemorySync(options = {}) {
  if (!state.source) {
    return;
  }

  const normalizedOptions = mergeTranslationMemorySyncOptions({}, options);
  const entries = normalizedOptions.allPages
    ? collectTranslationMemorySyncEntries({ includeSuggested: false, limit: TM_SYNC_ALL_PAGES_LIMIT })
    : collectTranslationMemorySyncEntries({
        includeSuggested: false,
        pageKeys: [normalizedOptions.pageKey || getCurrentPageKey()],
        limit: TM_SYNC_PAGE_LIMIT,
      });

  if (entries.length === 0) {
    return;
  }

  const ragSource = getRagSourceMetadata(
    normalizedOptions.allPages
      ? getCurrentPageNumber()
      : Number(normalizedOptions.pageKey || getCurrentPageNumber())
  );
  const fingerprintScope = normalizedOptions.allPages ? "all" : String(normalizedOptions.pageKey || getCurrentPageKey());
  const fingerprintKey = `${ragSource.documentKey}::${fingerprintScope}`;
  const fingerprintValue = JSON.stringify(entries);
  if (_translationMemorySyncFingerprints.get(fingerprintKey) === fingerprintValue) {
    return;
  }

  await window.mangaStudio.upsertTranslationMemory({
    documentKey: ragSource.documentKey,
    sourceKind: ragSource.sourceKind,
    sourcePath: ragSource.sourcePath,
    sourceName: ragSource.sourceName,
    projectPath: ragSource.projectPath,
    entries,
  });
  _translationMemorySyncFingerprints.set(fingerprintKey, fingerprintValue);
}

function runTranslationMemorySync(options = {}) {
  const normalizedOptions = mergeTranslationMemorySyncOptions({}, options);
  if (_translationMemorySyncInFlight) {
    _queuedTranslationMemorySyncOptions = mergeTranslationMemorySyncOptions(
      _queuedTranslationMemorySyncOptions || {},
      normalizedOptions
    );
    return;
  }

  _translationMemorySyncInFlight = (async () => {
    try {
      await flushTranslationMemorySync(normalizedOptions);
    } catch (error) {
      console.warn("translation memory sync failed:", error);
    } finally {
      _translationMemorySyncInFlight = null;
      if (_queuedTranslationMemorySyncOptions) {
        const nextOptions = _queuedTranslationMemorySyncOptions;
        _queuedTranslationMemorySyncOptions = null;
        runTranslationMemorySync(nextOptions);
      }
    }
  })();
}

function scheduleTranslationMemorySync(options = {}) {
  const normalizedOptions = mergeTranslationMemorySyncOptions({}, options);
  if (_translationMemorySyncTimer) {
    clearTimeout(_translationMemorySyncTimer);
    _translationMemorySyncTimer = null;
  }

  if (normalizedOptions.immediate) {
    runTranslationMemorySync(normalizedOptions);
    return;
  }

  _translationMemorySyncTimer = setTimeout(() => {
    _translationMemorySyncTimer = null;
    runTranslationMemorySync(normalizedOptions);
  }, TM_SYNC_DEBOUNCE_MS);
}

function getNearbyOcrPages(centerPageNumber = getCurrentPageNumber(), { distance = 1, maxItems = 4 } = {}) {
  if (!isPagedSourceKind() || !state.pdf) {
    return [];
  }

  const nearby = [];
  for (let offset = 1; offset <= distance; offset += 1) {
    const previous = state.ocrIndex[getOcrPageKey(centerPageNumber - offset)];
    const next = state.ocrIndex[getOcrPageKey(centerPageNumber + offset)];
    if (previous?.status === "ready" || previous?.status === "empty") {
      nearby.push(previous);
    }
    if (next?.status === "ready" || next?.status === "empty") {
      nearby.push(next);
    }
  }
  return nearby.slice(0, maxItems);
}

function getGlossaryEntries() {
  return Array.isArray(state.translationPreferences?.glossaryEntries)
    ? state.translationPreferences.glossaryEntries
      .filter((entry) => entry && typeof entry === "object")
      .map((entry) => ({
        source: String(entry.source || entry.source_text || "").trim(),
        target: String(entry.target || entry.target_text || entry.translated_text || "").trim(),
        notes: String(entry.notes || "").trim(),
        lock: entry.lock !== false,
      }))
      .filter((entry) => entry.source && entry.target)
    : [];
}

function restoreHistoryEntry(entryId) {
  if (state.isBusy) {
    setStatus("รอให้การประมวลผลปัจจุบันเสร็จก่อนแล้วค่อยย้อนเวลา", "error");
    return;
  }

  if (entryId && entryId === state.historyCursorId) {
    setStatus("ตอนนี้คุณอยู่ที่จุดนี้อยู่แล้ว", "success");
    return;
  }

  const entry = getHistoryEntryById(entryId);
  const snapshot = state.historySnapshots?.[entryId];
  if (!entry || !snapshot) {
    setStatus("รายการนี้ยังไม่มี snapshot สำหรับย้อนเวลา", "error");
    return;
  }
  if (snapshot.sourceKind && snapshot.sourceKind !== state.source?.kind) {
    setStatus("snapshot นี้มาจากไฟล์คนละประเภท จึงกู้กลับไม่ได้", "error");
    return;
  }

  try {
    persistActivePdfPageState();
    clearInlineEditingState();
    resetRegionDoubleClickTracking();

    state.userNotes = snapshot.userNotes && typeof snapshot.userNotes === "object"
      ? { ...snapshot.userNotes }
      : {};
    state.translationPreferences = snapshot.translationPreferences && typeof snapshot.translationPreferences === "object"
      ? { ...state.translationPreferences, ...snapshot.translationPreferences }
      : { ...state.translationPreferences };
    if (typeof snapshot.zoomLevel === "number" && snapshot.zoomLevel > 0) {
      state.zoomLevel = snapshot.zoomLevel;
      applyZoom();
    }

    state.historyCurrentVersionMap = snapshot.versionMap && typeof snapshot.versionMap === "object"
      ? { ...snapshot.versionMap }
      : {};

    if (isPagedSourceKind()) {
      if (!state.pdf) {
        throw new Error("ยังไม่มีเอกสารหลายหน้าที่เปิดอยู่");
      }

      state.pdf.selectedPageNumbers = Array.isArray(snapshot.selectedPageNumbers)
        ? [...new Set(snapshot.selectedPageNumbers.map((pageNumber) => Number(pageNumber)).filter(Number.isFinite))].sort((left, right) => left - right)
        : [];
      state.pdf.pageStates = {};

      for (const [pageKey, versionId] of Object.entries(state.historyCurrentVersionMap)) {
        const pageVersion = state.historyPageVersions?.[versionId];
        if (!pageVersion) {
          continue;
        }
        state.pdf.pageStates[String(pageKey)] = restoreHistoryPageState(pageVersion);
      }

      const activePageNumber = Number(snapshot.activePageNumber);
      state.pdf.activePageNumber = Number.isFinite(activePageNumber) ? activePageNumber : null;
      if (state.pdf.activePageNumber) {
        const activePageState = getPdfPageState(state.pdf.activePageNumber, { create: false });
        if (activePageState?.image) {
          loadPdfPageState(state.pdf.activePageNumber);
        } else {
          state.image = null;
          resetTranslationState();
          setWarnings([]);
        }
      } else {
        state.image = null;
        resetTranslationState();
        setWarnings([]);
      }
    } else {
      const singleVersionId = state.historyCurrentVersionMap.single || "";
      const singleVersion = state.historyPageVersions?.[singleVersionId] || null;
      if (singleVersion) {
        const restoredPageState = restoreHistoryPageState(singleVersion);
        state.image = restoredPageState.image;
        state.cleanedImageUrl = restoredPageState.cleanedImageUrl;
        state.regions = restoredPageState.regions;
        state.selectedRegionId = restoredPageState.selectedRegionId || state.regions[0]?.id || null;
        setWarnings(restoredPageState.warnings || []);
      } else {
        state.cleanedImageUrl = null;
        state.regions = [];
        state.selectedRegionId = null;
        setWarnings([]);
      }
    }

    elements.cleanPreviewToggle.checked = Boolean(snapshot.cleanPreviewEnabled && state.cleanedImageUrl);
    state.undoStack = [];
    state.redoStack = [];
    state.isDirty = true;
    syncWorkspaceCacheStateFromCurrentState();

    recordActivity("history-restore", {
      title: "ย้อนกลับจาก Action history",
      details: `${entry.title} • ${formatHistoryTime(entry.timestamp)}`,
      pageKey: snapshot.currentPageKey || entry.pageKey || getCurrentPageKey(),
      mergeKey: `history-restore:${entryId}`,
      meta: {
        targetEntryId: entryId,
        targetTitle: entry.title,
        targetTimestamp: entry.timestamp,
      },
    });
    renderAll();
    setStatus(`ย้อนกลับไปที่ ${entry.title} แล้ว`, "success");
  } catch (error) {
    console.error("restoreHistoryEntry failed:", error);
    setStatus(error.message || "ย้อนกลับจาก history ไม่สำเร็จ", "error");
  }
}

function resetTranslationState() {
  state.cleanedImageUrl = null;
  state.regions = [];
  state.selectedRegionId = null;
  state.dragContext = null;
  clearInlineEditingState();
  resetRegionDoubleClickTracking();
  state.warnings = [];
  renderWarnings();
}

function resetDocumentSessionState() {
  state.undoStack = [];
  state.redoStack = [];
  state.userNotes = {};
  state.editHistory = [];
  if (_translationMemorySyncTimer) {
    clearTimeout(_translationMemorySyncTimer);
    _translationMemorySyncTimer = null;
  }
  _queuedTranslationMemorySyncOptions = null;
  _translationMemorySyncFingerprints.clear();
  resetActivityTracking();
  resetOcrTracking();
  state.isDirty = false;
  clearInlineEditingState();
  resetRegionDoubleClickTracking();
}

function getSelectedRegion() {
  return state.regions.find((region) => region.id === state.selectedRegionId) || null;
}

function clearInlineEditingState(regionId = null) {
  if (!regionId || state.inlineEditingRegionId === regionId) {
    state.inlineEditingRegionId = null;
  }
  if (!regionId || state.pendingInlineFocusRegionId === regionId) {
    state.pendingInlineFocusRegionId = null;
  }
  if (!regionId || state.pendingInlineSelectAllRegionId === regionId) {
    state.pendingInlineSelectAllRegionId = null;
  }
}

function enterInlineRegionEditing(regionId, { selectAll = false, shouldRender = true } = {}) {
  const region = state.regions.find((item) => item.id === regionId);
  if (!region) {
    return;
  }

  state.selectedRegionId = regionId;
  state.inlineEditingRegionId = regionId;
  state.pendingInlineFocusRegionId = regionId;
  state.pendingInlineSelectAllRegionId = selectAll ? regionId : null;
  persistActivePdfPageState();
  if (shouldRender) {
    renderAll();
  }
}

function commitInlineRegionEditing(regionId = state.inlineEditingRegionId, { shouldRender = true } = {}) {
  if (!regionId) {
    return;
  }

  clearInlineEditingState(regionId);
  persistActivePdfPageState();
  if (shouldRender) {
    renderAll();
  }
}

function focusPendingInlineEditor() {
  const regionId = state.pendingInlineFocusRegionId;
  if (!regionId) {
    return;
  }

  const editor = elements.overlayLayer?.querySelector(`[data-region-editor-id="${regionId}"]`);
  if (!editor) {
    return;
  }

  const shouldSelectAll = state.pendingInlineSelectAllRegionId === regionId;
  state.pendingInlineFocusRegionId = null;
  state.pendingInlineSelectAllRegionId = null;

  window.requestAnimationFrame(() => {
    editor.focus();
    if (shouldSelectAll && typeof editor.select === "function") {
      editor.select();
      return;
    }
    if (typeof editor.setSelectionRange === "function") {
      const end = editor.value.length;
      editor.setSelectionRange(end, end);
    }
  });
}

function resetRegionDoubleClickTracking() {
  _lastRegionPointerRegionId = null;
  _lastRegionPointerAt = 0;
}

function consumeRegionDoubleClick(regionId) {
  const now = Date.now();
  const isDoubleClick = _lastRegionPointerRegionId === regionId
    && (now - _lastRegionPointerAt) <= REGION_DOUBLE_CLICK_MS;

  if (isDoubleClick) {
    resetRegionDoubleClickTracking();
    return true;
  }

  _lastRegionPointerRegionId = regionId;
  _lastRegionPointerAt = now;
  return false;
}

function renderRecentFiles() {
  if (!elements.recentFilesList || !elements.recentFilesEmpty) {
    return;
  }

  const recentFiles = Array.isArray(state.recentFiles) ? state.recentFiles : [];
  const hasRecentFiles = recentFiles.length > 0;
  elements.recentFilesEmpty.classList.toggle("hidden", hasRecentFiles);

  if (!hasRecentFiles) {
    elements.recentFilesList.innerHTML = "";
    elements.recentFilesEmpty.classList.remove("hidden");
    elements.recentFilesList.appendChild(elements.recentFilesEmpty);
    if (elements.recentFilesClearButton) {
      elements.recentFilesClearButton.disabled = true;
    }
    return;
  }

  elements.recentFilesList.innerHTML = recentFiles
    .map((file) => {
      const kindLabel = getSourceKindLabel(file.kind);
      const openedAt = file.openedAt ? new Date(file.openedAt) : null;
      const openedAtLabel = openedAt && !Number.isNaN(openedAt.getTime())
        ? openedAt.toLocaleString([], { dateStyle: "short", timeStyle: "short" })
        : "";
      const directoryLabel = String(file.directory || "").trim();

      return `
        <div class="recent-file">
          <button
            type="button"
            data-recent-file-path="${escapeHtml(file.path)}"
            data-tip="เปิดไฟล์นี้"
            ${state.isBusy ? "disabled" : ""}
          >
            <span class="recent-file__top">
              <span class="recent-file__kind">${escapeHtml(kindLabel)}</span>
              ${openedAtLabel ? `<span class="recent-file__time">${escapeHtml(openedAtLabel)}</span>` : ""}
            </span>
            <span class="recent-file__name">${escapeHtml(file.name)}</span>
            ${directoryLabel ? `<span class="recent-file__meta">${escapeHtml(directoryLabel)}</span>` : ""}
          </button>
          <button
            type="button"
            class="btn btn--ghost btn--xs recent-file__remove"
            data-recent-remove-path="${escapeHtml(file.path)}"
            data-tip="ลบออกจากรายการล่าสุด"
            aria-label="ลบ ${escapeHtml(file.name)} ออกจากรายการล่าสุด"
            ${state.isBusy ? "disabled" : ""}
          >
            ×
          </button>
        </div>
      `;
    })
    .join("");

  if (elements.recentFilesClearButton) {
    elements.recentFilesClearButton.disabled = state.isBusy || !hasRecentFiles;
  }
}

function setRecentFiles(recentFiles) {
  state.recentFiles = Array.isArray(recentFiles) ? recentFiles.map(normalizeRecentFile) : [];
  renderRecentFiles();
}

async function refreshRecentFiles() {
  if (typeof window.mangaStudio.getRecentFiles !== "function") {
    return;
  }

  try {
    const recentFiles = await window.mangaStudio.getRecentFiles();
    setRecentFiles(recentFiles);
  } catch (error) {
    console.error("refreshRecentFiles failed:", error);
  }
}

function getFileNameFromPath(filePath) {
  const normalized = String(filePath || "").split(/[\\/]/);
  return normalized[normalized.length - 1] || "project";
}

function formatRegionKindLabel(kind) {
  const normalized = String(kind || "").trim().toLowerCase();
  if (!normalized) {
    return "กล่องข้อความ";
  }
  if (normalized === "dialogue" || normalized === "speech") {
    return "บทสนทนา";
  }
  if (normalized === "caption" || normalized === "narration") {
    return "คำบรรยาย";
  }
  if (normalized === "thought") {
    return "ความคิด";
  }
  if (normalized === "sfx" || normalized === "sound-effect" || normalized === "soundeffect") {
    return "เอฟเฟกต์เสียง";
  }
  return kind;
}

function getBackgroundPresetLabel(value) {
  const preset = BACKGROUND_PRESETS.find((item) => item.value === value);
  return preset ? preset.label : `กำหนดเอง: ${value}`;
}

function ensureBackgroundPresetOption(value) {
  const select = elements.backgroundColorInput;
  const normalizedValue = String(value || "transparent").trim() || "transparent";

  if (!select) {
    return normalizedValue;
  }

  const hasOption = Array.from(select.options).some((option) => option.value === normalizedValue);
  if (!hasOption) {
    const option = document.createElement("option");
    option.value = normalizedValue;
    option.textContent = getBackgroundPresetLabel(normalizedValue);
    select.appendChild(option);
  }

  return normalizedValue;
}

function setupBackgroundPresetInput() {
  const currentInput = elements.backgroundColorInput;
  if (!currentInput || currentInput.tagName === "SELECT") {
    return;
  }

  const select = document.createElement("select");
  select.id = currentInput.id;
  select.className = currentInput.className;
  select.setAttribute("aria-label", "พื้นหลัง");

  for (const preset of BACKGROUND_PRESETS) {
    const option = document.createElement("option");
    option.value = preset.value;
    option.textContent = preset.label;
    select.appendChild(option);
  }

  currentInput.replaceWith(select);
  elements.backgroundColorInput = select;
}

function cloneRegion(region, index) {
  return normalizeRegion({ ...region }, index);
}

function clonePageState(pageState) {
  if (!pageState) {
    return {
      image: null,
      cleanedImageUrl: null,
      regions: [],
      selectedRegionId: null,
      warnings: [],
    };
  }

  return {
    image: pageState.image ? { ...pageState.image } : null,
    cleanedImageUrl: pageState.cleanedImageUrl || null,
    regions: Array.isArray(pageState.regions) ? pageState.regions.map(cloneRegion) : [],
    selectedRegionId: pageState.selectedRegionId || null,
    warnings: Array.isArray(pageState.warnings) ? pageState.warnings.map((warning) => String(warning)) : [],
  };
}

function serializePdfState() {
  if (!state.pdf) {
    return null;
  }

  const pageStates = {};
  for (const [pageNumber, pageState] of Object.entries(state.pdf.pageStates || {})) {
    pageStates[pageNumber] = clonePageState(pageState);
  }

  return {
    pageCount: state.pdf.pageCount,
    activePageNumber: state.pdf.activePageNumber,
    selectedPageNumbers: [...(state.pdf.selectedPageNumbers || [])],
    pages: Array.isArray(state.pdf.pages) ? state.pdf.pages.map((page) => ({ ...page })) : [],
    pageStates,
  };
}

function hashHistoryString(value) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

function rememberHistoryAsset(dataUrl) {
  const normalized = String(dataUrl || "");
  if (!normalized) {
    return "";
  }

  const assetId = `ha_${hashHistoryString(normalized)}_${normalized.length}`;
  if (!state.historyAssets[assetId]) {
    state.historyAssets[assetId] = normalized;
  }
  return assetId;
}

function resolveHistoryAsset(assetId) {
  if (!assetId) {
    return "";
  }
  return state.historyAssets[assetId] || "";
}

function serializeHistoryImageState(imageState) {
  if (!imageState) {
    return null;
  }

  const { dataUrl, ...rest } = imageState;
  return {
    ...rest,
    dataAssetId: rememberHistoryAsset(dataUrl),
  };
}

function restoreHistoryImageState(imageSnapshot) {
  if (!imageSnapshot) {
    return null;
  }

  const { dataAssetId = "", ...rest } = imageSnapshot;
  const dataUrl = resolveHistoryAsset(dataAssetId);
  if (!dataUrl) {
    return null;
  }
  return {
    ...rest,
    dataUrl,
  };
}

function buildPageStateSnapshotForHistory(pageKey = getCurrentPageKey(), overridePageState = null) {
  if (overridePageState) {
    return clonePageState(overridePageState);
  }

  if (!isPagedSourceKind()) {
    return clonePageState({
      image: state.image ? { ...state.image } : null,
      cleanedImageUrl: state.cleanedImageUrl || null,
      regions: state.regions.map(cloneRegion),
      selectedRegionId: state.selectedRegionId || null,
      warnings: [...state.warnings],
    });
  }

  const normalizedPageKey = String(pageKey || state.pdf?.activePageNumber || 1);
  if (String(state.pdf?.activePageNumber || "") === normalizedPageKey) {
    return clonePageState({
      image: state.image ? { ...state.image } : null,
      cleanedImageUrl: state.cleanedImageUrl || null,
      regions: state.regions.map(cloneRegion),
      selectedRegionId: state.selectedRegionId || null,
      warnings: [...state.warnings],
    });
  }

  const pageState = getPdfPageState(Number(normalizedPageKey), { create: false });
  return clonePageState(pageState);
}

function isMeaningfulPageStateSnapshot(pageState) {
  return Boolean(
    pageState?.image
    || pageState?.cleanedImageUrl
    || (Array.isArray(pageState?.regions) && pageState.regions.length > 0)
    || (Array.isArray(pageState?.warnings) && pageState.warnings.length > 0)
    || pageState?.selectedRegionId
  );
}

function rememberHistoryPageVersion(pageKey = getCurrentPageKey(), overridePageState = null) {
  const normalizedPageKey = String(pageKey || getCurrentPageKey());
  const pageState = buildPageStateSnapshotForHistory(normalizedPageKey, overridePageState);
  if (!isMeaningfulPageStateSnapshot(pageState)) {
    return state.historyCurrentVersionMap[normalizedPageKey] || "";
  }

  const versionPayload = {
    version: HISTORY_SNAPSHOT_VERSION,
    pageKey: normalizedPageKey,
    image: serializeHistoryImageState(pageState.image),
    cleanedImageAssetId: rememberHistoryAsset(pageState.cleanedImageUrl),
    regions: Array.isArray(pageState.regions) ? pageState.regions.map(cloneRegion) : [],
    selectedRegionId: pageState.selectedRegionId || null,
    warnings: Array.isArray(pageState.warnings) ? pageState.warnings.map((warning) => String(warning)) : [],
  };
  const versionId = `pv_${hashHistoryString(JSON.stringify(versionPayload))}`;
  if (!state.historyPageVersions[versionId]) {
    state.historyPageVersions[versionId] = versionPayload;
  }
  state.historyCurrentVersionMap[normalizedPageKey] = versionId;
  return versionId;
}

function buildHistoryTimelineSnapshot({
  pageKey = getPageCacheKey(),
  snapshotPageState = null,
  capturePageVersion = true,
} = {}) {
  persistActivePdfPageState();
  const normalizedPageKey = String(pageKey || getPageCacheKey());

  if (capturePageVersion) {
    rememberHistoryPageVersion(normalizedPageKey, snapshotPageState);
  }

  return {
    version: HISTORY_SNAPSHOT_VERSION,
    sourceKind: state.source?.kind || "",
    currentPageKey: getCurrentPageKey(),
    activePageNumber: state.pdf?.activePageNumber || null,
    selectedPageNumbers: [...(state.pdf?.selectedPageNumbers || [])],
    cleanPreviewEnabled: Boolean(elements.cleanPreviewToggle?.checked && state.cleanedImageUrl),
    userNotes: { ...(state.userNotes || {}) },
    translationPreferences: { ...(state.translationPreferences || {}) },
    zoomLevel: Number(state.zoomLevel || 1),
    versionMap: { ...(state.historyCurrentVersionMap || {}) },
  };
}

function collectHistorySnapshotVersionIds(snapshot) {
  return Object.values(snapshot?.versionMap || {}).filter(Boolean);
}

function collectHistoryPageVersionAssetIds(pageVersion) {
  const assetIds = [];
  if (pageVersion?.image?.dataAssetId) {
    assetIds.push(pageVersion.image.dataAssetId);
  }
  if (pageVersion?.cleanedImageAssetId) {
    assetIds.push(pageVersion.cleanedImageAssetId);
  }
  return assetIds;
}

function trimHistorySnapshots() {
  const keepEntryIds = new Set(
    state.activityLog
      .slice(0, HISTORY_SNAPSHOT_LIMIT)
      .map((entry) => entry.id)
      .filter(Boolean)
  );

  for (const entryId of Object.keys(state.historySnapshots || {})) {
    if (!keepEntryIds.has(entryId)) {
      delete state.historySnapshots[entryId];
    }
  }

  const keepVersionIds = new Set();
  for (const snapshot of Object.values(state.historySnapshots || {})) {
    for (const versionId of collectHistorySnapshotVersionIds(snapshot)) {
      keepVersionIds.add(versionId);
    }
  }

  for (const versionId of Object.keys(state.historyPageVersions || {})) {
    if (!keepVersionIds.has(versionId)) {
      delete state.historyPageVersions[versionId];
    }
  }

  const keepAssetIds = new Set();
  for (const pageVersion of Object.values(state.historyPageVersions || {})) {
    for (const assetId of collectHistoryPageVersionAssetIds(pageVersion)) {
      keepAssetIds.add(assetId);
    }
  }

  for (const assetId of Object.keys(state.historyAssets || {})) {
    if (!keepAssetIds.has(assetId)) {
      delete state.historyAssets[assetId];
    }
  }

  if (state.historyCursorId && !keepEntryIds.has(state.historyCursorId)) {
    state.historyCursorId = state.activityLog[0]?.id || "";
  }
}

function storeHistorySnapshotForEntry(entry, {
  pageKey = entry?.pageKey,
  snapshotPageState = null,
  capturePageVersion = true,
} = {}) {
  if (!entry?.id) {
    return;
  }

  state.historySnapshots[entry.id] = buildHistoryTimelineSnapshot({
    pageKey,
    snapshotPageState,
    capturePageVersion,
  });
  state.historyCursorId = entry.id;
  entry.meta = {
    ...(entry.meta || {}),
    hasSnapshot: true,
  };
  trimHistorySnapshots();
}

function restoreHistoryPageState(pageVersion) {
  if (!pageVersion) {
    return clonePageState(null);
  }

  return {
    image: restoreHistoryImageState(pageVersion.image),
    cleanedImageUrl: resolveHistoryAsset(pageVersion.cleanedImageAssetId) || null,
    regions: Array.isArray(pageVersion.regions) ? pageVersion.regions.map(cloneRegion) : [],
    selectedRegionId: pageVersion.selectedRegionId || null,
    warnings: Array.isArray(pageVersion.warnings) ? pageVersion.warnings.map((warning) => String(warning)) : [],
  };
}

function serializeProjectData() {
  if (!state.source) {
    throw new Error("เปิดภาพ, PDF หรือโปรเจกต์ก่อนค่อยบันทึก");
  }

  persistActivePdfPageState();

  return {
    version: 3,
    savedAt: new Date().toISOString(),
    source: {
      path: state.source.path || null,
      name: state.source.name || "page",
      dataUrl: state.source.dataUrl || null,
      fileUrl: state.source.fileUrl || "",
      kind: state.source.kind,
      mimeType: state.source.mimeType || "",
    },
    image: state.image ? { ...state.image } : null,
    cleanedImageUrl: state.cleanedImageUrl || null,
    regions: state.regions.map(cloneRegion),
    selectedRegionId: state.selectedRegionId || null,
    warnings: [...state.warnings],
    cleanPreviewEnabled: Boolean(elements.cleanPreviewToggle.checked),
    pdf: serializePdfState(),
    // v2 fields
    undoStack: state.undoStack.map((s) => ({ regions: s.regions.map(cloneRegion), selectedRegionId: s.selectedRegionId })),
    redoStack: state.redoStack.map((s) => ({ regions: s.regions.map(cloneRegion), selectedRegionId: s.selectedRegionId })),
    zoomLevel: state.zoomLevel || 1,
    userNotes: state.userNotes || {},
    editHistory: state.editHistory || [],
    fontFavorites: [..._favFonts],
    activityLog: state.activityLog || [],
    cacheIndex: state.cacheIndex || {},
    ocrIndex: state.ocrIndex || {},
    historySnapshots: state.historySnapshots || {},
    historyPageVersions: state.historyPageVersions || {},
    historyAssets: state.historyAssets || {},
    historyCurrentVersionMap: state.historyCurrentVersionMap || {},
    historyCursorId: state.historyCursorId || "",
    translationPreferences: state.translationPreferences || {},
  };
}

function getSuggestedProjectName() {
  const projectName = state.projectPath ? getFileNameFromPath(state.projectPath) : state.source?.name || "session";
  const baseName = stripExtension(projectName);
  return `${baseName}.mtsproj`;
}

function hideUnsavedDialog() {
  elements.closeDialog?.classList.add("hidden");
}

function resolveUnsavedDialog(action) {
  const resolve = _pendingUnsavedDialogResolve;
  _pendingUnsavedDialogResolve = null;
  hideUnsavedDialog();
  if (resolve) {
    resolve(action);
  }
}

function showUnsavedDialog({
  title = "บันทึกโปรเจกต์ก่อนออก?",
  message = "คุณมีการเปลี่ยนแปลงที่ยังไม่ได้บันทึก",
  saveLabel = "บันทึก",
  discardLabel = "ไม่บันทึก",
  cancelLabel = "ยกเลิก",
} = {}) {
  if (!elements.closeDialog) {
    return Promise.resolve("cancel");
  }

  if (_pendingUnsavedDialogResolve) {
    resolveUnsavedDialog("cancel");
  }

  if (elements.closeDialogTitle) {
    elements.closeDialogTitle.textContent = title;
  }
  if (elements.closeDialogMessage) {
    elements.closeDialogMessage.textContent = message;
  }
  if (elements.closeSaveButton) {
    elements.closeSaveButton.textContent = saveLabel;
  }
  if (elements.closeDiscardButton) {
    elements.closeDiscardButton.textContent = discardLabel;
  }
  if (elements.closeCancelButton) {
    elements.closeCancelButton.textContent = cancelLabel;
  }

  elements.closeDialog.classList.remove("hidden");
  return new Promise((resolve) => {
    _pendingUnsavedDialogResolve = resolve;
  });
}

function getTranslationModeRadios() {
  return [...document.querySelectorAll('input[name="translationMode"]')];
}

function getSelectedTranslationMode() {
  return getTranslationModeRadios().find((radio) => radio.checked)?.value || "current";
}

function syncTranslationModeUiState() {
  if (!elements.translationPagesInput) {
    return;
  }
  const selectedMode = getSelectedTranslationMode();
  const isCustomSelection = selectedMode === "selected";
  elements.translationPagesInput.disabled = !isCustomSelection;
  elements.translationPagesInput.classList.toggle("is-disabled", !isCustomSelection);
}

function closeTranslationModeModal(result = null) {
  const resolve = _pendingTranslationModeResolve;
  _pendingTranslationModeResolve = null;
  if (elements.translationModeModal) {
    elements.translationModeModal.classList.add("hidden");
    elements.translationModeModal.setAttribute("aria-hidden", "true");
  }
  if (resolve) {
    resolve(result);
  }
}

function showTranslationModeModal() {
  if (!elements.translationModeModal) {
    return Promise.resolve(null);
  }

  if (_pendingTranslationModeResolve) {
    closeTranslationModeModal(null);
  }

  const preferredMode = state.translationPreferences?.mode || "current";
  for (const radio of getTranslationModeRadios()) {
    radio.checked = radio.value === preferredMode;
  }
  if (elements.translationPagesInput) {
    elements.translationPagesInput.value = state.translationPreferences?.customPagesInput || "";
  }
  syncTranslationModeUiState();
  elements.translationModeModal.classList.remove("hidden");
  elements.translationModeModal.setAttribute("aria-hidden", "false");

  if ((state.translationPreferences?.mode || "current") === "selected" && elements.translationPagesInput) {
    setTimeout(() => elements.translationPagesInput.focus(), 0);
  }

  return new Promise((resolve) => {
    _pendingTranslationModeResolve = resolve;
  });
}

function parseCustomPageSelection(inputValue, pageCount) {
  const rawParts = String(inputValue || "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  if (rawParts.length === 0) {
    throw new Error("กรอกเลขหน้าที่ต้องการก่อน เช่น 1,3,4");
  }

  const pages = [...new Set(rawParts.map((part) => Number(part)))]
    .filter((pageNumber) => Number.isFinite(pageNumber))
    .map((pageNumber) => Math.round(pageNumber))
    .sort((left, right) => left - right);

  if (pages.length === 0) {
    throw new Error("รูปแบบเลขหน้าไม่ถูกต้อง");
  }

  const invalidPage = pages.find((pageNumber) => pageNumber < 1 || pageNumber > pageCount);
  if (invalidPage) {
    throw new Error(`หน้า ${invalidPage} อยู่นอกช่วง 1-${pageCount}`);
  }

  return pages;
}

async function chooseTranslationPages({ applyOnly = false } = {}) {
  if (!isPagedSourceKind() || !state.pdf) {
    return state.image ? [state.image.pageNumber || 1] : [];
  }

  const result = await showTranslationModeModal();
  if (!result) {
    return null;
  }

  const selectedMode = result.mode || "current";
  state.translationPreferences.mode = selectedMode;
  state.translationPreferences.customPagesInput = result.customPagesInput || "";
  state.isDirty = true;

  let pages = [];
  if (selectedMode === "all") {
    pages = state.pdf.pages.map((page) => page.pageNumber);
  } else if (selectedMode === "selected") {
    pages = parseCustomPageSelection(result.customPagesInput, state.pdf.pageCount);
  } else {
    if (!state.pdf.activePageNumber) {
      throw new Error("ยังไม่มีหน้าที่เปิดอยู่");
    }
    pages = [state.pdf.activePageNumber];
  }

  state.pdf.selectedPageNumbers = [...pages];
  persistActivePdfPageState();
  renderAll();

  if (applyOnly) {
    setStatus(`ตั้งค่าโหมดแปลแล้ว: ${pages.join(", ")}`, "success");
    recordActivity("translation-mode", {
      title: "เปลี่ยนโหมดการแปล",
      details: selectedMode === "all"
        ? "แปลทุกหน้า"
        : selectedMode === "selected"
          ? `แปลหน้าที่ระบุ: ${pages.join(", ")}`
          : `แปลหน้าปัจจุบัน: ${pages[0]}`,
      pageKey: pages[0] || getPageCacheKey(),
      mergeKey: "translation-mode",
    });
    return null;
  }

  return pages;
}

function openHistoryCacheDrawer() {
  if (!elements.historyCacheDrawer) {
    return;
  }
  elements.historyCacheDrawer.classList.remove("hidden");
  elements.historyCacheDrawer.setAttribute("aria-hidden", "false");
  renderHistoryCache();
}

function closeHistoryCacheDrawer() {
  if (!elements.historyCacheDrawer) {
    return;
  }
  elements.historyCacheDrawer.classList.add("hidden");
  elements.historyCacheDrawer.setAttribute("aria-hidden", "true");
}

async function confirmSourceReplacement() {
  if (!state.source || !state.isDirty) {
    return true;
  }

  const action = await showUnsavedDialog({
    title: "บันทึกก่อนเปิดไฟล์อื่น?",
    message: "คุณมีการเปลี่ยนแปลงที่ยังไม่ได้บันทึก ถ้าเปิดไฟล์อื่นต่อ งานปัจจุบันจะถูกแทนที่",
    saveLabel: "บันทึก",
    discardLabel: "เปิดต่อ",
    cancelLabel: "ยกเลิก",
  });

  if (action === "cancel") {
    return false;
  }
  if (action === "save") {
    const saveResult = await saveProject();
    return saveResult?.status === "saved";
  }
  return true;
}

function getPdfExportPageNumbers() {
  if (!state.pdf) {
    return [];
  }

  const selectedPages = getSelectedPdfPages();
  if (selectedPages.length > 0) {
    return selectedPages;
  }

  return state.pdf.activePageNumber ? [state.pdf.activePageNumber] : [];
}

async function saveProject({ saveAs = false, reason = "manual" } = {}) {
  if (!state.source) {
    setStatus("เปิดภาพหรือ PDF ก่อน แล้วค่อยบันทึกโปรเจกต์", "error");
    return { status: "no-source" };
  }

  try {
    const saveResult = await window.mangaStudio.saveProject({
      projectData: serializeProjectData(),
      projectPath: state.projectPath,
      suggestedName: getSuggestedProjectName(),
      saveAs,
    });

    if (saveResult?.canceled) {
      return { status: "canceled" };
    }

    state.projectPath = saveResult.path;
    state.isDirty = false;
    recordActivity(reason === "autosave" ? "autosave-project" : "save-project", {
      title: reason === "autosave"
        ? "บันทึกอัตโนมัติสำเร็จ"
        : saveAs
          ? "บันทึกโปรเจกต์เป็นไฟล์ใหม่"
          : "บันทึกโปรเจกต์สำเร็จ",
      details: getFileNameFromPath(saveResult.path),
      pageKey: getCurrentPageKey(),
      mergeKey: reason === "autosave"
        ? `autosave-project:${saveResult.path}`
        : `${saveAs ? "save-as" : "save"}:${saveResult.path}`,
      meta: {
        path: saveResult.path,
        reason,
      },
    });
    await refreshRecentFiles();
    scheduleTranslationMemorySync({ allPages: true, immediate: true });
    setStatus(`บันทึกโปรเจกต์แล้ว: ${getFileNameFromPath(saveResult.path)}`, "success");
    return { status: "saved", path: saveResult.path };
  } catch (error) {
    setStatus(error.message || "บันทึกโปรเจกต์ไม่สำเร็จ", "error");
    return { status: "error", error };
  }
}

async function applySavedPdfState(savedPdf, cleanPreviewEnabled) {
  if (!state.pdf || !savedPdf) {
    return;
  }

  state.pdf.selectedPageNumbers = Array.isArray(savedPdf.selectedPageNumbers)
    ? [...new Set(savedPdf.selectedPageNumbers.map((pageNumber) => Number(pageNumber)).filter(Number.isFinite))].sort((left, right) => left - right)
    : [];

  state.pdf.pageStates = {};
  for (const [pageNumber, pageState] of Object.entries(savedPdf.pageStates || {})) {
    state.pdf.pageStates[String(pageNumber)] = clonePageState(pageState);
  }

  const savedActivePage = Number(savedPdf.activePageNumber);
  const fallbackPage = Array.from(Object.keys(state.pdf.pageStates)).map((pageNumber) => Number(pageNumber)).find(Number.isFinite)
    || state.pdf.pages[0]?.pageNumber
    || null;
  const activePageNumber = Number.isFinite(savedActivePage) ? savedActivePage : fallbackPage;

  if (activePageNumber) {
    await openPdfPage(activePageNumber);
  } else {
    renderAll();
  }

  elements.cleanPreviewToggle.checked = Boolean(cleanPreviewEnabled && state.cleanedImageUrl);
}

async function loadProject(projectData, projectPath, { skipUnsavedPrompt = false } = {}) {
  if (!projectData || typeof projectData !== "object") {
    throw new Error("ไฟล์โปรเจกต์ไม่ถูกต้อง");
  }

  const source = projectData.source;
  if (!source || !source.kind || !source.name || (!source.path && !source.dataUrl)) {
    throw new Error("ไฟล์โปรเจกต์ไม่มีข้อมูลไฟล์ต้นฉบับ");
  }

  let sourceResult = {
    path: source.path || null,
    name: source.name,
    dataUrl: source.dataUrl || null,
    fileUrl: source.fileUrl || "",
    kind: source.kind,
    mimeType: source.mimeType || "",
  };

  if (!sourceResult.dataUrl && sourceResult.path) {
    sourceResult = await window.mangaStudio.openRecentFile({ filePath: sourceResult.path });
  }

  const opened = await openSourceResult(sourceResult, { skipUnsavedPrompt });
  if (!opened) {
    return false;
  }
  state.projectPath = projectPath || null;

  if (isPagedSourceKind(sourceResult.kind)) {
    await applySavedPdfState(projectData.pdf, projectData.cleanPreviewEnabled);
  } else {
    if (projectData.image && state.image) {
      state.image = { ...state.image, ...projectData.image };
    }
    state.cleanedImageUrl = projectData.cleanedImageUrl || null;
    state.regions = Array.isArray(projectData.regions) ? projectData.regions.map(cloneRegion) : [];
    state.selectedRegionId = projectData.selectedRegionId || state.regions[0]?.id || null;
    setWarnings(projectData.warnings || []);
    elements.cleanPreviewToggle.checked = Boolean(projectData.cleanPreviewEnabled && state.cleanedImageUrl);
    renderAll();
  }

  // Restore v2 fields.
  if (Array.isArray(projectData.undoStack)) {
    state.undoStack = projectData.undoStack.map((s) => ({
      regions: (s.regions || []).map(cloneRegion),
      selectedRegionId: s.selectedRegionId || null,
    }));
  }
  if (Array.isArray(projectData.redoStack)) {
    state.redoStack = projectData.redoStack.map((s) => ({
      regions: (s.regions || []).map(cloneRegion),
      selectedRegionId: s.selectedRegionId || null,
    }));
  }
  if (typeof projectData.zoomLevel === "number" && projectData.zoomLevel > 0) {
    state.zoomLevel = projectData.zoomLevel;
    applyZoom();
  }
  if (projectData.userNotes && typeof projectData.userNotes === "object") {
    state.userNotes = { ...projectData.userNotes };
  }
  if (Array.isArray(projectData.editHistory)) {
    state.editHistory = projectData.editHistory.slice(-50);  // Keep last 50.
  }
  if (Array.isArray(projectData.fontFavorites)) {
    _favFonts = new Set(projectData.fontFavorites);
    _saveFavFonts(_favFonts);
  }
  if (Array.isArray(projectData.activityLog)) {
    state.activityLog = projectData.activityLog.slice(0, ACTIVITY_LOG_LIMIT);
  }
  if (projectData.cacheIndex && typeof projectData.cacheIndex === "object") {
    state.cacheIndex = { ...projectData.cacheIndex };
    trimCacheIndexEntries();
  }
  if (projectData.ocrIndex && typeof projectData.ocrIndex === "object") {
    state.ocrIndex = Object.fromEntries(
      Object.entries(projectData.ocrIndex).map(([pageKey, entry]) => [pageKey, normalizeOcrPageEntry(entry, pageKey)])
    );
  }
  if (projectData.historySnapshots && typeof projectData.historySnapshots === "object") {
    state.historySnapshots = { ...projectData.historySnapshots };
  }
  if (projectData.historyPageVersions && typeof projectData.historyPageVersions === "object") {
    state.historyPageVersions = { ...projectData.historyPageVersions };
  }
  if (projectData.historyAssets && typeof projectData.historyAssets === "object") {
    state.historyAssets = { ...projectData.historyAssets };
  }
  if (projectData.historyCurrentVersionMap && typeof projectData.historyCurrentVersionMap === "object") {
    state.historyCurrentVersionMap = { ...projectData.historyCurrentVersionMap };
  }
  if (typeof projectData.historyCursorId === "string") {
    state.historyCursorId = projectData.historyCursorId;
  }
  if (projectData.translationPreferences && typeof projectData.translationPreferences === "object") {
    state.translationPreferences = {
      ...state.translationPreferences,
      ...projectData.translationPreferences,
    };
  }

  trimHistorySnapshots();
  if (Object.keys(state.historySnapshots || {}).length === 0 && state.activityLog[0]) {
    storeHistorySnapshotForEntry(state.activityLog[0], {
      pageKey: state.activityLog[0].pageKey,
    });
  }
  if (!state.historyCursorId) {
    state.historyCursorId = state.activityLog[0]?.id || "";
  }

  await refreshRecentFiles();
  setStatus(`เปิดโปรเจกต์แล้ว: ${getFileNameFromPath(projectPath || sourceResult.name)}`, "success");
  renderHistoryCache();
  startBackgroundOcrIndexing();
  scheduleTranslationMemorySync({ allPages: true });
  recordActivity("project-import", {
    title: "นำเข้าโปรเจกต์สำเร็จ",
    details: getFileNameFromPath(projectPath || sourceResult.name),
    pageKey: getCurrentPageKey(),
    mergeKey: `project-import:${projectPath || sourceResult.name}`,
    meta: {
      projectPath: projectPath || "",
      sourceKind: sourceResult.kind,
    },
  });
  persistHistoryCacheForCurrentSource({ immediate: true });
  return true;
}

/** Map a font_name from Gemini to the CSS font-family value from FONT_OPTIONS. */
function resolveFontFamily(region) {
  const fontName = (region.font_name || "").trim();
  if (!fontName) {
    return FONT_STYLE_MAP[region.font_style] || null;
  }
  // Normalize: lowercase, strip whitespace/hyphens/underscores and non-alphanumeric.
  const normalize = (s) => s.toLowerCase().replace(/[\s\-_]+/g, "").replace(/[^a-z0-9]/g, "");
  const needle = normalize(fontName);
  const match = FONT_OPTIONS.find((opt) => normalize(opt.label) === needle);
  if (match) return match.value;
  // Fallback: wrap the name as CSS font-family.
  return `"${fontName}", sans-serif`;
}

function normalizeRegion(region, index) {
  return {
    id: region.id || `region_${index + 1}`,
    kind: region.kind || "dialogue",
    source_text: region.source_text || "",
    translated_text: region.translated_text || "",
    x: clamp(Number(region.x) || 0, 0, 1000),
    y: clamp(Number(region.y) || 0, 0, 1000),
    width: clamp(Number(region.width) || 160, 10, 1000),
    height: clamp(Number(region.height) || 90, 10, 1000),
    font_size: clamp(Number(region.font_size) || 28, 10, 120),
    font_family: region.font_family || resolveFontFamily(region) || THAI_FONT_FAMILY,
    font_weight: region.font_weight || "normal",
    alignment: ["left", "center", "right"].includes(region.alignment) ? region.alignment : "center",
    text_color: region.text_color || "#111111",
    background_color: region.background_color || "rgba(255,255,255,0.92)",
    text_stroke_color: region.text_stroke_color || "#000000",
    text_stroke_width: clamp(Number(region.text_stroke_width) || 0, 0, 10),
    text_shadow_color: region.text_shadow_color || "#000000",
    text_shadow_blur: clamp(Number(region.text_shadow_blur) || 0, 0, 20),
    font_size_auto: region.font_size_auto !== false,
    notes: region.notes || "",
    review_state: region.review_state === "suggested" ? "suggested" : "approved",
  };
}

/* ═══ Undo / Redo ═══ */
function pushUndo() {
  state.isDirty = true;
  state.undoStack.push({
    regions: state.regions.map(cloneRegion),
    selectedRegionId: state.selectedRegionId,
  });
  if (state.undoStack.length > MAX_UNDO_STEPS) {
    state.undoStack.shift();
  }
  state.redoStack = [];
}

function undo() {
  if (state.undoStack.length === 0) return;
  state.isDirty = true;
  state.redoStack.push({
    regions: state.regions.map(cloneRegion),
    selectedRegionId: state.selectedRegionId,
  });
  const snapshot = state.undoStack.pop();
  state.regions = snapshot.regions;
  state.selectedRegionId = snapshot.selectedRegionId || state.regions[0]?.id || null;
  persistActivePdfPageState();
  recordActivity("undo", {
    title: "เลิกทำการแก้ไข",
    details: `ย้อนกลับเหลือ ${state.regions.length} กล่องข้อความ`,
    pageKey: getCurrentPageKey(),
    mergeKey: `undo:${getCurrentPageKey()}`,
  });
  renderAll();
}

function redo() {
  if (state.redoStack.length === 0) return;
  state.isDirty = true;
  state.undoStack.push({
    regions: state.regions.map(cloneRegion),
    selectedRegionId: state.selectedRegionId,
  });
  const snapshot = state.redoStack.pop();
  state.regions = snapshot.regions;
  state.selectedRegionId = snapshot.selectedRegionId || state.regions[0]?.id || null;
  persistActivePdfPageState();
  recordActivity("redo", {
    title: "ทำซ้ำการแก้ไข",
    details: `กลับไปที่ ${state.regions.length} กล่องข้อความ`,
    pageKey: getCurrentPageKey(),
    mergeKey: `redo:${getCurrentPageKey()}`,
  });
  renderAll();
}

function getSelectedPdfPages() {
  if (!state.pdf) {
    return [];
  }
  return [...(state.pdf.selectedPageNumbers || [])].sort((left, right) => left - right);
}

function isPdfPageSelected(pageNumber) {
  return getSelectedPdfPages().includes(pageNumber);
}

function getPdfPageState(pageNumber, { create = false } = {}) {
  if (!state.pdf) {
    return null;
  }

  const key = String(pageNumber);
  if (!state.pdf.pageStates[key] && create) {
    state.pdf.pageStates[key] = {
      image: null,
      cleanedImageUrl: null,
      regions: [],
      selectedRegionId: null,
      warnings: [],
    };
  }

  return state.pdf.pageStates[key] || null;
}

function persistActivePdfPageState() {
  if (!state.pdf?.activePageNumber) {
    return;
  }

  const pageState = getPdfPageState(state.pdf.activePageNumber, { create: true });
  pageState.image = state.image;
  pageState.cleanedImageUrl = state.cleanedImageUrl;
  pageState.regions = state.regions.map(cloneRegion);
  pageState.selectedRegionId = state.selectedRegionId;
  pageState.warnings = [...state.warnings];
}

function loadPdfPageState(pageNumber) {
  const pageState = getPdfPageState(pageNumber, { create: true });
  if (!pageState) return;
  state.image = pageState.image;
  state.cleanedImageUrl = pageState.cleanedImageUrl;
  state.regions = (pageState.regions || []).map(cloneRegion);
  state.selectedRegionId = pageState.selectedRegionId || state.regions[0]?.id || null;
  state.warnings = [...(pageState.warnings || [])];
  renderWarnings();
}

function getPdfNavigationPages() {
  if (!state.pdf) {
    return [];
  }

  const selectedPages = getSelectedPdfPages();
  if (selectedPages.length > 1 && selectedPages.includes(state.pdf.activePageNumber)) {
    return selectedPages;
  }

  return state.pdf.pages.map((page) => page.pageNumber);
}

function getNextPdfPageNumber(step) {
  if (!state.pdf?.activePageNumber) {
    return null;
  }

  const navigationPages = getPdfNavigationPages();
  const activeIndex = navigationPages.indexOf(state.pdf.activePageNumber);
  if (activeIndex === -1) {
    return null;
  }

  return navigationPages[activeIndex + step] || null;
}

function updateFileLabel() {
  if (!state.source) {
    elements.fileNameLabel.textContent = "ยังไม่ได้เลือกไฟล์";
    return;
  }

  const projectLabel = state.projectPath ? `${getFileNameFromPath(state.projectPath)} | ` : "";

  if (isPagedSourceKind()) {
    if (state.pdf?.activePageNumber) {
      elements.fileNameLabel.textContent = `${projectLabel}${state.source.name} | หน้า ${state.pdf.activePageNumber}/${state.pdf.pageCount}`;
      return;
    }

    const selectedPages = getSelectedPdfPages();
    if (selectedPages.length > 0) {
      elements.fileNameLabel.textContent = `${projectLabel}${state.source.name} | เลือกไว้ ${selectedPages.length} หน้า`;
      return;
    }

    elements.fileNameLabel.textContent = `${projectLabel}${state.source.name} | ยังไม่ได้เลือกหน้า`;
    return;
  }

  elements.fileNameLabel.textContent = `${projectLabel}${state.source.name}`;
}

function updateButtons() {
  const hasPage = Boolean(state.image);
  const hasRegions = state.regions.length > 0;
  const hasSource = Boolean(state.source);
  const hasPagedSource = Boolean(state.source && isPagedSourceKind(state.source.kind) && state.pdf);
  const selectedRegion = getSelectedRegion();
  const hasSuggestedSelection = Boolean(selectedRegion && selectedRegion.review_state === "suggested");
  const selectedPdfPages = hasPagedSource ? getSelectedPdfPages() : [];
  const hasQueuedPdfPages = selectedPdfPages.length > 0;
  const hasExportablePagedSource = hasPagedSource && getPdfExportPageNumbers().length > 0;
  const navigationPages = hasPagedSource ? getPdfNavigationPages() : [];
  const activePageIndex = hasPagedSource ? navigationPages.indexOf(state.pdf.activePageNumber) : -1;

  elements.openButton.disabled = state.isBusy;
  elements.translateButton.disabled = (!hasPage && !hasQueuedPdfPages) || state.isBusy;
  if (elements.translateModeButton) {
    elements.translateModeButton.disabled = !hasPagedSource || state.isBusy;
  }
  elements.cleanOnlyButton.disabled = !hasPage || state.isBusy;
  if (elements.cleanSuggestButton) {
    elements.cleanSuggestButton.disabled = !hasPage || state.isBusy;
  }
  elements.addRegionButton.disabled = !hasPage || state.isBusy;
  elements.saveButton.disabled = !hasSource || state.isBusy;
  elements.exportButton.textContent = hasPagedSource ? "ส่งออกเอกสาร" : "ส่งออกภาพ";
  const canOfferPagedPsd = hasPagedSource && getPdfExportPageNumbers().length === 1;
  elements.exportButton.title = hasPagedSource
    ? (canOfferPagedPsd ? "ส่งออกเป็น PDF / CBZ / ZIP / PSD" : "ส่งออกเป็น PDF / CBZ / ZIP")
    : "ส่งออกเป็น PNG / JPG / WEBP / PSD";
  elements.exportButton.disabled = hasPagedSource
    ? !hasExportablePagedSource || state.isBusy
    : !hasPage || (!hasRegions && !state.cleanedImageUrl) || state.isBusy;
  elements.cleanPreviewToggle.disabled = !state.cleanedImageUrl;
  elements.undoButton.disabled = state.undoStack.length === 0 || state.isBusy;
  elements.redoButton.disabled = state.redoStack.length === 0 || state.isBusy;
  elements.previewButton.disabled = !hasPage || (!hasRegions && !state.cleanedImageUrl) || state.isBusy;
  elements.deleteRegionButton.disabled = !state.selectedRegionId || state.isBusy;
  if (elements.acceptSuggestionButton) {
    elements.acceptSuggestionButton.disabled = !hasSuggestedSelection || state.isBusy;
    elements.acceptSuggestionButton.classList.toggle("hidden", !hasSuggestedSelection);
  }
  if (elements.historyCacheButton) {
    elements.historyCacheButton.disabled = !hasSource;
  }

  elements.pdfPrevButton.disabled = !hasPagedSource || state.isBusy || activePageIndex <= 0;
  elements.pdfNextButton.disabled = !hasPagedSource || state.isBusy || activePageIndex === -1 || activePageIndex >= navigationPages.length - 1;
  elements.pdfPageInput.disabled = !hasPagedSource || state.isBusy;
  elements.pdfJumpButton.disabled = !hasPagedSource || state.isBusy;
  elements.pdfClearSelectionButton.disabled = !hasPagedSource || state.isBusy || selectedPdfPages.length === 0;
  elements.pdfClearSelectionButton.classList.toggle("hidden", !hasPagedSource);
  if (elements.recentFilesClearButton) {
    elements.recentFilesClearButton.disabled = state.isBusy || state.recentFiles.length === 0;
  }
}

function getDisplaySource() {
  if (elements.cleanPreviewToggle.checked && state.cleanedImageUrl) {
    return state.cleanedImageUrl;
  }
  return state.image?.dataUrl || "";
}

function hasVisibleCleanBase() {
  return Boolean(elements.cleanPreviewToggle.checked && state.cleanedImageUrl);
}

function syncStageMetrics() {
  if (!state.image || !elements.baseImage.src) {
    state.stageMetrics = null;
    return;
  }

  const img = elements.baseImage;

  // Use naturalWidth/Height directly — the image is displayed at natural size
  // inside stageCanvas, and zoom is handled by CSS transform on the container.
  // This avoids issues with offsetWidth being 0 during layout.
  const w = img.naturalWidth || state.image.width || 800;
  const h = img.naturalHeight || state.image.height || 1200;

  state.stageMetrics = {
    left: 0,
    top: 0,
    width: w,
    height: h,
  };

  elements.overlayLayer.style.left = `${state.stageMetrics.left}px`;
  elements.overlayLayer.style.top = `${state.stageMetrics.top}px`;
  elements.overlayLayer.style.width = `${state.stageMetrics.width}px`;
  elements.overlayLayer.style.height = `${state.stageMetrics.height}px`;
  renderRegions();
}

function renderStageEmpty() {
  elements.stageEmpty.classList.toggle("hidden", Boolean(state.image));
}

function renderBaseImage() {
  if (!state.image) {
    elements.baseImage.style.display = "none";
    elements.baseImage.removeAttribute("src");
    elements.originalImage.style.display = "none";
    elements.originalImage.removeAttribute("src");
    elements.overlayLayer.innerHTML = "";
    state.stageMetrics = null;
    return;
  }

  elements.baseImage.style.display = "block";
  const nextSource = getDisplaySource();
  if (elements.baseImage.src !== nextSource) {
    elements.baseImage.src = nextSource;
  }

  // Show original image behind when clean preview is active and opacity < 100%.
  const opacity = Number(elements.cleanOpacitySlider.value);
  if (hasVisibleCleanBase() && opacity < 100) {
    elements.originalImage.src = state.image.dataUrl;
    elements.originalImage.style.display = "block";
    // Match exact position/size of baseImage after it loads.
    const syncOrigSize = () => {
      elements.originalImage.style.left = `${elements.baseImage.offsetLeft}px`;
      elements.originalImage.style.top = `${elements.baseImage.offsetTop}px`;
      elements.originalImage.style.width = `${elements.baseImage.offsetWidth}px`;
      elements.originalImage.style.height = `${elements.baseImage.offsetHeight}px`;
    };
    syncOrigSize();
    elements.baseImage.style.opacity = opacity / 100;
  } else {
    elements.originalImage.style.display = "none";
    elements.baseImage.style.opacity = "1";
  }
}

function buildPdfPageGrid() {
  elements.pdfPageGrid.innerHTML = state.pdf.pages
    .map((page) => {
      return `
        <div
          class="film-card"
          data-page-number="${page.pageNumber}"
        >
          <button type="button" class="film-card__toggle"
            data-page-toggle="${page.pageNumber}"
            data-pdf-action="toggle-page"
            data-tip="เลือกหรือยกเลิกหน้า ${page.pageNumber} สำหรับส่งออก"
            aria-pressed="false"
            aria-label="เลือกหน้า ${page.pageNumber}"></button>
          <button type="button" class="film-card__btn"
            data-page-open="${page.pageNumber}"
            data-pdf-action="open-page"
            data-tip="เปิดหน้า ${page.pageNumber} เพื่อแปล">
            ${page.thumbDataUrl
              ? `<img class="film-card__thumb" src="${page.thumbDataUrl}" alt="p${page.pageNumber}" width="${page.width || 200}" height="${page.height || 280}" />`
              : `<div class="film-card__placeholder">${page.pageNumber}</div>`}
            <div class="film-card__label">
              <span class="film-card__num">${page.pageNumber}</span>
              <span class="film-card__status"></span>
            </div>
          </button>
        </div>
      `;
    })
    .join("");
}

function updatePdfCardStates() {
  const activePageNumber = state.pdf.activePageNumber;
  const selectedPages = getSelectedPdfPages();
  const selectedSet = new Set(selectedPages);

  const cards = elements.pdfPageGrid.querySelectorAll(".film-card[data-page-number]");
  for (const card of cards) {
    const pageNumber = Number(card.dataset.pageNumber);
    const isActive = pageNumber === activePageNumber;
    const isBatchSelected = selectedSet.has(pageNumber);

    card.classList.toggle("is-active", isActive);
    card.classList.toggle("is-batch-selected", isBatchSelected);

    const toggle = card.querySelector(".film-card__toggle");
    if (toggle) {
      toggle.setAttribute("aria-pressed", String(isBatchSelected));
    }

    const statusEl = card.querySelector(".film-card__status");
    if (statusEl) {
      const pageState = getPdfPageState(pageNumber);
      const regionCount = pageState?.regions?.length || 0;
      let statusLabel = "";
      if (isActive) statusLabel = "แก้";
      else if (regionCount > 0) statusLabel = `${regionCount}`;
      else if (pageState?.image) statusLabel = "พร้อม";
      statusEl.textContent = statusLabel;
    }
  }
}

function renderPdfPanel() {
  if (!state.source || !isPagedSourceKind(state.source.kind) || !state.pdf) {
    elements.pdfPanel.classList.add("hidden");
    elements.pdfMetaLabel.textContent = "0 หน้า";
    elements.pdfSelectedLabel.textContent = "ยังไม่ได้เปิดหน้า";
    elements.pdfSelectedCountPill.textContent = "0";
    elements.pdfActivePagePill.textContent = "-";
    elements.pdfPageGrid.innerHTML = `<div class="filmstrip__empty">เปิดเอกสารหลายหน้าเพื่อดูหน้า</div>`;
    return;
  }

  const activePageNumber = state.pdf.activePageNumber;
  const selectedPages = getSelectedPdfPages();

  elements.pdfPanel.classList.remove("hidden");
  elements.pdfMetaLabel.textContent = `${state.pdf.pageCount} หน้า`;
  elements.pdfSelectedLabel.textContent = activePageNumber
    ? `เปิดหน้า ${activePageNumber}`
    : "ยังไม่ได้เปิดหน้า";
  elements.pdfSelectedCountPill.textContent = `${selectedPages.length}`;
  elements.pdfActivePagePill.textContent = activePageNumber
    ? `${activePageNumber}`
    : "-";
  elements.pdfPageInput.max = String(state.pdf.pageCount);
  elements.pdfPageInput.value = activePageNumber ? String(activePageNumber) : "";

  const existingCards = elements.pdfPageGrid.querySelectorAll(".film-card[data-page-number]");
  if (existingCards.length !== state.pdf.pages.length) {
    buildPdfPageGrid();
  }
  updatePdfCardStates();
}

function renderRegionList() {
  elements.regionCountPill.textContent = `${state.regions.length} กล่อง`;
  if (state.regions.length === 0) {
    elements.regionList.className = "region-list empty";
    elements.regionList.textContent = "ยังไม่มีข้อความที่ตรวจพบ";
    return;
  }

  elements.regionList.className = "region-list";
  elements.regionList.innerHTML = state.regions
    .map((region, index) => {
      const selected = region.id === state.selectedRegionId ? "is-selected" : "";
      const kindLabel = formatRegionKindLabel(region.kind);
      const reviewBadge = region.review_state === "suggested"
        ? `<span class="card-chip card-chip--suggested">Suggest</span>`
        : "";
      return `
        <button type="button" class="region-card ${selected}" data-region-id="${region.id}" data-tip="คลิกเพื่อเลือกกล่อง #${index + 1} (${escapeHtml(kindLabel)})">
          <div class="card-top">
            <span class="kind-tag">${escapeHtml(kindLabel)}</span>
            ${reviewBadge}
            <span class="card-label">#${index + 1}</span>
          </div>
          <div class="card-body">
            <div>
              <div class="card-label">ต้นฉบับ</div>
              <p class="card-text">${escapeHtml(region.source_text || "-")}</p>
            </div>
            <div>
              <div class="card-label">คำแปลไทย</div>
              <p class="card-text">${escapeHtml(region.translated_text || "-")}</p>
            </div>
          </div>
        </button>
      `;
    })
    .join("");
}

function renderInspector() {
  const region = getSelectedRegion();
  if (!region) {
    elements.emptyInspector.classList.remove("hidden");
    elements.inspectorFields.classList.add("hidden");
    elements.acceptSuggestionButton?.classList.add("hidden");
    return;
  }

  elements.emptyInspector.classList.add("hidden");
  elements.inspectorFields.classList.remove("hidden");
  elements.acceptSuggestionButton?.classList.toggle("hidden", region.review_state !== "suggested");

  elements.kindInput.value = region.kind;
  elements.sourceInput.value = region.source_text;
  elements.translatedInput.value = region.translated_text;
  elements.fontFamilyInput.value = region.font_family;
  syncFontPickerLabel();
  const matchesPreset = FONT_SIZE_PRESETS.includes(region.font_size);
  elements.fontSizeInput.value = matchesPreset ? String(region.font_size) : "custom";
  elements.fontSizeCustomInput.value = String(region.font_size);
  elements.alignmentInput.value = region.alignment;
  elements.textColorInput.value = region.text_color;
  elements.backgroundColorInput.value = ensureBackgroundPresetOption(region.background_color);
  elements.textStrokeColorInput.value = region.text_stroke_color || "#000000";
  elements.textStrokeWidthInput.value = String(region.text_stroke_width || 0);
  elements.textShadowColorInput.value = region.text_shadow_color || "#000000";
  elements.textShadowBlurInput.value = String(region.text_shadow_blur || 0);
  elements.notesInput.value = region.notes || "";
}

function makeTextRegionElement(region) {
  const metrics = state.stageMetrics;
  if (!metrics || !state.image) {
    return null;
  }

  const scaleX = metrics.width / 1000;
  const scaleY = metrics.height / 1000;
  const useCleanBase = hasVisibleCleanBase();
  const paintsBackground = shouldPaintRegionBackground(region, { usingCleanBase: useCleanBase });
  const isInlineEditing = state.inlineEditingRegionId === region.id;
  const box = document.createElement("div");
  box.className = "text-region";
  if (region.review_state === "suggested") {
    box.classList.add("text-region--suggested");
  }
  if (useCleanBase && !paintsBackground) {
    box.classList.add("text-region--clean");
  }
  if (region.id === state.selectedRegionId) {
    box.classList.add("is-selected");
  }
  if (isInlineEditing) {
    box.classList.add("text-region--editing");
  }

  box.dataset.regionId = region.id;
  box.style.left = `${region.x * scaleX}px`;
  box.style.top = `${region.y * scaleY}px`;
  box.style.width = `${region.width * scaleX}px`;
  box.style.height = `${region.height * scaleY}px`;
  box.style.fontSize = `${Math.max(10, region.font_size * (metrics.height / state.image.height))}px`;
  box.style.fontFamily = region.font_family || THAI_FONT_FAMILY;
  box.style.fontWeight = region.font_weight || "normal";
  box.style.padding = `${Math.max(4, TEXT_PADDING_Y * scaleY)}px ${Math.max(4, TEXT_PADDING_X * scaleX)}px`;
  box.style.background = paintsBackground ? region.background_color : "transparent";
  box.style.color = region.text_color;
  box.style.textAlign = region.alignment;
  if (region.text_stroke_width > 0) {
    box.style.webkitTextStroke = `${region.text_stroke_width}px ${region.text_stroke_color}`;
  }
  if (region.text_shadow_blur > 0) {
    box.style.textShadow = `0 0 ${region.text_shadow_blur}px ${region.text_shadow_color}`;
  }
  if (isInlineEditing) {
    const editor = document.createElement("textarea");
    editor.className = "text-region__editor";
    editor.dataset.regionEditorId = region.id;
    editor.value = region.translated_text;
    editor.rows = 1;
    editor.spellcheck = false;
    editor.placeholder = "แก้ข้อความตรงนี้";

    editor.addEventListener("pointerdown", (event) => {
      event.stopPropagation();
    });
    editor.addEventListener("click", (event) => {
      event.stopPropagation();
    });
    editor.addEventListener("input", (event) => {
      const currentRegion = state.regions.find((item) => item.id === region.id);
      if (!currentRegion) {
        return;
      }

      debouncedPushUndo();
      const reviewStateBefore = currentRegion.review_state === "suggested" ? "suggested" : "approved";
      currentRegion.translated_text = event.target.value;
      if (currentRegion.review_state === "suggested") {
        currentRegion.review_state = "approved";
      }
      state.isDirty = true;
      if (state.image && currentRegion.font_size_auto !== false) {
        autofitRegion(currentRegion, state.image.width, state.image.height);
        box.style.fontSize = `${Math.max(10, currentRegion.font_size * (metrics.height / state.image.height))}px`;
      }
      if (state.selectedRegionId === region.id) {
        renderInspector();
      }
      syncCurrentPageCacheFromState();
      recordActivity("region-edit", {
        title: "แก้ไขข้อความบนกล่อง",
        details: describeRegionPatch({ translated_text: event.target.value }),
        pageKey: getCurrentPageKey(),
        regionId: region.id,
        mergeKey: `inline-text:${getCurrentPageKey()}:${region.id}`,
        meta: {
          fields: ["translated_text"],
          regionId: region.id,
        },
      });
      if (String(currentRegion.source_text || "").trim()) {
        scheduleTranslationMemorySync({
          pageKey: getCurrentPageKey(),
          immediate: reviewStateBefore === "suggested" && currentRegion.review_state === "approved",
        });
      }
    });
    editor.addEventListener("blur", () => {
      if (state.inlineEditingRegionId === region.id) {
        scheduleTranslationMemorySync({ pageKey: getCurrentPageKey(), immediate: true });
        commitInlineRegionEditing(region.id);
      }
    });
    editor.addEventListener("keydown", (event) => {
      event.stopPropagation();
      if (event.key === "Escape") {
        event.preventDefault();
        editor.blur();
      }
    });

    box.appendChild(editor);
  } else {
    box.textContent = region.translated_text;
    box.addEventListener("pointerdown", (event) => {
      if (!state.stageMetrics) {
        return;
      }

      const target = event.target;
      if (target.classList.contains("resize-handle")) {
        resetRegionDoubleClickTracking();
      } else if (consumeRegionDoubleClick(region.id)) {
        enterInlineRegionEditing(region.id, { selectAll: true });
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      clearInlineEditingState();
      const mode = target.classList.contains("resize-handle") ? "resize" : "move";
      state.selectedRegionId = region.id;
      state.dragContext = {
        undoPushed: false,
        mode,
        regionId: region.id,
        startClientX: event.clientX,
        startClientY: event.clientY,
        startRegion: { ...region },
      };
      persistActivePdfPageState();
      renderAll();
      event.preventDefault();
      event.stopPropagation();
    });
  }

  const handle = document.createElement("div");
  handle.className = "resize-handle";
  box.appendChild(handle);

  return box;
}

function renderRegions() {
  elements.overlayLayer.innerHTML = "";
  if (!state.stageMetrics || !state.image) {
    return;
  }

  const fragment = document.createDocumentFragment();
  for (const region of state.regions) {
    const element = makeTextRegionElement(region);
    if (element) {
      fragment.appendChild(element);
    }
  }
  elements.overlayLayer.appendChild(fragment);
  focusPendingInlineEditor();
}

function getCurrentPageKey() {
  if (state.pdf && state.pdf.activePageNumber) return String(state.pdf.activePageNumber);
  return "single";
}

function syncCurrentPageCacheFromState() {
  const pageKey = getCurrentPageKey();
  updateCacheEntry(pageKey, {
    pageNumber: pageKey === "single" ? 1 : Number(pageKey),
    pageLabel: pageKey === "single" ? "ภาพหลัก" : `หน้า ${pageKey}`,
    regionsCount: state.regions.length,
    noteCount: state.userNotes?.[pageKey] ? 1 : 0,
    hasCleanedImage: Boolean(state.cleanedImageUrl),
    hasRenderedImage: Boolean(state.image),
    suggestedRegionCount: state.regions.filter((region) => region?.review_state === "suggested").length,
    hasSuggestedRegions: state.regions.some((region) => region?.review_state === "suggested"),
  });
}

function loadUserNote() {
  const key = getCurrentPageKey();
  elements.userNoteInput.value = state.userNotes[key] || "";
}

function saveUserNote() {
  const key = getCurrentPageKey();
  const val = elements.userNoteInput.value.trim();
  state.isDirty = true;
  if (val) {
    state.userNotes[key] = val;
  } else {
    delete state.userNotes[key];
  }
  updateCacheEntry(key, {
    noteCount: val ? 1 : 0,
  });
  syncCurrentPageCacheFromState();
  recordActivity("page-note", {
    title: "อัปเดตโน้ตหน้า",
    details: val || "ลบโน้ตหน้านี้",
    pageKey: key,
    mergeKey: `page-note:${key}`,
  });
}

// ─── Pan + Zoom System ───
// state.panX / state.panY track the translation of stageCanvas.
if (state.panX === undefined) state.panX = 0;
if (state.panY === undefined) state.panY = 0;

function applyZoom() {
  const canvas = document.getElementById("stageCanvas");
  if (!canvas) return;
  canvas.style.transform = `translate(${state.panX}px, ${state.panY}px) scale(${state.zoomLevel})`;
  canvas.style.transformOrigin = "0 0";
  const pill = document.getElementById("zoomPill");
  if (pill) pill.textContent = `${Math.round(state.zoomLevel * 100)}%`;
}

function setZoom(level, centerX, centerY) {
  const oldZoom = state.zoomLevel;
  const newZoom = Math.round(Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, level)) * 100) / 100;
  if (newZoom === oldZoom) return;

  // Zoom toward the pointer (or center of frame).
  const frame = document.querySelector(".stage-frame");
  if (frame && centerX !== undefined && centerY !== undefined) {
    const rect = frame.getBoundingClientRect();
    const mx = centerX - rect.left;
    const my = centerY - rect.top;
    state.panX = mx - (mx - state.panX) * (newZoom / oldZoom);
    state.panY = my - (my - state.panY) * (newZoom / oldZoom);
  }

  state.zoomLevel = newZoom;
  applyZoom();
  syncStageMetrics();
}

function centerCanvas() {
  const frame = document.querySelector(".stage-frame");
  const img = elements.baseImage;
  if (!frame || !img || !img.naturalWidth) return;

  const fw = frame.clientWidth;
  const fh = frame.clientHeight;
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;
  const pad = 20;

  // Fit image to view with padding.
  const fitZoom = Math.min((fw - pad * 2) / iw, (fh - pad * 2) / ih, 1);
  state.zoomLevel = Math.round(Math.max(ZOOM_MIN, fitZoom) * 100) / 100;

  const scaledW = iw * state.zoomLevel;
  const scaledH = ih * state.zoomLevel;
  state.panX = (fw - scaledW) / 2;
  state.panY = (fh - scaledH) / 2;
  applyZoom();
  syncStageMetrics();
}

function zoomIn() { setZoom(state.zoomLevel + ZOOM_STEP); }
function zoomOut() { setZoom(state.zoomLevel - ZOOM_STEP); }
function zoomReset() { state.panX = 0; state.panY = 0; setZoom(1); centerCanvas(); }

// ─── Pan drag (left-click drag on stage-frame, or spacebar + drag) ───
let _isPanning = false;
let _panStartX = 0;
let _panStartY = 0;
let _panStartPanX = 0;
let _panStartPanY = 0;

function initPanZoom() {
  const frame = document.querySelector(".stage-frame");
  if (!frame) return;

  // Scroll = zoom (no modifier needed).
  frame.addEventListener("wheel", (e) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP;
    setZoom(state.zoomLevel + delta, e.clientX, e.clientY);
  }, { passive: false });

  // Left-click drag to pan (only on stage-frame background, not on regions).
  frame.addEventListener("pointerdown", (e) => {
    // Only pan if clicking on the frame/canvas background, not on a text region.
    const target = e.target;
    if (target.closest(".text-region") || target.closest(".translating-overlay") || target.closest(".opacity-widget")) return;
    _isPanning = true;
    _panStartX = e.clientX;
    _panStartY = e.clientY;
    _panStartPanX = state.panX;
    _panStartPanY = state.panY;
    frame.classList.add("is-panning");
    frame.setPointerCapture(e.pointerId);
    e.preventDefault();
  });

  frame.addEventListener("pointermove", (e) => {
    if (!_isPanning) return;
    state.panX = _panStartPanX + (e.clientX - _panStartX);
    state.panY = _panStartPanY + (e.clientY - _panStartY);
    applyZoom();
  });

  frame.addEventListener("pointerup", (e) => {
    if (!_isPanning) return;
    _isPanning = false;
    frame.classList.remove("is-panning");
    frame.releasePointerCapture(e.pointerId);
    syncStageMetrics();
  });
}

function renderAll() {
  applyTheme();
  syncSuggestProviderControls();
  elements.latestModelValue.textContent = getModelBadgeLabel();
  updateFileLabel();
  renderRecentFiles();
  syncInspectorDrawer();
  renderStageEmpty();
  renderBaseImage();
  syncStageMetrics();
  renderPdfPanel();
  renderWarnings();
  renderRegionList();
  renderInspector();
  renderRegions();
  renderHistoryCache();
  updateButtons();
  loadUserNote();
}

function selectRegion(regionId) {
  if (state.inlineEditingRegionId && state.inlineEditingRegionId !== regionId) {
    clearInlineEditingState();
  }
  state.selectedRegionId = regionId;
  persistActivePdfPageState();
  renderAll();
}

let _undoDebounceTimer = null;

function debouncedPushUndo() {
  if (_undoDebounceTimer) return;
  pushUndo();
  _undoDebounceTimer = setTimeout(() => { _undoDebounceTimer = null; }, 300);
}

function setRegionReviewState(region, reviewState, { activityTitle = "", activityDetails = "" } = {}) {
  if (!region) {
    return;
  }
  const previousState = region.review_state === "suggested" ? "suggested" : "approved";
  const normalizedState = reviewState === "suggested" ? "suggested" : "approved";
  if (previousState === normalizedState) {
    return;
  }
  region.review_state = normalizedState;
  state.isDirty = true;
  persistActivePdfPageState();
  syncCurrentPageCacheFromState();
  if (normalizedState === "approved" && previousState !== "approved") {
    scheduleTranslationMemorySync({ pageKey: getCurrentPageKey(), immediate: true });
  }
  if (activityTitle) {
    recordActivity("suggest-review", {
      title: activityTitle,
      details: activityDetails || region.translated_text || region.source_text || region.id,
      pageKey: getCurrentPageKey(),
      regionId: region.id,
      mergeKey: `suggest-review:${getCurrentPageKey()}:${region.id}:${normalizedState}`,
      meta: {
        review_state: normalizedState,
        regionId: region.id,
      },
    });
  }
}

function updateSelectedRegion(patch) {
  const region = getSelectedRegion();
  if (!region) {
    return;
  }
  clearInlineEditingState(region.id);
  debouncedPushUndo();

  const hasManualFontSize = Object.prototype.hasOwnProperty.call(patch, "font_size");
  const shouldAutofit = state.image
    && !hasManualFontSize
    && region.font_size_auto !== false
    && ["translated_text", "width", "height"].some((key) => Object.prototype.hasOwnProperty.call(patch, key));
  const translatedTextChanged = Object.prototype.hasOwnProperty.call(patch, "translated_text")
    && String(patch.translated_text || "") !== String(region.translated_text || "");
  const reviewStateBefore = region.review_state === "suggested" ? "suggested" : "approved";

  Object.assign(region, patch);
  if (Object.prototype.hasOwnProperty.call(patch, "translated_text") && region.review_state === "suggested") {
    region.review_state = "approved";
  }
  region.x = clamp(region.x, 0, 1000);
  region.y = clamp(region.y, 0, 1000);
  region.width = clamp(region.width, 10, 1000 - region.x);
  region.height = clamp(region.height, 10, 1000 - region.y);
  region.font_size = clamp(region.font_size, 10, 120);
  if (hasManualFontSize) {
    region.font_size_auto = false;
  } else if (shouldAutofit) {
    autofitRegion(region, state.image.width, state.image.height);
  }
  persistActivePdfPageState();
  syncCurrentPageCacheFromState();
  recordActivity("region-edit", {
    title: "แก้ไขกล่องข้อความ",
    details: describeRegionPatch(patch),
    pageKey: getCurrentPageKey(),
    regionId: region.id,
    mergeKey: `region-edit:${getCurrentPageKey()}:${region.id}:${Object.keys(patch).sort().join(",")}`,
    meta: {
      fields: Object.keys(patch),
      regionId: region.id,
    },
  });
  if (translatedTextChanged || (reviewStateBefore === "suggested" && region.review_state === "approved")) {
    scheduleTranslationMemorySync({ pageKey: getCurrentPageKey() });
  }
  renderAll();
}

function acceptSelectedSuggestion() {
  const region = getSelectedRegion();
  if (!region || region.review_state !== "suggested") {
    return;
  }
  pushUndo();
  setRegionReviewState(region, "approved", {
    activityTitle: "ยืนยัน Suggest",
    activityDetails: region.translated_text || region.source_text || region.id,
  });
  renderAll();
}

function addRegion() {
  if (!state.image) {
    return;
  }
  pushUndo();

  const region = normalizeRegion(
    {
      id: `manual_${Date.now()}`,
      kind: "dialogue",
      source_text: "",
      translated_text: "แก้ข้อความตรงนี้",
      x: 420,
      y: 420,
      width: 180,
      height: 110,
      font_size: Math.max(22, Math.round(state.image.height * 0.022)),
      alignment: "center",
      text_color: "#111111",
      background_color: "transparent",
      notes: "เพิ่มเอง",
    },
    state.regions.length
  );
  state.regions.push(region);
  state.selectedRegionId = region.id;
  state.isDirty = true;
  state.inlineEditingRegionId = region.id;
  state.pendingInlineFocusRegionId = region.id;
  state.pendingInlineSelectAllRegionId = region.id;
  persistActivePdfPageState();
  recordActivity("region-add", {
    title: "เพิ่มกล่องข้อความ",
    details: `เพิ่มกล่องใหม่ที่หน้า ${getCurrentPageKey()}`,
    pageKey: getCurrentPageKey(),
    regionId: region.id,
    mergeKey: `region-add:${getCurrentPageKey()}:${region.id}`,
    meta: {
      regionId: region.id,
    },
  });

  // Force stageMetrics to exist before rendering.
  if (!state.stageMetrics) {
    syncStageMetrics();
  }
  renderAll();
}

function removeSelectedRegion() {
  if (!state.selectedRegionId) {
    return;
  }
  const removedRegionId = state.selectedRegionId;
  pushUndo();
  resetRegionDoubleClickTracking();
  clearInlineEditingState(state.selectedRegionId);

  state.regions = state.regions.filter((region) => region.id !== state.selectedRegionId);
  state.selectedRegionId = state.regions[0]?.id || null;
  persistActivePdfPageState();
  recordActivity("region-remove", {
    title: "ลบกล่องข้อความ",
    details: `ลบกล่อง ${removedRegionId}`,
    pageKey: getCurrentPageKey(),
    regionId: removedRegionId,
    mergeKey: `region-remove:${getCurrentPageKey()}:${removedRegionId}`,
    meta: {
      regionId: removedRegionId,
    },
  });
  renderAll();
}

function wrapText(ctx, text, maxWidth) {
  const segments = (text || "").split("\n");
  const lines = [];
  const thaiSegmenter = typeof Intl !== "undefined" && Intl.Segmenter
    ? new Intl.Segmenter("th", { granularity: "word" })
    : null;

  for (const segment of segments) {
    const trimmedSegment = segment.trim();
    if (!trimmedSegment) {
      lines.push("");
      continue;
    }

    const tokens = /\s/.test(trimmedSegment)
      ? trimmedSegment.split(/(\s+)/).filter(Boolean)
      : thaiSegmenter
        ? Array.from(thaiSegmenter.segment(trimmedSegment), (part) => part.segment)
        : Array.from(trimmedSegment);

    let currentLine = "";
    for (const token of tokens) {
      const testLine = `${currentLine}${token}`;
      if (ctx.measureText(testLine).width <= maxWidth) {
        currentLine = testLine;
      } else {
        if (currentLine) {
          lines.push(currentLine.trimEnd());
        }
        currentLine = token.trimStart();
      }
    }
    if (currentLine) {
      lines.push(currentLine.trimEnd());
    }
  }

  return lines.length > 0 ? lines : [""];
}

function fitText(ctx, region, imageWidth, imageHeight, { allowGrow = region.font_size_auto !== false } = {}) {
  const x = (region.x / 1000) * imageWidth;
  const y = (region.y / 1000) * imageHeight;
  const width = (region.width / 1000) * imageWidth;
  const height = (region.height / 1000) * imageHeight;
  const paddingX = Math.max(4, Math.min(TEXT_PADDING_X, width * 0.12));
  const paddingY = Math.max(4, Math.min(TEXT_PADDING_Y, height * 0.12));
  const maxTextWidth = Math.max(4, width - paddingX * 2);
  const maxTextHeight = Math.max(4, height - paddingY * 2);

  const fontFamily = region.font_family || THAI_FONT_FAMILY;
  const fontWeight = region.font_weight || "normal";
  const layoutFor = (fontSize) => {
    ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
    const lines = wrapText(ctx, region.translated_text, maxTextWidth);
    const lineHeight = fontSize * 1.18;
    const blockHeight = lines.length * lineHeight;
    const widestLine = lines.reduce((widest, line) => Math.max(widest, ctx.measureText(line).width), 0);
    return {
      lines,
      fontSize,
      lineHeight,
      blockHeight,
      widestLine,
      fits: widestLine <= maxTextWidth && blockHeight <= maxTextHeight,
    };
  };

  let fontSize = clamp(region.font_size || 28, MIN_TEXT_FONT_SIZE, MAX_TEXT_FONT_SIZE);
  let layout = layoutFor(fontSize);

  if (allowGrow) {
    // Auto mode: shrink if too big, grow if too small.
    while (!layout.fits && fontSize > MIN_TEXT_FONT_SIZE) {
      fontSize -= 1;
      layout = layoutFor(fontSize);
    }
    while (layout.fits && fontSize < MAX_TEXT_FONT_SIZE) {
      const nextLayout = layoutFor(fontSize + 1);
      if (!nextLayout.fits) break;
      fontSize += 1;
      layout = nextLayout;
    }
    if (!layout.fits) {
      layout = layoutFor(MIN_TEXT_FONT_SIZE);
    }
  }
  // When allowGrow is false (manual font_size), use the font_size as-is.
  // Don't shrink — match what the DOM overlay shows.

  return {
    x,
    y,
    width,
    height,
    paddingX,
    paddingY,
    ...layout,
  };
}

function autofitRegion(region, imageWidth, imageHeight) {
  if (!region || !imageWidth || !imageHeight) {
    return;
  }

  const ctx = getTextMeasureContext();
  if (!ctx) {
    return;
  }

  const layout = fitText(ctx, region, imageWidth, imageHeight, { allowGrow: true });
  region.font_size = layout.fontSize;
  region.font_size_auto = true;
}

function autofitRegions(regions, imageWidth, imageHeight) {
  if (!Array.isArray(regions) || !imageWidth || !imageHeight) {
    return;
  }

  for (const region of regions) {
    autofitRegion(region, imageWidth, imageHeight);
  }
}

async function loadExportBaseImage(imageState, { cleanedImageUrl = null, preferCleanBase = false } = {}) {
  if (!imageState?.dataUrl) {
    throw new Error("ยังไม่มีภาพที่พร้อมสำหรับส่งออก");
  }

  const image = new Image();
  image.src = preferCleanBase && cleanedImageUrl ? cleanedImageUrl : imageState.dataUrl;

  try {
    await image.decode();
    return image;
  } catch (error) {
    if (preferCleanBase && cleanedImageUrl && image.src !== imageState.dataUrl) {
      image.src = imageState.dataUrl;
      await image.decode();
      return image;
    }
    throw error;
  }
}

async function ensureRegionFontsLoaded(regions) {
  const fontFamilies = new Set();
  for (const region of regions || []) {
    const fontFamily = region?.font_family || THAI_FONT_FAMILY;
    const match = fontFamily.match(/"([^"]+)"/);
    if (match) {
      fontFamilies.add(match[1]);
    }
  }

  const fontLoads = [...fontFamilies].map((name) =>
    document.fonts.load(`bold 40px "${name}"`).catch(() => {})
  );
  if (fontLoads.length > 0) {
    await Promise.all(fontLoads);
  }
}

function createExportCanvas(width, height) {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width) || 1);
  canvas.height = Math.max(1, Math.round(height) || 1);
  return canvas;
}

async function createCanvasFromDataUrl(dataUrl, width, height) {
  if (!dataUrl) {
    throw new Error("ยังไม่มีภาพสำหรับสร้างเลเยอร์");
  }

  const image = new Image();
  image.src = dataUrl;
  await image.decode();

  const canvas = createExportCanvas(width || image.naturalWidth || image.width, height || image.naturalHeight || image.height);
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("ไม่สามารถสร้าง canvas สำหรับเลเยอร์ PSD ได้");
  }
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas;
}

function renderRegionLayerCanvas(region, imageWidth, imageHeight, { cleanedImageUrl = null } = {}) {
  const canvas = createExportCanvas(imageWidth, imageHeight);
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("ไม่สามารถสร้าง canvas สำหรับเลเยอร์ข้อความได้");
  }
  drawTranslatedRegions(ctx, imageWidth, imageHeight, [region], { cleanedImageUrl });
  return canvas;
}

function hasRenderableRegionContent(region, useCleanBase) {
  return Boolean(String(region?.translated_text || "").trim())
    || shouldPaintRegionBackground(region, { usingCleanBase: useCleanBase, forExport: true });
}

function makePsdLayerName(region, index) {
  const baseLabel = `Text ${String(index + 1).padStart(2, "0")}`;
  const preview = String(region?.translated_text || region?.source_text || region?.notes || "")
    .replace(/\s+/g, " ")
    .trim();
  if (!preview) {
    return baseLabel;
  }
  const clipped = preview.length > 40 ? `${preview.slice(0, 37)}...` : preview;
  return `${baseLabel} - ${clipped}`;
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error || new Error("อ่านข้อมูลไฟล์ไม่สำเร็จ"));
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
}

async function buildPsdDocumentDataUrl(pageState, {
  preferCleanBase = false,
  pageLabel = "",
} = {}) {
  if (!pageState?.image) {
    throw new Error("ยังไม่มีหน้าที่พร้อมสำหรับส่งออก PSD");
  }
  if (!window.agPsd?.writePsd) {
    throw new Error("ไม่พบไลบรารี PSD ในหน้าแอป");
  }

  await ensureRegionFontsLoaded(pageState.regions || []);

  const width = pageState.image.width;
  const height = pageState.image.height;
  const useCleanBase = Boolean(preferCleanBase && pageState.cleanedImageUrl);
  const compositeDataUrl = await renderTranslatedPageDataUrl(pageState, {
    preferCleanBase: useCleanBase,
    mimeType: IMAGE_EXPORT_FORMATS.png.mimeType,
  });
  const compositeCanvas = await createCanvasFromDataUrl(compositeDataUrl, width, height);

  const layers = [
    {
      name: pageLabel ? `${pageLabel} - Original` : "Original",
      canvas: await createCanvasFromDataUrl(pageState.image.dataUrl, width, height),
      hidden: useCleanBase,
    },
  ];

  if (useCleanBase) {
    layers.push({
      name: pageLabel ? `${pageLabel} - Clean Base` : "Clean Base",
      canvas: await createCanvasFromDataUrl(pageState.cleanedImageUrl, width, height),
    });
  }

  let regionLayerCount = 0;
  for (const [index, rawRegion] of (pageState.regions || []).entries()) {
    const region = cloneRegion(rawRegion, index);
    if (!hasRenderableRegionContent(region, useCleanBase)) {
      continue;
    }

    layers.push({
      name: makePsdLayerName(region, index),
      canvas: renderRegionLayerCanvas(region, width, height, {
        cleanedImageUrl: useCleanBase ? pageState.cleanedImageUrl : null,
      }),
    });
    regionLayerCount += 1;
  }

  const psdBuffer = window.agPsd.writePsd({
    width,
    height,
    canvas: compositeCanvas,
    children: layers,
  }, {
    noBackground: true,
  });

  const dataUrl = await blobToDataUrl(new Blob([psdBuffer], { type: IMAGE_EXPORT_FORMATS.psd.mimeType }));
  return {
    dataUrl,
    layerCount: layers.length,
    regionLayerCount,
  };
}

function drawRoundedRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawTranslatedRegions(ctx, imageWidth, imageHeight, regions, { cleanedImageUrl = null } = {}) {
  const useCleanBase = Boolean(cleanedImageUrl);
  for (const region of regions) {
    // Use fitText but respect user's manual font_size — don't auto-grow if user set it.
    const textLayout = fitText(ctx, region, imageWidth, imageHeight, {
      allowGrow: region.font_size_auto !== false,
    });
    const radius = Math.min(textLayout.width, textLayout.height) * 0.15;
    const paintsBackground = shouldPaintRegionBackground(region, { usingCleanBase: useCleanBase, forExport: true });

    ctx.save();
    if (paintsBackground && !useCleanBase) {
      ctx.fillStyle = region.background_color;
      drawRoundedRect(ctx, textLayout.x, textLayout.y, textLayout.width, textLayout.height, radius);
      ctx.fill();
    }

    ctx.fillStyle = region.text_color;
    ctx.textAlign = region.alignment;
    ctx.textBaseline = "middle";
    ctx.font = `${region.font_weight || "normal"} ${textLayout.fontSize}px ${region.font_family || THAI_FONT_FAMILY}`;

    let textX = textLayout.x + textLayout.width / 2;
    if (region.alignment === "left") {
      textX = textLayout.x + textLayout.paddingX;
    } else if (region.alignment === "right") {
      textX = textLayout.x + textLayout.width - textLayout.paddingX;
    }

    const contentHeight = Math.max(0, textLayout.height - textLayout.paddingY * 2);
    let textY = textLayout.y
      + textLayout.paddingY
      + (contentHeight - textLayout.blockHeight) / 2
      + textLayout.lineHeight / 2;
    if (region.text_shadow_blur > 0) {
      ctx.shadowColor = region.text_shadow_color || "#000000";
      ctx.shadowBlur = region.text_shadow_blur;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    }

    if (region.text_stroke_width > 0) {
      ctx.strokeStyle = region.text_stroke_color || "#000000";
      ctx.lineWidth = region.text_stroke_width * 2;
      ctx.lineJoin = "round";
      for (const line of textLayout.lines) {
        ctx.strokeText(line, textX, textY);
        textY += textLayout.lineHeight;
      }
      ctx.shadowColor = "transparent";
      textY = textLayout.y + textLayout.paddingY + (contentHeight - textLayout.blockHeight) / 2 + textLayout.lineHeight / 2;
    }

    for (const line of textLayout.lines) {
      ctx.fillText(line, textX, textY);
      textY += textLayout.lineHeight;
    }
    ctx.restore();
  }
}

async function renderTranslatedPageDataUrl(pageState, {
  preferCleanBase = false,
  mimeType = "image/png",
  quality,
} = {}) {
  if (!pageState?.image) {
    throw new Error("ยังไม่มีหน้าที่พร้อมสำหรับส่งออก");
  }

  await ensureRegionFontsLoaded(pageState.regions || []);

  const cleanedImageUrl = preferCleanBase ? pageState.cleanedImageUrl : null;
  const image = await loadExportBaseImage(pageState.image, {
    cleanedImageUrl,
    preferCleanBase,
  });
  const canvas = createExportCanvas(pageState.image.width, pageState.image.height);
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("ไม่สามารถสร้าง canvas สำหรับเรนเดอร์ได้");
  }
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  drawTranslatedRegions(ctx, canvas.width, canvas.height, pageState.regions || [], {
    cleanedImageUrl,
  });
  return typeof quality === "number"
    ? canvas.toDataURL(mimeType, quality)
    : canvas.toDataURL(mimeType);
}

function getSuggestedImageExportName(format = "png") {
  const baseName = stripExtension(state.image?.name || state.source?.name || "translated-page");
  return `${baseName}-thai.${format}`;
}

function getSuggestedPagedExportName(pageNumbers, format = "pdf") {
  const baseName = stripExtension(state.source?.name || "translated-document");
  if (pageNumbers.length === 1) {
    return `${baseName}-page-${String(pageNumbers[0]).padStart(3, "0")}-thai.${format}`;
  }
  return `${baseName}-thai.${format}`;
}

async function exportPageStateAsPsd(pageState, { outputPath, pageLabel = "" } = {}) {
  const psdDocument = await buildPsdDocumentDataUrl(pageState, {
    preferCleanBase: Boolean(pageState?.cleanedImageUrl),
    pageLabel,
  });
  const saveResult = await window.mangaStudio.saveExportFile({
    dataUrl: psdDocument.dataUrl,
    outputPath,
  });
  return {
    ...saveResult,
    layerCount: psdDocument.layerCount,
    regionLayerCount: psdDocument.regionLayerCount,
  };
}

async function exportPdfDocument() {
  if (!state.source || state.source.kind !== "pdf" || !state.pdf) {
    return;
  }

  const pageNumbers = getPdfExportPageNumbers();
  if (pageNumbers.length === 0) {
    setStatus("เลือกหน้าที่ต้องการส่งออก PDF ก่อน", "error");
    return;
  }

  persistActivePdfPageState();
  state.isBusy = true;
  updateButtons();

  try {
    const pages = [];
    for (const [index, pageNumber] of pageNumbers.entries()) {
      setStatus(`กำลังเตรียมหน้า ${pageNumber} เพื่อส่งออก PDF (${index + 1}/${pageNumbers.length})...`);
      const pageState = await ensurePdfPageRendered(pageNumber);
      pages.push({
        pageNumber,
        imageDataUrl: await renderTranslatedPageDataUrl(pageState, { preferCleanBase: Boolean(pageState.cleanedImageUrl) }),
      });
    }

    const exportResult = await window.mangaStudio.exportPdf({
      filePath: state.source.path,
      fileDataUrl: state.source.dataUrl,
      fileName: state.source.name,
      pages,
      suggestedName: getSuggestedPdfExportName(pageNumbers),
    });

    if (!exportResult?.canceled) {
      setStatus(`ส่งออก PDF แล้ว: ${exportResult.path}`, "success");
    }
  } catch (error) {
    setStatus(error.message || "ส่งออก PDF ไม่สำเร็จ", "error");
  } finally {
    state.isBusy = false;
    updateButtons();
  }
}

async function exportImage() {
  if (!state.image || state.regions.length === 0) {
    return;
  }
  try {
    const exportDataUrl = await renderTranslatedPageDataUrl({
      image: state.image,
      cleanedImageUrl: state.cleanedImageUrl,
      regions: state.regions,
    }, { preferCleanBase: Boolean(state.cleanedImageUrl) });
    const exportResult = await window.mangaStudio.saveExport({
      dataUrl: exportDataUrl,
      suggestedName: `${stripExtension(state.image.name)}-thai.png`,
    });

    if (!exportResult.canceled) {
      setStatus(`ส่งออกแล้ว: ${exportResult.path}`, "success");
    }
  } catch (error) {
    setStatus(error.message || "ส่งออกไม่สำเร็จ", "error");
  }
}

async function handleExport() {
  if (state.source?.kind === "pdf") {
    await exportPdfDocument();
    return;
  }

  await exportImage();
}

async function ensurePdfPageRendered(pageNumber) {
  if (!state.pdf || !state.source || state.source.kind !== "pdf") {
    throw new Error("ยังไม่ได้เลือก PDF");
  }

  const normalizedPageNumber = clamp(Math.round(pageNumber), 1, state.pdf.pageCount);
  const pageState = getPdfPageState(normalizedPageNumber, { create: true });
  if (pageState.image) {
    return pageState;
  }

  const data = await window.mangaStudio.renderPdfPage({
    filePath: state.source.path,
    fileDataUrl: state.source.dataUrl,
    fileName: state.source.name,
    pageNumber: normalizedPageNumber,
    pageWidth: 1600,
  });

  pageState.image = {
    name: `${stripExtension(data.file_name)}-page-${String(data.page_number).padStart(3, "0")}.png`,
    dataUrl: `data:${data.image_mime_type || "image/png"};base64,${data.image_base64}`,
    width: data.image_width,
    height: data.image_height,
    pageNumber: data.page_number,
    totalPages: state.pdf.pageCount,
    sourceKind: "pdf",
  };

  return pageState;
}

async function exportPagedDocument() {
  if (!state.source || !isPagedSourceKind(state.source.kind) || !state.pdf) {
    return;
  }

  const pageNumbers = getPdfExportPageNumbers();
  if (pageNumbers.length === 0) {
    setStatus("เลือกหน้าที่ต้องการส่งออกก่อน", "error");
    return;
  }

  persistActivePdfPageState();
  state.isBusy = true;
  updateButtons();

  try {
    const defaultFormat = state.source.kind === "pdf" ? "pdf" : "cbz";
    const destination = await window.mangaStudio.choosePagedExportPath({
      sourceKind: state.source.kind,
      allowPsd: pageNumbers.length === 1,
      suggestedName: getSuggestedPagedExportName(pageNumbers, defaultFormat),
    });
    if (destination?.canceled) {
      return;
    }

    if (destination.format === IMAGE_EXPORT_FORMATS.psd.extension) {
      if (pageNumbers.length !== 1) {
        throw new Error("PSD export รองรับทีละ 1 หน้าเท่านั้น");
      }

      const pageNumber = pageNumbers[0];
      setStatus(`กำลังเตรียม PSD สำหรับหน้าที่ ${pageNumber}...`);
      const pageState = await ensurePdfPageRendered(pageNumber);
      const exportResult = await exportPageStateAsPsd(pageState, {
        outputPath: destination.path,
        pageLabel: `Page ${pageNumber}`,
      });

      if (!exportResult?.canceled) {
        const formatLabel = IMAGE_EXPORT_FORMATS.psd.label;
        updateCacheEntry(String(pageNumber), (entry) => {
          entry.exports = trimList([formatLabel, ...(entry.exports || []).filter((item) => item !== formatLabel)], 8);
        });
        recordActivity("export", {
          title: `ส่งออก ${formatLabel} สำเร็จ`,
          details: `หน้า ${pageNumber} -> ${getFileNameFromPath(exportResult.path)}`,
          pageKey: String(pageNumber),
          mergeKey: `export:${destination.format}:${pageNumber}`,
          meta: {
            format: formatLabel,
            path: exportResult.path,
            pageCount: 1,
            layerCount: exportResult.layerCount,
            regionLayerCount: exportResult.regionLayerCount,
          },
        });
        setStatus(`ส่งออก PSD แล้ว: ${exportResult.path}`, "success");
      }
      return;
    }

    const pages = [];
    for (const [index, pageNumber] of pageNumbers.entries()) {
      setStatus(`กำลังเตรียมหน้าที่ ${pageNumber} เพื่อส่งออก (${index + 1}/${pageNumbers.length})...`);
      const pageState = await ensurePdfPageRendered(pageNumber);
      pages.push({
        pageNumber,
        fileName: `${stripExtension(pageState.image?.name || `page-${pageNumber}`)}.png`,
        imageDataUrl: await renderTranslatedPageDataUrl(pageState, {
          preferCleanBase: Boolean(pageState.cleanedImageUrl),
          mimeType: IMAGE_EXPORT_FORMATS.png.mimeType,
        }),
      });
    }

    const exportResult = await window.mangaStudio.exportPagedDocument({
      sourceKind: state.source.kind,
      filePath: state.source.path,
      fileDataUrl: state.source.dataUrl,
      fileName: state.source.name,
      pages,
      outputPath: destination.path,
      format: destination.format,
    });

    if (!exportResult?.canceled) {
      const exportFormat = String(destination.format || "").toUpperCase();
      for (const pageNumber of pageNumbers) {
        updateCacheEntry(String(pageNumber), (entry) => {
          entry.exports = trimList([exportFormat, ...(entry.exports || []).filter((item) => item !== exportFormat)], 8);
        });
      }
      recordActivity("export", {
        title: `ส่งออก ${exportFormat} สำเร็จ`,
        details: `${pageNumbers.length} หน้า -> ${getFileNameFromPath(exportResult.path)}`,
        pageKey: String(pageNumbers[0] || getCurrentPageKey()),
        mergeKey: `export:${destination.format}:${pageNumbers.join(",")}`,
        meta: {
          format: exportFormat,
          path: exportResult.path,
          pageCount: pageNumbers.length,
        },
      });
      setStatus(`ส่งออกเอกสารแล้ว: ${exportResult.path}`, "success");
    }
  } catch (error) {
    setStatus(error.message || "ส่งออกเอกสารไม่สำเร็จ", "error");
  } finally {
    state.isBusy = false;
    updateButtons();
  }
}

async function exportImage() {
  if (!state.image || (state.regions.length === 0 && !state.cleanedImageUrl)) {
    return;
  }

  try {
    const destination = await window.mangaStudio.chooseImageExportPath({
      suggestedName: getSuggestedImageExportName("png"),
    });
    if (destination?.canceled) {
      return;
    }

    const format = IMAGE_EXPORT_FORMATS[destination.format] || IMAGE_EXPORT_FORMATS.png;
    const currentPageState = {
      image: state.image,
      cleanedImageUrl: state.cleanedImageUrl,
      regions: state.regions,
    };
    const exportResult = format.binary
      ? await exportPageStateAsPsd(currentPageState, {
          outputPath: destination.path,
          pageLabel: stripExtension(state.image.name || state.source?.name || "Page"),
        })
      : await (async () => {
          const exportDataUrl = await renderTranslatedPageDataUrl(currentPageState, {
            preferCleanBase: Boolean(state.cleanedImageUrl),
            mimeType: format.mimeType,
            quality: format.quality,
          });
          return window.mangaStudio.saveExportFile({
            dataUrl: exportDataUrl,
            outputPath: destination.path,
          });
        })();

    if (!exportResult?.canceled) {
      const formatLabel = format.label.toUpperCase();
      updateCacheEntry(getCurrentPageKey(), (entry) => {
        entry.exports = trimList([formatLabel, ...(entry.exports || []).filter((item) => item !== formatLabel)], 8);
      });
      const detailSuffix = format.binary && Number.isFinite(exportResult.layerCount)
        ? ` • ${exportResult.layerCount} layers`
        : "";
      recordActivity("export", {
        title: `ส่งออก ${formatLabel} สำเร็จ`,
        details: `${getFileNameFromPath(exportResult.path)}${detailSuffix}`,
        pageKey: getCurrentPageKey(),
        mergeKey: `export:${format.extension}:${getCurrentPageKey()}`,
        meta: {
          format: formatLabel,
          path: exportResult.path,
          layerCount: exportResult.layerCount,
          regionLayerCount: exportResult.regionLayerCount,
        },
      });
      setStatus(`ส่งออกแล้ว: ${exportResult.path}`, "success");
    }
  } catch (error) {
    setStatus(error.message || "ส่งออกไม่สำเร็จ", "error");
  }
}

async function handleExport() {
  if (isPagedSourceKind(state.source?.kind)) {
    await exportPagedDocument();
    return;
  }

  await exportImage();
}

async function ensurePdfPageRendered(pageNumber) {
  if (!state.pdf || !state.source || !isPagedSourceKind(state.source.kind)) {
    throw new Error("ยังไม่ได้เลือกเอกสารหลายหน้า");
  }

  const normalizedPageNumber = clamp(Math.round(pageNumber), 1, state.pdf.pageCount);
  const pageState = getPdfPageState(normalizedPageNumber, { create: true });
  if (pageState.image) {
    return pageState;
  }

  const data = state.source.kind === "pdf"
    ? await window.mangaStudio.renderPdfPage({
        filePath: state.source.path,
        fileDataUrl: state.source.dataUrl,
        fileName: state.source.name,
        pageNumber: normalizedPageNumber,
        pageWidth: 1600,
      })
    : await window.mangaStudio.renderPagedDocumentPage({
        filePath: state.source.path,
        fileName: state.source.name,
        pageNumber: normalizedPageNumber,
      });

  pageState.image = {
    name: data.page_file_name || `${stripExtension(data.file_name)}-page-${String(data.page_number).padStart(3, "0")}.png`,
    dataUrl: `data:${data.image_mime_type || "image/png"};base64,${data.image_base64}`,
    fileUrl: data.page_file_url || "",
    width: data.image_width,
    height: data.image_height,
    pageNumber: data.page_number,
    totalPages: state.pdf.pageCount,
    sourceKind: state.source.kind,
  };

  updateCacheEntry(String(normalizedPageNumber), {
    pageNumber: normalizedPageNumber,
    pageLabel: `หน้า ${normalizedPageNumber}`,
    hasRenderedImage: true,
  });
  recordActivity("page-rendered", {
    title: "สร้าง cache หน้าเอกสาร",
    details: `เตรียมหน้าที่ ${normalizedPageNumber} สำหรับแก้ไข/ส่งออก`,
    pageKey: String(normalizedPageNumber),
    mergeKey: `page-rendered:${normalizedPageNumber}`,
    meta: {
      sourceKind: state.source.kind,
    },
  });

  return pageState;
}

function togglePdfPageSelection(pageNumber) {
  if (!state.pdf) {
    return;
  }

  state.isDirty = true;
  const selectedPages = new Set(getSelectedPdfPages());
  if (selectedPages.has(pageNumber)) {
    selectedPages.delete(pageNumber);
  } else {
    selectedPages.add(pageNumber);
  }

  state.pdf.selectedPageNumbers = [...selectedPages].sort((left, right) => left - right);
  const message = selectedPages.has(pageNumber)
    ? `เพิ่มหน้า ${pageNumber} เข้าคิวส่งออกแล้ว`
    : `เอาหน้า ${pageNumber} ออกจากคิวส่งออกแล้ว`;
  setStatus(message, "success");
  renderAll();
}

async function openPdfPage(pageNumber) {
  if (!state.pdf || !state.source || state.source.kind !== "pdf") {
    return;
  }

  const normalizedPageNumber = clamp(Math.round(pageNumber), 1, state.pdf.pageCount);
  persistActivePdfPageState();
  state.isBusy = true;
  updateButtons();
  setStatus(`กำลังเปิดหน้า ${normalizedPageNumber}...`);

  // Increment request ID — if another openPdfPage runs before this finishes,
  // the stale response is discarded.
  const requestId = ++_pdfPageRequestId;

  try {
    const pageState = await ensurePdfPageRendered(normalizedPageNumber);

    // Discard if a newer request was issued while awaiting.
    if (requestId !== _pdfPageRequestId) return;

    state.pdf.activePageNumber = normalizedPageNumber;
    loadPdfPageState(normalizedPageNumber);
    elements.cleanPreviewToggle.checked = Boolean(pageState.cleanedImageUrl);
    const readyLabel = pageState.regions.length > 0 ? "พร้อมแก้ไข" : "พร้อมแปล";
    setStatus(`เปิดหน้า ${normalizedPageNumber}/${state.pdf.pageCount} แล้ว ${readyLabel}`, "success");
  } catch (error) {
    if (requestId !== _pdfPageRequestId) return;
    console.error("openPdfPage failed:", error);
    setStatus(error.message || "เปิดหน้า PDF ไม่สำเร็จ", "error");
  } finally {
    if (requestId === _pdfPageRequestId) {
      state.isBusy = false;
      renderAll();

      const activeCard = elements.pdfPageGrid.querySelector(`.film-card.is-active`);
      if (activeCard) {
        activeCard.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    }
  }
}

function clearPdfSelection() {
  if (!state.pdf) {
    return;
  }

  state.pdf.selectedPageNumbers = [];
  const message = state.pdf.activePageNumber
    ? `ล้างคิวส่งออกแล้ว ยังเปิดหน้า ${state.pdf.activePageNumber}`
    : "ล้างคิวส่งออกแล้ว";
  setStatus(message);
  renderAll();
}

async function loadPdfSource(file) {
  state.isBusy = true;
  state.pdf = null;
  state.image = null;
  resetTranslationState();
  renderAll();
  setStatus("กำลังโหลด PDF และสร้างตัวอย่าง...");

  try {
    const data = await window.mangaStudio.previewPdf({
      filePath: file.path,
      fileDataUrl: file.dataUrl,
      fileName: file.name,
      thumbWidth: 150,
    });

    state.pdf = {
      pageCount: data.page_count,
      activePageNumber: null,
      selectedPageNumbers: [],
      pageStates: {},
      pages: (data.pages || []).map((page) => ({
        pageNumber: page.page_number,
        width: page.width,
        height: page.height,
        thumbDataUrl: `data:${page.thumbnail_mime_type || "image/png"};base64,${page.thumbnail_base64}`,
      })),
    };

    setStatus(`โหลด PDF แล้ว พบ ${state.pdf.pageCount} หน้า`, "success");
    renderAll();

    if (data.selected_page) {
      await openPdfPage(data.selected_page);
    }
  } catch (error) {
    state.pdf = null;
    state.image = null;
    setStatus(error.message || "โหลดตัวอย่าง PDF ไม่สำเร็จ", "error");
    renderAll();
  } finally {
    state.isBusy = false;
    updateButtons();
  }
}

async function openSourceResult(result, { fromRecent = false, fromWindows = false, skipUnsavedPrompt = false } = {}) {
  if (!skipUnsavedPrompt) {
    const shouldProceed = await confirmSourceReplacement();
    if (!shouldProceed) {
      return false;
    }
  }

  if (result.kind === "project") {
    return loadProject(result.projectData, result.path, { skipUnsavedPrompt: true });
  }

  resetDocumentSessionState();
  state.projectPath = null;
  state.source = {
    path: result.path,
    name: result.name,
    dataUrl: result.dataUrl,
    fileUrl: result.fileUrl,
    kind: result.kind,
    mimeType: result.mimeType,
  };

  if (result.kind === "pdf") {
    await loadPdfSource(result);
    await refreshRecentFiles();
    if (fromWindows) {
      setStatus(`เปิด ${result.name} จากรายการล่าสุดของ Windows แล้ว`, "success");
    } else if (fromRecent) {
      setStatus(`เปิด ${result.name} จากไฟล์ล่าสุดแล้ว`, "success");
    }
    return true;
  }

  state.pdf = null;
  state.image = {
    name: result.name,
    dataUrl: result.dataUrl,
    fileUrl: result.fileUrl,
    width: 0,
    height: 0,
    pageNumber: 1,
    totalPages: 1,
    sourceKind: "image",
  };
  elements.cleanPreviewToggle.checked = true;
  resetTranslationState();
  if (fromWindows) {
    setStatus(`เปิด ${result.name} จากรายการล่าสุดของ Windows แล้ว`, "success");
  } else if (fromRecent) {
    setStatus(`เปิด ${result.name} จากไฟล์ล่าสุดแล้ว`, "success");
  } else {
    setStatus(`เปิด ${result.name} แล้ว พร้อมแปลเป็นไทย`, "success");
  }
  renderAll();
  await refreshRecentFiles();
  return true;
}

async function openRecentFile(filePath, { fromWindows = false } = {}) {
  if (!filePath) {
    return;
  }

  state.isBusy = true;
  renderRecentFiles();
  updateButtons();

  try {
    const result = await window.mangaStudio.openRecentFile({ filePath });
    await openSourceResult(result, { fromRecent: !fromWindows, fromWindows });
  } catch (error) {
    await refreshRecentFiles();
    setStatus(error.message || "เปิดไฟล์ล่าสุดไม่สำเร็จ", "error");
  } finally {
    state.isBusy = false;
    renderRecentFiles();
    updateButtons();
  }
}

async function removeRecentFile(filePath) {
  if (!filePath || typeof window.mangaStudio.removeRecentFile !== "function") {
    return;
  }

  try {
    const recentFiles = await window.mangaStudio.removeRecentFile({ filePath });
    setRecentFiles(recentFiles);
  } catch (error) {
    setStatus(error.message || "ลบไฟล์ออกจากรายการล่าสุดไม่สำเร็จ", "error");
  }
}

async function clearRecentFiles() {
  if (typeof window.mangaStudio.clearRecentFiles !== "function") {
    return;
  }

  try {
    const recentFiles = await window.mangaStudio.clearRecentFiles();
    setRecentFiles(recentFiles);
    setStatus("ล้างรายการไฟล์ล่าสุดแล้ว", "success");
  } catch (error) {
    setStatus(error.message || "ล้างรายการไฟล์ล่าสุดไม่สำเร็จ", "error");
  }
}

async function openFile() {
  const result = await window.mangaStudio.pickFile();
  if (result.canceled) {
    return;
  }

  await openSourceResult(result);
}

async function requestTranslationForImage(image, apiKey) {
  return window.mangaStudio.translateImage({
    imageDataUrl: image.dataUrl,
    fileName: image.name,
    apiKey,
  });
}

function applyTranslationResultToCurrentState(data) {
  state.isDirty = true;
  clearInlineEditingState();
  state.regions = (data.regions || []).map(normalizeRegion);
  state.selectedRegionId = state.regions[0]?.id || null;
  state.cleanedImageUrl = data.cleaned_image_base64
    ? `data:image/png;base64,${data.cleaned_image_base64}`
    : null;

  if (state.image && data.image_width && data.image_height) {
    state.image.width = data.image_width;
    state.image.height = data.image_height;
    autofitRegions(state.regions, state.image.width, state.image.height);
  }

  elements.cleanPreviewToggle.checked = Boolean(state.cleanedImageUrl);
  setWarnings(data.warnings || []);
  persistActivePdfPageState();
  syncCurrentPageCacheFromState();
}

function applyTranslationResultToPageState(pageState, data) {
  pageState.regions = (data.regions || []).map(normalizeRegion);
  pageState.selectedRegionId = pageState.regions[0]?.id || null;
  pageState.cleanedImageUrl = data.cleaned_image_base64
    ? `data:image/png;base64,${data.cleaned_image_base64}`
    : null;
  pageState.warnings = Array.isArray(data.warnings) ? data.warnings.map((warning) => String(warning)) : [];

  if (pageState.image && data.image_width && data.image_height) {
    pageState.image.width = data.image_width;
    pageState.image.height = data.image_height;
    autofitRegions(pageState.regions, pageState.image.width, pageState.image.height);
  }
}

async function translatePdfPages(pageNumbers, apiKey) {
  const queue = [...new Set(pageNumbers)].sort((left, right) => left - right);
  const preferredActivePage = state.pdf.activePageNumber || queue[0];

  persistActivePdfPageState();

  for (const [index, pageNumber] of queue.entries()) {
    setStatus(`กำลังแปลหน้า ${pageNumber} (${index + 1}/${queue.length})...`);
    const pageState = await ensurePdfPageRendered(pageNumber);
    const data = await requestTranslationForImage(pageState.image, apiKey);
    applyTranslationResultToPageState(pageState, data);
  }

  if (preferredActivePage) {
    state.pdf.activePageNumber = preferredActivePage;
    loadPdfPageState(preferredActivePage);
    if (state.image) {
      elements.cleanPreviewToggle.checked = true;
    }
  }
  setStatus(`แปลครบ ${queue.length} หน้าแล้ว`, "success");
  showToast({
    title: "แปล PDF เสร็จแล้ว",
    message: `แปลครบ ${queue.length} หน้าแล้ว พร้อมส่งออกเป็น PDF ใหม่ได้ทันที`,
    tone: "success",
  });
  renderAll();
}

const _CLEAN_PROGRESS_STEPS = [
  { at: 0,  pct: 5,  msg: "กำลังเตรียมภาพ..." },
  { at: 1,  pct: 10, msg: "ส่งภาพให้ Gemini..." },
  { at: 3,  pct: 18, msg: "Gemini กำลังสแกนข้อความ..." },
  { at: 5,  pct: 28, msg: "ตรวจพบบริเวณข้อความ..." },
  { at: 8,  pct: 38, msg: "กำลังลบข้อความออก..." },
  { at: 11, pct: 48, msg: "Gemini กำลัง inpaint พื้นหลัง..." },
  { at: 14, pct: 58, msg: "เติมพื้นหลังให้เนียน..." },
  { at: 17, pct: 65, msg: "ปรับแต่งรายละเอียด..." },
  { at: 20, pct: 72, msg: "ตรวจสอบความเรียบร้อย..." },
  { at: 24, pct: 78, msg: "Gemini กำลัง generate ภาพ..." },
  { at: 28, pct: 84, msg: "เกือบเสร็จแล้ว..." },
  { at: 32, pct: 88, msg: "รอ Gemini ส่งภาพกลับ..." },
  { at: 40, pct: 92, msg: "รอรับข้อมูล..." },
];

async function cleanOnlyImage() {
  if (!state.image) {
    setStatus("เปิดภาพก่อน", "error");
    return;
  }

  state.isBusy = true;
  updateButtons();
  showTranslatingOverlay("กำลังลบข้อความออก...");
  setStatus("กำลังลบข้อความออกจากภาพ...", "default");

  // Simulated progress while waiting for API.
  const startTime = Date.now();
  let stepIdx = 0;
  const progressTimer = setInterval(() => {
    const elapsed = (Date.now() - startTime) / 1000;
    while (stepIdx < _CLEAN_PROGRESS_STEPS.length && elapsed >= _CLEAN_PROGRESS_STEPS[stepIdx].at) {
      const step = _CLEAN_PROGRESS_STEPS[stepIdx];
      updateTranslateProgress(step.pct, step.msg);
      stepIdx++;
    }
  }, 500);

  try {
    const apiKey = elements.apiKeyInput.value.trim();
    const result = await window.mangaStudio.cleanOnly({
      imageDataUrl: state.image.dataUrl,
      apiKey,
    });

    clearInterval(progressTimer);
    updateTranslateProgress(95, "กำลังประมวลผลภาพ...");

    if (result.cleaned_image_base64) {
      updateTranslateProgress(100, "ลบข้อความสำเร็จ!");
      state.cleanedImageUrl = `data:image/png;base64,${result.cleaned_image_base64}`;
      state.regions = [];
      state.selectedRegionId = null;
      state.isDirty = true;
      elements.cleanPreviewToggle.checked = true;
      persistActivePdfPageState();
      syncCurrentPageCacheFromState();
      setStatus("ลบข้อความสำเร็จ!", "success");
      showToast({
        title: "ลบข้อความสำเร็จ",
        message: "ภาพถูกลบข้อความออกแล้ว พร้อมส่งออกได้เลย",
      });
    } else {
      setStatus("Gemini ไม่ได้ส่งภาพกลับมา", "error");
    }
  } catch (error) {
    clearInterval(progressTimer);
    setStatus(error.message || "ลบข้อความไม่สำเร็จ", "error");
  } finally {
    state.isBusy = false;
    hideTranslatingOverlay();
    updateButtons();
    renderAll();
  }
}

async function cleanAndSuggestImage() {
  if (!state.image) {
    setStatus("เปิดภาพก่อน", "error");
    return;
  }

  state.isBusy = true;
  updateButtons();
  showTranslatingOverlay("กำลังลบข้อความและสร้าง Suggest...");
  setStatus("กำลังเตรียม OCR context สำหรับ Suggest...", "default");

  const startTime = Date.now();
  let stepIdx = 0;
  const progressTimer = setInterval(() => {
    const elapsed = (Date.now() - startTime) / 1000;
    while (stepIdx < _CLEAN_PROGRESS_STEPS.length && elapsed >= _CLEAN_PROGRESS_STEPS[stepIdx].at) {
      const step = _CLEAN_PROGRESS_STEPS[stepIdx];
      updateTranslateProgress(Math.min(90, step.pct), step.msg);
      stepIdx += 1;
    }
  }, 500);

  try {
    const apiKey = elements.apiKeyInput.value.trim();
    localStorage.setItem("geminiApiKey", apiKey);
    const currentPageNumber = getCurrentPageNumber();
    const ragSource = getRagSourceMetadata(currentPageNumber);
    const providerLabel = "Gemini OCR + SQL RAG";
    let currentOcrPage = null;
    try {
      currentOcrPage = await ensureOcrForPage(currentPageNumber);
    } catch (ocrError) {
      console.warn("ensureOcrForPage failed before clean+suggest:", ocrError);
    }

    updateTranslateProgress(20, "กำลังรวบรวมบริบทจาก OCR และหน้าข้างเคียง...");
    const nearbyOcrPages = getNearbyOcrPages(currentPageNumber, { distance: 2, maxItems: 4 });
    const translationMemory = collectTranslationMemoryEntries({ includeSuggested: false, limit: 32 });
    const approvedTranslations = collectApprovedTranslationEntries({ limit: 24 });
    const glossaryEntries = getGlossaryEntries();
    updateTranslateProgress(35, `กำลังสร้าง Suggest ด้วย ${providerLabel}...`);

    updateTranslateProgress(35, "กำลังส่งภาพไปลบข้อความและสร้าง Suggest...");
    updateTranslateProgress(35, `กำลังสร้าง Suggest ด้วย ${providerLabel}...`);
    const result = await window.mangaStudio.cleanAndSuggest({
      imageDataUrl: state.image.dataUrl,
      fileName: state.image.name,
      apiKey,
      documentKey: ragSource.documentKey,
      sourceKind: ragSource.sourceKind,
      sourcePath: ragSource.sourcePath,
      sourceName: ragSource.sourceName,
      projectPath: ragSource.projectPath,
      pageNumber: ragSource.pageNumber,
      currentOcrPage,
      nearbyOcrPages,
      translationMemory,
      approvedTranslations,
      glossaryEntries,
    });

    clearInterval(progressTimer);
    updateTranslateProgress(96, "กำลังสร้างเลเยอร์ Suggest...");

    state.cleanedImageUrl = result.cleaned_image_base64
      ? `data:image/png;base64,${result.cleaned_image_base64}`
      : state.cleanedImageUrl;
    clearInlineEditingState();
    state.regions = (result.regions || []).map(normalizeRegion);
    state.selectedRegionId = state.regions[0]?.id || null;
    state.isDirty = true;
    elements.cleanPreviewToggle.checked = Boolean(state.cleanedImageUrl);
    setWarnings(result.warnings || []);
    persistActivePdfPageState();
    syncCurrentPageCacheFromState();
    recordActivity("clean-suggest", {
      title: "ลบข้อความพร้อมสร้าง Suggest",
      details: `OCR ${result.ocr_blocks_used || 0} บล็อก • Suggest ${state.regions.length} กล่อง`,
      pageKey: getCurrentPageKey(),
      mergeKey: `clean-suggest:${getCurrentPageKey()}`,
      meta: {
        ocrBlocksUsed: Number(result.ocr_blocks_used || 0),
        suggestedRegions: state.regions.length,
        suggestionProvider: result.suggestion_provider || "gemini-rag",
        suggestionModel: result.suggestion_model_used || "",
      },
    });
    updateTranslateProgress(100, "Suggest layer พร้อมแก้ไขแล้ว");
    setStatus(`ลบข้อความและสร้าง Suggest แล้ว ${state.regions.length} กล่อง`, "success");
    showToast({
      title: "Suggest layer พร้อมแล้ว",
      message: `ใช้ Gemini OCR + SQL RAG สร้างกล่องข้อความแนะนำ ${state.regions.length} กล่องบนภาพสะอาด`,
      tone: "success",
    });
    renderAll();
  } catch (error) {
    clearInterval(progressTimer);
    setStatus(error.message || "ลบข้อความพร้อม Suggest ไม่สำเร็จ", "error");
  } finally {
    state.isBusy = false;
    hideTranslatingOverlay();
    updateButtons();
  }
}

async function translateImage() {
  const selectedPdfPages = state.source?.kind === "pdf" ? getSelectedPdfPages() : [];
  if (!state.image && selectedPdfPages.length === 0) {
    return;
  }

  state.isBusy = true;
  updateButtons();
  showTranslatingOverlay();

  try {
    const apiKey = elements.apiKeyInput.value.trim();
    localStorage.setItem("geminiApiKey", apiKey);

    if (state.source?.kind === "pdf" && selectedPdfPages.length > 0) {
      await translatePdfPages(selectedPdfPages, apiKey);
      return;
    }

    const statusLabel = state.source?.kind === "pdf"
      ? `กำลังส่งหน้า ${state.image.pageNumber} ไปให้ Gemini วิเคราะห์และแปล...`
      : "กำลังส่งภาพไปให้ Gemini วิเคราะห์และแปล...";
    setStatus(statusLabel, "default");

    const data = await requestTranslationForImage(state.image, apiKey);
    applyTranslationResultToCurrentState(data);
    setStatus(`แปลเสร็จแล้ว พบ ${state.regions.length} กล่องข้อความ`, "success");
    showToast({
      title: "แปลเสร็จแล้ว",
      message: `พบ ${state.regions.length} กล่องข้อความ พร้อมแก้ไขและส่งออกต่อได้`,
      tone: "success",
    });
    renderAll();
  } catch (error) {
    setStatus(error.message || "แปลข้อความไม่สำเร็จ", "error");
  } finally {
    hideTranslatingOverlay();
    state.isBusy = false;
    updateButtons();
  }
}

function togglePdfPageSelection(pageNumber) {
  if (!state.pdf) {
    return;
  }

  state.isDirty = true;
  const selectedPages = new Set(getSelectedPdfPages());
  const willSelect = !selectedPages.has(pageNumber);
  if (willSelect) {
    selectedPages.add(pageNumber);
  } else {
    selectedPages.delete(pageNumber);
  }

  state.pdf.selectedPageNumbers = [...selectedPages].sort((left, right) => left - right);
  setStatus(
    willSelect
      ? `เพิ่มหน้า ${pageNumber} เข้าในคิวแล้ว`
      : `เอาหน้า ${pageNumber} ออกจากคิวแล้ว`,
    "success"
  );
  recordActivity("page-selection", {
    title: willSelect ? "เพิ่มหน้าลงคิวแปล/ส่งออก" : "เอาหน้าออกจากคิวแปล/ส่งออก",
    details: `หน้า ${pageNumber}`,
    pageKey: String(pageNumber),
    mergeKey: `page-selection:${pageNumber}`,
    meta: {
      selected: willSelect,
    },
  });
  renderAll();
}

async function openPdfPage(pageNumber) {
  if (!state.pdf || !state.source || !isPagedSourceKind(state.source.kind)) {
    return;
  }

  const normalizedPageNumber = clamp(Math.round(pageNumber), 1, state.pdf.pageCount);
  persistActivePdfPageState();
  state.isBusy = true;
  updateButtons();
  setStatus(`กำลังเปิดหน้าที่ ${normalizedPageNumber}...`);

  const requestId = ++_pdfPageRequestId;

  try {
    const pageState = await ensurePdfPageRendered(normalizedPageNumber);
    if (requestId !== _pdfPageRequestId) return;

    state.pdf.activePageNumber = normalizedPageNumber;
    loadPdfPageState(normalizedPageNumber);
    elements.cleanPreviewToggle.checked = Boolean(pageState.cleanedImageUrl);
    setStatus(
      `เปิดหน้าที่ ${normalizedPageNumber}/${state.pdf.pageCount} แล้ว ${pageState.regions.length > 0 ? "พร้อมแก้ไข" : "พร้อมแปล"}`,
      "success"
    );
    recordActivity("page-open", {
      title: "เปิดหน้าเอกสาร",
      details: `หน้า ${normalizedPageNumber}/${state.pdf.pageCount}`,
      pageKey: String(normalizedPageNumber),
      mergeKey: `page-open:${normalizedPageNumber}`,
    });
    startBackgroundOcrIndexing();
  } catch (error) {
    if (requestId !== _pdfPageRequestId) return;
    console.error("openPdfPage failed:", error);
    setStatus(error.message || "เปิดหน้าเอกสารไม่สำเร็จ", "error");
  } finally {
    if (requestId === _pdfPageRequestId) {
      state.isBusy = false;
      renderAll();

      const activeCard = elements.pdfPageGrid.querySelector(".film-card.is-active");
      if (activeCard) {
        activeCard.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    }
  }
}

function clearPdfSelection() {
  if (!state.pdf) {
    return;
  }

  state.isDirty = true;
  const removedPages = getSelectedPdfPages();
  state.pdf.selectedPageNumbers = [];
  setStatus(
    state.pdf.activePageNumber
      ? `ล้างคิวแล้ว ยังเปิดหน้า ${state.pdf.activePageNumber}`
      : "ล้างคิวแล้ว"
  );
  recordActivity("page-selection-clear", {
    title: "ล้างคิวหน้าที่เลือก",
    details: removedPages.length > 0 ? removedPages.join(", ") : "ไม่มีหน้าที่ถูกเลือก",
    pageKey: getCurrentPageKey(),
    mergeKey: "page-selection-clear",
  });
  renderAll();
}

async function loadPagedSource(file) {
  state.isBusy = true;
  state.pdf = null;
  state.image = null;
  resetTranslationState();
  renderAll();
  setStatus(`กำลังโหลด ${getSourceKindLabel(file.kind)} และสร้างตัวอย่าง...`);

  try {
    const data = file.kind === "pdf"
      ? await window.mangaStudio.previewPdf({
          filePath: file.path,
          fileDataUrl: file.dataUrl,
          fileName: file.name,
          thumbWidth: 150,
        })
      : await window.mangaStudio.previewPagedDocument({
          filePath: file.path,
          fileName: file.name,
          thumbWidth: 150,
        });

    state.pdf = {
      pageCount: data.page_count,
      activePageNumber: null,
      selectedPageNumbers: [],
      pageStates: {},
      pages: (data.pages || []).map((page) => ({
        pageNumber: page.page_number,
        width: page.width,
        height: page.height,
        thumbDataUrl: `data:${page.thumbnail_mime_type || "image/png"};base64,${page.thumbnail_base64}`,
        fileName: page.file_name || "",
        fileUrl: page.file_url || "",
      })),
    };

    setWarnings(data.warnings || []);
    recordActivity("open-source", {
      title: `เปิดไฟล์ ${getSourceKindLabel(file.kind)}`,
      details: `${file.name} • ${state.pdf.pageCount} หน้า`,
      pageKey: "1",
      mergeKey: `open-source:${file.path || file.name}`,
      meta: {
        sourceKind: file.kind,
        pageCount: state.pdf.pageCount,
      },
    });
    renderAll();

    if (data.selected_page) {
      await openPdfPage(data.selected_page);
    } else {
      setStatus(`โหลด ${getSourceKindLabel(file.kind)} แล้ว พบ ${state.pdf.pageCount} หน้า`, "success");
    }
  } catch (error) {
    state.pdf = null;
    state.image = null;
    setStatus(error.message || "โหลดเอกสารไม่สำเร็จ", "error");
    renderAll();
  } finally {
    state.isBusy = false;
    updateButtons();
  }
}

async function loadPdfSource(file) {
  await loadPagedSource(file);
}

async function openSourceResult(result, { fromRecent = false, fromWindows = false, skipUnsavedPrompt = false } = {}) {
  if (!skipUnsavedPrompt) {
    const shouldProceed = await confirmSourceReplacement();
    if (!shouldProceed) {
      return false;
    }
  }

  if (result.kind === "project") {
    return loadProject(result.projectData, result.path, { skipUnsavedPrompt: true });
  }

  resetDocumentSessionState();
  state.projectPath = null;
  state.source = {
    path: result.path,
    name: result.name,
    dataUrl: result.dataUrl,
    fileUrl: result.fileUrl,
    kind: result.kind,
    mimeType: result.mimeType,
  };
  loadHistoryCacheForCurrentSource();

  if (isPagedSourceKind(result.kind)) {
    await loadPagedSource(result);
    await refreshRecentFiles();
    startBackgroundOcrIndexing();
    if (fromWindows) {
      setStatus(`เปิด ${result.name} จากรายการล่าสุดของ Windows แล้ว`, "success");
    } else if (fromRecent) {
      setStatus(`เปิด ${result.name} จากไฟล์ล่าสุดแล้ว`, "success");
    }
    return true;
  }

  state.pdf = null;
  state.image = {
    name: result.name,
    dataUrl: result.dataUrl,
    fileUrl: result.fileUrl,
    width: 0,
    height: 0,
    pageNumber: 1,
    totalPages: 1,
    sourceKind: "image",
  };
  elements.cleanPreviewToggle.checked = true;
  resetTranslationState();
  updateCacheEntry("single", {
    pageNumber: 1,
    pageLabel: "ภาพหลัก",
    hasRenderedImage: true,
  });
  recordActivity("open-source", {
    title: "เปิดไฟล์ภาพ",
    details: result.name,
    pageKey: "single",
    mergeKey: `open-source:${result.path || result.name}`,
    meta: {
      sourceKind: result.kind,
    },
  });
  if (fromWindows) {
    setStatus(`เปิด ${result.name} จากรายการล่าสุดของ Windows แล้ว`, "success");
  } else if (fromRecent) {
    setStatus(`เปิด ${result.name} จากไฟล์ล่าสุดแล้ว`, "success");
  } else {
    setStatus(`เปิด ${result.name} แล้ว พร้อมแปลเป็นไทย`, "success");
  }
  renderAll();
  await refreshRecentFiles();
  startBackgroundOcrIndexing();
  return true;
}

async function translatePdfPages(pageNumbers, apiKey) {
  const queue = [...new Set(pageNumbers)].sort((left, right) => left - right);
  const preferredActivePage = state.pdf?.activePageNumber || queue[0];

  persistActivePdfPageState();
  state.isDirty = true;
  const emptyPageNumbers = [];

  for (const [index, pageNumber] of queue.entries()) {
    setStatus(`กำลังแปลหน้าที่ ${pageNumber} (${index + 1}/${queue.length})...`);
    const pageState = await ensurePdfPageRendered(pageNumber);
    const data = await requestTranslationForImage(pageState.image, apiKey);
    applyTranslationResultToPageState(pageState, data);
    updateCacheEntry(String(pageNumber), {
      regionsCount: pageState.regions.length,
      hasCleanedImage: Boolean(pageState.cleanedImageUrl),
      hasRenderedImage: true,
      modelUsed: data.model_used || DEFAULT_MODEL_BADGE,
    });
    recordActivity("translate-success", {
      title: `แปลหน้าที่ ${pageNumber} สำเร็จ`,
      details: `พบ ${pageState.regions.length} กล่องข้อความ`,
      pageKey: String(pageNumber),
      mergeKey: `translate:${pageNumber}`,
      meta: {
        modelUsed: data.model_used || DEFAULT_MODEL_BADGE,
        regionsCount: pageState.regions.length,
      },
    });
    if (pageState.regions.length === 0) {
      emptyPageNumbers.push(pageNumber);
    }
  }

  if (preferredActivePage) {
    state.pdf.activePageNumber = preferredActivePage;
    loadPdfPageState(preferredActivePage);
    if (state.image) {
      elements.cleanPreviewToggle.checked = true;
    }
  }

  if (emptyPageNumbers.length === queue.length) {
    setStatus(`Gemini ไม่พบข้อความในทุกหน้าที่แปล (${queue.length} หน้า)`, "error");
    showToast({
      title: "ไม่พบข้อความ",
      message: "Gemini ไม่พบข้อความที่ต้องแปลในทุกหน้า ลองเปลี่ยนโมเดลใน .env",
      tone: "error",
      duration: 8000,
    });
  } else if (emptyPageNumbers.length > 0) {
    setStatus(`แปลครบ ${queue.length} หน้า (${emptyPageNumbers.length} หน้าไม่พบข้อความ: ${emptyPageNumbers.join(", ")})`, "success");
    showToast({
      title: "แปลเอกสารเสร็จแล้ว",
      message: `${emptyPageNumbers.length} หน้าไม่พบข้อความ: ${emptyPageNumbers.join(", ")}`,
      tone: "success",
    });
  } else {
    setStatus(`แปลครบ ${queue.length} หน้าแล้ว`, "success");
    showToast({
      title: "แปลเอกสารเสร็จแล้ว",
      message: `แปลครบ ${queue.length} หน้าแล้ว พร้อมแก้ไขและส่งออกต่อได้`,
      tone: "success",
    });
  }
  renderAll();

  // Auto-show preview so the user can see before/after comparison immediately.
  if (state.regions.length > 0 || state.cleanedImageUrl) {
    try {
      await showPreview();
    } catch (_previewErr) {
      // Preview is optional — ignore errors.
    }
  }
}

async function cleanOnlyImage() {
  if (!state.image) {
    setStatus("เปิดภาพก่อน", "error");
    return;
  }

  state.isBusy = true;
  updateButtons();
  showTranslatingOverlay("กำลังลบข้อความออก...");
  setStatus("กำลังลบข้อความออกจากภาพ...", "default");

  const startTime = Date.now();
  let stepIdx = 0;
  const progressTimer = setInterval(() => {
    const elapsed = (Date.now() - startTime) / 1000;
    while (stepIdx < _CLEAN_PROGRESS_STEPS.length && elapsed >= _CLEAN_PROGRESS_STEPS[stepIdx].at) {
      const step = _CLEAN_PROGRESS_STEPS[stepIdx];
      updateTranslateProgress(step.pct, step.msg);
      stepIdx += 1;
    }
  }, 500);

  try {
    const apiKey = elements.apiKeyInput.value.trim();
    const result = await window.mangaStudio.cleanOnly({
      imageDataUrl: state.image.dataUrl,
      apiKey,
    });

    clearInterval(progressTimer);
    updateTranslateProgress(95, "กำลังประมวลผลภาพ...");

    if (result.cleaned_image_base64) {
      updateTranslateProgress(100, "ลบข้อความสำเร็จ!");
      state.cleanedImageUrl = `data:image/png;base64,${result.cleaned_image_base64}`;
      state.regions = [];
      state.selectedRegionId = null;
      state.isDirty = true;
      elements.cleanPreviewToggle.checked = true;
      persistActivePdfPageState();
      updateCacheEntry(getCurrentPageKey(), {
        hasCleanedImage: true,
        regionsCount: 0,
      });
      recordActivity("clean-success", {
        title: "ลบข้อความออกจากภาพสำเร็จ",
        details: `หน้า ${getCurrentPageKey()}`,
        pageKey: getCurrentPageKey(),
        mergeKey: `clean:${getCurrentPageKey()}`,
      });
      setStatus("ลบข้อความสำเร็จ!", "success");
      showToast({
        title: "ลบข้อความสำเร็จ",
        message: "ภาพถูกลบข้อความออกแล้ว พร้อมส่งออกได้เลย",
      });
    } else {
      setStatus("Gemini ไม่ได้ส่งภาพกลับมา", "error");
    }
  } catch (error) {
    clearInterval(progressTimer);
    setStatus(error.message || "ลบข้อความไม่สำเร็จ", "error");
  } finally {
    state.isBusy = false;
    hideTranslatingOverlay();
    updateButtons();
    renderAll();
  }
}

async function translateImage() {
  const hasPagedSource = Boolean(state.source && isPagedSourceKind(state.source.kind) && state.pdf);
  if (!state.image && !hasPagedSource) {
    return;
  }

  let targetPages = null;
  if (hasPagedSource) {
    try {
      targetPages = await chooseTranslationPages();
      if (!targetPages || targetPages.length === 0) {
        return;
      }
      recordActivity("translation-mode", {
        title: "ยืนยันโหมดการแปล",
        details: state.translationPreferences.mode === "all"
          ? "แปลทุกหน้า"
          : state.translationPreferences.mode === "selected"
            ? `แปลหน้าที่ระบุ: ${targetPages.join(", ")}`
            : `แปลหน้าปัจจุบัน: ${targetPages[0]}`,
        pageKey: String(targetPages[0]),
        mergeKey: "translation-mode-confirm",
      });
    } catch (error) {
      setStatus(error.message || "เลือกหน้าที่จะแปลไม่สำเร็จ", "error");
      return;
    }
  }

  state.isBusy = true;
  updateButtons();
  showTranslatingOverlay();

  try {
    const apiKey = elements.apiKeyInput.value.trim();
    localStorage.setItem("geminiApiKey", apiKey);

    if (hasPagedSource && targetPages) {
      await translatePdfPages(targetPages, apiKey);
      return;
    }

    setStatus("กำลังส่งภาพไปให้ Gemini วิเคราะห์และแปล...", "default");
    const data = await requestTranslationForImage(state.image, apiKey);
    applyTranslationResultToCurrentState(data);
    updateCacheEntry(getCurrentPageKey(), {
      regionsCount: state.regions.length,
      hasCleanedImage: Boolean(state.cleanedImageUrl),
      hasRenderedImage: true,
      modelUsed: data.model_used || DEFAULT_MODEL_BADGE,
    });
    recordActivity("translate-success", {
      title: "แปลภาพสำเร็จ",
      details: `พบ ${state.regions.length} กล่องข้อความ`,
      pageKey: getCurrentPageKey(),
      mergeKey: `translate:${getCurrentPageKey()}`,
      meta: {
        modelUsed: data.model_used || DEFAULT_MODEL_BADGE,
        regionsCount: state.regions.length,
      },
    });
    if (state.regions.length > 0) {
      setStatus(`แปลเสร็จแล้ว พบ ${state.regions.length} กล่องข้อความ`, "success");
      showToast({
        title: "แปลเสร็จแล้ว",
        message: `พบ ${state.regions.length} กล่องข้อความ พร้อมแก้ไขและส่งออกต่อได้`,
        tone: "success",
      });
    } else {
      const warningParts = ["Gemini ไม่พบข้อความในภาพนี้"];
      if (data.warnings && data.warnings.length > 0) {
        warningParts.push(data.warnings.join("; "));
      }
      warningParts.push(`(โมเดล: ${data.model_used || DEFAULT_MODEL_BADGE})`);
      setStatus(warningParts.join(" — "), "error");
      showToast({
        title: "ไม่พบข้อความ",
        message: "Gemini ไม่พบข้อความที่ต้องแปลในภาพนี้ ลองใช้ภาพมังงะที่มีข้อความชัดเจน หรือเปลี่ยนโมเดลใน .env",
        tone: "error",
        duration: 8000,
      });
    }
    renderAll();

    // Auto-show preview so the user can see before/after comparison immediately.
    if (state.regions.length > 0 || state.cleanedImageUrl) {
      try {
        await showPreview();
      } catch (_previewErr) {
        // Preview is optional — ignore errors and let the user see the canvas.
      }
    }
  } catch (error) {
    setStatus(error.message || "แปลข้อความไม่สำเร็จ", "error");
  } finally {
    hideTranslatingOverlay();
    state.isBusy = false;
    updateButtons();
  }
}

function attachInspectorHandlers() {
  elements.kindInput.addEventListener("input", (event) => {
    updateSelectedRegion({ kind: event.target.value.trim() || "dialogue" });
  });
  elements.translatedInput.addEventListener("input", (event) => {
    updateSelectedRegion({ translated_text: event.target.value });
  });
  elements.fontFamilyInput.addEventListener("change", (event) => {
    updateSelectedRegion({ font_family: event.target.value || THAI_FONT_FAMILY });
  });
  elements.fontSizeInput.addEventListener("change", (event) => {
    if (event.target.value === "custom") {
      elements.fontSizeCustomInput.focus();
      return;
    }
    updateSelectedRegion({ font_size: clamp(Number(event.target.value) || 28, 10, 120) });
  });
  elements.fontSizeCustomInput.addEventListener("input", (event) => {
    updateSelectedRegion({ font_size: clamp(Number(event.target.value) || 28, 10, 120) });
  });
  elements.alignmentInput.addEventListener("change", (event) => {
    updateSelectedRegion({ alignment: event.target.value });
  });
  elements.textColorInput.addEventListener("input", (event) => {
    updateSelectedRegion({ text_color: event.target.value.trim() || "#111111" });
  });
  elements.backgroundColorInput.addEventListener("change", (event) => {
    updateSelectedRegion({ background_color: event.target.value || "transparent" });
  });
  elements.textStrokeColorInput.addEventListener("input", (event) => {
    updateSelectedRegion({ text_stroke_color: event.target.value.trim() || "#000000" });
  });
  elements.textStrokeWidthInput.addEventListener("input", (event) => {
    updateSelectedRegion({ text_stroke_width: clamp(Number(event.target.value) || 0, 0, 10) });
  });
  elements.textShadowColorInput.addEventListener("input", (event) => {
    updateSelectedRegion({ text_shadow_color: event.target.value.trim() || "#000000" });
  });
  elements.textShadowBlurInput.addEventListener("input", (event) => {
    updateSelectedRegion({ text_shadow_blur: clamp(Number(event.target.value) || 0, 0, 20) });
  });
  elements.notesInput.addEventListener("input", (event) => {
    updateSelectedRegion({ notes: event.target.value });
  });
}

/* ═══ Preview Modal ═══ */
async function showPreview() {
  if (!state.image || (state.regions.length === 0 && !state.cleanedImageUrl)) {
    setStatus("ยังไม่มีข้อมูลให้ดูตัวอย่าง", "error");
    return;
  }

  if (!state.image || (state.regions.length === 0 && !state.cleanedImageUrl)) {
    setStatus("ยังไม่มีข้อมูลให้ preview", "error");
    return;
  }

  try {
    let afterDataUrl;
    if (state.regions.length === 0 && state.cleanedImageUrl) {
      // Clean-only mode: show cleaned image directly.
      afterDataUrl = state.cleanedImageUrl;
    } else {
      afterDataUrl = await renderTranslatedPageDataUrl({
        image: state.image,
        cleanedImageUrl: state.cleanedImageUrl,
        regions: state.regions,
      }, { preferCleanBase: hasVisibleCleanBase() });
    }

    const beforeSrc = state.image.dataUrl;
    elements.previewBefore.src = beforeSrc;
    elements.previewAfter.src = afterDataUrl;

    await Promise.all([
      (elements.previewBefore.decode ? elements.previewBefore.decode().catch(() => {}) : Promise.resolve()),
      (elements.previewAfter.decode ? elements.previewAfter.decode().catch(() => {}) : Promise.resolve()),
    ]);

    // Store the rendered preview for display, but keep original clean base.
    state.previewAfterUrl = afterDataUrl;

    setCompareSliderPosition(50);
    elements.previewModal.classList.remove("hidden");
    // Hide stage overlay (text-region boxes) so they don't show through.
    elements.overlayLayer.style.display = "none";
    attachCompareSliderEvents();
  } catch (error) {
    // Restore overlay if it was hidden before the error.
    elements.overlayLayer.style.display = "";
    setStatus(error.message || "เปิดดูตัวอย่างไม่สำเร็จ", "error");
    return;
  }
}

function closePreview() {
  elements.previewModal.classList.add("hidden");
  detachCompareSliderEvents();
  exitEditMode();
  // Restore overlay layer visibility.
  elements.overlayLayer.style.display = "";
  // Ensure main view shows the latest edited image.
  if (state.cleanedImageUrl) {
    elements.cleanPreviewToggle.checked = true;
  }
  renderBaseImage();
  renderRegions();
}

/* ═══ Edit Mode ═══ */
const editElements = {
  editModeButton: document.getElementById("editModeButton"),
  editModePanel: document.getElementById("editModePanel"),
  editCanvas: document.getElementById("editCanvas"),
  editBrushSize: document.getElementById("editBrushSize"),
  editBrushSizeLabel: document.getElementById("editBrushSizeLabel"),
  editUndoStroke: document.getElementById("editUndoStroke"),
  editClearBrush: document.getElementById("editClearBrush"),
  editPromptInput: document.getElementById("editPromptInput"),
  editSendButton: document.getElementById("editSendButton"),
  editStatus: document.getElementById("editStatus"),
  editLoadingOverlay: document.getElementById("editLoadingOverlay"),
  editLoadingLabel: document.getElementById("editLoadingLabel"),
  editCompare: document.getElementById("editCompare"),
  editCompareBefore: document.getElementById("editCompareBefore"),
  editCompareAfter: document.getElementById("editCompareAfter"),
  editCompareSlider: document.getElementById("editCompareSlider"),
};

const EDIT_UNDO_MAX = 25;
const EDIT_PROMPT_MAX_LENGTH = 2000;
const EDIT_BRUSH_COLOR = "rgba(255, 50, 50, 0.45)";

let _editModeActive = false;
let _editCtx = null;
let _editBaseImage = null;
let _editStrokes = [];
let _editDrawing = false;
let _editSending = false;
let _editLastPos = null;

// ─── Stable handler references (fix #1: same refs for add/remove) ───
function _editPointerDown(event) {
  if (!_editCtx) return;
  // Hide compare view when user starts drawing again.
  _hideEditCompare();
  _editDrawing = true;
  const canvas = editElements.editCanvas;

  // Undo snapshot (fix #3: cap at EDIT_UNDO_MAX).
  if (_editStrokes.length >= EDIT_UNDO_MAX) {
    _editStrokes.shift();
  }
  _editStrokes.push(_editCtx.getImageData(0, 0, canvas.width, canvas.height));

  // Draw initial dot.
  const pos = _editCanvasPos(event);
  _editLastPos = pos;
  const radius = _scaledBrushRadius();
  _editCtx.beginPath();
  _editCtx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
  _editCtx.fillStyle = EDIT_BRUSH_COLOR;
  _editCtx.fill();
}

function _editPointerMove(event) {
  if (!_editDrawing || !_editCtx) return;
  const pos = _editCanvasPos(event);
  const radius = _scaledBrushRadius();

  // Fix #4: Draw continuous line instead of discrete circles.
  _editCtx.beginPath();
  _editCtx.strokeStyle = EDIT_BRUSH_COLOR;
  _editCtx.lineWidth = radius * 2;
  _editCtx.lineCap = "round";
  _editCtx.lineJoin = "round";
  if (_editLastPos) {
    _editCtx.moveTo(_editLastPos.x, _editLastPos.y);
  } else {
    _editCtx.moveTo(pos.x, pos.y);
  }
  _editCtx.lineTo(pos.x, pos.y);
  _editCtx.stroke();
  _editLastPos = pos;
}

function _editPointerUp() {
  _editDrawing = false;
  _editLastPos = null;
}

function _editCanvasPos(event) {
  const canvas = editElements.editCanvas;
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  return {
    x: (event.clientX - rect.left) * scaleX,
    y: (event.clientY - rect.top) * scaleY,
  };
}

// Fix #7: Scale brush size to canvas coordinates.
function _scaledBrushRadius() {
  const canvas = editElements.editCanvas;
  const rect = canvas.getBoundingClientRect();
  const scale = canvas.width / rect.width;
  const rawSize = parseInt(editElements.editBrushSize.value, 10) || 20;
  return (rawSize / 2) * scale;
}

// Fix #1: Use stable function references for add/removeEventListener.
let _editCanvasListenersAttached = false;

function attachEditCanvasEvents() {
  if (_editCanvasListenersAttached) return;
  const canvas = editElements.editCanvas;
  canvas.addEventListener("pointerdown", _editPointerDown);
  canvas.addEventListener("pointermove", _editPointerMove);
  canvas.addEventListener("pointerup", _editPointerUp);
  canvas.addEventListener("pointerleave", _editPointerUp);
  _editCanvasListenersAttached = true;
}

function detachEditCanvasEvents() {
  if (!_editCanvasListenersAttached) return;
  const canvas = editElements.editCanvas;
  canvas.removeEventListener("pointerdown", _editPointerDown);
  canvas.removeEventListener("pointermove", _editPointerMove);
  canvas.removeEventListener("pointerup", _editPointerUp);
  canvas.removeEventListener("pointerleave", _editPointerUp);
  _editCanvasListenersAttached = false;
}

function enterEditMode() {
  _editModeActive = true;
  editElements.editModeButton.textContent = "กลับไปดูเปรียบเทียบ";
  editElements.editModeButton.classList.add("btn--accent");
  elements.previewCompare.classList.add("hidden");
  editElements.editModePanel.classList.remove("hidden");
  editElements.editPromptInput.value = "ลบข้อความต้นฉบับที่เหลือออก แล้วเติมพื้นหลังให้เรียบเนียนกลมกลืนกับภาพรอบข้าง";
  setEditStatus("");

  const afterSrc = elements.previewAfter.src;
  if (!afterSrc) {
    setEditStatus("ไม่มีภาพให้แก้ไข กรุณาดูตัวอย่างก่อน", "error");
    return;
  }
  const img = new window.Image();
  img.onload = () => {
    _editBaseImage = img;
    const canvas = editElements.editCanvas;
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    // Fix #6: Check for null context.
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setEditStatus("ไม่สามารถสร้าง canvas context ได้", "error");
      return;
    }
    _editCtx = ctx;
    _editCtx.drawImage(img, 0, 0);
    _editStrokes = [];
    attachEditCanvasEvents();
  };
  // Fix #9: Handle image load error.
  img.onerror = () => {
    setEditStatus("ไม่สามารถโหลดภาพสำหรับโหมดแก้ภาพได้", "error");
  };
  img.src = afterSrc;
}

function exitEditMode() {
  if (!_editModeActive) return;
  _editModeActive = false;
  _editDrawing = false;
  _editLastPos = null;
  _hideEditLoading();
  _hideEditCompare();
  editElements.editModeButton.textContent = "โหมดแก้ภาพ";
  editElements.editModeButton.classList.remove("btn--accent");
  editElements.editModePanel.classList.add("hidden");
  elements.previewCompare.classList.remove("hidden");
  detachEditCanvasEvents();
  _editCtx = null;
  _editBaseImage = null;
  _editStrokes = [];
  _editBeforeDataUrl = null;
}

function setEditStatus(message, tone = "") {
  editElements.editStatus.textContent = message;
  editElements.editStatus.className = "edit-mode__status" + (tone ? ` is-${tone}` : "");
}

function editUndoStroke() {
  if (!_editCtx || _editStrokes.length === 0) return;
  const prev = _editStrokes.pop();
  _editCtx.putImageData(prev, 0, 0);
}

function editClearBrush() {
  if (!_editCtx || !_editBaseImage) return;
  const canvas = editElements.editCanvas;
  // Fix #12: Cap undo stack on clear too.
  if (_editStrokes.length >= EDIT_UNDO_MAX) {
    _editStrokes.shift();
  }
  _editStrokes.push(_editCtx.getImageData(0, 0, canvas.width, canvas.height));
  _editCtx.clearRect(0, 0, canvas.width, canvas.height);
  _editCtx.drawImage(_editBaseImage, 0, 0);
}

// ─── Loading animation messages ───
const _EDIT_LOADING_MESSAGES = [
  "กำลังส่งภาพให้ Gemini...",
  "Gemini กำลังรับภาพ...",
  "Gemini กำลังวิเคราะห์บริเวณที่ระบาย...",
  "Gemini กำลังลบข้อความในบริเวณที่ระบุ...",
  "Gemini กำลังเติมพื้นหลัง...",
  "Gemini กำลัง inpaint บริเวณที่แก้ไข...",
  "Gemini กำลังปรับแต่งให้กลมกลืน...",
  "Gemini กำลัง generate ภาพที่แก้ไขแล้ว...",
  "เกือบเสร็จแล้ว รอ Gemini ส่งภาพกลับ...",
  "รอ Gemini ตอบกลับ...",
];

let _editLoadingTimer = null;

function _showEditLoading() {
  editElements.editLoadingOverlay.classList.remove("hidden");
  editElements.editCanvas.style.pointerEvents = "none";
  let msgIdx = 0;
  editElements.editLoadingLabel.textContent = _EDIT_LOADING_MESSAGES[0];
  _editLoadingTimer = setInterval(() => {
    msgIdx = Math.min(msgIdx + 1, _EDIT_LOADING_MESSAGES.length - 1);
    editElements.editLoadingLabel.textContent = _EDIT_LOADING_MESSAGES[msgIdx];
  }, 3000);
}

function _hideEditLoading() {
  editElements.editLoadingOverlay.classList.add("hidden");
  editElements.editCanvas.style.pointerEvents = "";
  if (_editLoadingTimer) {
    clearInterval(_editLoadingTimer);
    _editLoadingTimer = null;
  }
}

// ─── Edit Before/After compare slider ───
let _editCompareDragging = false;

function _showEditCompare(beforeSrc, afterSrc) {
  // Detach first to prevent duplicate listeners.
  _hideEditCompare();

  editElements.editCompareBefore.src = beforeSrc;
  editElements.editCompareAfter.src = afterSrc;
  editElements.editCompare.classList.remove("hidden");
  // Use visibility:hidden (not display:none) so canvas still occupies space
  // and gives the compare overlay its dimensions.
  editElements.editCanvas.style.visibility = "hidden";
  editElements.editCanvas.style.pointerEvents = "none";
  _setEditComparePosition(50);

  // Attach drag events.
  editElements.editCompareSlider.addEventListener("pointerdown", _editComparePointerDown);
  document.addEventListener("pointermove", _editComparePointerMove);
  document.addEventListener("pointerup", _editComparePointerUp);
}

function _hideEditCompare() {
  editElements.editCompare.classList.add("hidden");
  editElements.editCanvas.style.visibility = "";
  editElements.editCanvas.style.pointerEvents = "";
  editElements.editCompareSlider.removeEventListener("pointerdown", _editComparePointerDown);
  document.removeEventListener("pointermove", _editComparePointerMove);
  document.removeEventListener("pointerup", _editComparePointerUp);
  _editCompareDragging = false;
}

function _setEditComparePosition(percent) {
  const clamped = Math.max(0, Math.min(100, percent));
  editElements.editCompareAfter.style.clipPath = `inset(0 0 0 ${clamped}%)`;
  editElements.editCompareSlider.style.left = `${clamped}%`;
}

function _editComparePointerDown(e) {
  _editCompareDragging = true;
  e.preventDefault();
}
function _editComparePointerMove(e) {
  if (!_editCompareDragging) return;
  const rect = editElements.editCompare.getBoundingClientRect();
  if (rect.width === 0) return;
  const percent = ((e.clientX - rect.left) / rect.width) * 100;
  _setEditComparePosition(percent);
}
function _editComparePointerUp() {
  _editCompareDragging = false;
}

let _editBeforeDataUrl = null;  // Snapshot before sending to Gemini.

async function editSendToGemini() {
  if (!_editCtx || _editSending) return;

  const prompt = editElements.editPromptInput.value.trim();
  if (!prompt) {
    setEditStatus("กรุณาใส่ prompt ก่อนส่ง", "error");
    return;
  }
  if (prompt.length > EDIT_PROMPT_MAX_LENGTH) {
    setEditStatus(`Prompt ยาวเกินไป (${prompt.length}/${EDIT_PROMPT_MAX_LENGTH} ตัวอักษร)`, "error");
    return;
  }

  // Hide any previous compare view.
  _hideEditCompare();

  const canvas = editElements.editCanvas;
  const dataUrl = canvas.toDataURL("image/png");
  _editBeforeDataUrl = dataUrl;  // Save for before/after compare.
  const apiKey = elements.apiKeyInput.value.trim();

  // Save edit to history.
  state.editHistory.push({
    prompt,
    timestamp: new Date().toISOString(),
    page: getCurrentPageKey(),
  });
  if (state.editHistory.length > 50) state.editHistory.shift();

  _editSending = true;
  _showEditLoading();
  setEditStatus("", "");
  editElements.editSendButton.disabled = true;

  try {
    const result = await window.mangaStudio.editImage({
      imageDataUrl: dataUrl,
      prompt,
      apiKey,
    });

    _hideEditLoading();

    if (result.edited_image_base64) {
      const newDataUrl = `data:image/png;base64,${result.edited_image_base64}`;

      // Show before/after compare.
      _showEditCompare(_editBeforeDataUrl, newDataUrl);

      const editedImg = new window.Image();
      editedImg.onload = () => {
        // Guard: user may have exited edit mode or closed preview while image was loading.
        if (!_editModeActive) {
          // Still update the app state even if edit mode was exited.
          elements.previewAfter.src = newDataUrl;
          state.cleanedImageUrl = newDataUrl;
          state.isDirty = true;
          persistActivePdfPageState();
          updateCacheEntry(getCurrentPageKey(), {
            hasCleanedImage: true,
          });
          recordActivity("edit-image", {
            title: "แก้ไขภาพด้วย prompt สำเร็จ",
            details: prompt,
            pageKey: getCurrentPageKey(),
            mergeKey: `edit-image:${getCurrentPageKey()}`,
          });
          return;
        }

        _editBaseImage = editedImg;
        canvas.width = editedImg.naturalWidth;
        canvas.height = editedImg.naturalHeight;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          _editCtx = ctx;
          _editCtx.drawImage(editedImg, 0, 0);
        }
        _editStrokes = [];

        // Update preview "after" image and app state.
        elements.previewAfter.src = newDataUrl;
        state.cleanedImageUrl = newDataUrl;
        state.isDirty = true;
        persistActivePdfPageState();
        updateCacheEntry(getCurrentPageKey(), {
          hasCleanedImage: true,
        });
        recordActivity("edit-image", {
          title: "แก้ไขภาพด้วย prompt สำเร็จ",
          details: prompt,
          pageKey: getCurrentPageKey(),
          mergeKey: `edit-image:${getCurrentPageKey()}`,
        });

        setEditStatus("แก้ไขสำเร็จ! เลื่อนดู before/after ได้ กดระบายเพิ่มถ้ายังไม่พอใจ", "success");
      };
      editedImg.onerror = () => {
        _hideEditCompare();
        setEditStatus("ภาพที่ Gemini ส่งกลับมาเสียหาย", "error");
      };
      editedImg.src = newDataUrl;
    } else {
      setEditStatus("Gemini ไม่ได้ส่งภาพกลับมา", "error");
    }
  } catch (error) {
    _hideEditLoading();
    setEditStatus(error.message || "Edit failed", "error");
  } finally {
    _editSending = false;
    editElements.editSendButton.disabled = false;
  }
}

function setCompareSliderPosition(percent) {
  const clamped = Math.max(0, Math.min(100, percent));
  elements.previewAfter.style.clipPath = `inset(0 0 0 ${clamped}%)`;
  elements.previewSlider.style.left = `${clamped}%`;
}

let _compareDragging = false;
function onComparePointerDown(e) {
  _compareDragging = true;
  e.preventDefault();
}
function onComparePointerMove(e) {
  if (!_compareDragging) return;
  const rect = elements.previewCompare.getBoundingClientRect();
  if (rect.width === 0) return;
  const percent = ((e.clientX - rect.left) / rect.width) * 100;
  setCompareSliderPosition(percent);
}
function onComparePointerUp() {
  _compareDragging = false;
}

function attachCompareSliderEvents() {
  elements.previewCompare.addEventListener("pointerdown", onComparePointerDown);
  document.addEventListener("pointermove", onComparePointerMove);
  document.addEventListener("pointerup", onComparePointerUp);
}
function detachCompareSliderEvents() {
  elements.previewCompare.removeEventListener("pointerdown", onComparePointerDown);
  document.removeEventListener("pointermove", onComparePointerMove);
  document.removeEventListener("pointerup", onComparePointerUp);
  _compareDragging = false;
}

/* ═══ Translating Overlay ═══ */
let _progressHighWater = 0;

function showTranslatingOverlay(label) {
  if (elements.translatingLabel) {
    elements.translatingLabel.textContent = label || "กำลังวิเคราะห์และแปล...";
  }
  _progressHighWater = 0;
  updateTranslateProgress(0, "");
  elements.translatingOverlay.classList.remove("hidden");
}

function hideTranslatingOverlay() {
  elements.translatingOverlay.classList.add("hidden");
  _progressHighWater = 0;
}

function updateTranslateProgress(progress, message) {
  // Monotonic guard: never let the progress bar go backward.
  if (progress < _progressHighWater) return;
  _progressHighWater = progress;

  if (elements.translatingProgressBar) {
    elements.translatingProgressBar.style.width = `${progress}%`;
  }
  if (elements.translatingPercent) {
    elements.translatingPercent.textContent = `${progress}%`;
  }
  if (elements.translatingStep) {
    elements.translatingStep.textContent = message || "";
  }
}

function handlePointerMove(event) {
  if (!state.dragContext || !state.stageMetrics) {
    return;
  }

  const region = getSelectedRegion();
  if (!region) {
    return;
  }

  // Push undo once on first actual drag movement.
  if (!state.dragContext.undoPushed) {
    pushUndo();
    state.dragContext.undoPushed = true;
  }

  const zoom = state.zoomLevel || 1;
  const dx = ((event.clientX - state.dragContext.startClientX) / zoom / state.stageMetrics.width) * 1000;
  const dy = ((event.clientY - state.dragContext.startClientY) / zoom / state.stageMetrics.height) * 1000;
  const startRegion = state.dragContext.startRegion;

  if (state.dragContext.mode === "move") {
    region.x = clamp(startRegion.x + dx, 0, 1000 - region.width);
    region.y = clamp(startRegion.y + dy, 0, 1000 - region.height);
  } else {
    region.width = clamp(startRegion.width + dx, 10, 1000 - region.x);
    region.height = clamp(startRegion.height + dy, 10, 1000 - region.y);
    // Auto-fit font size to new box size (like Canva).
    if (region.font_size_auto !== false && state.image) {
      autofitRegion(region, state.image.width, state.image.height);
    }
  }

  // Lightweight render: only update overlay regions during drag (skip full DOM rebuild).
  renderRegions();
}

function handlePointerUp() {
  if (state.dragContext) {
    const completedDrag = state.dragContext;
    const region = getSelectedRegion();
    state.dragContext = null;
    persistActivePdfPageState();
    if (region && completedDrag.undoPushed) {
      recordActivity("region-edit", {
        title: completedDrag.mode === "move" ? "ย้ายกล่องข้อความ" : "ปรับขนาดกล่องข้อความ",
        details: completedDrag.mode === "move"
          ? `ตำแหน่งใหม่ x:${Math.round(region.x)} y:${Math.round(region.y)}`
          : `ขนาดใหม่ ${Math.round(region.width)} x ${Math.round(region.height)}`,
        pageKey: getCurrentPageKey(),
        regionId: region.id,
        mergeKey: `pointer-${completedDrag.mode}:${getCurrentPageKey()}:${region.id}`,
        meta: {
          mode: completedDrag.mode,
          regionId: region.id,
        },
      });
    }
    renderAll();
  }
}

async function jumpToPdfPage() {
  if (!state.pdf) {
    return;
  }

  const targetPage = Number(elements.pdfPageInput.value);
  if (!Number.isFinite(targetPage)) {
    setStatus("ใส่เลขหน้าที่ต้องการก่อน", "error");
    return;
  }

  const normalizedPage = clamp(Math.round(targetPage), 1, state.pdf.pageCount);
  await openPdfPage(normalizedPage);
}

function attachGeneralHandlers() {
  elements.apiKeyInput.value = state.apiKey;
  syncSuggestProviderControls();
  elements.latestModelValue.textContent = getModelBadgeLabel();

  const persistApiKeyInput = ({ startWarmup = false } = {}) => {
    const apiKey = String(elements.apiKeyInput?.value || "").trim();
    state.apiKey = apiKey;
    localStorage.setItem("geminiApiKey", apiKey);
    if (startWarmup && apiKey) {
      startBackgroundOcrIndexing();
    }
  };

  elements.themeToggleButton.addEventListener("click", toggleTheme);
  elements.openButton.addEventListener("click", openFile);
  elements.translateButton.addEventListener("click", translateImage);
  elements.apiKeyInput?.addEventListener("change", () => {
    persistApiKeyInput({ startWarmup: true });
  });
  elements.apiKeyInput?.addEventListener("blur", () => {
    persistApiKeyInput({ startWarmup: true });
  });
  elements.translateModeButton?.addEventListener("click", async () => {
    try {
      await chooseTranslationPages({ applyOnly: true });
    } catch (error) {
      setStatus(error.message || "ตั้งค่าโหมดแปลไม่สำเร็จ", "error");
    }
  });
  elements.cleanOnlyButton.addEventListener("click", cleanOnlyImage);
  elements.cleanSuggestButton?.addEventListener("click", cleanAndSuggestImage);
  elements.exportButton.addEventListener("click", handleExport);
  elements.historyCacheButton?.addEventListener("click", openHistoryCacheDrawer);
  elements.saveButton.addEventListener("click", async () => {
    await saveProject();
  });
  elements.undoButton.addEventListener("click", undo);
  elements.redoButton.addEventListener("click", redo);
  elements.previewButton.addEventListener("click", () => showPreview().catch((e) => console.error("showPreview:", e)));
  elements.previewExportButton.addEventListener("click", () => {
    closePreview();
    handleExport().catch((e) => console.error("handleExport:", e));
  });
  elements.previewCloseButton.addEventListener("click", closePreview);
  elements.previewModal.querySelector(".preview-modal__backdrop")?.addEventListener("click", closePreview);
  elements.closeSaveButton?.addEventListener("click", () => resolveUnsavedDialog("save"));
  elements.closeDiscardButton?.addEventListener("click", () => resolveUnsavedDialog("discard"));
  elements.closeCancelButton?.addEventListener("click", () => resolveUnsavedDialog("cancel"));
  elements.closeDialog?.querySelector(".close-dialog__backdrop")?.addEventListener("click", () => resolveUnsavedDialog("cancel"));
  elements.translationModeCloseButton?.addEventListener("click", () => closeTranslationModeModal(null));
  elements.translationModeCancelButton?.addEventListener("click", () => closeTranslationModeModal(null));
  elements.translationModeConfirmButton?.addEventListener("click", () => {
    closeTranslationModeModal({
      mode: getSelectedTranslationMode(),
      customPagesInput: elements.translationPagesInput?.value || "",
    });
  });
  elements.translationModeModal?.querySelector(".translation-mode-modal__backdrop")
    ?.addEventListener("click", () => closeTranslationModeModal(null));
  elements.historyCacheCloseButton?.addEventListener("click", closeHistoryCacheDrawer);
  elements.historyCacheDrawer?.querySelector(".history-cache-drawer__backdrop")
    ?.addEventListener("click", closeHistoryCacheDrawer);
  elements.historyActionList?.addEventListener("click", (event) => {
    const targetButton = event.target.closest("[data-history-entry-id]");
    if (!targetButton) {
      return;
    }
    restoreHistoryEntry(targetButton.dataset.historyEntryId);
  });
  for (const radio of getTranslationModeRadios()) {
    radio.addEventListener("change", () => {
      syncTranslationModeUiState();
      if (radio.checked && radio.value === "selected") {
        setTimeout(() => elements.translationPagesInput?.focus(), 0);
      }
    });
  }
  elements.translationPagesInput?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      elements.translationModeConfirmButton?.click();
    }
    if (event.key === "Escape") {
      event.preventDefault();
      closeTranslationModeModal(null);
    }
  });

  // ─── Edit Mode events ───
  editElements.editModeButton.addEventListener("click", () => {
    if (_editModeActive) {
      exitEditMode();
    } else {
      enterEditMode();
    }
  });
  editElements.editBrushSize.addEventListener("input", () => {
    editElements.editBrushSizeLabel.textContent = `${editElements.editBrushSize.value}px`;
  });
  editElements.editUndoStroke.addEventListener("click", editUndoStroke);
  editElements.editClearBrush.addEventListener("click", editClearBrush);
  editElements.editSendButton.addEventListener("click", () => editSendToGemini().catch((e) => console.error("editSendToGemini:", e)));
  elements.addRegionButton.addEventListener("click", addRegion);
  elements.acceptSuggestionButton?.addEventListener("click", acceptSelectedSuggestion);
  elements.deleteRegionButton.addEventListener("click", removeSelectedRegion);
  elements.cleanPreviewToggle.addEventListener("change", () => {
    renderBaseImage();
  });
  elements.cleanOpacitySlider.addEventListener("input", () => {
    const val = elements.cleanOpacitySlider.value;
    elements.cleanOpacityValue.textContent = `${val}%`;
    renderBaseImage();
  });
  if (elements.recentFilesClearButton) {
    elements.recentFilesClearButton.addEventListener("click", clearRecentFiles);
  }
  if (elements.recentFilesList) {
    elements.recentFilesList.addEventListener("click", async (event) => {
      const removeButton = event.target.closest("[data-recent-remove-path]");
      if (removeButton) {
        await removeRecentFile(removeButton.dataset.recentRemovePath);
        return;
      }

      const openButton = event.target.closest("[data-recent-file-path]");
      if (openButton) {
        await openRecentFile(openButton.dataset.recentFilePath);
      }
    });
  }

  elements.pdfPrevButton.addEventListener("click", async () => {
    const previousPage = getNextPdfPageNumber(-1);
    if (!previousPage) {
      return;
    }
    await openPdfPage(previousPage);
  });

  elements.pdfNextButton.addEventListener("click", async () => {
    const nextPage = getNextPdfPageNumber(1);
    if (!nextPage) {
      return;
    }
    await openPdfPage(nextPage);
  });

  elements.pdfJumpButton.addEventListener("click", jumpToPdfPage);
  elements.pdfPageInput.addEventListener("keydown", async (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      await jumpToPdfPage();
    }
  });
  elements.pdfClearSelectionButton.addEventListener("click", clearPdfSelection);

  elements.regionList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-region-id]");
    if (!button) {
      return;
    }
    selectRegion(button.dataset.regionId);
  });

  elements.pdfPageGrid.addEventListener("click", async (event) => {
    if (state.isBusy) {
      return;
    }

    const toggleButton = event.target.closest("[data-page-toggle]");
    if (toggleButton) {
      const pageNumber = Number(toggleButton.dataset.pageToggle);
      if (Number.isFinite(pageNumber)) {
        togglePdfPageSelection(pageNumber);
      }
      return;
    }

    const openButton = event.target.closest("[data-page-open]");
    const card = event.target.closest("[data-page-number]");
    const target = openButton || card;
    if (!target) {
      return;
    }

    const pageNumber = Number(openButton ? openButton.dataset.pageOpen : card.dataset.pageNumber);
    if (!Number.isFinite(pageNumber)) {
      return;
    }

    await openPdfPage(pageNumber);
  });

  elements.baseImage.addEventListener("load", () => {
    if (state.image && (state.image.width === 0 || state.image.height === 0)) {
      state.image.width = elements.baseImage.naturalWidth;
      state.image.height = elements.baseImage.naturalHeight;
    }
    persistActivePdfPageState();
    syncStageMetrics();
  });
  elements.baseImage.addEventListener("error", () => {
    if (elements.baseImage.src) {
      setStatus("ไม่สามารถโหลดภาพได้", "error");
    }
  });

  if (_stageResizeObserver) _stageResizeObserver.disconnect();
  _stageResizeObserver = new ResizeObserver(() => syncStageMetrics());
  _stageResizeObserver.observe(document.querySelector(".stage-frame"));
  window.addEventListener("resize", syncStageMetrics);

  // User notes.
  elements.userNoteInput.addEventListener("input", saveUserNote);

  // Zoom controls.
  document.getElementById("zoomInBtn").addEventListener("click", zoomIn);
  document.getElementById("zoomOutBtn").addEventListener("click", zoomOut);
  document.getElementById("zoomPill").addEventListener("click", zoomReset);
  initPanZoom();
  applyZoom();
  // Center canvas after first image loads.
  elements.baseImage.addEventListener("load", () => {
    setTimeout(centerCanvas, 50);
  }, { once: false });

  window.addEventListener("keydown", (event) => {
    const active = document.activeElement;
    const isTyping = active && (active.tagName === "INPUT" || active.tagName === "TEXTAREA" || active.isContentEditable);
    if (event.key === "Escape") {
      if (!elements.translationModeModal?.classList.contains("hidden")) {
        event.preventDefault();
        closeTranslationModeModal(null);
        return;
      }
      if (!elements.historyCacheDrawer?.classList.contains("hidden")) {
        event.preventDefault();
        closeHistoryCacheDrawer();
        return;
      }
    }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
      event.preventDefault();
      void saveProject({ saveAs: event.shiftKey });
    }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z" && !event.shiftKey && !isTyping) {
      event.preventDefault();
      undo();
    }
    if ((event.ctrlKey || event.metaKey) && (event.key.toLowerCase() === "y" || (event.key.toLowerCase() === "z" && event.shiftKey)) && !isTyping) {
      event.preventDefault();
      redo();
    }
    if (event.key === "Delete" && state.selectedRegionId && !state.isBusy) {
      if (!isTyping) {
        event.preventDefault();
        removeSelectedRegion();
      }
    }
    if (event.key === "F1") {
      event.preventDefault();
      showGuideModal();
    }
  });
  document.addEventListener("pointermove", handlePointerMove);
  document.addEventListener("pointerup", handlePointerUp);
  // Store cleanup functions to prevent listener leaks.
  if (_ipcCleanups.length) {
    _ipcCleanups.forEach((fn) => fn());
    _ipcCleanups.length = 0;
  }
  if (typeof window.mangaStudio.onTranslateProgress === "function") {
    _ipcCleanups.push(window.mangaStudio.onTranslateProgress((data) => {
      if (data && typeof data.progress === "number") {
        updateTranslateProgress(data.progress, data.message || "");
      }
    }));
  }
  if (typeof window.mangaStudio.onOpenExternalFile === "function") {
    _ipcCleanups.push(window.mangaStudio.onOpenExternalFile((payload) => {
      if (!payload?.path) {
        return;
      }
      void openRecentFile(payload.path, { fromWindows: true });
    }));
  }
  // ─── Close confirmation ───
  if (typeof window.mangaStudio.onBeforeClose === "function") {
    _ipcCleanups.push(window.mangaStudio.onBeforeClose(async () => {
      if (!state.source || !state.isDirty) {
        window.mangaStudio.confirmClose("discard");
        return;
      }

      const action = await showUnsavedDialog({
        title: "บันทึกโปรเจกต์ก่อนออก?",
        message: "คุณมีการเปลี่ยนแปลงที่ยังไม่ได้บันทึก",
        saveLabel: "บันทึก",
        discardLabel: "ไม่บันทึก",
        cancelLabel: "ยกเลิก",
      });

      if (action === "save") {
        const saveResult = await saveProject();
        if (saveResult?.status === "saved") {
          window.mangaStudio.confirmClose("save");
        } else {
          window.mangaStudio.confirmClose("cancel");
        }
        return;
      }

      window.mangaStudio.confirmClose(action);
    }));
  }

  // Handle menu bar actions (ไฟล์, แก้ไข, etc.)
  if (typeof window.mangaStudio.onMenuAction === "function") {
    _ipcCleanups.push(window.mangaStudio.onMenuAction((action) => {
      switch (action) {
        case "open-file":
          elements.openButton.click();
          break;
        case "save":
          void saveProject();
          break;
        case "save-as":
          void saveProject({ saveAs: true });
          break;
        case "export":
          elements.exportButton.click();
          break;
        case "show-guide":
          showGuideModal();
          break;
      }
    }));
  }
}

function showGuideModal() {
  // Toggle: if already open, close it.
  const existing = document.getElementById("guideModal");
  if (existing) { existing.remove(); document.body.classList.remove("has-guide-blur"); return; }

  const modal = document.createElement("div");
  modal.id = "guideModal";
  modal.className = "guide-modal";
  modal.innerHTML = `
    <div class="guide-modal__backdrop"></div>
    <div class="guide-modal__frame">
      <button class="guide-modal__close" data-tip="ปิดคู่มือ" data-tip-pos="left">✕</button>
      <iframe class="guide-modal__iframe" src="./guide.html"></iframe>
    </div>
  `;

  document.body.appendChild(modal);
  document.body.classList.add("has-guide-blur");

  // Animate in.
  requestAnimationFrame(() => modal.classList.add("is-visible"));

  const closeGuide = () => {
    modal.classList.remove("is-visible");
    document.body.classList.remove("has-guide-blur");
    modal.addEventListener("transitionend", () => modal.remove(), { once: true });
    // Fallback removal if transition doesn't fire.
    setTimeout(() => { if (modal.parentNode) modal.remove(); }, 400);
  };

  modal.querySelector(".guide-modal__backdrop").addEventListener("click", closeGuide);
  modal.querySelector(".guide-modal__close").addEventListener("click", closeGuide);

  // ESC to close.
  const onEsc = (e) => {
    if (e.key === "Escape") { closeGuide(); document.removeEventListener("keydown", onEsc); }
  };
  document.addEventListener("keydown", onEsc);
}

// ─── Auto Save System ───
const AUTOSAVE_STORAGE_KEY = "mangaStudio_autoSave";

let _autoSaveTimer = null;
let _autoSaveEnabled = false;
let _autoSaveIntervalSec = 60;

function _loadAutoSaveSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(AUTOSAVE_STORAGE_KEY) || "{}");
    _autoSaveEnabled = saved.enabled === true;
    _autoSaveIntervalSec = Number(saved.interval) || 60;
  } catch {
    _autoSaveEnabled = false;
    _autoSaveIntervalSec = 60;
  }
}

function _saveAutoSaveSettings() {
  localStorage.setItem(AUTOSAVE_STORAGE_KEY, JSON.stringify({
    enabled: _autoSaveEnabled,
    interval: _autoSaveIntervalSec,
  }));
}

function _syncAutoSaveUI() {
  elements.autoSaveToggle.checked = _autoSaveEnabled;
  elements.autoSaveInterval.value = String(_autoSaveIntervalSec);
  elements.autoSaveInterval.disabled = !_autoSaveEnabled;
}

const _AUTO_SAVE_MESSAGES = [
  "💾 บันทึกแล้วจ้า~",
  "✨ เซฟให้แล้วนะ!",
  "🐱 เหมียว~ เซฟแล้ว",
  "🎉 บันทึกเรียบร้อย!",
  "💫 เซฟสำเร็จ~",
  "🌟 งานปลอดภัยแล้ว!",
  "🍡 เก็บงานให้แล้วน้า",
  "🫧 บันทึกเสร็จ~",
  "🎀 เซฟไว้ให้แล้วค่า",
  "🐾 เรียบร้อย! เซฟแล้ว",
];

function _showAutoSaveBubble() {
  const msg = _AUTO_SAVE_MESSAGES[Math.floor(Math.random() * _AUTO_SAVE_MESSAGES.length)];

  const bubble = document.createElement("div");
  bubble.className = "autosave-bubble";
  bubble.textContent = msg;

  // Random position — stay within visible area.
  const padX = 220, padY = 80;
  const maxX = Math.max(padX, window.innerWidth - padX);
  const maxY = Math.max(padY, window.innerHeight - padY);
  const x = padX + Math.random() * (maxX - padX);
  const y = padY + Math.random() * (maxY - padY);
  bubble.style.left = `${x}px`;
  bubble.style.top = `${y}px`;

  document.body.appendChild(bubble);
  setTimeout(() => {
    bubble.classList.add("autosave-bubble--out");
    bubble.addEventListener("animationend", () => bubble.remove());
  }, 2200);
}

function _startAutoSave() {
  _stopAutoSave();
  if (!_autoSaveEnabled) return;
  _autoSaveTimer = setInterval(async () => {
    // Only auto-save if there's a project with unsaved changes.
    if (!state.projectPath || !state.source || state.isBusy || !state.isDirty) return;
    try {
      await saveProject({ reason: "autosave" });
      _showAutoSaveBubble();
    } catch {
      // Silent fail — don't disrupt user.
    }
  }, _autoSaveIntervalSec * 1000);
}

function _stopAutoSave() {
  if (_autoSaveTimer) {
    clearInterval(_autoSaveTimer);
    _autoSaveTimer = null;
  }
}

function initAutoSave() {
  _loadAutoSaveSettings();
  _syncAutoSaveUI();
  _startAutoSave();

  elements.autoSaveToggle.addEventListener("change", () => {
    _autoSaveEnabled = elements.autoSaveToggle.checked;
    _saveAutoSaveSettings();
    _syncAutoSaveUI();
    _startAutoSave();
    if (_autoSaveEnabled) {
      setStatus(`เปิดบันทึกอัตโนมัติทุก ${_formatInterval(_autoSaveIntervalSec)}`);
    } else {
      setStatus("ปิดบันทึกอัตโนมัติ");
    }
  });

  elements.autoSaveInterval.addEventListener("change", () => {
    _autoSaveIntervalSec = Number(elements.autoSaveInterval.value) || 60;
    _saveAutoSaveSettings();
    _startAutoSave();
    if (_autoSaveEnabled) {
      setStatus(`บันทึกอัตโนมัติทุก ${_formatInterval(_autoSaveIntervalSec)}`);
    }
  });
}

function _formatInterval(sec) {
  if (sec < 60) return `${sec} วินาที`;
  if (sec < 120) return "1 นาที";
  return `${Math.floor(sec / 60)} นาที`;
}

// ─── Font Picker with Favorites ───
const FONT_FAV_KEY = "mangaStudio_favFonts";

function _loadFavFonts() {
  try {
    return new Set(JSON.parse(localStorage.getItem(FONT_FAV_KEY) || "[]"));
  } catch {
    return new Set();
  }
}

function _saveFavFonts(favs) {
  localStorage.setItem(FONT_FAV_KEY, JSON.stringify([...favs]));
}

let _favFonts = _loadFavFonts();
let _fontPickerOpen = false;

function buildFontPickerList(filter = "") {
  const list = elements.fontPickerList;
  list.innerHTML = "";
  const needle = filter.toLowerCase();
  const currentValue = elements.fontFamilyInput.value;

  // Split into favorites and rest.
  const favItems = [];
  const restItems = [];
  for (const opt of FONT_OPTIONS) {
    if (needle && !opt.label.toLowerCase().includes(needle)) continue;
    if (_favFonts.has(opt.value)) {
      favItems.push(opt);
    } else {
      restItems.push(opt);
    }
  }

  // Render favorites section.
  if (favItems.length > 0) {
    const divider = document.createElement("div");
    divider.className = "font-picker__divider";
    divider.textContent = "★ รายการโปรด";
    list.appendChild(divider);
    for (const opt of favItems) {
      list.appendChild(_buildFontItem(opt, true, currentValue));
    }
  }

  // Render rest.
  if (restItems.length > 0) {
    if (favItems.length > 0) {
      const divider = document.createElement("div");
      divider.className = "font-picker__divider";
      divider.textContent = "ฟอนต์ทั้งหมด";
      list.appendChild(divider);
    }
    for (const opt of restItems) {
      list.appendChild(_buildFontItem(opt, false, currentValue));
    }
  }

  if (favItems.length === 0 && restItems.length === 0) {
    const empty = document.createElement("div");
    empty.className = "font-picker__divider";
    empty.textContent = "ไม่พบฟอนต์ที่ค้นหา";
    list.appendChild(empty);
  }
}

function _buildFontItem(opt, isFav, currentValue) {
  const item = document.createElement("div");
  item.className = "font-picker__item" + (opt.value === currentValue ? " is-selected" : "");

  const star = document.createElement("button");
  star.type = "button";
  star.className = "font-picker__star" + (isFav ? " is-fav" : "");
  star.textContent = isFav ? "★" : "☆";
  star.title = isFav ? "เอาออกจากรายการโปรด" : "เพิ่มในรายการโปรด";
  star.addEventListener("click", (e) => {
    e.stopPropagation();
    if (_favFonts.has(opt.value)) {
      _favFonts.delete(opt.value);
    } else {
      _favFonts.add(opt.value);
    }
    _saveFavFonts(_favFonts);
    buildFontPickerList(elements.fontPickerSearch.value);
  });

  const label = document.createElement("span");
  label.className = "font-picker__font-label";
  label.textContent = opt.label;
  label.style.fontFamily = opt.value;

  item.appendChild(star);
  item.appendChild(label);

  item.addEventListener("click", () => {
    selectFontPickerValue(opt.value, opt.label);
    closeFontPicker();
  });

  return item;
}

function selectFontPickerValue(value, label) {
  elements.fontFamilyInput.value = value;
  elements.fontPickerLabel.textContent = label;
  elements.fontPickerLabel.style.fontFamily = value;
  // Trigger change event on hidden select.
  elements.fontFamilyInput.dispatchEvent(new Event("change"));
}

function openFontPicker() {
  if (_fontPickerOpen) return;
  _fontPickerOpen = true;
  elements.fontPickerSearch.value = "";
  buildFontPickerList();
  elements.fontPickerDropdown.classList.remove("hidden");
  elements.fontPickerSearch.focus();

  // Scroll to selected item.
  requestAnimationFrame(() => {
    const selected = elements.fontPickerList.querySelector(".is-selected");
    if (selected) selected.scrollIntoView({ block: "center" });
  });
}

function closeFontPicker() {
  if (!_fontPickerOpen) return;
  _fontPickerOpen = false;
  elements.fontPickerDropdown.classList.add("hidden");
}

function syncFontPickerLabel() {
  const value = elements.fontFamilyInput.value;
  const opt = FONT_OPTIONS.find((o) => o.value === value);
  if (opt) {
    elements.fontPickerLabel.textContent = opt.label;
    elements.fontPickerLabel.style.fontFamily = opt.value;
  } else {
    elements.fontPickerLabel.textContent = "เลือกฟอนต์";
    elements.fontPickerLabel.style.fontFamily = "";
  }
}

async function initializeApp() {
  setupInspectorDrawer();
  setupBackgroundPresetInput();

  // Populate hidden select (keeps existing code compatible).
  for (const fontOption of FONT_OPTIONS) {
    const option = document.createElement("option");
    option.value = fontOption.value;
    option.textContent = fontOption.label;
    option.style.fontFamily = fontOption.value;
    elements.fontFamilyInput.appendChild(option);
  }

  // Font picker events.
  elements.fontPickerTrigger.addEventListener("click", () => {
    if (_fontPickerOpen) closeFontPicker();
    else openFontPicker();
  });
  let _fontSearchTimer = null;
  elements.fontPickerSearch.addEventListener("input", () => {
    if (_fontSearchTimer) clearTimeout(_fontSearchTimer);
    _fontSearchTimer = setTimeout(() => buildFontPickerList(elements.fontPickerSearch.value), 120);
  });
  // Close when clicking outside.
  document.addEventListener("pointerdown", (e) => {
    if (_fontPickerOpen && !elements.fontPicker.contains(e.target)) {
      closeFontPicker();
    }
  });

  attachGeneralHandlers();
  attachInspectorHandlers();
  initAutoSave();
  renderAll();
  await refreshRecentFiles();

  if (typeof window.mangaStudio.consumePendingOpenFile === "function") {
    try {
      const pendingFile = await window.mangaStudio.consumePendingOpenFile();
      if (pendingFile?.path) {
        await openSourceResult(pendingFile, { fromWindows: true });
        return;
      }
    } catch (error) {
      setStatus(error.message || "เปิดไฟล์ที่ร้องขอไม่สำเร็จ", "error");
      return;
    }
  }

  setStatus("พร้อมใช้งาน");
}

void initializeApp();
