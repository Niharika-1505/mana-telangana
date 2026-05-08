// Run with: node generate-icons.mjs
// Requires: sharp (npm install sharp --save-dev)
import sharp from 'sharp'
import { readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PUBLIC = resolve(__dirname, 'public')

// ── helpers ────────────────────────────────────────────────────────────────

function svgIcon({ size, maskable = false, textScale = 1 }) {
  const BG = '#1a6b5a'
  const HALF = size / 2

  // For maskable icons the safe zone is 80% of the canvas (10% bleed on each side)
  const contentSize = maskable ? size * 0.78 : size
  const offsetX    = maskable ? (size - contentSize) / 2 : 0
  const offsetY    = maskable ? (size - contentSize) / 2 : 0

  // Text sizes relative to content area
  const mainSize = Math.round(contentSize * 0.40 * textScale)   // "మన"
  const subSize  = Math.round(contentSize * 0.155 * textScale)  // "తె"

  // Vertical positions within content area
  const mainY = offsetY + contentSize * 0.52
  const subY  = offsetY + contentSize * 0.81

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <style>
      @font-face {
        font-family: 'TelFallback';
        src: local('Gautami'), local('Noto Sans Telugu'), local('Telugu Text'), local('Arial');
      }
    </style>
  </defs>
  <rect width="${size}" height="${size}" fill="${BG}"/>
  <text
    x="${HALF}"
    y="${mainY}"
    font-family="Gautami, 'Noto Sans Telugu', 'Telugu Text', sans-serif"
    font-size="${mainSize}"
    font-weight="bold"
    fill="white"
    text-anchor="middle"
    dominant-baseline="auto"
    letter-spacing="2">మన</text>
  <text
    x="${HALF}"
    y="${subY}"
    font-family="Gautami, 'Noto Sans Telugu', 'Telugu Text', sans-serif"
    font-size="${subSize}"
    fill="rgba(255,255,255,0.85)"
    text-anchor="middle"
    dominant-baseline="auto"
    letter-spacing="1">తె</text>
</svg>`
}

async function pngBuffer(size, maskable = false) {
  const svg = svgIcon({ size, maskable })
  return sharp(Buffer.from(svg))
    .png({ compressionLevel: 9 })
    .toBuffer()
}

// ── favicon.ico (write as 32×32 PNG — browsers accept PNG inside .ico) ─────
async function writeFavicon() {
  const buf = await pngBuffer(32)
  writeFileSync(`${PUBLIC}/favicon.ico`, buf)
  console.log('✓ favicon.ico (32×32 PNG)')
}

// ── standard PNGs ──────────────────────────────────────────────────────────
async function writePng(filename, size, maskable = false) {
  const buf = await pngBuffer(size, maskable)
  writeFileSync(`${PUBLIC}/${filename}`, buf)
  console.log(`✓ ${filename} (${size}×${size})`)
}

// ── main ───────────────────────────────────────────────────────────────────
async function main() {
  console.log('\nGenerating PWA icons…\n')
  await writeFavicon()
  await writePng('icon-192.png', 192)
  await writePng('apple-touch-icon.png', 180)
  await writePng('icon-512.png', 512)
  await writePng('icon-512-maskable.png', 512, true)   // safe-zone padded
  console.log('\nDone — all icons written to public/\n')
}

main().catch(err => { console.error(err); process.exit(1) })
