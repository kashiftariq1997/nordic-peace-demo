/**
 * Generates the hand-drawn-style SVG illustrations for the mock catalog.
 *
 * Dependency-free (Node only). Output:
 *   public/images/products/p-{handle}.svg          (product hero)
 *   public/images/products/p-{handle}-detail.svg   (fabric/detail zoom)
 *   public/images/collections/c-{handle}.svg       (collection art)
 *
 * All art is generated from the brand palette — no external images.
 * Run: node scripts/generate-illustrations.mjs
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PRODUCTS_DIR = join(ROOT, "public", "images", "products");
const COLLECTIONS_DIR = join(ROOT, "public", "images", "collections");

/* Brand palette (must match src/app/globals.css tokens) */
const C = {
  blush: "#FBE9EF",
  rose: "#DE8096",
  cream: "#FFF9F6",
  plum: "#372A33",
  blushDeep: "#F6D3DD",
  roseInk: "#A64560",
  plumSoft: "#5B4853",
  line: "#EFD9E0",
};

const W = 400;
const H = 400;

/* ------------------------------ tiny helpers ------------------------------ */

const svg = (inner, { w = W, h = H } = {}) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img">` +
  `<rect width="${w}" height="${h}" fill="${C.cream}"/>` +
  inner +
  `</svg>`;

/** Soft rounded background panel */
const panel = (x = 24, y = 24, w = W - 48, h = H - 48, fill = C.blush, r = 36) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}"/>`;

/** A ribbon bow — the house motif. cx,cy = center; s = scale factor */
const bow = (cx, cy, s = 1, left = C.rose, right = C.rose, knot = C.roseInk) => {
  const lw = 34 * s;
  const lh = 22 * s;
  const rw = 34 * s;
  const rh = 22 * s;
  return (
    `<g>` +
    // left loop
    `<path d="M ${cx} ${cy} C ${cx - lw} ${cy - lh}, ${cx - lw} ${cy + lh}, ${cx} ${cy} Z" fill="${left}"/>` +
    // right loop
    `<path d="M ${cx} ${cy} C ${cx + rw} ${cy - rh}, ${cx + rw} ${cy + rh}, ${cx} ${cy} Z" fill="${right}"/>` +
    // tails
    `<path d="M ${cx - 4 * s} ${cy + 2 * s} l ${-10 * s} ${18 * s} l ${8 * s} ${-2 * s} Z" fill="${left}" opacity="0.85"/>` +
    `<path d="M ${cx + 4 * s} ${cy + 2 * s} l ${10 * s} ${18 * s} l ${-8 * s} ${-2 * s} Z" fill="${right}" opacity="0.85"/>` +
    // knot
    `<circle cx="${cx}" cy="${cy}" r="${6 * s}" fill="${knot}"/>` +
    `</g>`
  );
};

/** Scalloped bottom edge as a path (for hems) */
const scallops = (x1, x2, y, count, depth, color) => {
  const step = (x2 - x1) / count;
  let d = `M ${x1} ${y}`;
  for (let i = 0; i < count; i++) {
    const sx = x1 + i * step;
    d += ` Q ${sx + step / 2} ${y + depth}, ${sx + step} ${y}`;
  }
  d += ` L ${x2} ${y + 6} L ${x1} ${y + 6} Z`;
  return `<path d="${d}" fill="${color}"/>`;
};

/* --------------------------- fabric pattern defs --------------------------- */

const stripes = (id, color, gap = 18, width = 7) =>
  `<pattern id="${id}" width="${gap}" height="${gap}" patternUnits="userSpaceOnUse" patternTransform="rotate(0)">` +
  `<rect width="${gap}" height="${gap}" fill="${C.cream}"/>` +
  `<rect width="${width}" height="${gap}" fill="${color}" opacity="0.55"/>` +
  `</pattern>`;

const waffle = (id, color) => {
  const cell = 16;
  return (
    `<pattern id="${id}" width="${cell}" height="${cell}" patternUnits="userSpaceOnUse">` +
    `<rect width="${cell}" height="${cell}" fill="${C.cream}"/>` +
    `<path d="M 0 0 H ${cell} M 0 0 V ${cell}" stroke="${color}" stroke-width="3" opacity="0.5" fill="none"/>` +
    `</pattern>`
  );
};

const check = (id, a, b) => {
  const cell = 28;
  return (
    `<pattern id="${id}" width="${cell}" height="${cell}" patternUnits="userSpaceOnUse">` +
    `<rect width="${cell}" height="${cell}" fill="${C.cream}"/>` +
    `<rect width="${cell / 2}" height="${cell}" fill="${a}" opacity="0.5"/>` +
    `<rect width="${cell}" height="${cell / 2}" fill="${b}" opacity="0.4"/>` +
    `</pattern>`
  );
};

const knit = (id, color) => {
  const cell = 22;
  return (
    `<pattern id="${id}" width="${cell}" height="${cell}" patternUnits="userSpaceOnUse">` +
    `<rect width="${cell}" height="${cell}" fill="${C.cream}"/>` +
    `<path d="M 2 ${cell} C 2 ${cell / 3}, ${cell - 2} ${cell / 3}, ${cell - 2} ${cell}" ` +
    `stroke="${color}" stroke-width="3.5" fill="none" opacity="0.55"/>` +
    `</pattern>`
  );
};

