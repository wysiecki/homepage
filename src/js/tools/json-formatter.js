(function () {
  'use strict';

  const inputEl = document.getElementById('json-input');
  const outputEl = document.getElementById('json-output');
  const lineNumbersEl = document.getElementById('line-numbers');
  const statusEl = document.getElementById('status-indicator');
  const errorDisplay = document.getElementById('error-display');
  const errorDetail = document.getElementById('error-detail');
  const indentSelect = document.getElementById('indent-size');

  const btnFormat = document.getElementById('btn-format');
  const btnMinify = document.getElementById('btn-minify');
  const btnCopy = document.getElementById('btn-copy');
  const btnClear = document.getElementById('btn-clear');

  let debounceTimer = null;

  function getIndent() {
    return parseInt(indentSelect.value, 10);
  }

  function parseJSON(text) {
    try {
      const parsed = JSON.parse(text);
      return { ok: true, data: parsed, error: null };
    } catch (e) {
      const result = { ok: false, data: null, error: e.message };

      // Try to extract line/column from error message
      const posMatch = e.message.match(/position\s+(\d+)/i);
      if (posMatch) {
        const pos = parseInt(posMatch[1], 10);
        const before = text.substring(0, pos);
        const lines = before.split('\n');
        result.line = lines.length;
        result.column = lines[lines.length - 1].length + 1;
      }

      return result;
    }
  }

  function renderLineNumbers(text) {
    if (!text) {
      lineNumbersEl.textContent = '';
      return;
    }
    const count = text.split('\n').length;
    const nums = [];
    for (let i = 1; i <= count; i++) {
      nums.push(i);
    }
    lineNumbersEl.textContent = nums.join('\n');
  }

  function showError(result) {
    errorDisplay.classList.remove('hidden');
    let detail = result.error;
    if (result.line) {
      detail += ' (line ' + result.line + ', column ' + result.column + ')';
    }
    errorDetail.textContent = detail;
    statusEl.textContent = 'Invalid';
    statusEl.className = 'text-xs font-mono text-red-400';
  }

  function hideError() {
    errorDisplay.classList.add('hidden');
    errorDetail.textContent = '';
  }

  function setOutput(text) {
    outputEl.textContent = text;
    renderLineNumbers(text);
  }

  function formatJSON() {
    const raw = inputEl.value.trim();
    if (!raw) {
      setOutput('');
      hideError();
      statusEl.textContent = '';
      return;
    }

    const result = parseJSON(raw);
    if (!result.ok) {
      showError(result);
      setOutput('');
      return;
    }

    hideError();
    const formatted = JSON.stringify(result.data, null, getIndent());
    setOutput(formatted);
    statusEl.textContent = 'Valid JSON';
    statusEl.className = 'text-xs font-mono text-green-400';
  }

  function minifyJSON() {
    const raw = inputEl.value.trim();
    if (!raw) {
      setOutput('');
      hideError();
      statusEl.textContent = '';
      return;
    }

    const result = parseJSON(raw);
    if (!result.ok) {
      showError(result);
      setOutput('');
      return;
    }

    hideError();
    const minified = JSON.stringify(result.data);
    setOutput(minified);
    statusEl.textContent = 'Minified';
    statusEl.className = 'text-xs font-mono text-green-400';
  }

  function copyOutput() {
    const text = outputEl.textContent;
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
    setOutput('');
    hideError();
    statusEl.textContent = '';
  }

  function validate() {
    const raw = inputEl.value.trim();
    if (!raw) {
      hideError();
      statusEl.textContent = '';
      return;
    }

    const result = parseJSON(raw);
    if (result.ok) {
      hideError();
      statusEl.textContent = 'Valid JSON';
      statusEl.className = 'text-xs font-mono text-green-400';
    } else {
      showError(result);
    }
  }

  function debouncedValidate() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(validate, 300);
  }

  // Event listeners
  btnFormat.addEventListener('click', formatJSON);
  btnMinify.addEventListener('click', minifyJSON);
  btnCopy.addEventListener('click', copyOutput);
  btnClear.addEventListener('click', clearAll);
  inputEl.addEventListener('input', debouncedValidate);

  // Tab key inserts spaces in textarea
  inputEl.addEventListener('keydown', function (e) {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = this.selectionStart;
      const end = this.selectionEnd;
      const indent = ' '.repeat(getIndent());
      this.value = this.value.substring(0, start) + indent + this.value.substring(end);
      this.selectionStart = this.selectionEnd = start + indent.length;
      debouncedValidate();
    }
  });
})();
