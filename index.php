<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Scrolling Video Generator</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Roboto:wght@400;700&family=Montserrat:wght@400;600&family=Oswald:wght@400;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="assets/styles.css" />
</head>
<body>
  <header class="topbar">
    <div class="brand">
      <div class="logo">SV</div>
      <div>
        <h1>Scrolling Video Generator</h1>
        <p>Platform-ready templates with live preview</p>
      </div>
    </div>
    <button id="exportFrame" class="secondary">Export Preview PNG</button>
  </header>

  <main class="layout">
    <section class="panel">
      <h2>Template</h2>
      <label class="field">
        <span>Screen template</span>
        <select id="templateSelect"></select>
      </label>
      <div class="row">
        <label class="field">
          <span>Width (px)</span>
          <input type="number" id="widthInput" min="100" max="4000" />
        </label>
        <label class="field">
          <span>Height (px)</span>
          <input type="number" id="heightInput" min="100" max="4000" />
        </label>
      </div>
      <label class="field">
        <span>Background color</span>
        <input type="color" id="bgColor" value="#0b0f1a" />
      </label>
      <label class="field checkbox">
        <input type="checkbox" id="transparentBg" />
        <span>Transparent background</span>
      </label>

      <h2>Scrolling Text</h2>
      <label class="field">
        <span>Text content</span>
        <textarea id="textInput" rows="4">Your scrolling text goes here</textarea>
      </label>
      <div class="row">
        <label class="field">
          <span>Font</span>
          <select id="fontSelect">
            <option value="Inter">Inter</option>
            <option value="Roboto">Roboto</option>
            <option value="Montserrat">Montserrat</option>
            <option value="Oswald">Oswald</option>
            <option value="Arial">Arial</option>
            <option value="Helvetica">Helvetica</option>
          </select>
        </label>
        <label class="field">
          <span>Font size</span>
          <input type="number" id="fontSize" min="12" max="200" value="64" />
        </label>
      </div>
      <div class="row">
        <label class="field">
          <span>Text color</span>
          <input type="color" id="textColor" value="#ffffff" />
        </label>
        <label class="field">
          <span>Line spacing</span>
          <input type="number" id="lineSpacing" min="1" max="200" value="12" />
        </label>
      </div>
      <div class="row">
        <label class="field">
          <span>Offset X</span>
          <input type="number" id="offsetX" value="0" />
        </label>
        <label class="field">
          <span>Offset Y</span>
          <input type="number" id="offsetY" value="0" />
        </label>
      </div>
      <label class="field">
        <span>Direction</span>
        <select id="directionSelect">
          <option value="ltr">Left to right</option>
          <option value="rtl" selected>Right to left</option>
          <option value="ttb">Top to bottom</option>
          <option value="btt">Bottom to top</option>
        </select>
      </label>
      <label class="field">
        <span>Speed (px/sec)</span>
        <input type="range" id="speed" min="20" max="400" value="120" />
      </label>
      <div id="warning" class="warning" hidden>Text may be clipped in the current template.</div>

      <h2>QR Code</h2>
      <label class="field">
        <span>URL</span>
        <input type="url" id="qrUrl" placeholder="https://example.com" />
      </label>
      <div class="row">
        <label class="field">
          <span>QR size (px)</span>
          <input type="number" id="qrSize" min="60" max="600" value="160" />
        </label>
        <label class="field">
          <span>QR X</span>
          <input type="number" id="qrX" value="40" />
        </label>
        <label class="field">
          <span>QR Y</span>
          <input type="number" id="qrY" value="40" />
        </label>
      </div>
      <div class="row">
        <button id="generateQr">Generate QR</button>
        <button id="downloadQrPng" class="secondary">Download PNG</button>
        <button id="downloadQrSvg" class="secondary">Download SVG</button>
      </div>
    </section>

    <section class="preview">
      <div class="preview-header">
        <h2>Live Preview</h2>
        <div class="template-meta" id="templateMeta"></div>
      </div>
      <div class="canvas-wrap">
        <canvas id="previewCanvas"></canvas>
      </div>
      <div class="note">
        Preview scales to fit this panel. Export uses the full template resolution.
      </div>
    </section>
  </main>

  <script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js"></script>
  <script src="assets/app.js"></script>
</body>
</html>