const linenWeave = (id, color) => {
  const cell = 12;
  let lines = "";
  for (let i = 0; i < cell; i += 3) {
    lines += `<rect x="0" y="${i}" width="${cell}" height="1.4" fill="${color}" opacity="0.35"/>`;
    lines += `<rect x="${i}" y="0" width="1.4" height="${cell}" fill="${color}" opacity="0.28"/>`;
  }
  return (
    `<pattern id="${id}" width="${cell}" height="${cell}" patternUnits="userSpaceOnUse">` +
    `<rect width="${cell}" height="${cell}" fill="${C.cream}"/>` +
    lines +
    `</pattern>`
  );
};

const velvet = (id, color) => {
  const cell = 10;
  let dots = "";
  for (let y = 0; y < cell; y += 5) {
    for (let x = 0; x < cell; x += 5) {
      dots += `<circle cx="${x}" cy="${y}" r="1.3" fill="${color}" opacity="0.4"/>`;
    }
  }
  return (
    `<pattern id="${id}" width="${cell}" height="${cell}" patternUnits="userSpaceOnUse">` +
    `<rect width="${cell}" height="${cell}" fill="${color}" opacity="0.85"/>` +
    dots +
    `</pattern>`
  );
};

/* ------------------------------ product art ------------------------------ */

/** Folded pajama set: top + shorts/trousers stack */
function pajamaArt({ fill, accent, detail = false }) {
  const pid = "pat";
  const pattern =
    fill === "waffle"
      ? waffle(pid, accent)
      : fill === "check"
        ? check(pid, accent, C.rose)
        : stripes(pid, accent);
  const bodyFill = `url(#${pid})`;
  const cx = W / 2;
  const cy = H / 2 + 8;
  return svg(
    panel(28, 28, W - 56, H - 56, C.blush) +
      `<defs>${pattern}</defs>` +
      // shadow
      `<ellipse cx="${cx}" cy="${cy + 118}" rx="118" ry="14" fill="${C.blushDeep}"/>` +
      // folded trousers (bottom)
      `<g>` +
      `<rect x="${cx - 96}" y="${cy + 22}" width="192" height="92" rx="16" fill="${bodyFill}" stroke="${C.line}" stroke-width="2"/>` +
      `<line x1="${cx}" y1="${cy + 34}" x2="${cx}" y2="${cy + 104}" stroke="${C.line}" stroke-width="2"/>` +
      `</g>` +
      // folded top (on top)
      `<g>` +
      `<rect x="${cx - 88}" y="${cy - 74}" width="176" height="98" rx="16" fill="${bodyFill}" stroke="${C.line}" stroke-width="2"/>` +
      // collar V
      `<path d="M ${cx - 26} ${cy - 74} L ${cx} ${cy - 44} L ${cx + 26} ${cy - 74}" fill="none" stroke="${accent}" stroke-width="4" stroke-linecap="round"/>` +
      // piping line
      `<line x1="${cx - 88}" y1="${cy + 10}" x2="${cx + 88}" y2="${cy + 10}" stroke="${accent}" stroke-width="3" opacity="0.8"/>` +
      // buttons
      `<circle cx="${cx}" cy="${cy - 22}" r="3.5" fill="${C.roseInk}"/>` +
      `<circle cx="${cx}" cy="${cy - 2}" r="3.5" fill="${C.roseInk}"/>` +
      `</g>` +
      // bow on top
      bow(cx, cy - 92, 1.15, accent, accent, C.roseInk) +
      (detail
        ? // fabric-detail variant: big swatch with scallop hem
          panel(60, 150, W - 120, 150, C.blushDeep, 20) +
          `<rect x="76" y="166" width="${W - 152}" height="90" rx="10" fill="${bodyFill}" stroke="${C.line}" stroke-width="2"/>` +
          scallops(76, W - 76, 250, 7, 16, accent)
        : ""),
  );
}

/** Duvet / sheet set: layered bedding stack */
function beddingArt({ accent, detail = false }) {
  const pid = "linen";
  const pattern = linenWeave(pid, accent);
  const cx = W / 2;
  const cy = H / 2 + 10;
  const layer = (y, w, h, fill) =>
    `<rect x="${cx - w / 2}" y="${y}" width="${w}" height="${h}" rx="14" fill="${fill}" stroke="${C.line}" stroke-width="2"/>`;
  return svg(
    panel(28, 28, W - 56, H - 56, C.blush) +
      `<defs>${pattern}</defs>` +
      `<ellipse cx="${cx}" cy="${cy + 96}" rx="126" ry="13" fill="${C.blushDeep}"/>` +
      layer(cy + 30, 210, 70, `url(#${pid})`) +
      layer(cy - 16, 196, 70, C.cream) +
      layer(cy - 62, 182, 70, `url(#${pid})`) +
      // ribbon wrap
      `<rect x="${cx - 12}" y="${cy - 76}" width="24" height="176" fill="${accent}" opacity="0.9"/>` +
      bow(cx, cy - 76, 1.1, accent, accent, C.roseInk) +
      (detail
        ? panel(70, 170, W - 140, 120, C.blushDeep, 20) +
          `<rect x="86" y="186" width="${W - 172}" height="64" rx="10" fill="url(#${pid})" stroke="${C.line}" stroke-width="2"/>` +
          // scallop embroidery line
          `<path d="M 86 258 q 20 16 40 0 q 20 16 40 0 q 20 16 40 0 q 20 16 40 0 q 20 16 40 0" fill="none" stroke="${accent}" stroke-width="3"/>`
        : ""),
  );
}

