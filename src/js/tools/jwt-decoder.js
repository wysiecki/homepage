// ── JWT Decoder ──────────────────────────────────────────────
(function () {
  'use strict';

  const input = document.getElementById('jwt-input');
  const headerEl = document.getElementById('jwt-header');
  const payloadEl = document.getElementById('jwt-payload');
  const signatureEl = document.getElementById('jwt-signature');
  const statusEl = document.getElementById('jwt-status');
  const statusIcon = document.getElementById('jwt-status-icon');
  const statusText = document.getElementById('jwt-status-text');
  const countdownEl = document.getElementById('jwt-countdown');
  const errorEl = document.getElementById('jwt-error');
  const claimsEl = document.getElementById('jwt-claims');
  const claimsBody = document.getElementById('jwt-claims-body');

  const CLAIM_DESCRIPTIONS = {
    iss: 'Issuer',
    sub: 'Subject',
    aud: 'Audience',
    exp: 'Expiration Time',
    nbf: 'Not Before',
    iat: 'Issued At',
    jti: 'JWT ID',
  };

  let countdownInterval = null;

  // ── Base64url decode ────────────────────────────────────────
  function base64urlDecode(str) {
    // Replace Base64url chars with standard Base64
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    // Pad with '=' to make length a multiple of 4
    const pad = base64.length % 4;
    if (pad) {
      base64 += '='.repeat(4 - pad);
    }
    const decoded = atob(base64);
    // Handle UTF-8 encoding
    const bytes = new Uint8Array(decoded.length);
    for (let i = 0; i < decoded.length; i++) {
      bytes[i] = decoded.charCodeAt(i);
    }
    return new TextDecoder().decode(bytes);
  }

  // ── Format timestamp to human-readable date ────────────────
  function formatTimestamp(ts) {
    const d = new Date(ts * 1000);
    return d.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short',
    });
  }

  // ── Format time delta for countdown ────────────────────────
  function formatDelta(ms) {
    const abs = Math.abs(ms);
    const seconds = Math.floor(abs / 1000) % 60;
    const minutes = Math.floor(abs / 60000) % 60;
    const hours = Math.floor(abs / 3600000) % 24;
    const days = Math.floor(abs / 86400000);
    const parts = [];
    if (days > 0) parts.push(days + 'd');
    if (hours > 0) parts.push(hours + 'h');
    if (minutes > 0) parts.push(minutes + 'm');
    parts.push(seconds + 's');
    return parts.join(' ');
  }

  // ── Show error ─────────────────────────────────────────────
  function showError(msg) {
    errorEl.classList.remove('hidden');
    errorEl.querySelector('p').textContent = msg;
    statusEl.classList.add('hidden');
    claimsEl.classList.add('hidden');
    headerEl.textContent = '';
    payloadEl.textContent = '';
    signatureEl.textContent = '';
    clearInterval(countdownInterval);
  }

  function hideError() {
    errorEl.classList.add('hidden');
  }

  // ── Clear all output ───────────────────────────────────────
  function clearOutput() {
    headerEl.textContent = '';
    payloadEl.textContent = '';
    signatureEl.textContent = '';
    statusEl.classList.add('hidden');
    claimsEl.classList.add('hidden');
    hideError();
    clearInterval(countdownInterval);
  }

  // ── Update token status ────────────────────────────────────
  function updateStatus(payload) {
    const now = Math.floor(Date.now() / 1000);
    const exp = payload.exp;
    const nbf = payload.nbf;

    if (!exp && !nbf) {
      statusEl.classList.add('hidden');
      return;
    }

    statusEl.classList.remove('hidden');

    if (nbf && now < nbf) {
      statusIcon.className = 'flex-shrink-0 w-3 h-3 rounded-full bg-yellow-400';
      statusText.textContent = 'Not yet valid — becomes valid ' + formatTimestamp(nbf);
      statusText.className = 'font-mono text-sm text-yellow-400';
      countdownEl.textContent = 'in ' + formatDelta((nbf - now) * 1000);
    } else if (exp && now >= exp) {
      statusIcon.className = 'flex-shrink-0 w-3 h-3 rounded-full bg-red-400';
      statusText.textContent = 'Expired — ' + formatTimestamp(exp);
      statusText.className = 'font-mono text-sm text-red-400';
      countdownEl.textContent = formatDelta((now - exp) * 1000) + ' ago';
    } else if (exp) {
      statusIcon.className = 'flex-shrink-0 w-3 h-3 rounded-full bg-green-400';
      statusText.textContent = 'Valid — expires ' + formatTimestamp(exp);
      statusText.className = 'font-mono text-sm text-green-400';
      countdownEl.textContent = 'in ' + formatDelta((exp - now) * 1000);
    }

    // Live countdown
    clearInterval(countdownInterval);
    if (exp && now < exp) {
      countdownInterval = setInterval(() => {
        const n = Math.floor(Date.now() / 1000);
        if (n >= exp) {
          statusIcon.className = 'flex-shrink-0 w-3 h-3 rounded-full bg-red-400';
          statusText.textContent = 'Expired — ' + formatTimestamp(exp);
          statusText.className = 'font-mono text-sm text-red-400';
          countdownEl.textContent = 'just now';
          clearInterval(countdownInterval);
        } else {
          countdownEl.textContent = 'in ' + formatDelta((exp - n) * 1000);
        }
      }, 1000);
    } else if (nbf && now < nbf) {
      countdownInterval = setInterval(() => {
        const n = Math.floor(Date.now() / 1000);
        if (n >= nbf) {
          // Re-decode to update everything
          decode();
          clearInterval(countdownInterval);
        } else {
          countdownEl.textContent = 'in ' + formatDelta((nbf - n) * 1000);
        }
      }, 1000);
    }
  }

  // ── Build claims table ─────────────────────────────────────
  function buildClaimsTable(payload) {
    const knownClaims = Object.keys(CLAIM_DESCRIPTIONS);
    const found = knownClaims.filter((k) => payload[k] !== undefined);

    if (found.length === 0) {
      claimsEl.classList.add('hidden');
      return;
    }

    claimsEl.classList.remove('hidden');
    claimsBody.innerHTML = '';

    found.forEach((key) => {
      const tr = document.createElement('tr');
      tr.className = 'border-b border-on-surface/5';

      const tdKey = document.createElement('td');
      tdKey.className = 'py-2 pr-4 text-primary/80';
      tdKey.textContent = key;

      const tdVal = document.createElement('td');
      tdVal.className = 'py-2 pr-4 text-on-surface/70 break-all';
      const val = payload[key];
      if (['exp', 'nbf', 'iat'].includes(key) && typeof val === 'number') {
        tdVal.textContent = formatTimestamp(val) + ' (' + val + ')';
      } else if (typeof val === 'object') {
        tdVal.textContent = JSON.stringify(val);
      } else {
        tdVal.textContent = String(val);
      }

      const tdDesc = document.createElement('td');
      tdDesc.className = 'py-2 text-on-surface/40';
      tdDesc.textContent = CLAIM_DESCRIPTIONS[key];

      tr.appendChild(tdKey);
      tr.appendChild(tdVal);
      tr.appendChild(tdDesc);
      claimsBody.appendChild(tr);
    });
  }

  // ── Main decode function ───────────────────────────────────
  function decode() {
    const token = input.value.trim();

    if (!token) {
      clearOutput();
      return;
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
      showError(
        'Invalid JWT format. Expected 3 parts separated by dots (header.payload.signature), got ' +
          parts.length +
          '.'
      );
      return;
    }

    hideError();

    // Decode header
    let header;
    try {
      const headerJson = base64urlDecode(parts[0]);
      header = JSON.parse(headerJson);
      headerEl.textContent = JSON.stringify(header, null, 2);
    } catch (e) {
      showError('Failed to decode header: ' + e.message);
      return;
    }

    // Decode payload
    let payload;
    try {
      const payloadJson = base64urlDecode(parts[1]);
      payload = JSON.parse(payloadJson);
      payloadEl.textContent = JSON.stringify(payload, null, 2);
    } catch (e) {
      showError('Failed to decode payload: ' + e.message);
      return;
    }

    // Signature (raw Base64url string)
    signatureEl.textContent = parts[2];

    // Status
    updateStatus(payload);

    // Claims table
    buildClaimsTable(payload);
  }

  // ── Copy buttons ───────────────────────────────────────────
  document.querySelectorAll('.jwt-copy-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const section = btn.getAttribute('data-section');
      let text = '';
      if (section === 'header') text = headerEl.textContent;
      else if (section === 'payload') text = payloadEl.textContent;
      else if (section === 'signature') text = signatureEl.textContent;

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

  // ── Live decode on input ───────────────────────────────────
  input.addEventListener('input', decode);

  // Decode on page load if there's a value (e.g. from browser autofill)
  if (input.value.trim()) {
    decode();
  }
})();
