const state = {
  apiKey: localStorage.getItem("geminiApiKey") || "",
  model: localStorage.getItem("geminiModel") || "gemini-2.5-flash-image",
  image: null,
  cleanedImageUrl: null,
  regions: [],
  selectedRegionId: null,
  dragContext: null,
  isBusy: false,
  stageMetrics: null,
};

const elements = {
  apiKeyInput: document.getElementById("apiKeyInput"),
  modelInput: document.getElementById("modelInput"),
  openButton: document.getElementById("openButton"),
  translateButton: document.getElementById("translateButton"),
  addRegionButton: document.getElementById("addRegionButton"),
  exportButton: document.getElementById("exportButton"),
  cleanPreviewToggle: document.getElementById("cleanPreviewToggle"),
  fileNameLabel: document.getElementById("fileNameLabel"),
  statusBanner: document.getElementById("statusBanner"),
  warningsBox: document.getElementById("warningsBox"),
  baseImage: document.getElementById("baseImage"),
  overlayLayer: document.getElementById("overlayLayer"),
  regionList: document.getElementById("regionList"),
  regionCountPill: document.getElementById("regionCountPill"),
  emptyInspector: document.getElementById("emptyInspector"),
  inspectorFields: document.getElementById("inspectorFields"),
  deleteRegionButton: document.getElementById("deleteRegionButton"),
  kindInput: document.getElementById("kindInput"),
  sourceInput: document.getElementById("sourceInput"),
  translatedInput: document.getElementById("translatedInput"),
  xInput: document.getElementById("xInput"),
  yInput: document.getElementById("yInput"),
  widthInput: document.getElementById("widthInput"),
  heightInput: document.getElementById("heightInput"),
  fontSizeInput: document.getElementById("fontSizeInput"),
  alignmentInput: document.getElementById("alignmentInput"),
  textColorInput: document.getElementById("textColorInput"),
  backgroundColorInput: document.getElementById("backgroundColorInput"),
  notesInput: document.getElementById("notesInput"),
};

function setStatus(message, tone = "default") {
  elements.statusBanner.textContent = message;
  elements.statusBanner.style.background =
    tone === "error" ? "rgba(181, 59, 39, 0.12)" :
    tone === "success" ? "rgba(35, 107, 77, 0.12)" :
    "rgba(196, 93, 36, 0.12)";
  elements.statusBanner.style.color =
    tone === "error" ? "#8c2f1e" :
    tone === "success" ? "#236b4d" :
    "#9f4314";
}

function setWarnings(warnings) {
  if (!warnings || warnings.length === 0) {
    elements.warningsBox.classList.add("hidden");
    elements.warningsBox.innerHTML = "";
    return;
  }
  elements.warningsBox.classList.remove("hidden");
  elements.warningsBox.innerHTML = warnings.map((warning) => `<div>${escapeHtml(String(warning))}</div>`).join("");
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function getSelectedRegion() {
  return state.regions.find((region) => region.id === state.selectedRegionId) || null;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
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
    alignment: ["left", "center", "right"].includes(region.alignment) ? region.alignment : "center",
    text_color: region.text_color || "#111111",
    background_color: region.background_color || "rgba(255,255,255,0.92)",
    notes: region.notes || "",
  };
}

function updateButtons() {
  const hasImage = Boolean(state.image);
  const hasRegions = state.regions.length > 0;

  elements.translateButton.disabled = !hasImage || state.isBusy;
  elements.exportButton.disabled = !hasImage || !hasRegions || state.isBusy;
  elements.addRegionButton.disabled = !hasImage || state.isBusy;
  elements.openButton.disabled = state.isBusy;
}

function getDisplaySource() {
  if (elements.cleanPreviewToggle.checked && state.cleanedImageUrl) {
    return state.cleanedImageUrl;
  }
  return state.image?.dataUrl || "";
}

function syncStageMetrics() {
  if (!state.image || !elements.baseImage.src) {
    return;
  }

  const imageRect = elements.baseImage.getBoundingClientRect();
  const stageRect = elements.baseImage.parentElement.getBoundingClientRect();
  state.stageMetrics = {
    left: imageRect.left - stageRect.left,
    top: imageRect.top - stageRect.top,
    width: imageRect.width,
    height: imageRect.height,
  };

  elements.overlayLayer.style.left = `${state.stageMetrics.left}px`;
  elements.overlayLayer.style.top = `${state.stageMetrics.top}px`;
  elements.overlayLayer.style.width = `${state.stageMetrics.width}px`;
  elements.overlayLayer.style.height = `${state.stageMetrics.height}px`;
  renderRegions();
}