/** Pillow shams: two pillows */
function pillowsArt({ accent, detail = false }) {
  const cx = W / 2;
  const cy = H / 2;
  const pillow = (x, y) =>
    `<g>` +
    `<rect x="${x - 66}" y="${y - 44}" width="132" height="88" rx="26" fill="${C.cream}" stroke="${C.line}" stroke-width="2.5"/>` +
    // pintuck lines
    `<line x1="${x - 30}" y1="${y - 30}" x2="${x - 30}" y2="${y + 30}" stroke="${accent}" stroke-width="2" opacity="0.7"/>` +
    `<line x1="${x}" y1="${y - 34}" x2="${x}" y2="${y + 34}" stroke="${accent}" stroke-width="2" opacity="0.7"/>` +
    `<line x1="${x + 30}" y1="${y - 30}" x2="${x + 30}" y2="${y + 30}" stroke="${accent}" stroke-width="2" opacity="0.7"/>` +
    `</g>`;
  return svg(
    panel(28, 28, W - 56, H - 56, C.blush) +
      `<ellipse cx="${cx}" cy="${cy + 82}" rx="110" ry="12" fill="${C.blushDeep}"/>` +
      pillow(cx - 54, cy - 12) +
      pillow(cx + 54, cy + 18) +
      bow(cx, cy - 74, 0.9, accent, accent, C.roseInk) +
      (detail
        ? panel(70, 180, W - 140, 110, C.blushDeep, 20) +
          `<path d="M 90 200 l 0 70 M 130 200 l 0 70 M 170 200 l 0 70 M 210 200 l 0 70 M 250 200 l 0 70 M 290 200 l 0 70 M 310 200 l 0 70" stroke="${accent}" stroke-width="3" opacity="0.6"/>`
        : ""),
  );
}

/** Throw blanket: rolled / draped knit */
function throwArt({ accent, detail = false }) {
  const pid = "knit";
  const pattern = knit(pid, accent);
  const cx = W / 2;
  const cy = H / 2 + 16;
  return svg(
    panel(28, 28, W - 56, H - 56, C.blush) +
      `<defs>${pattern}</defs>` +
      `<ellipse cx="${cx}" cy="${cy + 84}" rx="116" ry="12" fill="${C.blushDeep}"/>` +
      // draped body
      `<path d="M ${cx - 108} ${cy + 60} C ${cx - 108} ${cy - 40}, ${cx - 40} ${cy - 76}, ${cx} ${cy - 76} ` +
      `C ${cx + 40} ${cy - 76}, ${cx + 108} ${cy - 40}, ${cx + 108} ${cy + 60} ` +
      `L ${cx + 92} ${cy + 60} L ${cx - 92} ${cy + 60} Z" fill="url(#${pid})" stroke="${C.line}" stroke-width="2"/>` +
      // scallop hem
      scallops(cx - 100, cx + 100, cy + 58, 8, 14, C.cream) +
      // folded corner
      `<path d="M ${cx - 30} ${cy - 20} q 30 24 60 0" fill="none" stroke="${accent}" stroke-width="3"/>` +
      bow(cx, cy - 92, 1, accent, accent, C.roseInk) +
      (detail
        ? panel(70, 170, W - 140, 120, C.blushDeep, 20) +
          `<rect x="86" y="186" width="${W - 172}" height="72" rx="10" fill="url(#${pid})" stroke="${C.line}" stroke-width="2"/>`
        : ""),
  );
}

