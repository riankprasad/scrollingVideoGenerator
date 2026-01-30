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

const elements = {
  templateSelect: document.getElementById("templateSelect"),
  widthInput: document.getElementById("widthInput"),
  heightInput: document.getElementById("heightInput"),
  bgColor: document.getElementById("bgColor"),
  transparentBg: document.getElementById("transparentBg"),
  textInput: document.getElementById("textInput"),
  fontSelect: document.getElementById("fontSelect"),
  fontSize: document.getElementById("fontSize"),
  textColor: document.getElementById("textColor"),
  lineSpacing: document.getElementById("lineSpacing"),
  offsetX: document.getElementById("offsetX"),
  offsetY: document.getElementById("offsetY"),
  directionSelect: document.getElementById("directionSelect"),
  speed: document.getElementById("speed"),
  warning: document.getElementById("warning"),
  qrUrl: document.getElementById("qrUrl"),
  qrSize: document.getElementById("qrSize"),
  qrX: document.getElementById("qrX"),
  qrY: document.getElementById("qrY"),
  generateQr: document.getElementById("generateQr"),
  downloadQrPng: document.getElementById("downloadQrPng"),
  downloadQrSvg: document.getElementById("downloadQrSvg"),
  exportFrame: document.getElementById("exportFrame"),
  templateMeta: document.getElementById("templateMeta"),
  canvas: document.getElementById("previewCanvas"),
};

const ctx = elements.canvas.getContext("2d");
let qrImage = null;
let qrSvg = "";
let lastTime = performance.now();
let scrollPosition = 0;

function populateTemplates() {
  templates.forEach((template) => {
    const option = document.createElement("option");
    option.value = template.id;
    option.textContent = template.label;
    elements.templateSelect.appendChild(option);
  });
  elements.templateSelect.value = templates[0].id;
}

function getCurrentTemplate() {
  return (
    templates.find((template) => template.id === elements.templateSelect.value) ||
    templates[0]
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

function resizeCanvas() {
  const width = Number(elements.widthInput.value) || 1080;
  const height = Number(elements.heightInput.value) || 1080;
  elements.canvas.width = width;
  elements.canvas.height = height;
  scrollPosition = 0;
}

function buildFont() {
  const size = Number(elements.fontSize.value) || 64;
  const font = elements.fontSelect.value || "Inter";
  return `${size}px ${font}`;
}

function drawBackground() {
  if (elements.transparentBg.checked) {
    ctx.clearRect(0, 0, elements.canvas.width, elements.canvas.height);
    return;
  }
  ctx.fillStyle = elements.bgColor.value;
  ctx.fillRect(0, 0, elements.canvas.width, elements.canvas.height);
}

function getLines() {
  return elements.textInput.value.split("\n");
}

function updateWarning(textMetrics) {
  const lines = getLines();
  const lineHeight = Number(elements.fontSize.value) + Number(elements.lineSpacing.value);
  const textHeight = lines.length * lineHeight;
  const widthLimit = elements.canvas.width - 10;
  const heightLimit = elements.canvas.height - 10;
  const tooWide = textMetrics.width > widthLimit;
  const tooTall = textHeight > heightLimit;
  elements.warning.hidden = !(tooWide || tooTall);
}

function drawText(delta) {
  const direction = elements.directionSelect.value;
  const speed = Number(elements.speed.value) || 100;
  const offsetX = Number(elements.offsetX.value) || 0;
  const offsetY = Number(elements.offsetY.value) || 0;

  ctx.font = buildFont();
  ctx.fillStyle = elements.textColor.value;
  ctx.textBaseline = "top";

  const lines = getLines();
  const lineHeight = Number(elements.fontSize.value) + Number(elements.lineSpacing.value);
  const metrics = ctx.measureText(lines[0] || "");
  updateWarning(metrics);

  if (direction === "rtl" || direction === "ltr") {
    const textWidth = metrics.width;
    const startX = direction === "rtl" ? elements.canvas.width + textWidth : -textWidth;
    const endX = direction === "rtl" ? -textWidth : elements.canvas.width + textWidth;
    const distance = endX - startX;
    scrollPosition += (speed * delta * (direction === "rtl" ? -1 : 1));
    let x = startX + scrollPosition;
    if ((direction === "rtl" && x < endX) || (direction === "ltr" && x > endX)) {
      scrollPosition = 0;
      x = startX;
    }
    lines.forEach((line, index) => {
      ctx.fillText(line, x + offsetX, offsetY + index * lineHeight);
    });
  } else {
    const textHeight = lines.length * lineHeight;
    const startY = direction === "btt" ? elements.canvas.height + textHeight : -textHeight;
    const endY = direction === "btt" ? -textHeight : elements.canvas.height + textHeight;
    scrollPosition += (speed * delta * (direction === "btt" ? -1 : 1));
    let y = startY + scrollPosition;
    if ((direction === "btt" && y < endY) || (direction === "ttb" && y > endY)) {
      scrollPosition = 0;
      y = startY;
    }
    lines.forEach((line, index) => {
      ctx.fillText(line, offsetX, y + offsetY + index * lineHeight);
    });
  }
}

function drawQr() {
  if (!qrImage) return;
  const size = Number(elements.qrSize.value) || 160;
  const x = Number(elements.qrX.value) || 0;
  const y = Number(elements.qrY.value) || 0;
  ctx.drawImage(qrImage, x, y, size, size);
}

function animate(now) {
  const deltaSeconds = (now - lastTime) / 1000;
  lastTime = now;
  drawBackground();
  drawText(deltaSeconds);
  drawQr();
  requestAnimationFrame(animate);
}

function generateQr() {
  const url = elements.qrUrl.value.trim();
  if (!url) return;
  QRCode.toDataURL(url, { width: 512, margin: 1 }, (err, dataUrl) => {
    if (err) return;
    const img = new Image();
    img.onload = () => {
      qrImage = img;
    };
    img.src = dataUrl;
  });

  QRCode.toString(url, { type: "svg", margin: 1 }, (err, svg) => {
    if (err) return;
    qrSvg = svg;
  });
}

function downloadDataUrl(dataUrl, filename) {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

function downloadSvg(svg, filename) {
  const blob = new Blob([svg], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  downloadDataUrl(url, filename);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

function exportPreviewFrame() {
  const dataUrl = elements.canvas.toDataURL("image/png");
  downloadDataUrl(dataUrl, "scrolling-preview.png");
}

function bindEvents() {
  elements.templateSelect.addEventListener("change", updateTemplateInputs);
  elements.widthInput.addEventListener("input", resizeCanvas);
  elements.heightInput.addEventListener("input", resizeCanvas);
  elements.generateQr.addEventListener("click", generateQr);
  elements.downloadQrPng.addEventListener("click", () => {
    if (qrImage) downloadDataUrl(qrImage.src, "qr-code.png");
  });
  elements.downloadQrSvg.addEventListener("click", () => {
    if (qrSvg) downloadSvg(qrSvg, "qr-code.svg");
  });
  elements.exportFrame.addEventListener("click", exportPreviewFrame);
}

populateTemplates();
updateTemplateInputs();
bindEvents();
requestAnimationFrame(animate);
