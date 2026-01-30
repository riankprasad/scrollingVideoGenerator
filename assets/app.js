const templates = [
  {
    id: "instagram_square",
    label: "Instagram Post (1:1)",
    width: 1080,
    height: 1080,
  },
  {
    id: "instagram_story",
    label: "Instagram Story/Reel (9:16)",
    width: 1080,
    height: 1920,
  },
  {
    id: "youtube_standard",
    label: "YouTube Standard (16:9)",
    width: 1920,
    height: 1080,
  },
  {
    id: "youtube_shorts",
    label: "YouTube Shorts (9:16)",
    width: 1080,
    height: 1920,
  },
  {
    id: "tiktok",
    label: "TikTok Fullscreen (9:16)",
    width: 1080,
    height: 1920,
  },
  {
    id: "custom",
    label: "Custom",
    width: 1080,
    height: 1080,
  },
];

const STORAGE_KEY = "svg-custom-templates";

const elements = {
  tabs: document.querySelectorAll(".tab"),
  panels: document.querySelectorAll("main[data-panel]"),
  templateSelect: document.getElementById("templateSelect"),
  templateName: document.getElementById("templateName"),
  templatePassword: document.getElementById("templatePassword"),
  addTemplate: document.getElementById("addTemplate"),
  widthInput: document.getElementById("widthInput"),
  heightInput: document.getElementById("heightInput"),
  bgMode: document.getElementById("bgMode"),
  bgColor: document.getElementById("bgColor"),
  bgColorRow: document.getElementById("bgColorRow"),
  bgImageRow: document.getElementById("bgImageRow"),
  bgImageInput: document.getElementById("bgImageInput"),
  textInput: document.getElementById("textInput"),
  textEditor: document.getElementById("textEditor"),
  editorToolbar: document.querySelector(".editor-toolbar"),
  autoParagraph: document.getElementById("autoParagraph"),
  textAlign: document.getElementById("textAlign"),
  fontSelect: document.getElementById("fontSelect"),
  customFont: document.getElementById("customFont"),
  fontSize: document.getElementById("fontSize"),
  fontWeight: document.getElementById("fontWeight"),
  fontStyle: document.getElementById("fontStyle"),
  textColor: document.getElementById("textColor"),
  lineSpacing: document.getElementById("lineSpacing"),
  offsetX: document.getElementById("offsetX"),
  offsetY: document.getElementById("offsetY"),
  directionSelect: document.getElementById("directionSelect"),
  speed: document.getElementById("speed"),
  warning: document.getElementById("warning"),
  qrUrl: document.getElementById("qrUrl"),
  qrStyle: document.getElementById("qrStyle"),
  qrSize: document.getElementById("qrSize"),
  qrX: document.getElementById("qrX"),
  qrY: document.getElementById("qrY"),
  qrLabel: document.getElementById("qrLabel"),
  qrLabelSize: document.getElementById("qrLabelSize"),
  qrLabelColor: document.getElementById("qrLabelColor"),
  qrStatus: document.getElementById("qrStatus"),
  generateQr: document.getElementById("generateQr"),
  downloadQrPng: document.getElementById("downloadQrPng"),
  downloadQrSvg: document.getElementById("downloadQrSvg"),
  exportFrame: document.getElementById("exportFrame"),
  refreshPreview: document.getElementById("refreshPreview"),
  downloadVideo: document.getElementById("downloadVideo"),
  videoDuration: document.getElementById("videoDuration"),
  videoFormat: document.getElementById("videoFormat"),
  videoProgress: document.getElementById("videoProgress"),
  templateMeta: document.getElementById("templateMeta"),
  canvas: document.getElementById("previewCanvas"),

  captionProfileSelect: document.getElementById("captionProfileSelect"),
  captionProfileName: document.getElementById("captionProfileName"),
  captionProfileHandle: document.getElementById("captionProfileHandle"),
  captionProfilePlatform: document.getElementById("captionProfilePlatform"),
  captionAddProfile: document.getElementById("captionAddProfile"),
  captionTemplateSelect: document.getElementById("captionTemplateSelect"),
  captionTemplateName: document.getElementById("captionTemplateName"),
  captionDaysOffset: document.getElementById("captionDaysOffset"),
  captionTemplateBody: document.getElementById("captionTemplateBody"),
  captionHashtags: document.getElementById("captionHashtags"),
  captionSaveTemplate: document.getElementById("captionSaveTemplate"),
  captionDate: document.getElementById("captionDate"),
  captionDay: document.getElementById("captionDay"),
  captionTime: document.getElementById("captionTime"),
  captionCustomText: document.getElementById("captionCustomText"),
  captionScrollToggle: document.getElementById("captionScrollToggle"),
  captionScrollText: document.getElementById("captionScrollText"),
  captionTitle: document.getElementById("captionTitle"),
  captionSiteUrl: document.getElementById("captionSiteUrl"),
  captionCategory: document.getElementById("captionCategory"),
  captionGenerate: document.getElementById("captionGenerate"),
  captionCopy: document.getElementById("captionCopy"),
  captionSavePost: document.getElementById("captionSavePost"),
  captionSaveResult: document.getElementById("captionSaveResult"),
  captionPreviewMeta: document.getElementById("captionPreviewMeta"),
  captionOutput: document.getElementById("captionOutput"),
  captionCustomCopy: document.getElementById("captionCustomCopy"),
  captionCustomPaste: document.getElementById("captionCustomPaste"),
  captionOutputCopy: document.getElementById("captionOutputCopy"),
  captionOutputPaste: document.getElementById("captionOutputPaste"),
  contentCopyButtons: document.querySelectorAll(".content-copy"),

  wizardSteps: document.querySelectorAll(".wizard-step"),
  wizardPanels: document.querySelectorAll(".wizard-step-content"),
  wizardPrev: document.getElementById("wizardPrev"),
  wizardNext: document.getElementById("wizardNext"),
  wizardProgress: document.getElementById("wizardProgress"),

  expScheduleDate: document.getElementById("expScheduleDate"),
  expScheduleTime: document.getElementById("expScheduleTime"),
  expHookText: document.getElementById("expHookText"),
  expScoreHook: document.getElementById("expScoreHook"),
  expHookScore: document.getElementById("expHookScore"),
  expBestTime: document.getElementById("expBestTime"),
  expApplyBestTime: document.getElementById("expApplyBestTime"),
  expScheduleSummary: document.getElementById("expScheduleSummary"),
  expDays: document.getElementById("expDays"),
  expTimezone: document.getElementById("expTimezone"),
  carousel: document.getElementById("contentCarousel"),
  carouselPrev: document.getElementById("carouselPrev"),
  carouselNext: document.getElementById("carouselNext"),
  igReelUrl: document.getElementById("igReelUrl"),
  igDownload: document.getElementById("igDownload"),
  igCopyLink: document.getElementById("igCopyLink"),
  igDownloadStatus: document.getElementById("igDownloadStatus"),
  ytUrl: document.getElementById("ytUrl"),
  ytDownload: document.getElementById("ytDownload"),
  ytCopyLink: document.getElementById("ytCopyLink"),
  ytDownloadStatus: document.getElementById("ytDownloadStatus"),
};