/** Mug with scallop rim */
function mugArt({ accent, detail = false }) {
  const cx = W / 2;
  const cy = H / 2 + 8;
  return svg(
    panel(28, 28, W - 56, H - 56, C.blush) +
      `<ellipse cx="${cx}" cy="${cy + 92}" rx="74" ry="10" fill="${C.blushDeep}"/>` +
      // body
      `<path d="M ${cx - 56} ${cy - 44} L ${cx - 48} ${cy + 76} Q ${cx} ${cy + 96} ${cx + 48} ${cy + 76} L ${cx + 56} ${cy - 44} Z" fill="${C.cream}" stroke="${C.line}" stroke-width="2.5"/>` +
      // scallop rim
      `<path d="M ${cx - 58} ${cy - 44} q 8 -18 16 0 q 8 -18 16 0 q 8 -18 16 0 q 8 -18 16 0 q 8 -18 16 0 q 8 -18 16 0" fill="none" stroke="${accent}" stroke-width="4" stroke-linecap="round"/>` +
      // handle
      `<path d="M ${cx + 56} ${cy - 20} q 34 6 28 34 q -6 26 -32 22" fill="none" stroke="${accent}" stroke-width="7" stroke-linecap="round"/>` +
      // heart steam
      `<path d="M ${cx - 10} ${cy - 78} c -8 -10 -22 -2 -12 10 l 12 12 l 12 -12 c 10 -12 -4 -20 -12 -10 Z" fill="${C.rose}" opacity="0.85"/>` +
      bow(cx, cy + 40, 0.7, accent, accent, C.roseInk) +
      (detail
        ? panel(80, 180, W - 160, 110, C.blushDeep, 20) +
          `<path d="M 100 220 q 15 -20 30 0 q 15 -20 30 0 q 15 -20 30 0 q 15 -20 30 0 q 15 -20 30 0 q 15 -20 30 0" fill="none" stroke="${accent}" stroke-width="4"/>`
        : ""),
  );
}

/** Scalloped vanity mirror */
function mirrorArt({ accent, detail = false }) {
  const cx = W / 2;
  const cy = H / 2 - 6;
  const scallopRing = () => {
    const r = 96;
    let d = "";
    const bumps = 16;
    for (let i = 0; i <= bumps; i++) {
      const a0 = (i / bumps) * Math.PI * 2;
      const a1 = ((i + 0.5) / bumps) * Math.PI * 2;
      const a2 = ((i + 1) / bumps) * Math.PI * 2;
      const p0 = [cx + r * Math.cos(a0), cy + r * Math.sin(a0)];
      const p1 = [cx + (r + 12) * Math.cos(a1), cy + (r + 12) * Math.sin(a1)];
      const p2 = [cx + r * Math.cos(a2), cy + r * Math.sin(a2)];
      if (i === 0) d += `M ${p0[0]} ${p0[1]} `;
      d += `Q ${p1[0]} ${p1[1]}, ${p2[0]} ${p2[1]} `;
    }
    return `<path d="${d}" fill="none" stroke="${accent}" stroke-width="5" stroke-linecap="round"/>`;
  };
  return svg(
    panel(28, 28, W - 56, H - 56, C.blush) +
      // stand
      `<rect x="${cx - 8}" y="${cy + 88}" width="16" height="44" rx="6" fill="${C.plumSoft}"/>` +
      `<rect x="${cx - 44}" y="${cy + 126}" width="88" height="14" rx="7" fill="${C.plumSoft}"/>` +
      // glass
      `<circle cx="${cx}" cy="${cy}" r="88" fill="${C.cream}" stroke="${C.line}" stroke-width="3"/>` +
      // soft reflection
      `<path d="M ${cx - 46} ${cy - 40} q 20 -30 54 -24" fill="none" stroke="#ffffff" stroke-width="8" stroke-linecap="round" opacity="0.9"/>` +
      scallopRing() +
      bow(cx, cy - 112, 0.95, accent, accent, C.roseInk) +
      (detail
        ? panel(80, 190, W - 160, 100, C.blushDeep, 20) +
          `<path d="M 110 240 q 14 -18 28 0 q 14 -18 28 0 q 14 -18 28 0 q 14 -18 28 0 q 14 -18 28 0 q 14 -18 28 0" fill="none" stroke="${accent}" stroke-width="4"/>`
        : ""),
  );
}

/** Velvet jewelry box */
function jewelryBoxArt({ accent, detail = false }) {
  const pid = "velvet";
  const pattern = velvet(pid, accent);
  const cx = W / 2;
  const cy = H / 2 + 10;
  return svg(
    panel(28, 28, W - 56, H - 56, C.blush) +
      `<defs>${pattern}</defs>` +
      `<ellipse cx="${cx}" cy="${cy + 84}" rx="106" ry="12" fill="${C.blushDeep}"/>` +
      // box base
      `<rect x="${cx - 96}" y="${cy - 6}" width="192" height="90" rx="14" fill="url(#${pid})" stroke="${C.line}" stroke-width="2"/>` +
      // lid
      `<path d="M ${cx - 100} ${cy - 6} q 100 -86 200 0 Z" fill="url(#${pid})" stroke="${C.line}" stroke-width="2"/>` +
      // ribbon
      `<rect x="${cx - 10}" y="${cy - 74}" width="20" height="158" fill="${C.cream}" opacity="0.9"/>` +
      bow(cx, cy - 40, 1.05, C.cream, C.cream, accent) +
      // little clasp
      `<circle cx="${cx}" cy="${cy + 16}" r="6" fill="${C.roseInk}"/>` +
      (detail
        ? panel(80, 180, W - 160, 110, C.blushDeep, 20) +
          `<rect x="100" y="200" width="${W - 200}" height="60" rx="10" fill="url(#${pid})" stroke="${C.line}" stroke-width="2"/>` +
          `<circle cx="140" cy="230" r="8" fill="${C.cream}" stroke="${C.line}"/>` +
          `<circle cx="170" cy="230" r="8" fill="${C.cream}" stroke="${C.line}"/>` +
          `<circle cx="200" cy="230" r="8" fill="${C.cream}" stroke="${C.line}"/>`
        : ""),
  );
}

