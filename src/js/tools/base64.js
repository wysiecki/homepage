(function () {
  'use strict';

  const inputEl = document.getElementById('b64-input');
  const outputEl = document.getElementById('b64-output');
  const inputLabel = document.getElementById('input-label');
  const outputLabel = document.getElementById('output-label');
  const charCount = document.getElementById('char-count');
  const errorDisplay = document.getElementById('error-display');
  const errorMessage = document.getElementById('error-message');

  const btnEncode = document.getElementById('btn-encode');
  const btnDecode = document.getElementById('btn-decode');
  const btnCopy = document.getElementById('btn-copy');
  const btnClear = document.getElementById('btn-clear');

  let mode = 'encode';

  function setMode(newMode) {
    mode = newMode;

    if (mode === 'encode') {
      btnEncode.className =
        'px-5 py-2.5 text-sm font-body font-medium tracking-wide transition-all duration-200 bg-primary text-on-primary';
      btnDecode.className =
        'px-5 py-2.5 text-sm font-body font-medium tracking-wide transition-all duration-200 text-on-surface/60 hover:text-on-surface';
      inputLabel.textContent = 'Text Input';
      outputLabel.textContent = 'Base64 Output';
      inputEl.placeholder = 'Enter text to encode...';
    } else {
      btnDecode.className =
        'px-5 py-2.5 text-sm font-body font-medium tracking-wide transition-all duration-200 bg-primary text-on-primary';
      btnEncode.className =
        'px-5 py-2.5 text-sm font-body font-medium tracking-wide transition-all duration-200 text-on-surface/60 hover:text-on-surface';
      inputLabel.textContent = 'Base64 Input';
      outputLabel.textContent = 'Text Output';
      inputEl.placeholder = 'Enter Base64 string to decode...';
    }

    // Re-process current input
    process();
  }

  function utf8ToBase64(str) {
    // Encode string to UTF-8 bytes, then to Base64
    const bytes = new TextEncoder().encode(str);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  function base64ToUtf8(b64) {
    // Decode Base64 to binary, then interpret as UTF-8
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder().decode(bytes);
  }

  function hideError() {
    errorDisplay.classList.add('hidden');
    errorMessage.textContent = '';
  }

  function showError(msg) {
    errorDisplay.classList.remove('hidden');
    errorMessage.textContent = msg;
  }

  function process() {
    const raw = inputEl.value;
    hideError();

    if (!raw) {
      outputEl.value = '';
      charCount.textContent = '';
      return;
    }

    try {
      let result;
      if (mode === 'encode') {
        result = utf8ToBase64(raw);
      } else {
        // Clean whitespace from Base64 input
        const cleaned = raw.replace(/\s/g, '');

        // Validate Base64 characters
        if (!/^[A-Za-z0-9+/]*={0,2}$/.test(cleaned)) {
          throw new Error(
            'Invalid Base64: contains characters outside the Base64 alphabet (A-Z, a-z, 0-9, +, /, =).'
          );
        }

        if (cleaned.length % 4 !== 0) {
          throw new Error(
            'Invalid Base64: string length must be a multiple of 4. Got ' +
              cleaned.length +
              ' characters.'
          );
        }

        result = base64ToUtf8(cleaned);
      }

      outputEl.value = result;
      charCount.textContent = result.length + ' chars';
    } catch (e) {
      outputEl.value = '';
      charCount.textContent = '';
      showError(e.message);
    }
  }

  function copyOutput() {
    const text = outputEl.value;
    if (!text) return;

    navigator.clipboard.writeText(text).then(function () {
      const original = btnCopy.textContent;
      btnCopy.textContent = 'Copied!';
      setTimeout(function () {
        btnCopy.textContent = original;
      }, 1500);
    });
  }

  function clearAll() {
    inputEl.value = '';
    outputEl.value = '';
    charCount.textContent = '';
    hideError();
  }

  // Event listeners
  btnEncode.addEventListener('click', function () {
    setMode('encode');
  });
  btnDecode.addEventListener('click', function () {
    setMode('decode');
  });
  btnCopy.addEventListener('click', copyOutput);
  btnClear.addEventListener('click', clearAll);

  // Live processing on input
  inputEl.addEventListener('input', process);
})();
