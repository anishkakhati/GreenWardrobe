// generate_pdf.js
// Converts GREENWARDROBE_VIVA_GUIDE.md into a beautifully styled, print-ready PDF using headless Chrome/Edge

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { marked } from 'marked';

const projectDir = 'C:\\Users\\laksh\\.gemini\\antigravity\\scratch\\greenwardrobe';
const mdPath = path.join(projectDir, 'GREENWARDROBE_VIVA_GUIDE.md');
const htmlPath = path.join(projectDir, 'viva_guide_print.html');
const pdfPath = path.join(projectDir, 'GREENWARDROBE_VIVA_GUIDE.pdf');

// Read markdown
const mdContent = fs.readFileSync(mdPath, 'utf-8');

// Parse markdown to HTML
const htmlBody = marked.parse(mdContent);

// Wrap with custom styling for executive academic PDF output
const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>GreenWardrobe - Viva & Code Guide</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');

    @page {
      size: A4;
      margin: 18mm 16mm 18mm 16mm;
      @bottom-right {
        content: counter(page);
        font-family: 'Plus Jakarta Sans', sans-serif;
        font-size: 9pt;
        color: #64748b;
      }
    }

    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 10pt;
      line-height: 1.6;
      color: #1e293b;
      background-color: #ffffff;
      margin: 0;
      padding: 0;
    }

    /* Headings */
    h1 {
      font-size: 20pt;
      font-weight: 800;
      color: #065f46;
      border-bottom: 2.5px solid #10b981;
      padding-bottom: 6px;
      margin-top: 26pt;
      margin-bottom: 12pt;
      page-break-after: avoid;
      break-after: avoid;
    }

    h1:first-of-type {
      margin-top: 0;
      font-size: 24pt;
      color: #047857;
      text-align: center;
      border-bottom: none;
      padding-bottom: 0;
    }

    h2 {
      font-size: 14pt;
      font-weight: 700;
      color: #047857;
      margin-top: 20pt;
      margin-bottom: 8pt;
      padding-bottom: 4pt;
      border-bottom: 1px solid #e2e8f0;
      page-break-after: avoid;
      break-after: avoid;
    }

    h3 {
      font-size: 12pt;
      font-weight: 700;
      color: #0f766e;
      margin-top: 14pt;
      margin-bottom: 6pt;
      page-break-after: avoid;
      break-after: avoid;
    }

    h4 {
      font-size: 10.5pt;
      font-weight: 700;
      color: #1e293b;
      margin-top: 12pt;
      margin-bottom: 4pt;
      page-break-after: avoid;
      break-after: avoid;
    }

    p {
      margin-top: 0;
      margin-bottom: 8pt;
      text-align: justify;
    }

    /* Questions & Highlights */
    h4:has(+ p) {
      background-color: #f0fdf4;
      border-left: 3.5px solid #10b981;
      padding: 5pt 8pt;
      border-radius: 3pt;
      color: #065f46;
      margin-top: 10pt;
    }

    /* Lists */
    ul, ol {
      margin-top: 0;
      margin-bottom: 8pt;
      padding-left: 18pt;
    }

    li {
      margin-bottom: 3pt;
    }

    /* Tables */
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 8pt;
      margin-bottom: 12pt;
      font-size: 9pt;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    th, td {
      border: 1px solid #cbd5e1;
      padding: 6pt 8pt;
      text-align: left;
      vertical-align: top;
    }

    th {
      background-color: #065f46;
      color: #ffffff;
      font-weight: 600;
    }

    tr:nth-child(even) td {
      background-color: #f8fafc;
    }

    /* Code blocks */
    pre {
      background-color: #0f172a;
      color: #f1f5f9;
      padding: 10pt 12pt;
      border-radius: 6pt;
      font-family: 'JetBrains Mono', Consolas, Monaco, monospace;
      font-size: 8.5pt;
      line-height: 1.45;
      overflow-x: hidden;
      white-space: pre-wrap;
      word-break: break-word;
      margin-top: 6pt;
      margin-bottom: 10pt;
      page-break-inside: avoid;
      break-inside: avoid;
      border: 1px solid #1e293b;
    }

    code {
      font-family: 'JetBrains Mono', Consolas, Monaco, monospace;
      font-size: 8.5pt;
      background-color: #f1f5f9;
      color: #0f766e;
      padding: 1pt 3pt;
      border-radius: 3pt;
    }

    pre code {
      background-color: transparent;
      color: inherit;
      padding: 0;
    }

    /* Blockquotes */
    blockquote {
      margin: 10pt 0;
      padding: 8pt 12pt;
      background-color: #f8fafc;
      border-left: 4px solid #0d9488;
      border-radius: 0 4pt 4pt 0;
      color: #334155;
      font-style: italic;
    }

    blockquote p {
      margin: 0;
    }

    /* Horizontal Rules */
    hr {
      border: none;
      border-top: 1px solid #e2e8f0;
      margin: 16pt 0;
    }

    /* Links */
    a {
      color: #059669;
      text-decoration: none;
      font-weight: 500;
    }

    /* Cover / Header Card */
    .doc-header {
      background: linear-gradient(135deg, #ecfdf5 0%, #f0fdfa 100%);
      border: 1.5px solid #a7f3d0;
      border-radius: 8pt;
      padding: 16pt;
      margin-bottom: 18pt;
      text-align: center;
    }

    .doc-meta {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 12pt;
      margin-top: 8pt;
      font-size: 8.5pt;
      color: #047857;
      font-weight: 600;
    }

    .doc-badge {
      background-color: #d1fae5;
      padding: 3pt 8pt;
      border-radius: 12pt;
      border: 1px solid #6ee7b7;
    }

    /* Print utilities */
    .page-break {
      page-break-before: always;
      break-before: always;
    }

    .avoid-break {
      page-break-inside: avoid;
      break-inside: avoid;
    }
  </style>
</head>
<body>
  <div class="doc-header">
    <div style="font-size: 9pt; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 700; color: #059669; margin-bottom: 4pt;">
      Academic Evaluation & Viva Defense Document
    </div>
    <div style="font-size: 20pt; font-weight: 800; color: #065f46; line-height: 1.2;">
      🌱 GreenWardrobe – Comprehensive Viva Guide
    </div>
    <div style="font-size: 11pt; color: #334155; margin-top: 4pt; font-weight: 500;">
      Sustainable Fashion Intelligence Web Application
    </div>
    <div class="doc-meta">
      <span class="doc-badge">Department: B.Tech CSE (AIML)</span>
      <span class="doc-badge">Role: Complete Frontend Engineering</span>
      <span class="doc-badge">Tech: React 19 + Vite + Tailwind + REST</span>
      <span class="doc-badge">Date: 2026 Academic Year</span>
    </div>
  </div>

  ${htmlBody}
</body>
</html>`;

fs.writeFileSync(htmlPath, fullHtml, 'utf-8');
console.log('HTML print template created successfully at:', htmlPath);

// Find Chrome or Edge executable
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const browserPath = fs.existsSync(chromePath) ? chromePath : edgePath;

console.log('Using browser for PDF compilation:', browserPath);

// Execute print-to-pdf command
const cmd = `"${browserPath}" --headless --disable-gpu --run-all-compositor-stages-before-draw --no-pdf-header-footer --print-to-pdf="${pdfPath}" "${htmlPath}"`;

console.log('Generating PDF...');
execSync(cmd, { stdio: 'inherit' });

if (fs.existsSync(pdfPath)) {
  const stats = fs.statSync(pdfPath);
  console.log(`\nSUCCESS! PDF generated: ${pdfPath}`);
  console.log(`File Size: ${(stats.size / 1024).toFixed(1)} KB`);
} else {
  console.error('PDF generation failed.');
}