/** Linen vanity tray */
function trayArt({ accent, detail = false }) {
  const pid = "linen";
  const pattern = linenWeave(pid, accent);
  const cx = W / 2;
  const cy = H / 2 + 6;
  return svg(
    panel(28, 28, W - 56, H - 56, C.blush) +
      `<defs>${pattern}</defs>` +
      `<ellipse cx="${cx}" cy="${cy + 74}" rx="112" ry="12" fill="${C.blushDeep}"/>` +
      // tray
      `<rect x="${cx - 118}" y="${cy - 52}" width="236" height="120" rx="20" fill="url(#${pid})" stroke="${C.line}" stroke-width="3"/>` +
      `<rect x="${cx - 100}" y="${cy - 36}" width="200" height="88" rx="12" fill="${C.cream}" opacity="0.55"/>` +
      // little bottles
      `<rect x="${cx - 66}" y="${cy - 12}" width="30" height="48" rx="8" fill="${C.blushDeep}" stroke="${C.line}"/>` +
      `<rect x="${cx - 58}" y="${cy - 24}" width="14" height="14" rx="4" fill="${accent}"/>` +
      `<rect x="${cx - 12}" y="${cy - 4}" width="26" height="40" rx="8" fill="${C.cream}" stroke="${C.line}"/>` +
      `<rect x="${cx - 6}" y="${cy - 14}" width="14" height="12" rx="4" fill="${C.rose}"/>` +
      `<circle cx="${cx + 48}" cy="${cy + 18}" r="16" fill="${C.blushDeep}" stroke="${C.line}"/>` +
      bow(cx, cy - 62, 0.85, accent, accent, C.roseInk) +
      (detail
        ? panel(80, 180, W - 160, 110, C.blushDeep, 20) +
          `<rect x="100" y="200" width="${W - 200}" height="60" rx="10" fill="url(#${pid})" stroke="${C.line}" stroke-width="2"/>`
        : ""),
  );
}

/** Bow clips / barrette art (used for all three hair pieces) */
function bowAccessoryArt({ accent, accent2, pearls = false, count = 3, detail = false }) {
  const cx = W / 2;
  const cy = H / 2;
  let bows = "";
  if (count === 1) {
    bows += bow(cx, cy + 6, 2.6, accent, accent, C.roseInk);
    // barrette clip under
    bows += `<rect x="${cx - 70}" y="${cy + 64}" width="140" height="12" rx="6" fill="${C.plumSoft}"/>`;
  } else {
    const positions = [
      [cx - 62, cy - 30],
      [cx + 58, cy - 6],
      [cx - 20, cy + 62],
    ];
    for (let i = 0; i < count && i < positions.length; i++) {
      const [x, y] = positions[i];
      const left = i === 1 ? accent2 : accent;
      bows += bow(x, y, 1.5, left, left, C.roseInk);
    }
  }
  const pearlsArt = pearls
    ? `<circle cx="${cx + 74}" cy="${cy - 54}" r="7" fill="${C.cream}" stroke="${C.line}"/>` +
      `<circle cx="${cx - 88}" cy="${cy + 40}" r="6" fill="${C.cream}" stroke="${C.line}"/>` +
      `<circle cx="${cx + 30}" cy="${cy + 88}" r="7" fill="${C.cream}" stroke="${C.line}"/>`
    : "";
  return svg(
    panel(28, 28, W - 56, H - 56, C.blush) +
      `<ellipse cx="${cx}" cy="${cy + 116}" rx="104" ry="11" fill="${C.blushDeep}"/>` +
      bows +
      pearlsArt +
      (detail
        ? panel(80, 180, W - 160, 110, C.blushDeep, 20) +
          `<path d="M 110 235 q 22 -26 44 0 q 22 -26 44 0 q 22 -26 44 0" fill="none" stroke="${accent}" stroke-width="4"/>` +
          (pearls
            ? `<circle cx="150" cy="255" r="5" fill="${C.cream}" stroke="${C.line}"/><circle cx="200" cy="255" r="5" fill="${C.cream}" stroke="${C.line}"/><circle cx="250" cy="255" r="5" fill="${C.cream}" stroke="${C.line}"/>`
            : "")
        : ""),
  );
}