let ctx = null;
if (elements.canvas) {
  ctx = elements.canvas.getContext("2d");
}
let qrImage = null;
let qrSvg = "";
let backgroundImage = null;
let backgroundImageUrl = "";
let lastTime = performance.now();
let scrollPosition = 0;
let wizardCurrentStep = 1;
let needsFit = true;
const MIN_FONT_SIZE = 12;
const FIT_PADDING = 20;

function buildBestTimes(date) {
  const day = date.getDay();
  const weekdays = [
    ["09:00", "12:00", "18:30"],
    ["08:30", "11:30", "19:00"],
    ["09:15", "13:00", "20:00"],
    ["10:00", "14:00", "20:30"],
    ["09:45", "12:45", "19:15"],
    ["11:00", "16:00", "21:00"],
    ["10:30", "15:30", "20:30"],
  ];
  return weekdays[day] || ["12:00", "18:00", "20:00"];
}

function scoreHook(text, style) {
  const clean = text.trim();
  if (!clean) return 0;
  const lengthScore = Math.max(0, 50 - Math.abs(clean.length - 70));
  const emojiBoost = /[\u{1F300}-\u{1FAFF}]/u.test(clean) ? 6 : 0;
  const questionBoost = /\?/.test(clean) ? 6 : 0;
  const numberBoost = /\d/.test(clean) ? 6 : 0;
  const actionBoost = /(stop|watch|learn|try|do|save|share)/i.test(clean) ? 8 : 0;

  let styleBoost = 0;
  if (style.includes("Engagement")) styleBoost = questionBoost + emojiBoost;
  if (style.includes("Retention")) styleBoost = numberBoost + actionBoost;
  if (style.includes("Sales")) styleBoost = actionBoost + 4;

  const total = lengthScore + emojiBoost + questionBoost + numberBoost + actionBoost + styleBoost;
  return Math.min(100, Math.max(20, Math.round(total)));
}

function updateBestTimeOptions() {
  if (!elements.expBestTime || !elements.expScheduleDate) return;
  const dateValue = elements.expScheduleDate.value;
  if (!dateValue) {
    elements.expBestTime.innerHTML = "";
    if (elements.expScheduleSummary) {
      elements.expScheduleSummary.textContent = "Set a date to see recommendations.";
    }
    return;
  }
  const date = new Date(`${dateValue}T00:00:00`);
  const times = buildBestTimes(date);
  elements.expBestTime.innerHTML = "";
  times.forEach((time) => {
    const option = document.createElement("option");
    option.value = time;
    option.textContent = time;
    elements.expBestTime.appendChild(option);
  });
  if (elements.expScheduleSummary) {
    elements.expScheduleSummary.textContent = `Best times for ${dateValue}: ${times.join(", ")}`;
  }
}

function applyBestTime() {
  if (!elements.expBestTime || !elements.expScheduleTime) return;
  const value = elements.expBestTime.value;
  if (value) elements.expScheduleTime.value = value;
}

function updateHookScore() {
  if (!elements.expHookScore || !elements.expHookText || !elements.expHookStyle) return;
  const score = scoreHook(elements.expHookText.value, elements.expHookStyle.value);
  elements.expHookScore.textContent = `${score}/100`;
}

function setWizardStep(step) {
  if (!elements.wizardSteps.length) return;
  const total = elements.wizardSteps.length;
  wizardCurrentStep = Math.min(Math.max(step, 1), total);
  elements.wizardSteps.forEach((item) => {
    item.classList.toggle("active", Number(item.dataset.step) === wizardCurrentStep);
  });
  elements.wizardPanels.forEach((panel) => {
    panel.hidden = Number(panel.dataset.step) !== wizardCurrentStep;
  });
  if (elements.wizardPrev) elements.wizardPrev.disabled = wizardCurrentStep === 1;
  if (elements.wizardNext) {
    elements.wizardNext.textContent = wizardCurrentStep === total ? "Finish" : "Next";
  }
  if (elements.wizardProgress) {
    const progress = Math.round((wizardCurrentStep / total) * 100);
    elements.wizardProgress.style.width = `${progress}%`;
  }
}

const CAPTION_PROFILE_KEY = "svg-caption-profiles";
const CAPTION_TEMPLATE_KEY = "svg-caption-templates";

const defaultCaptionTemplates = [
  {
    id: "default_ig",
    name: "Instagram Default",
    daysOffset: "0",
    body: "{custom}\n\n{hashtags}",
    hashtags: "#instagram #content",
  },
  {
    id: "default_yt",
    name: "YouTube Default",
    daysOffset: "0",
    body: "{custom}\n\n{hashtags}",
    hashtags: "#youtube #shorts",
  },
];