function renderBaseImage() {
  if (!state.image) {
    elements.baseImage.style.display = "none";
    elements.baseImage.removeAttribute("src");
    elements.overlayLayer.innerHTML = "";
    return;
  }

  elements.baseImage.style.display = "block";
  const nextSource = getDisplaySource();
  if (elements.baseImage.src !== nextSource) {
    elements.baseImage.src = nextSource;
  }
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
      return `
        <button type="button" class="region-card ${selected}" data-region-id="${region.id}">
          <div class="card-top">
            <span class="kind-tag">${escapeHtml(region.kind)}</span>
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
    return;
  }

  elements.emptyInspector.classList.add("hidden");
  elements.inspectorFields.classList.remove("hidden");

  elements.kindInput.value = region.kind;
  elements.sourceInput.value = region.source_text;
  elements.translatedInput.value = region.translated_text;
  elements.xInput.value = (region.x / 10).toFixed(1);
  elements.yInput.value = (region.y / 10).toFixed(1);
  elements.widthInput.value = (region.width / 10).toFixed(1);
  elements.heightInput.value = (region.height / 10).toFixed(1);
  elements.fontSizeInput.value = String(region.font_size);
  elements.alignmentInput.value = region.alignment;
  elements.textColorInput.value = region.text_color;
  elements.backgroundColorInput.value = region.background_color;
  elements.notesInput.value = region.notes || "";
}

function makeTextRegionElement(region) {
  const metrics = state.stageMetrics;
  if (!metrics) {
    return null;
  }

  const scaleX = metrics.width / 1000;
  const scaleY = metrics.height / 1000;
  const box = document.createElement("div");
  box.className = "text-region";
  if (region.id === state.selectedRegionId) {
    box.classList.add("is-selected");
  }

  box.dataset.regionId = region.id;
  box.style.left = `${region.x * scaleX}px`;
  box.style.top = `${region.y * scaleY}px`;
  box.style.width = `${region.width * scaleX}px`;
  box.style.height = `${region.height * scaleY}px`;
  box.style.fontSize = `${Math.max(10, region.font_size * (metrics.height / state.image.height))}px`;
  box.style.background = region.background_color;
  box.style.color = region.text_color;
  box.style.textAlign = region.alignment;
  box.textContent = region.translated_text;

  box.addEventListener("pointerdown", (event) => {
    if (!state.stageMetrics) {
      return;
    }
    const target = event.target;
    const mode = target.classList.contains("resize-handle") ? "resize" : "move";
    state.selectedRegionId = region.id;
    state.dragContext = {
      mode,
      regionId: region.id,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startRegion: { ...region },
    };
    renderAll();
    event.preventDefault();
  });

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
}

function renderAll() {
  renderBaseImage();
  renderRegionList();
  renderInspector();
  renderRegions();
  updateButtons();
}

function selectRegion(regionId) {
  state.selectedRegionId = regionId;
  renderAll();
}

function updateSelectedRegion(patch) {
  const region = getSelectedRegion();
  if (!region) {
    return;
  }

  Object.assign(region, patch);
  region.x = clamp(region.x, 0, 1000);
  region.y = clamp(region.y, 0, 1000);
  region.width = clamp(region.width, 10, 1000 - region.x);
  region.height = clamp(region.height, 10, 1000 - region.y);
  region.font_size = clamp(region.font_size, 10, 120);
  renderAll();
}

function addRegion() {
  if (!state.image) {
    return;
  }

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
      background_color: "rgba(255,255,255,0.92)",
      notes: "Added manually",
    },
    state.regions.length
  );
  state.regions.push(region);
  state.selectedRegionId = region.id;
  renderAll();
}

function removeSelectedRegion() {
  if (!state.selectedRegionId) {
    return;
  }

  state.regions = state.regions.filter((region) => region.id !== state.selectedRegionId);
  state.selectedRegionId = state.regions[0]?.id || null;
  renderAll();
}

function wrapText(ctx, text, maxWidth) {
  const segments = (text || "").split("\n");
  const lines = [];
  const thaiSegmenter = typeof Intl !== "undefined" && Intl.Segmenter
    ? new Intl.Segmenter("th", { granularity: "grapheme" })
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
    lines.push(currentLine.trimEnd());
  }

  return lines;
}

function fitText(ctx, region, imageWidth, imageHeight) {
  const x = (region.x / 1000) * imageWidth;
  const y = (region.y / 1000) * imageHeight;
  const width = (region.width / 1000) * imageWidth;
  const height = (region.height / 1000) * imageHeight;
  let fontSize = clamp(region.font_size || 28, 12, 120);
  const fontFamily = "\"Noto Sans Thai\", \"Sarabun\", \"Segoe UI\", sans-serif";

  while (fontSize >= 12) {
    ctx.font = `${fontSize}px ${fontFamily}`;
    const lines = wrapText(ctx, region.translated_text, width - 16);
    const lineHeight = fontSize * 1.2;
    if (lines.length * lineHeight <= height - 12) {
      return { x, y, width, height, lines, fontSize, lineHeight };
    }
    fontSize -= 1;
  }

  ctx.font = `12px ${fontFamily}`;
  return {
    x,
    y,
    width,
    height,
    lines: wrapText(ctx, region.translated_text, width - 16),
    fontSize: 12,
    lineHeight: 14.4,
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

async function exportImage() {
  if (!state.image || state.regions.length === 0) {
    return;
  }

  const image = new Image();
  image.src = state.image.dataUrl;
  await image.decode();

  const canvas = document.createElement("canvas");
  canvas.width = state.image.width;
  canvas.height = state.image.height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

  for (const region of state.regions) {
    const textLayout = fitText(ctx, region, canvas.width, canvas.height);
    const radius = Math.min(textLayout.width, textLayout.height) * 0.15;

    ctx.save();
    ctx.fillStyle = region.background_color;
    drawRoundedRect(ctx, textLayout.x, textLayout.y, textLayout.width, textLayout.height, radius);
    ctx.fill();

    ctx.fillStyle = region.text_color;
    ctx.textAlign = region.alignment;
    ctx.textBaseline = "middle";
    ctx.font = `${textLayout.fontSize}px "Noto Sans Thai", "Sarabun", "Segoe UI", sans-serif`;

    let textX = textLayout.x + textLayout.width / 2;
    if (region.alignment === "left") {
      textX = textLayout.x + 10;
    } else if (region.alignment === "right") {
      textX = textLayout.x + textLayout.width - 10;
    }

    const blockHeight = textLayout.lines.length * textLayout.lineHeight;
    let textY = textLayout.y + (textLayout.height - blockHeight) / 2 + textLayout.lineHeight / 2;
    for (const line of textLayout.lines) {
      ctx.fillText(line, textX, textY, textLayout.width - 12);
      textY += textLayout.lineHeight;
    }
    ctx.restore();
  }

  const exportResult = await window.mangaStudio.saveExport({
    dataUrl: canvas.toDataURL("image/png"),
    suggestedName: `${state.image.name.replace(/\.[^.]+$/, "")}-thai.png`,
  });

  if (!exportResult.canceled) {
    setStatus(`Exported: ${exportResult.path}`, "success");
  }
}

async function openImage() {
  const result = await window.mangaStudio.pickImage();
  if (result.canceled) {
    return;
  }

  state.image = {
    path: result.path,
    name: result.name,
    dataUrl: result.dataUrl,
    fileUrl: result.fileUrl,
    width: 0,
    height: 0,
  };
  state.cleanedImageUrl = null;
  state.regions = [];
  state.selectedRegionId = null;
  elements.fileNameLabel.textContent = result.name;
  elements.cleanPreviewToggle.checked = true;
  setWarnings([]);
  setStatus("โหลดภาพแล้ว พร้อมแปลเป็นไทย");
  renderAll();
}

async function translateImage() {
  if (!state.image) {
    return;
  }

  state.isBusy = true;
  updateButtons();
  setStatus("กำลังส่งภาพไปให้ Gemini วิเคราะห์และแปล...", "default");

  try {
    const apiKey = elements.apiKeyInput.value.trim();
    const model = elements.modelInput.value.trim() || "gemini-2.5-flash-image";
    localStorage.setItem("geminiApiKey", apiKey);
    localStorage.setItem("geminiModel", model);

    const data = await window.mangaStudio.translateImage({
      filePath: state.image.path,
      apiKey,
      model,
    });

    state.regions = (data.regions || []).map(normalizeRegion);
    state.selectedRegionId = state.regions[0]?.id || null;
    state.cleanedImageUrl = data.cleaned_image_base64
      ? `data:image/png;base64,${data.cleaned_image_base64}`
      : null;

    if (data.image_width && data.image_height) {
      state.image.width = data.image_width;
      state.image.height = data.image_height;
    }

    setWarnings(data.warnings || []);
    setStatus(`แปลเสร็จแล้ว พบ ${state.regions.length} กล่องข้อความ`, "success");
    renderAll();
  } catch (error) {
    setStatus(error.message || "Translation failed.", "error");
  } finally {
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
  elements.xInput.addEventListener("input", (event) => {
    updateSelectedRegion({ x: clamp(Number(event.target.value) * 10 || 0, 0, 1000) });
  });
  elements.yInput.addEventListener("input", (event) => {
    updateSelectedRegion({ y: clamp(Number(event.target.value) * 10 || 0, 0, 1000) });
  });
  elements.widthInput.addEventListener("input", (event) => {
    updateSelectedRegion({ width: clamp(Number(event.target.value) * 10 || 10, 10, 1000) });
  });
  elements.heightInput.addEventListener("input", (event) => {
    updateSelectedRegion({ height: clamp(Number(event.target.value) * 10 || 10, 10, 1000) });
  });
  elements.fontSizeInput.addEventListener("input", (event) => {
    updateSelectedRegion({ font_size: clamp(Number(event.target.value) || 28, 10, 120) });
  });
  elements.alignmentInput.addEventListener("change", (event) => {
    updateSelectedRegion({ alignment: event.target.value });
  });
  elements.textColorInput.addEventListener("input", (event) => {
    updateSelectedRegion({ text_color: event.target.value.trim() || "#111111" });
  });
  elements.backgroundColorInput.addEventListener("input", (event) => {
    updateSelectedRegion({ background_color: event.target.value.trim() || "rgba(255,255,255,0.92)" });
  });
  elements.notesInput.addEventListener("input", (event) => {
    updateSelectedRegion({ notes: event.target.value });
  });
}

function handlePointerMove(event) {
  if (!state.dragContext || !state.stageMetrics) {
    return;
  }

  const region = getSelectedRegion();
  if (!region) {
    return;
  }

  const dx = ((event.clientX - state.dragContext.startClientX) / state.stageMetrics.width) * 1000;
  const dy = ((event.clientY - state.dragContext.startClientY) / state.stageMetrics.height) * 1000;
  const startRegion = state.dragContext.startRegion;

  if (state.dragContext.mode === "move") {
    region.x = clamp(startRegion.x + dx, 0, 1000 - region.width);
    region.y = clamp(startRegion.y + dy, 0, 1000 - region.height);
  } else {
    region.width = clamp(startRegion.width + dx, 10, 1000 - region.x);
    region.height = clamp(startRegion.height + dy, 10, 1000 - region.y);
  }

  renderAll();
}

function handlePointerUp() {
  state.dragContext = null;
}

function attachGeneralHandlers() {
  elements.apiKeyInput.value = state.apiKey;
  elements.modelInput.value = state.model;

  elements.openButton.addEventListener("click", openImage);
  elements.translateButton.addEventListener("click", translateImage);
  elements.exportButton.addEventListener("click", exportImage);
  elements.addRegionButton.addEventListener("click", addRegion);
  elements.deleteRegionButton.addEventListener("click", removeSelectedRegion);
  elements.cleanPreviewToggle.addEventListener("change", () => {
    renderBaseImage();
  });

  elements.regionList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-region-id]");
    if (!button) {
      return;
    }
    selectRegion(button.dataset.regionId);
  });

  elements.baseImage.addEventListener("load", () => {
    if (state.image && (state.image.width === 0 || state.image.height === 0)) {
      state.image.width = elements.baseImage.naturalWidth;
      state.image.height = elements.baseImage.naturalHeight;
    }
    syncStageMetrics();
  });

  new ResizeObserver(() => syncStageMetrics()).observe(document.querySelector(".stage-frame"));
  window.addEventListener("resize", syncStageMetrics);
  document.addEventListener("pointermove", handlePointerMove);
  document.addEventListener("pointerup", handlePointerUp);
}

attachGeneralHandlers();
attachInspectorHandlers();
renderAll();
setStatus("พร้อมใช้งาน");