/** Sleep mask + scrunchies */
function sleepSetArt({ accent, detail = false }) {
  const cx = W / 2;
  const cy = H / 2 + 4;
  return svg(
    panel(28, 28, W - 56, H - 56, C.blush) +
      `<ellipse cx="${cx}" cy="${cy + 96}" rx="110" ry="12" fill="${C.blushDeep}"/>` +
      // mask
      `<path d="M ${cx - 96} ${cy - 30} q 96 -66 192 0 q -20 44 -96 44 q -76 0 -96 -44 Z" fill="${C.cream}" stroke="${C.line}" stroke-width="2.5"/>` +
      // scallop edge on mask
      `<path d="M ${cx - 92} ${cy - 22} q 8 12 16 0 q 8 12 16 0 q 8 12 16 0 q 8 12 16 0 q 8 12 16 0 q 8 12 16 0 q 8 12 16 0 q 8 12 16 0 q 8 12 16 0" fill="none" stroke="${accent}" stroke-width="3"/>` +
      // strap
      `<path d="M ${cx - 96} ${cy - 30} q -18 -18 -8 -40" fill="none" stroke="${accent}" stroke-width="6" stroke-linecap="round"/>` +
      `<path d="M ${cx + 96} ${cy - 30} q 18 -18 8 -40" fill="none" stroke="${accent}" stroke-width="6" stroke-linecap="round"/>` +
      // closed eyes
      `<path d="M ${cx - 40} ${cy - 2} q 10 10 20 0" fill="none" stroke="${C.plumSoft}" stroke-width="3" stroke-linecap="round"/>` +
      `<path d="M ${cx + 20} ${cy - 2} q 10 10 20 0" fill="none" stroke="${C.plumSoft}" stroke-width="3" stroke-linecap="round"/>` +
      // scrunchies
      `<circle cx="${cx - 52}" cy="${cy + 62}" r="24" fill="none" stroke="${accent}" stroke-width="10" opacity="0.9"/>` +
      `<circle cx="${cx + 52}" cy="${cy + 62}" r="24" fill="none" stroke="${C.plum}" stroke-width="10" opacity="0.85"/>` +
      bow(cx, cy - 62, 0.9, accent, accent, C.roseInk) +
      (detail
        ? panel(80, 180, W - 160, 110, C.blushDeep, 20) +
          `<path d="M 100 235 q 18 -22 36 0 q 18 -22 36 0 q 18 -22 36 0 q 18 -22 36 0" fill="none" stroke="${accent}" stroke-width="4"/>`
        : ""),
  );
}

/** Cozy sock duo */
function socksArt({ accent, detail = false }) {
  const cx = W / 2;
  const cy = H / 2;
  const sock = (x, y, tilt) =>
    `<g transform="translate(${x} ${y}) rotate(${tilt})">` +
    `<path d="M -22 -84 h 44 v 108 q 0 18 -18 18 h -34 q -22 0 -22 -22 q 0 -20 22 -20 q 12 0 12 -14 Z" ` +
    `fill="${C.cream}" stroke="${C.line}" stroke-width="2.5"/>` +
    // ribbed cuff
    `<rect x="-22" y="-84" width="44" height="18" rx="6" fill="${accent}" opacity="0.85"/>` +
    // heel + toe
    `<path d="M -40 18 q -6 14 8 18 l 20 -8" fill="${accent}" opacity="0.5"/>` +
    `<path d="M 22 20 q 10 8 -2 16 l -18 -6" fill="${accent}" opacity="0.5"/>` +
    `</g>`;
  return svg(
    panel(28, 28, W - 56, H - 56, C.blush) +
      `<ellipse cx="${cx}" cy="${cy + 96}" rx="96" ry="11" fill="${C.blushDeep}"/>` +
      sock(cx - 44, cy, -8) +
      sock(cx + 44, cy, 8) +
      bow(cx, cy - 100, 0.9, accent, accent, C.roseInk) +
      (detail
        ? panel(80, 180, W - 160, 110, C.blushDeep, 20) +
          `<path d="M 110 200 v 70 M 130 200 v 70 M 150 200 v 70 M 170 200 v 70 M 190 200 v 70 M 210 200 v 70 M 230 200 v 70 M 250 200 v 70 M 270 200 v 70 M 290 200 v 70" stroke="${accent}" stroke-width="3" opacity="0.55"/>`
        : ""),
  );
}