function loadCaptionProfiles() {
  try {
    const stored = JSON.parse(localStorage.getItem(CAPTION_PROFILE_KEY) || "[]");
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
}

function saveCaptionProfiles(list) {
  localStorage.setItem(CAPTION_PROFILE_KEY, JSON.stringify(list));
}

function loadCaptionTemplates() {
  try {
    const stored = JSON.parse(localStorage.getItem(CAPTION_TEMPLATE_KEY) || "[]");
    if (Array.isArray(stored) && stored.length) return stored;
    return defaultCaptionTemplates;
  } catch {
    return defaultCaptionTemplates;
  }
}

function saveCaptionTemplates(list) {
  localStorage.setItem(CAPTION_TEMPLATE_KEY, JSON.stringify(list));
}

function populateCaptionProfiles() {
  if (!elements.captionProfileSelect) return;
  const profiles = loadCaptionProfiles();
  elements.captionProfileSelect.innerHTML = "";
  const emptyOption = document.createElement("option");
  emptyOption.value = "";
  emptyOption.textContent = "Select profile";
  elements.captionProfileSelect.appendChild(emptyOption);
  profiles.forEach((profile) => {
    const option = document.createElement("option");
    option.value = profile.id;
    option.textContent = `${profile.name} (${profile.platform})`;
    elements.captionProfileSelect.appendChild(option);
  });
}

function populateCaptionTemplates() {
  if (!elements.captionTemplateSelect) return;
  const templates = loadCaptionTemplates();
  elements.captionTemplateSelect.innerHTML = "";
  templates.forEach((template) => {
    const option = document.createElement("option");
    option.value = template.id;
    option.textContent = template.name;
    elements.captionTemplateSelect.appendChild(option);
  });
  elements.captionTemplateSelect.value = templates[0]?.id || "";
  applyCaptionTemplate();
}

function applyCaptionTemplate() {
  const templates = loadCaptionTemplates();
  const current = templates.find((t) => t.id === elements.captionTemplateSelect.value) || templates[0];
  if (!current) return;
  elements.captionTemplateName.value = current.name;
  elements.captionDaysOffset.value = current.daysOffset;
  elements.captionTemplateBody.value = current.body;
  elements.captionHashtags.value = current.hashtags;
}

function addCaptionProfile() {
  const name = elements.captionProfileName.value.trim();
  if (!name) return;
  const handle = elements.captionProfileHandle.value.trim();
  const platform = elements.captionProfilePlatform.value;
  const profiles = loadCaptionProfiles();
  profiles.push({
    id: `profile_${Date.now()}`,
    name,
    handle,
    platform,
  });
  saveCaptionProfiles(profiles);
  elements.captionProfileName.value = "";
  elements.captionProfileHandle.value = "";
  populateCaptionProfiles();
}

function addCaptionTemplate() {
  const name = elements.captionTemplateName.value.trim();
  if (!name) return;
  const templates = loadCaptionTemplates();
  templates.push({
    id: `tmpl_${Date.now()}`,
    name,
    daysOffset: elements.captionDaysOffset.value.trim() || "0",
    body: elements.captionTemplateBody.value,
    hashtags: elements.captionHashtags.value,
  });
  saveCaptionTemplates(templates);
  populateCaptionTemplates();
  elements.captionTemplateSelect.value = templates[templates.length - 1].id;
}

function parseDaysOffset(raw) {
  const value = raw.trim();
  if (value === "") return 0;
  if (/^[+-]?\d+$/.test(value)) return Number(value);
  return 0;
}

function getSelectedProfile() {
  const profiles = loadCaptionProfiles();
  return profiles.find((p) => p.id === elements.captionProfileSelect.value) || null;
}

function updateDayFromDate() {
  if (!elements.captionDate.value) return;
  const date = new Date(`${elements.captionDate.value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return;
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  elements.captionDay.value = days[date.getDay()];
}

function buildCaptionText() {
  const profile = getSelectedProfile();
  const profileName = profile?.name || "";
  const profileHandle = profile?.handle || "";
  const platform = profile?.platform || "";
  const dateValue = elements.captionDate.value;
  let dayValue = elements.captionDay.value;
  const timeValue = elements.captionTime.value || "";
  let offsetDate = dateValue;

  if (dateValue) {
    const baseDate = new Date(`${dateValue}T00:00:00`);
    const offset = parseDaysOffset(elements.captionDaysOffset.value || "0");
    if (!Number.isNaN(baseDate.getTime())) {
      baseDate.setDate(baseDate.getDate() + offset);
      const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      dayValue = days[baseDate.getDay()];
      offsetDate = baseDate.toISOString().slice(0, 10);
    }
  }

  const hashtags = elements.captionHashtags.value.trim();
  const custom = elements.captionCustomText.value;
  let caption = elements.captionTemplateBody.value || "{custom}\n\n{hashtags}";
  caption = caption
    .replaceAll("{profile}", profileName)
    .replaceAll("{handle}", profileHandle)
    .replaceAll("{platform}", platform)
    .replaceAll("{date}", offsetDate)
    .replaceAll("{day}", dayValue)
    .replaceAll("{time}", timeValue)
    .replaceAll("{custom}", custom)
    .replaceAll("{hashtags}", hashtags);

  if (elements.captionScrollToggle.checked) {
    const scrollText = elements.captionScrollText.value.trim();
    if (scrollText) {
      caption += `\n\n${scrollText}`;
    }
  }

  return caption.trim();
}

function updateCaptionPreview() {
  if (!elements.captionOutput) return;
  const caption = buildCaptionText();
  elements.captionOutput.textContent = caption;
  elements.captionPreviewMeta.textContent = caption ? "Preview updated" : "Ready";
}

async function saveCaptionPost() {
  const caption = buildCaptionText();
  if (!caption) return;
  const profile = getSelectedProfile();
  const form = new FormData();
  form.append("action", "save_caption");
  form.append("caption", caption);
  form.append("title", elements.captionTitle.value.trim());
  form.append("profile", profile ? `${profile.name} ${profile.handle}`.trim() : "");
  form.append("date", elements.captionDate.value || "");
  form.append("day", elements.captionDay.value || "");
  form.append("time", elements.captionTime.value || "");
  form.append("hashtags", elements.captionHashtags.value.trim());
  form.append("category", elements.captionCategory?.value.trim() || "");
  form.append("siteUrl", elements.captionSiteUrl.value.trim());

  const response = await fetch("index.php", {
    method: "POST",
    body: form,
  });
  const data = await response.json();
  if (data.ok) {
    elements.captionSaveResult.hidden = false;
    elements.captionSaveResult.textContent = `Saved: ${data.url}`;
  } else {
    elements.captionSaveResult.hidden = false;
    elements.captionSaveResult.textContent = data.message || "Save failed.";
  }
}

function copyCaption() {
  const caption = buildCaptionText();
  if (!caption) return;
  navigator.clipboard.writeText(caption);
}

function copyCustomText() {
  const text = elements.captionCustomText?.value || "";
  if (!text) return;
  navigator.clipboard.writeText(text);
}

async function pasteToCustomText() {
  if (!elements.captionCustomText) return;
  const text = await navigator.clipboard.readText();
  if (text) {
    elements.captionCustomText.value = text;
    updateCaptionPreview();
  }
}

function copyGeneratedCaption() {
  const text = elements.captionOutput?.textContent || "";
  if (!text) return;
  navigator.clipboard.writeText(text);
}

function pasteOutputToCustom() {
  if (!elements.captionOutput || !elements.captionCustomText) return;
  elements.captionCustomText.value = elements.captionOutput.textContent || "";
  updateCaptionPreview();
}

function bindContentCopyButtons() {
  if (!elements.contentCopyButtons.length) return;
  elements.contentCopyButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const url = button.dataset.copyUrl;
      if (url) navigator.clipboard.writeText(url);
    });
  });
}

function bindTabEvents() {
  elements.tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      elements.tabs.forEach((btn) => btn.classList.remove("active"));
      tab.classList.add("active");
      const target = tab.dataset.tab;
      elements.panels.forEach((panel) => {
        panel.hidden = panel.dataset.panel !== target;
      });
    });
  });
}

function loadCustomTemplates() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
}

function saveCustomTemplates(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function getAllTemplates() {
  const customTemplates = loadCustomTemplates();
  return [...templates, ...customTemplates];
}

function populateTemplates() {
  elements.templateSelect.innerHTML = "";
  getAllTemplates().forEach((template) => {
    const option = document.createElement("option");
    option.value = template.id;
    option.textContent = template.label;
    elements.templateSelect.appendChild(option);
  });
  elements.templateSelect.value = getAllTemplates()[0].id;
}

function getCurrentTemplate() {
  return (
    getAllTemplates().find((template) => template.id === elements.templateSelect.value) ||
    getAllTemplates()[0]
  );
}

function updateTemplateInputs() {
  const current = getCurrentTemplate();
  const isCustom = current.id === "custom";
  elements.widthInput.value = current.width;
  elements.heightInput.value = current.height;
  elements.widthInput.disabled = !isCustom;
  elements.heightInput.disabled = !isCustom;
  elements.templateMeta.textContent = `${current.width} x ${current.height}px`;
  resizeCanvas();
}

function addCustomTemplate() {
  const name = elements.templateName.value.trim();
  if (!name) return;
  const password = elements.templatePassword.value.trim();
  if (password !== "secretpassword") {
    alert("Invalid password. Template not saved.");
    return;
  }
  const width = Number(elements.widthInput.value) || 1080;
  const height = Number(elements.heightInput.value) || 1080;
  const newTemplate = {
    id: `custom_${Date.now()}`,
    label: name,
    width,
    height,
  };
  const customTemplates = loadCustomTemplates();
  customTemplates.push(newTemplate);
  saveCustomTemplates(customTemplates);
  populateTemplates();
  elements.templateSelect.value = newTemplate.id;
  elements.templateName.value = "";
  elements.templatePassword.value = "";
  updateTemplateInputs();
}

function resizeCanvas() {
  if (!elements.canvas) return;
  const width = Number(elements.widthInput.value) || 1080;
  const height = Number(elements.heightInput.value) || 1080;
  elements.canvas.width = width;
  elements.canvas.height = height;
  scrollPosition = 0;
  needsFit = true;
  updateAutoDuration();
}

function buildFont(sizeOverride) {
  const size = Number(sizeOverride ?? elements.fontSize.value) || 64;
  const custom = elements.customFont.value.trim();
  const font = custom || elements.fontSelect.value || "Inter";
  const weight = elements.fontWeight.value || "400";
  const style = elements.fontStyle.value || "normal";
  return `${style} ${weight} ${size}px ${font}`;
}

function drawBackground() {
  if (!ctx) return;
  const mode = elements.bgMode?.value || "color";
  if (mode === "transparent") {
    ctx.clearRect(0, 0, elements.canvas.width, elements.canvas.height);
    return;
  }
  if (mode === "image") {
    ctx.clearRect(0, 0, elements.canvas.width, elements.canvas.height);
    if (backgroundImage) {
      drawBackgroundImage(backgroundImage);
    }
    return;
  }
  const fill = mode === "white" ? "#ffffff" : mode === "black" ? "#000000" : elements.bgColor.value;
  ctx.fillStyle = fill;
  ctx.fillRect(0, 0, elements.canvas.width, elements.canvas.height);
}

function drawBackgroundImage(image) {
  if (!ctx) return;
  const canvasWidth = elements.canvas.width;
  const canvasHeight = elements.canvas.height;
  const scale = Math.max(canvasWidth / image.width, canvasHeight / image.height);
  const drawWidth = image.width * scale;
  const drawHeight = image.height * scale;
  const offsetX = (canvasWidth - drawWidth) / 2;
  const offsetY = (canvasHeight - drawHeight) / 2;
  ctx.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
}

function updateBackgroundModeUI() {
  if (!elements.bgMode) return;
  const mode = elements.bgMode.value;
  if (elements.bgColorRow) {
    elements.bgColorRow.hidden = mode !== "color";
  }
  if (elements.bgImageRow) {
    elements.bgImageRow.hidden = mode !== "image";
  }
  refreshPreview();
}

function loadBackgroundImage(file) {
  if (!file) return;
  if (backgroundImageUrl) {
    URL.revokeObjectURL(backgroundImageUrl);
  }
  const url = URL.createObjectURL(file);
  backgroundImageUrl = url;
  const img = new Image();
  img.onload = () => {
    backgroundImage = img;
    refreshPreview();
  };
  img.src = url;
}

function getLines(sizeOverride) {
  if (!ctx) return [""];
  ctx.font = buildFont(sizeOverride);
  const sourceText = elements.textEditor?.innerText || elements.textInput?.value || "";
  const rawLines = sourceText.split("\n");
  if (elements.autoParagraph.value !== "on") return rawLines;

  const padding = 40;
  const maxWidth = Math.max(200, elements.canvas.width - padding * 2);
  const wrapped = [];
  rawLines.forEach((line) => {
    const words = line.split(" ");
    let current = "";
    words.forEach((word) => {
      const testLine = current ? `${current} ${word}` : word;
      const width = ctx.measureText(testLine).width;
      if (width > maxWidth && current) {
        wrapped.push(current);
        current = word;
      } else {
        current = testLine;
      }
    });
    if (current) wrapped.push(current);
  });
  return wrapped.length ? wrapped : [""];
}

function measureTextBlock(sizeOverride) {
  if (!ctx) {
    return {
      lines: [""],
      lineHeight: 0,
      textHeight: 0,
      maxLineWidth: 0,
      size: Number(sizeOverride ?? elements.fontSize.value) || 64,
    };
  }
  const size = Number(sizeOverride ?? elements.fontSize.value) || 64;
  const lines = getLines(size);
  const lineHeight = size + Number(elements.lineSpacing.value);
  const maxLineWidth = Math.max(...lines.map((line) => ctx.measureText(line).width), 0);
  const textHeight = lines.length * lineHeight;
  return { lines, lineHeight, textHeight, maxLineWidth, size };
}

function ensureTextFits() {
  if (!ctx) return;
  let size = Number(elements.fontSize.value) || 64;
  const maxWidth = elements.canvas.width - FIT_PADDING * 2;
  const maxHeight = elements.canvas.height - FIT_PADDING * 2;
  const direction = elements.directionSelect.value;
  let guard = 0;
  while (size > MIN_FONT_SIZE && guard < 40) {
    const metrics = measureTextBlock(size);
    const widthOk = direction === "ltr" || direction === "rtl" ? true : metrics.maxLineWidth <= maxWidth;
    const heightOk = direction === "ttb" || direction === "btt" ? true : metrics.textHeight <= maxHeight;
    if (widthOk && heightOk) break;
    size -= 2;
    guard += 1;
  }
  if (size < MIN_FONT_SIZE) size = MIN_FONT_SIZE;
  if (Number(elements.fontSize.value) !== size) {
    elements.fontSize.value = size;
  }
  needsFit = false;
}

function updateWarning() {
  if (!ctx) return;
  const metrics = measureTextBlock();
  const widthLimit = elements.canvas.width - 10;
  const heightLimit = elements.canvas.height - 10;
  const direction = elements.directionSelect.value;
  const tooWide = metrics.maxLineWidth > widthLimit;
  const tooTall = metrics.textHeight > heightLimit;
  const relevantClip = (direction === "ttb" || direction === "btt") ? tooWide :
    (direction === "ltr" || direction === "rtl") ? tooTall : (tooWide || tooTall);
  elements.warning.hidden = !relevantClip;
}

function drawText(delta) {
  if (!ctx) return;
  const direction = elements.directionSelect.value;
  const speed = Number(elements.speed.value) || 100;
  const offsetX = Number(elements.offsetX.value) || 0;
  const offsetY = Number(elements.offsetY.value) || 0;

  if (needsFit) ensureTextFits();
  ctx.font = buildFont();
  ctx.fillStyle = elements.textColor.value;
  ctx.textBaseline = "top";
  ctx.textAlign = elements.textAlign.value || "center";

  const metrics = measureTextBlock();
  const lines = metrics.lines;
  const lineHeight = metrics.lineHeight;
  const maxLineWidth = metrics.maxLineWidth;
  updateWarning();

  if (direction === "rtl" || direction === "ltr") {
    const textWidth = maxLineWidth;
    const startX = direction === "rtl" ? elements.canvas.width + textWidth : -textWidth;
    const endX = direction === "rtl" ? -textWidth : elements.canvas.width + textWidth;
    const distance = endX - startX;
    scrollPosition += (speed * delta * (direction === "rtl" ? -1 : 1));
    let x = startX + scrollPosition;
    if ((direction === "rtl" && x < endX) || (direction === "ltr" && x > endX)) {
      scrollPosition = 0;
      x = startX;
    }
    const alignOffset = ctx.textAlign === "center" ? elements.canvas.width / 2 :
      ctx.textAlign === "right" ? elements.canvas.width - 20 : 20;
    lines.forEach((line, index) => {
      ctx.fillText(line, x + offsetX + alignOffset, offsetY + index * lineHeight);
    });
  } else {
    const textHeight = lines.length * lineHeight;
    const lead = lineHeight;
    const startY = direction === "btt" ? elements.canvas.height + lead : -lead;
    const endY = direction === "btt" ? -textHeight : elements.canvas.height + textHeight;
    scrollPosition += (speed * delta * (direction === "btt" ? -1 : 1));
    let y = startY + scrollPosition;
    if ((direction === "btt" && y < endY) || (direction === "ttb" && y > endY)) {
      scrollPosition = 0;
      y = startY;
    }
    const alignOffset = ctx.textAlign === "center" ? elements.canvas.width / 2 :
      ctx.textAlign === "right" ? elements.canvas.width - 20 : 20;
    lines.forEach((line, index) => {
      ctx.fillText(line, offsetX + alignOffset, y + offsetY + index * lineHeight);
    });
  }
}

function updateAutoDuration() {
  if (!ctx || !elements.videoDuration || !elements.speed) return;
  if (needsFit) ensureTextFits();
  const metrics = measureTextBlock();
  const speed = Math.max(10, Number(elements.speed.value) || 100);
  const direction = elements.directionSelect.value;
  let distance = 0;
  if (direction === "rtl" || direction === "ltr") {
    distance = elements.canvas.width + metrics.maxLineWidth * 2;
  } else {
    distance = elements.canvas.height + metrics.textHeight + metrics.lineHeight;
  }
  const duration = Math.max(1, Math.round((distance / speed) * 10) / 10);
  elements.videoDuration.value = Math.min(duration, 600);
}

function refreshPreview() {
  if (!ctx) return;
  scrollPosition = 0;
  lastTime = performance.now();
  needsFit = true;
  ensureTextFits();
  updateAutoDuration();
  drawBackground();
  drawText(0);
  drawQr();
}

function drawQr() {
  if (!ctx) return;
  if (!qrImage) return;
  const size = Number(elements.qrSize.value) || 160;
  const x = Number(elements.qrX.value) || 0;
  const y = Number(elements.qrY.value) || 0;
  ctx.drawImage(qrImage, x, y, size, size);

  const label = elements.qrLabel?.value?.trim();
  if (label) {
    const labelSize = Number(elements.qrLabelSize?.value) || 20;
    ctx.font = `600 ${labelSize}px Inter, system-ui, sans-serif`;
    ctx.fillStyle = elements.qrLabelColor?.value || "#ffffff";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    const labelY = y + size + 8;
    ctx.fillText(label, x + size / 2, labelY);
  }
}

function animate(now) {
  if (!ctx) return;
  const deltaSeconds = (now - lastTime) / 1000;
  lastTime = now;
  drawBackground();
  drawText(deltaSeconds);
  drawQr();
  requestAnimationFrame(animate);
}

function updateQrStatus(message) {
  if (!elements.qrStatus) return;
  elements.qrStatus.textContent = message;
}

async function generateQr() {
  const url = elements.qrUrl.value.trim();
  if (!url) {
    updateQrStatus("Provide a URL to generate a QR code.");
    return;
  }
  const style = elements.qrStyle?.value || "classic";
  updateQrStatus("Generating QR code...");

  if (style !== "classic" && window.QRCodeStyling) {
    const qrCode = new QRCodeStyling({
      width: 512,
      height: 512,
      type: "canvas",
      data: url,
      margin: 4,
      dotsOptions: {
        type: style === "dots" ? "dots" : style === "classy" ? "classy" : "rounded",
        color: "#000000",
      },
      backgroundOptions: {
        color: "transparent",
      },
      cornersSquareOptions: {
        type: style === "classy" ? "extra-rounded" : "rounded",
      },
      cornersDotOptions: {
        type: style === "dots" ? "dot" : "rounded",
      },
    });

    const blob = await qrCode.getRawData("png");
    if (blob) {
      const dataUrl = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => {
        qrImage = img;
        refreshPreview();
        URL.revokeObjectURL(dataUrl);
      };
      img.src = dataUrl;
    }

    const svgBlob = await qrCode.getRawData("svg");
    if (svgBlob) {
      qrSvg = await svgBlob.text();
    }
  } else {
    QRCode.toDataURL(url, { width: 512, margin: 1 }, (err, dataUrl) => {
      if (err) {
        updateQrStatus("QR generation failed.");
        return;
      }
      const img = new Image();
      img.onload = () => {
        qrImage = img;
        refreshPreview();
      };
      img.src = dataUrl;
    });

    QRCode.toString(url, { type: "svg", margin: 1 }, (err, svg) => {
      if (err) return;
      qrSvg = svg;
    });
  }

  logQrGeneration();
  updateQrStatus("QR code ready.");
}

async function logQrGeneration() {
  const url = elements.qrUrl.value.trim();
  if (!url) return;
  const payload = new URLSearchParams({
    action: "save_qr_log",
    url,
    style: elements.qrStyle?.value || "classic",
    size: elements.qrSize.value || "160",
    x: elements.qrX.value || "0",
    y: elements.qrY.value || "0",
    label: elements.qrLabel?.value || "",
    labelSize: elements.qrLabelSize?.value || "20",
    labelColor: elements.qrLabelColor?.value || "#ffffff",
  });
  try {
    await fetch(window.location.pathname + window.location.search, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: payload.toString(),
    });
  } catch {
    // no-op
  }
}

function buildQrCompositePng() {
  if (!qrImage) return null;
  const size = Number(elements.qrSize.value) || 160;
  const label = elements.qrLabel?.value?.trim();
  const labelSize = Number(elements.qrLabelSize?.value) || 20;
  const labelPadding = label ? 10 + labelSize : 0;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size + labelPadding;
  const cctx = canvas.getContext("2d");
  if (!cctx) return null;
  cctx.clearRect(0, 0, canvas.width, canvas.height);
  cctx.drawImage(qrImage, 0, 0, size, size);
  if (label) {
    cctx.font = `600 ${labelSize}px Inter, system-ui, sans-serif`;
    cctx.fillStyle = elements.qrLabelColor?.value || "#ffffff";
    cctx.textAlign = "center";
    cctx.textBaseline = "top";
    cctx.fillText(label, size / 2, size + 8);
  }
  return canvas.toDataURL("image/png");
}

function downloadDataUrl(dataUrl, filename) {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

function buildUniqueId() {
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, "0");
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const yy = String(now.getFullYear()).slice(-2);
  const ss = String(now.getSeconds()).padStart(2, "0");
  const random = Math.random().toString(36).slice(2, 6);
  return `${dd}${mm}${yy}_${ss}_${random}`;
}

function buildFilename(ext) {
  return `${buildUniqueId()}.${ext}`;
}

function downloadSvg(svg, filename) {
  const blob = new Blob([svg], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  downloadDataUrl(url, filename);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

function exportPreviewFrame() {
  if (!elements.canvas) return;
  const dataUrl = elements.canvas.toDataURL("image/png");
  downloadDataUrl(dataUrl, "scrolling-preview.png");
}

function downloadVideo() {
  if (!elements.canvas) return;
  refreshPreview();
  const duration = Number(elements.videoDuration.value) || 5;
  const format = elements.videoFormat.value || "webm";
  if (format !== "webm") {
    alert("MPG and AVI exports are not supported in-browser. Exporting WebM instead.");
  }
  const stream = elements.canvas.captureStream(30);
  const recorder = new MediaRecorder(stream, { mimeType: "video/webm" });
  const chunks = [];
  const startedAt = performance.now();
  elements.videoProgress.value = 0;

  recorder.ondataavailable = (event) => {
    if (event.data.size > 0) chunks.push(event.data);
  };

  recorder.onstop = () => {
    const blob = new Blob(chunks, { type: "video/webm" });
    const url = URL.createObjectURL(blob);
    downloadDataUrl(url, buildFilename(format === "webm" ? "webm" : format));
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    elements.videoProgress.value = 100;
  };

  requestAnimationFrame(() => {
    scrollPosition = 0;
    lastTime = performance.now();
    recorder.start();
  });
  const timer = setInterval(() => {
    const elapsed = (performance.now() - startedAt) / 1000;
    const progress = Math.min(100, Math.round((elapsed / duration) * 100));
    elements.videoProgress.value = progress;
    if (progress >= 100) clearInterval(timer);
  }, 200);
  setTimeout(() => recorder.stop(), Math.max(1000, duration * 1000));
}

function bindEvents() {
  if (elements.templateSelect) {
    elements.templateSelect.addEventListener("change", updateTemplateInputs);
  }
  if (elements.widthInput) {
    elements.widthInput.addEventListener("input", resizeCanvas);
  }
  if (elements.heightInput) {
    elements.heightInput.addEventListener("input", resizeCanvas);
  }
  if (elements.addTemplate) {
    elements.addTemplate.addEventListener("click", addCustomTemplate);
  }
  if (elements.generateQr) {
    elements.generateQr.addEventListener("click", generateQr);
  }
  if (elements.downloadQrPng) {
    elements.downloadQrPng.addEventListener("click", () => {
      const composite = buildQrCompositePng();
      if (composite) {
        downloadDataUrl(composite, "qr-code.png");
      } else if (qrImage) {
        downloadDataUrl(qrImage.src, "qr-code.png");
      }
    });
  }
  if (elements.downloadQrSvg) {
    elements.downloadQrSvg.addEventListener("click", () => {
      if (qrSvg) downloadSvg(qrSvg, "qr-code.svg");
    });
  }
  if (elements.exportFrame) {
    elements.exportFrame.addEventListener("click", exportPreviewFrame);
  }
  if (elements.refreshPreview) {
    elements.refreshPreview.addEventListener("click", refreshPreview);
  }
  if (elements.downloadVideo) {
    elements.downloadVideo.addEventListener("click", downloadVideo);
  }

  if (elements.captionAddProfile) {
    elements.captionAddProfile.addEventListener("click", addCaptionProfile);
  }
  if (elements.captionSaveTemplate) {
    elements.captionSaveTemplate.addEventListener("click", addCaptionTemplate);
  }
  if (elements.captionTemplateSelect) {
    elements.captionTemplateSelect.addEventListener("change", applyCaptionTemplate);
  }
  if (elements.captionGenerate) {
    elements.captionGenerate.addEventListener("click", updateCaptionPreview);
  }
  if (elements.captionCopy) {
    elements.captionCopy.addEventListener("click", copyCaption);
  }
  if (elements.captionCustomCopy) {
    elements.captionCustomCopy.addEventListener("click", copyCustomText);
  }
  if (elements.captionCustomPaste) {
    elements.captionCustomPaste.addEventListener("click", pasteToCustomText);
  }
  if (elements.captionOutputCopy) {
    elements.captionOutputCopy.addEventListener("click", copyGeneratedCaption);
  }
  if (elements.captionOutputPaste) {
    elements.captionOutputPaste.addEventListener("click", pasteOutputToCustom);
  }
  if (elements.captionSavePost) {
    elements.captionSavePost.addEventListener("click", saveCaptionPost);
  }
  if (elements.captionDate) {
    elements.captionDate.addEventListener("change", () => {
      updateDayFromDate();
      updateCaptionPreview();
    });
  }
  if (elements.captionCustomText) {
    elements.captionCustomText.addEventListener("input", updateCaptionPreview);
  }
  if (elements.captionTemplateBody) {
    elements.captionTemplateBody.addEventListener("input", updateCaptionPreview);
  }
  if (elements.captionHashtags) {
    elements.captionHashtags.addEventListener("input", updateCaptionPreview);
  }
  if (elements.captionScrollToggle) {
    elements.captionScrollToggle.addEventListener("change", updateCaptionPreview);
  }
  if (elements.captionScrollText) {
    elements.captionScrollText.addEventListener("input", updateCaptionPreview);
  }
  if (elements.qrStyle) {
    elements.qrStyle.addEventListener("change", generateQr);
  }
  if (elements.qrLabel) {
    elements.qrLabel.addEventListener("input", refreshPreview);
  }
  if (elements.qrLabelSize) {
    elements.qrLabelSize.addEventListener("input", refreshPreview);
  }
  if (elements.qrLabelColor) {
    elements.qrLabelColor.addEventListener("input", refreshPreview);
  }
  if (elements.qrSize) {
    elements.qrSize.addEventListener("input", refreshPreview);
  }
  if (elements.qrX) {
    elements.qrX.addEventListener("input", refreshPreview);
  }
  if (elements.qrY) {
    elements.qrY.addEventListener("input", refreshPreview);
  }
  if (elements.bgMode) {
    elements.bgMode.addEventListener("change", updateBackgroundModeUI);
  }
  if (elements.bgColor) {
    elements.bgColor.addEventListener("input", refreshPreview);
  }
  if (elements.bgImageInput) {
    elements.bgImageInput.addEventListener("change", (event) => {
      const file = event.target.files?.[0];
      if (file) loadBackgroundImage(file);
    });
  }

  if (elements.textEditor) {
    elements.textEditor.addEventListener("input", () => {
      needsFit = true;
      updateAutoDuration();
    });
  }
  if (elements.textInput) {
    elements.textInput.addEventListener("input", () => {
      needsFit = true;
      updateAutoDuration();
    });
  }

  const autoDurationInputs = [
    elements.textEditor,
    elements.textInput,
    elements.autoParagraph,
    elements.textAlign,
    elements.fontSelect,
    elements.customFont,
    elements.fontSize,
    elements.fontWeight,
    elements.fontStyle,
    elements.lineSpacing,
    elements.offsetX,
    elements.offsetY,
    elements.directionSelect,
    elements.speed,
    elements.widthInput,
    elements.heightInput,
  ].filter(Boolean);

  autoDurationInputs.forEach((input) => {
    input.addEventListener("input", () => {
      needsFit = true;
      updateAutoDuration();
    });
    input.addEventListener("change", () => {
      needsFit = true;
      updateAutoDuration();
    });
  });
  if (elements.editorToolbar) {
    elements.editorToolbar.addEventListener("click", (event) => {
      const button = event.target.closest("button");
      if (!button) return;
      const cmd = button.dataset.cmd;
      const emoji = button.dataset.emoji;
      const action = button.dataset.action;
      if (cmd) {
        document.execCommand(cmd, false, null);
        elements.textEditor?.focus();
      }
      if (emoji) {
        document.execCommand("insertText", false, emoji);
        elements.textEditor?.focus();
      }
      if (action === "copy") {
        const text = elements.textEditor?.innerText || "";
        if (text) {
          navigator.clipboard?.writeText(text);
        }
      }
      if (action === "paste") {
        if (!navigator.clipboard?.readText) return;
        navigator.clipboard.readText().then((clipText) => {
          if (!clipText) return;
          document.execCommand("insertText", false, clipText);
          elements.textEditor?.focus();
        });
      }
    });
  }
  bindContentCopyButtons();

  if (elements.wizardSteps.length) {
    elements.wizardSteps.forEach((item) => {
      item.addEventListener("click", () => {
        setWizardStep(Number(item.dataset.step));
      });
    });
  }
  if (elements.wizardPrev) {
    elements.wizardPrev.addEventListener("click", () => {
      setWizardStep(wizardCurrentStep - 1);
    });
  }
  if (elements.wizardNext) {
    elements.wizardNext.addEventListener("click", () => {
      const total = elements.wizardSteps.length || 1;
      if (wizardCurrentStep >= total) {
        setWizardStep(1);
      } else {
        setWizardStep(wizardCurrentStep + 1);
      }
    });
  }

  if (elements.expScheduleDate) {
    elements.expScheduleDate.addEventListener("change", updateBestTimeOptions);
  }
  if (elements.expScoreHook) {
    elements.expScoreHook.addEventListener("click", updateHookScore);
  }
  if (elements.expHookText) {
    elements.expHookText.addEventListener("input", () => {
      if (elements.expHookScore?.textContent) updateHookScore();
    });
  }
  if (elements.expApplyBestTime) {
    elements.expApplyBestTime.addEventListener("click", applyBestTime);
  }

  if (elements.carousel && elements.carouselPrev && elements.carouselNext) {
    elements.carouselPrev.addEventListener("click", () => {
      elements.carousel.scrollBy({ left: -320, behavior: "smooth" });
    });
    elements.carouselNext.addEventListener("click", () => {
      elements.carousel.scrollBy({ left: 320, behavior: "smooth" });
    });
  }

  if (elements.igCopyLink) {
    elements.igCopyLink.addEventListener("click", () => {
      const url = elements.igReelUrl?.value.trim();
      if (!url) return;
      navigator.clipboard.writeText(url);
      if (elements.igDownloadStatus) {
        elements.igDownloadStatus.textContent = "Link copied. Use official IG APIs for downloads.";
      }
    });
  }
  if (elements.igDownload) {
    elements.igDownload.addEventListener("click", () => {
      if (elements.igDownloadStatus) {
        elements.igDownloadStatus.textContent = "Direct downloads require official Instagram APIs or creator-provided downloads.";
      }
    });
  }
  if (elements.ytCopyLink) {
    elements.ytCopyLink.addEventListener("click", () => {
      const url = elements.ytUrl?.value.trim();
      if (!url) return;
      navigator.clipboard.writeText(url);
      if (elements.ytDownloadStatus) {
        elements.ytDownloadStatus.textContent = "Link copied. Use YouTube APIs or authorized downloads.";
      }
    });
  }
  if (elements.ytDownload) {
    elements.ytDownload.addEventListener("click", () => {
      if (elements.ytDownloadStatus) {
        elements.ytDownloadStatus.textContent = "Direct downloads require official YouTube APIs or creator-enabled downloads.";
      }
    });
  }
}

if (elements.templateSelect) {
  populateTemplates();
  updateTemplateInputs();
}
updateBackgroundModeUI();
populateCaptionProfiles();
populateCaptionTemplates();
updateCaptionPreview();
bindEvents();
if (elements.canvas) {
  requestAnimationFrame(animate);
}
setWizardStep(1);
updateBestTimeOptions();
