# Scrolling Video Generator

## Prompt: Platform-Specific Scrolling Text Video Configuration

### Goal
Create a web-based tool that lets users generate scrolling-text videos with overlays, optimized for platform-specific screen templates (Instagram, YouTube, Shorts, TikTok, and custom sizes).

### Key Features (Include Screen Templates)

#### 1) User Input: Scrolling Text Video
- **Text attributes**
	- Text content
	- Font style (choose from predefined fonts)
	- Font size
	- Text color
	- Offset (margin/padding for text position)
	- Scrolling direction (left-to-right, right-to-left, top-to-bottom, bottom-to-top)
- **Scrolling speed**
	- Slider or dropdown to control how fast the text scrolls
- **Video settings**
	- **Screen templates** (predefined aspect ratios and sizes):
		- **Instagram**
			- Post: 1:1 – 1080x1080
			- Story/Reel: 9:16 – 1080x1920
		- **YouTube**
			- Standard: 16:9 – 1920x1080
			- Shorts: 9:16 – 1080x1920
		- **TikTok**
			- Fullscreen: 9:16 – 1080x1920
		- **Custom**
			- User-defined width and height
	- Background color (including transparency)
	- Number of lines or text spacing based on template dimensions

#### 2) QR Code Generation
- Input field for a URL to generate a QR code
- QR codes can be:
	- Placed as overlays in the scrolling video (adjustable size/position)
	- Downloaded as standalone images (`PNG`, `SVG`)
- Placement preview updates in real time based on the chosen template

#### 3) Real-Time Preview Window
- Live interactive preview that responds to:
	- Selected screen template
	- Scrolling text direction/speed/style
	- Background color
	- Overlays (QR codes, logos)
- Seamless switching between aspect ratios (1:1, 16:9, 9:16)

#### 4) Video Generation
- Export videos in `MP4` and `WEBM`
- Outputs respect:
	- Template aspect ratio and dimensions
	- Text scrolling configuration
	- Overlay placement and transparency

---

### Workflow With Screen Templates
1. **Homepage**
	 - Inputs for text, fonts, speed, and direction
	 - Template dropdown (Instagram, YouTube, Shorts, TikTok, Custom)
	 - Uploads for logos/background overlays
	 - QR code generator
2. **Preview Window**
	 - Renders scrolling text and overlays to match selected aspect ratio
	 - Live scaling to show fit and cut-off risk
	 - Quick toggles for Square, Vertical, Widescreen
3. **Generate**
	 - Client-side rendering using Canvas API or FFmpeg.js
	 - Download video and QR assets
4. **Validation**
	 - Guardrails to prevent text cropping
	 - Warnings for oversized fonts or offsets

---

### Technology Notes (Template Switching)
- **Preview rendering:** Canvas API for dynamic scaling
- **Aspect ratio simulation:** CSS + responsive layout to reflect templates
- **Rendering/export:** FFmpeg.js or canvas frame export
- **Cross-browser support:** Chrome, Firefox, Safari, Edge

---

### Benefits
- Preset templates simplify optimal exports for each platform
- Real-time preview builds confidence before download
- Custom dimensions ensure flexibility for uncommon formats

---

## Quick Start (PHP)
1. Start a local server:
	- `php -S localhost:8000`
2. Open `http://localhost:8000/index.php`