/** Heart trinket dish */
function heartDishArt({ accent, detail = false }) {
  const cx = W / 2;
  const cy = H / 2 + 4;
  return svg(
    panel(28, 28, W - 56, H - 56, C.blush) +
      `<ellipse cx="${cx}" cy="${cy + 84}" rx="92" ry="11" fill="${C.blushDeep}"/>` +
      // dish (heart)
      `<path d="M ${cx} ${cy + 62} C ${cx - 10} ${cy + 46}, ${cx - 78} ${cy + 6}, ${cx - 78} ${cy - 26} ` +
      `C ${cx - 78} ${cy - 58}, ${cx - 44} ${cy - 66}, ${cx - 22} ${cy - 48} ` +
      `C ${cx - 10} ${cy - 38}, ${cx} ${cy - 30}, ${cx} ${cy - 30} ` +
      `C ${cx} ${cy - 30}, ${cx + 10} ${cy - 38}, ${cx + 22} ${cy - 48} ` +
      `C ${cx + 44} ${cy - 66}, ${cx + 78} ${cy - 58}, ${cx + 78} ${cy - 26} ` +
      `C ${cx + 78} ${cy + 6}, ${cx + 10} ${cy + 46}, ${cx} ${cy + 62} Z" ` +
      `fill="${C.cream}" stroke="${accent}" stroke-width="5"/>` +
      // gold rim echo
      `<path d="M ${cx} ${cy + 46} C ${cx - 8} ${cy + 34}, ${cx - 60} ${cy + 2}, ${cx - 60} ${cy - 22} ` +
      `C ${cx - 60} ${cy - 44}, ${cx - 34} ${cy - 50}, ${cx - 18} ${cy - 36} ` +
      `C ${cx - 8} ${cy - 28}, ${cx} ${cy - 22}, ${cx} ${cy - 22} ` +
      `C ${cx} ${cy - 22}, ${cx + 8} ${cy - 28}, ${cx + 18} ${cy - 36} ` +
      `C ${cx + 34} ${cy - 50}, ${cx + 60} ${cy - 44}, ${cx + 60} ${cy - 22} ` +
      `C ${cx + 60} ${cy + 2}, ${cx + 8} ${cy + 34}, ${cx} ${cy + 46} Z" ` +
      `fill="none" stroke="${C.rose}" stroke-width="2" opacity="0.7"/>` +
      // tiny ring inside
      `<circle cx="${cx - 14}" cy="${cy - 4}" r="10" fill="none" stroke="${C.plumSoft}" stroke-width="3"/>` +
      bow(cx, cy - 84, 0.8, accent, accent, C.roseInk) +
      (detail
        ? panel(80, 180, W - 160, 110, C.blushDeep, 20) +
          `<path d="M 200 210 c -6 -8 -18 -2 -10 8 l 10 10 l 10 -10 c 8 -10 -4 -16 -10 -8 Z" fill="none" stroke="${accent}" stroke-width="3"/>`
        : ""),
  );
}

/* ---------------------------- collection art ---------------------------- */

function collectionArt(handle) {
  const cx = W / 2;
  const cy = H / 2;
  const base = panel(28, 28, W - 56, H - 56, C.blush);
  switch (handle) {
    case "pajama-sets":
      return svg(
        base +
          bow(cx, cy - 90, 1.4, C.rose, C.rose, C.roseInk) +
          `<rect x="${cx - 100}" y="${cy - 40}" width="200" height="120" rx="18" fill="${C.cream}" stroke="${C.line}" stroke-width="2.5"/>` +
          `<path d="M ${cx - 30} ${cy - 40} L ${cx} ${cy - 8} L ${cx + 30} ${cy - 40}" fill="none" stroke="${C.rose}" stroke-width="4"/>` +
          `<line x1="${cx - 100}" y1="${cy + 52}" x2="${cx + 100}" y2="${cy + 52}" stroke="${C.rose}" stroke-width="3" opacity="0.7"/>`,
      );
    case "cozy-home":
      return svg(
        base +
          bow(cx, cy - 96, 1.2, C.rose, C.rose, C.roseInk) +
          `<rect x="${cx - 110}" y="${cy + 20}" width="220" height="64" rx="14" fill="${C.cream}" stroke="${C.line}" stroke-width="2.5"/>` +
          `<rect x="${cx - 96}" y="${cy - 28}" width="192" height="64" rx="14" fill="${C.blushDeep}" stroke="${C.line}" stroke-width="2.5"/>` +
          `<rect x="${cx - 82}" y="${cy - 76}" width="168" height="64" rx="14" fill="${C.cream}" stroke="${C.line}" stroke-width="2.5"/>` +
          `<rect x="${cx - 10}" y="${cy - 88}" width="20" height="164" fill="${C.rose}" opacity="0.85"/>`,
      );
    case "vanity-edit":
      return svg(
        base +
          `<circle cx="${cx}" cy="${cy - 24}" r="64" fill="${C.cream}" stroke="${C.line}" stroke-width="3"/>` +
          `<path d="M ${cx - 30} ${cy - 44} q 16 -20 40 -14" fill="none" stroke="#ffffff" stroke-width="7" stroke-linecap="round"/>` +
          `<rect x="${cx - 6}" y="${cy + 40}" width="12" height="34" rx="5" fill="${C.plumSoft}"/>` +
          `<rect x="${cx - 34}" y="${cy + 70}" width="68" height="12" rx="6" fill="${C.plumSoft}"/>` +
          `<rect x="${cx - 108}" y="${cy + 52}" width="56" height="30" rx="10" fill="${C.blushDeep}" stroke="${C.line}"/>` +
          bow(cx + 86, cy + 62, 0.8, C.rose, C.rose, C.roseInk),
      );
    case "gifts":
      return svg(
        base +
          `<rect x="${cx - 86}" y="${cy - 40}" width="172" height="126" rx="14" fill="${C.cream}" stroke="${C.line}" stroke-width="2.5"/>` +
          `<rect x="${cx - 12}" y="${cy - 40}" width="24" height="126" fill="${C.rose}" opacity="0.85"/>` +
          `<rect x="${cx - 86}" y="${cy + 4}" width="172" height="22" fill="${C.rose}" opacity="0.85"/>` +
          bow(cx, cy - 40, 1.5, C.rose, C.rose, C.roseInk) +
          `<circle cx="${cx - 58}" cy="${cy + 106}" r="5" fill="${C.roseInk}"/>` +
          `<circle cx="${cx + 58}" cy="${cy + 106}" r="5" fill="${C.roseInk}"/>`,
      );
    case "new-arrivals":
      return svg(
        base +
          `<rect x="${cx - 70}" y="${cy - 90}" width="140" height="180" rx="16" fill="${C.cream}" stroke="${C.line}" stroke-width="2.5" transform="rotate(-6 ${cx} ${cy})"/>` +
          `<rect x="${cx - 56}" y="${cy - 76}" width="112" height="150" rx="12" fill="${C.blushDeep}" stroke="${C.line}" stroke-width="2" transform="rotate(4 ${cx} ${cy})"/>` +
          bow(cx, cy - 92, 1.3, C.rose, C.rose, C.roseInk) +
          `<path d="M ${cx - 24} ${cy + 30} l 18 18 l 34 -36" fill="none" stroke="${C.roseInk}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`,
      );
    case "bestsellers":
      return svg(
        base +
          `<circle cx="${cx}" cy="${cy}" r="88" fill="${C.cream}" stroke="${C.line}" stroke-width="3"/>` +
          `<circle cx="${cx}" cy="${cy}" r="70" fill="none" stroke="${C.rose}" stroke-width="2.5" stroke-dasharray="4 6"/>` +
          bow(cx, cy - 6, 1.8, C.rose, C.rose, C.roseInk) +
          // ribbon tails of a rosette
          `<path d="M ${cx - 16} ${cy + 78} l -10 34 l 16 -8 Z" fill="${C.rose}"/>` +
          `<path d="M ${cx + 16} ${cy + 78} l 10 34 l -16 -8 Z" fill="${C.rose}"/>`,
      );
    default:
      return svg(base + bow(cx, cy, 1.5, C.rose, C.rose, C.roseInk));
  }
}

