// ── Color Converter ──────────────────────────────────────────
(function () {
  'use strict';

  const hexInput = document.getElementById('hex-input');
  const rgbR = document.getElementById('rgb-r');
  const rgbG = document.getElementById('rgb-g');
  const rgbB = document.getElementById('rgb-b');
  const hslH = document.getElementById('hsl-h');
  const hslS = document.getElementById('hsl-s');
  const hslL = document.getElementById('hsl-l');
  const preview = document.getElementById('color-preview');
  const cssOutput = document.getElementById('css-output');
  const errorEl = document.getElementById('color-error');

  // ── Conversion: RGB → HEX ─────────────────────────────────
  function rgbToHex(r, g, b) {
    return [r, g, b]
      .map((v) => {
        const hex = Math.round(v).toString(16).padStart(2, '0');
        return hex;
      })
      .join('')
      .toUpperCase();
  }

  // ── Conversion: HEX → RGB ─────────────────────────────────
  function hexToRgb(hex) {
    hex = hex.replace(/^#/, '');
    if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    if (hex.length !== 6 || !/^[0-9A-Fa-f]{6}$/.test(hex)) {
      return null;
    }
    return {
      r: parseInt(hex.substring(0, 2), 16),
      g: parseInt(hex.substring(2, 4), 16),
      b: parseInt(hex.substring(4, 6), 16),
    };
  }

  // ── Conversion: RGB → HSL ─────────────────────────────────
  function rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 2;
    let h = 0;
    let s = 0;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
          break;
        case g:
          h = ((b - r) / d + 2) / 6;
          break;
        case b:
          h = ((r - g) / d + 4) / 6;
          break;
      }
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100),
    };
  }

  // ── Conversion: HSL → RGB ─────────────────────────────────
  function hslToRgb(h, s, l) {
    h /= 360;
    s /= 100;
    l /= 100;

    if (s === 0) {
      const v = Math.round(l * 255);
      return { r: v, g: v, b: v };
    }

    function hue2rgb(p, q, t) {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    }

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    return {
      r: Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
      g: Math.round(hue2rgb(p, q, h) * 255),
      b: Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
    };
  }

  // ── Clamp helper ───────────────────────────────────────────
  function clamp(val, min, max) {
    return Math.min(max, Math.max(min, val));
  }

  // ── Show / hide error ─────────────────────────────────────
  function showError(msg) {
    errorEl.classList.remove('hidden');
    errorEl.querySelector('p').textContent = msg;
  }

  function hideError() {
    errorEl.classList.add('hidden');
  }

  // ── Update preview and CSS output ─────────────────────────
  function updatePreviewAndCss(r, g, b, h, s, l, hex) {
    preview.style.backgroundColor = '#' + hex;
    cssOutput.textContent =
      '#' +
      hex +
      '\n' +
      'rgb(' +
      r +
      ', ' +
      g +
      ', ' +
      b +
      ')' +
      '\n' +
      'hsl(' +
      h +
      ', ' +
      s +
      '%, ' +
      l +
      '%)';
  }

  // ── Update from HEX ───────────────────────────────────────
  function updateFromHex() {
    const raw = hexInput.value.replace(/^#/, '').trim();
    if (!raw) return;

    const rgb = hexToRgb(raw);
    if (!rgb) {
      showError('Invalid HEX value. Use 3 or 6 hex digits (e.g. FFF or 5BA8E0).');
      return;
    }
    hideError();

    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    const hex6 = rgbToHex(rgb.r, rgb.g, rgb.b);

    rgbR.value = rgb.r;
    rgbG.value = rgb.g;
    rgbB.value = rgb.b;
    hslH.value = hsl.h;
    hslS.value = hsl.s;
    hslL.value = hsl.l;

    updatePreviewAndCss(rgb.r, rgb.g, rgb.b, hsl.h, hsl.s, hsl.l, hex6);
  }

  // ── Update from RGB ───────────────────────────────────────
  function updateFromRgb() {
    const r = clamp(parseInt(rgbR.value, 10) || 0, 0, 255);
    const g = clamp(parseInt(rgbG.value, 10) || 0, 0, 255);
    const b = clamp(parseInt(rgbB.value, 10) || 0, 0, 255);

    hideError();

    const hex = rgbToHex(r, g, b);
    const hsl = rgbToHsl(r, g, b);

    hexInput.value = hex;
    hslH.value = hsl.h;
    hslS.value = hsl.s;
    hslL.value = hsl.l;

    updatePreviewAndCss(r, g, b, hsl.h, hsl.s, hsl.l, hex);
  }

  // ── Update from HSL ───────────────────────────────────────
  function updateFromHsl() {
    const h = clamp(parseInt(hslH.value, 10) || 0, 0, 360);
    const s = clamp(parseInt(hslS.value, 10) || 0, 0, 100);
    const l = clamp(parseInt(hslL.value, 10) || 0, 0, 100);

    hideError();

    const rgb = hslToRgb(h, s, l);
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b);

    hexInput.value = hex;
    rgbR.value = rgb.r;
    rgbG.value = rgb.g;
    rgbB.value = rgb.b;

    updatePreviewAndCss(rgb.r, rgb.g, rgb.b, h, s, l, hex);
  }

  // ── Copy buttons ───────────────────────────────────────────
  document.querySelectorAll('.color-copy-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const format = btn.getAttribute('data-format');
      let text = '';

      if (format === 'hex') {
        text = '#' + hexInput.value;
      } else if (format === 'rgb') {
        text = 'rgb(' + rgbR.value + ', ' + rgbG.value + ', ' + rgbB.value + ')';
      } else if (format === 'hsl') {
        text = 'hsl(' + hslH.value + ', ' + hslS.value + '%, ' + hslL.value + '%)';
      } else if (format === 'css') {
        text = cssOutput.textContent;
      }

      if (!text) return;

      navigator.clipboard.writeText(text).then(() => {
        const original = btn.textContent;
        btn.textContent = 'Copied!';
        setTimeout(() => {
          btn.textContent = original;
        }, 1500);
      });
    });
  });

  // ── Event listeners ────────────────────────────────────────
  hexInput.addEventListener('input', updateFromHex);
  rgbR.addEventListener('input', updateFromRgb);
  rgbG.addEventListener('input', updateFromRgb);
  rgbB.addEventListener('input', updateFromRgb);
  hslH.addEventListener('input', updateFromHsl);
  hslS.addEventListener('input', updateFromHsl);
  hslL.addEventListener('input', updateFromHsl);

  // Initialize CSS output on load
  updateFromHex();
})();
