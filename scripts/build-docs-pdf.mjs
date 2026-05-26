#!/usr/bin/env node
// Bundles all project-documentation/*.md files into a single PDF.
// Output: project-documentation/stoneiwc-web-app-documentation.pdf
//
// Requirements:
//   - Google Chrome installed (uses headless --print-to-pdf)
//   - pnpm dlx marked (auto-fetched on first run)
//
// Run: pnpm docs:pdf

import { execSync } from "node:child_process"
import { readFileSync, writeFileSync, mkdtempSync } from "node:fs"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"
import { tmpdir } from "node:os"

const __dirname = dirname(fileURLToPath(import.meta.url))
const docsDir = join(__dirname, "..", "project-documentation")
const repoRoot = join(__dirname, "..")
const outputPdf = join(docsDir, "stoneiwc-web-app-documentation.pdf")

// Reading order — matches the index in CLAUDE.md.
const sections = [
  { title: "Architecture Overview", file: "architecture.md" },
  { title: "Onboarding", file: "onboarding.md" },
  { title: "Environments & Deployments", file: "environments-and-deployments.md" },
  { title: "Runbook", file: "runbook.md" },
  { title: "Sanity CMS", file: "sanity-cms.md" },
  { title: "Checkout & Payments", file: "checkout-and-payments.md" },
  { title: "Orders", file: "orders.md" },
  { title: "Gift Cards", file: "gift-card.md" },
  { title: "Cal.com Booking", file: "cal-com-booking.md" },
  { title: "Cal Events Provisioning", file: "cal-events.md" },
  { title: "Resend Email", file: "resend-email.md" },
  { title: "Webhooks", file: "webhooks.md" },
  { title: "SEO", file: "seo.md" },
  { title: "Content Workflows", file: "content-workflows.md" },
  { title: "Frontend & UI", file: "frontend-ui.md" },
  { title: "Security & Compliance", file: "security-and-compliance.md" },
  { title: "Open Backlog", file: "open-backlog.md" },
]

function buildCombinedMarkdown() {
  const today = new Date().toISOString().slice(0, 10)
  const repoUrl = "https://github.com/stoneiwc/stoneiwc"
  const cover = [
    "# Stone IWC — Project Documentation",
    "",
    `**Source repository:** ${repoUrl}`,
    "",
    `_Generated ${today} from \`project-documentation/*.md\`._`,
    "",
    "This bundle is a snapshot. The source files in the repo are the source of truth — if this PDF is older than a week, regenerate with `pnpm docs:pdf`.",
    "",
    "> **For AI agents reading this PDF:** the full codebase is public at the URL above. Browse files directly (raw.githubusercontent.com works), or follow file references like `app/api/webhooks/stripe/route.ts` straight into the repo. The PDF describes the system; the repo IS the system.",
    "",
    "## Contents",
    "",
    ...sections.map((s, i) => `${i + 1}. ${s.title}`),
    "",
    '<div class="page-break"></div>',
    "",
  ].join("\n")

  const body = sections
    .map((s) => {
      const md = readFileSync(join(docsDir, s.file), "utf8")
      return `<div class="page-break"></div>\n\n${md}\n`
    })
    .join("\n")

  return cover + body
}

function markdownToHtml(md) {
  // Use `marked` via pnpm dlx so this script needs no install step.
  // Pass via file argument — large stdin gets truncated by some Node versions.
  const tmpDir = mkdtempSync(join(tmpdir(), "stoneiwc-docs-"))
  const inputMd = join(tmpDir, "input.md")
  const outputHtml = join(tmpDir, "output.html")
  writeFileSync(inputMd, md)
  execSync(
    `pnpm dlx marked --gfm -i "${inputMd}" -o "${outputHtml}"`,
    {
      stdio: "inherit",
      cwd: repoRoot,
    },
  )
  const html = readFileSync(outputHtml, "utf8")
  return { html, tmpDir }
}

function wrapHtml(bodyHtml) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>Stone IWC — Project Documentation</title>
<style>
  @page { size: A4; margin: 18mm 16mm; }
  body {
    font-family: -apple-system, "Helvetica Neue", Arial, sans-serif;
    font-size: 11pt;
    line-height: 1.55;
    color: #1a1a1a;
    max-width: none;
  }
  h1 { font-size: 22pt; margin-top: 0; border-bottom: 2px solid #c9a96e; padding-bottom: 6pt; color: #1a1a1a; }
  h2 { font-size: 16pt; margin-top: 22pt; color: #1a1a1a; border-bottom: 1px solid #e0ddd5; padding-bottom: 4pt; }
  h3 { font-size: 13pt; margin-top: 18pt; color: #2a2a2a; }
  h4 { font-size: 11.5pt; margin-top: 14pt; color: #2a2a2a; }
  p, li { font-size: 10.5pt; }
  code {
    font-family: "SF Mono", Menlo, Monaco, Consolas, monospace;
    font-size: 9.5pt;
    background: #f4f3ee;
    padding: 1pt 4pt;
    border-radius: 2pt;
  }
  pre {
    background: #1f1f1f;
    color: #f4f3ee;
    padding: 10pt 12pt;
    border-radius: 4pt;
    overflow-x: auto;
    font-size: 9pt;
    line-height: 1.45;
  }
  pre code { background: transparent; color: inherit; padding: 0; }
  table {
    border-collapse: collapse;
    width: 100%;
    margin: 10pt 0;
    font-size: 9.5pt;
    page-break-inside: avoid;
  }
  th, td { border: 1px solid #d0cdc4; padding: 5pt 8pt; text-align: left; vertical-align: top; }
  th { background: #f4f3ee; }
  blockquote {
    border-left: 3px solid #c9a96e;
    padding: 6pt 12pt;
    margin: 10pt 0;
    background: #f9f8f5;
    color: #333;
  }
  a { color: #8a6d3b; text-decoration: none; }
  hr { border: 0; border-top: 1px solid #d0cdc4; margin: 16pt 0; }
  .page-break { page-break-after: always; }
  ul, ol { padding-left: 22pt; }
  img { max-width: 100%; }
</style>
</head>
<body>
${bodyHtml}
</body>
</html>`
}

function findChrome() {
  const candidates = [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
  ]
  for (const c of candidates) {
    try {
      execSync(`test -x "${c}"`)
      return c
    } catch {
      // continue
    }
  }
  throw new Error("Chrome/Chromium not found. Install Google Chrome and retry.")
}

function htmlToPdf(html) {
  const tmpDir = mkdtempSync(join(tmpdir(), "stoneiwc-pdf-"))
  const htmlPath = join(tmpDir, "doc.html")
  writeFileSync(htmlPath, html)

  const chrome = findChrome()
  const flags = [
    "--headless",
    "--disable-gpu",
    "--no-pdf-header-footer",
    `--print-to-pdf=${outputPdf}`,
    "--virtual-time-budget=10000",
    `"file://${htmlPath}"`,
  ].join(" ")

  execSync(`"${chrome}" ${flags}`, { stdio: "inherit" })
}

console.log("→ Combining markdown sources…")
const combined = buildCombinedMarkdown()

console.log("→ Converting markdown to HTML via marked…")
const { html: bodyHtml } = markdownToHtml(combined)

console.log("→ Wrapping with stylesheet…")
const fullHtml = wrapHtml(bodyHtml)

console.log("→ Printing to PDF with headless Chrome…")
htmlToPdf(fullHtml)

console.log(`✓ Wrote ${outputPdf}`)