/* --------------------------- product art table --------------------------- */

const PRODUCTS = [
  { handle: "rosewater-silk-pajama-set", art: pajamaArt, accent: C.rose },
  { handle: "blush-stripe-pajama-set", art: pajamaArt, accent: C.rose },
  { handle: "cloud-waffle-pajama-set", art: pajamaArt, accent: C.rose, opts: { fill: "waffle" } },
  { handle: "peony-check-pajama-set", art: pajamaArt, accent: C.roseInk, opts: { fill: "check" } },
  { handle: "plum-lace-pajama-set", art: pajamaArt, accent: C.plumSoft },
  { handle: "oat-linen-duvet-cover", art: beddingArt, accent: C.plumSoft },
  { handle: "blush-pintuck-pillow-shams", art: pillowsArt, accent: C.rose },
  { handle: "cloud-knit-throw", art: throwArt, accent: C.rose },
  { handle: "scalloped-cotton-sheet-set", art: beddingArt, accent: C.rose },
  { handle: "rosewater-scallop-mug", art: mugArt, accent: C.rose },
  { handle: "scallop-vanity-mirror", art: mirrorArt, accent: C.rose },
  { handle: "blush-velvet-jewelry-box", art: jewelryBoxArt, accent: C.plumSoft },
  { handle: "linen-vanity-tray", art: trayArt, accent: C.rose },
  {
    handle: "satin-ribbon-bow-clip-set",
    art: bowAccessoryArt,
    accent: C.rose,
    accent2: C.blushDeep,
  },
  {
    handle: "plum-velvet-bow-barrette",
    art: bowAccessoryArt,
    accent: C.plumSoft,
    opts: { count: 1 },
  },
  {
    handle: "pearl-bow-clip-set",
    art: bowAccessoryArt,
    accent: C.rose,
    accent2: C.blushDeep,
    opts: { pearls: true },
  },
  { handle: "sleep-mask-scrunchie-set", art: sleepSetArt, accent: C.rose },
  { handle: "cozy-sock-duo", art: socksArt, accent: C.rose },
  { handle: "heart-trinket-dish", art: heartDishArt, accent: C.rose },
];

const COLLECTION_HANDLES = [
  "pajama-sets",
  "cozy-home",
  "vanity-edit",
  "gifts",
  "new-arrivals",
  "bestsellers",
];

/* --------------------------------- write --------------------------------- */

mkdirSync(PRODUCTS_DIR, { recursive: true });
mkdirSync(COLLECTIONS_DIR, { recursive: true });

let count = 0;
for (const { handle, art, accent, accent2, opts = {} } of PRODUCTS) {
  const args = { accent, accent2, ...opts };
  const hero = art({ ...args, detail: false });
  const detail = art({ ...args, detail: true });
  writeFileSync(join(PRODUCTS_DIR, `p-${handle}.svg`), hero);
  writeFileSync(join(PRODUCTS_DIR, `p-${handle}-detail.svg`), detail);
  count += 2;
}

for (const handle of COLLECTION_HANDLES) {
  writeFileSync(join(COLLECTIONS_DIR, `c-${handle}.svg`), collectionArt(handle));
  count += 1;
}

console.log(`Generated ${count} SVG illustrations.`);
