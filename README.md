# QR Craft — QR Code Generator & Designer Studio

> **Google Developer Groups on Campus SRM — Technical Domain Recruitments**  
> **Domain**: Frontend  
> **Task 1**: QR Code Generator & Designer  
> **Author**: Candidate Submission  
> **Official Query Contact**: `technical@gdgsrm.com`  

---

## 🚀 Live Demo & Deployment

- **Deployment Platform**: Ready for 1-click deployment on **Vercel** or **Netlify**
- **Vercel Deployment**: Push to GitHub and import repository in Vercel (`Build Command: npm run build`, `Output Directory: dist`)
- **Netlify Deployment**: Connect repository in Netlify with standard Vite presets (`npm run build`, `dist`)

---

## 🌟 Overview & Architecture

**QR Craft** is a high-performance, client-side web application built with **React 19**, **TypeScript**, and **Tailwind CSS v4**. It allows users to generate, deeply customize, mathematically verify, and export scannable QR codes for diverse payload types entirely inside the browser — requiring zero backend servers.

### Key Highlights
- ⚡ **100% Client-Side**: Operates entirely in the browser without any backend dependencies or data tracking.
- 📐 **Real-time Live Preview**: Changes to content, shapes, gradients, margins, or logos update immediately on the canvas.
- 🛡️ **Scan Reliability & WCAG Contrast Engine**: Computes relative luminance and contrast ratios conforming to WCAG 2.1 specifications, warns about unreadable inverted colors or low error correction, and provides 1-click auto-fix actions.
- 🔍 **Real-time Decoder Verification (`jsQR`)**: Runs a mathematical decoding pass directly on the rendered canvas to verify scannability before download.
- 💾 **Local Persistence**: Saves recently generated QR codes in `localStorage` with full state restoration across page reloads.

---

## 📋 Task Checklist & Feature Mapping

| Task | Description | Implementation Status |
| :--- | :--- | :---: |
| **Task 1: QR Code Generation** | Enter URL or text, real-time live preview generation | ✅ Complete |
| **Task 2: Different QR Types** | URL, Plain Text, Email (`mailto:`), Phone (`tel:`), Wi-Fi (`WIFI:T:..`), SMS, vCard 3.0 | ✅ Complete |
| **Task 3: QR Customization** | Size slider, foreground/background colors, error correction (L, M, Q, H), quiet zone margin | ✅ Complete |
| **Task 4: Presets** | 8 curated visual themes (Classic, Cyberpunk, Emerald Matrix, Sunset Glow, etc.) with full post-edit capability | ✅ Complete |
| **Task 5: Download** | Download as PNG, SVG, JPEG, and WebP at 1x (500px), 2x (1000px HD), and 4x (2000px Ultra Print) matching preview | ✅ Complete |
| **Task 6: Validation** | Live form validation with clear field errors (URL regex, email syntax, phone format, Wi-Fi password length) | ✅ Complete |
| **Task 7: Scan Reliability** | Scannability diagnostics, WCAG contrast score, inverted color alerts, logo error correction warnings, 1-click Auto-Fix | ✅ Complete |
| **Task 8: Recent QR Codes** | Persistent local storage history, timestamped list, 1-click restore to editor, quick copy, item deletion, clear all | ✅ Complete |
| **Task 9: Responsive Design** | Clean dual-column desktop studio & mobile-friendly stacked layout with sticky preview | ✅ Complete |
| **Task 10: Testing** | Comprehensive Vitest test suite (24 automated tests covering payloads, validation, contrast, and storage) | ✅ Complete |

### 💎 Optional Enhancements Implemented
- [x] **SVG vector download** (infinite resolution scalability)
- [x] **Logo & Icon embedding** (preset popular icons + custom image upload with size & margin controls)
- [x] **Gradient QR codes** (linear and radial gradients with customizable angle and color stops)
- [x] **Direct clipboard export** (copies PNG image directly to system clipboard via the Clipboard API)
- [x] **Custom QR matrix & corner patterns** (6 dot styles, 3 eye frame shapes, 2 eye dot styles, custom accent colors)
- [x] **Dark / Light theme toggle** (persistent across browser sessions with smooth transitions)

---

## 🛠️ Technology Stack

- **Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite 8](https://vite.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **QR Engine**: [qr-code-styling](https://www.npmjs.com/package/qr-code-styling)
- **In-Browser Decoder**: [jsQR](https://github.com/cozmo/jsQR)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Micro-Delight**: [canvas-confetti](https://www.npmjs.com/package/canvas-confetti)
- **Test Framework**: [Vitest](https://vitest.dev/) + [JSDOM](https://github.com/jsdom/jsdom)

---

## 💻 Local Setup & Development

### Prerequisites
- Node.js (v18 or higher recommended; developed on Node v24)
- npm (v9+ or higher)

### Installation
```bash
# Clone the repository
git clone <your-repo-url>
cd qr-code-designer

# Install dependencies
npm install

# Start local development server
npm run dev
```
Open your browser at `http://localhost:5173` to explore the application.

### Running Automated Tests
```bash
# Run unit and integration tests
npm run test
```

### Production Build
```bash
# Build optimized production bundle
npm run build

# Preview production build locally
npm run preview
```

---

## 🧪 Testing Coverage (Task 10)

The project includes 24 automated unit and integration tests under `src/__tests__/`:
1. **`qrPayload.test.ts` (14 tests)**:
   - URL auto-prefixing with `https://`
   - Email `mailto:` syntax and URI encoding for subject and body
   - Telephone `tel:` URI formatting
   - Wi-Fi standard syntax (`WIFI:T:...;S:...;P:...;H:...;;`) and escaping (`\`, `;`, `:`, `"`)
   - SMS URI generation
   - vCard 3.0 business card structure
   - Input validation routines (invalid URLs, malformed emails, Wi-Fi password constraints)
2. **`contrast.test.ts` (5 tests)**:
   - Hex to RGB parsing (3-digit and 6-digit)
   - WCAG 2.1 relative luminance algorithm
   - Maximum (21:1) and minimum (1:1) contrast ratio calculations
   - Inverted color warning detection
   - Low error correction warning with logos
3. **`storage.test.ts` (5 tests)**:
   - Initial empty state handling
   - Save and retrieve operations
   - Item deletion and history clearing
   - Theme mode persistence (`light` / `dark` / `system`)

---

## 📸 Screenshots

> Add screenshots of your application in this folder or embed them below:

| Light Studio Mode | Dark Theme Mode |
| :---: | :---: |
| *(Add `screenshots/light-mode.png`)* | *(Add `screenshots/dark-mode.png`)* |

| Customization & Gradients | Scannability Diagnostics & Verification |
| :---: | :---: |
| *(Add `screenshots/customization.png`)* | *(Add `screenshots/scannability.png`)* |

---

## 📄 License & Integrity Statement

This project was built from scratch for the **Google Developer Groups on Campus SRM Technical Domain Recruitment 2026**.  
Original code, client-side architecture, and documentation. No external copyrighted templates were plagiarized.
