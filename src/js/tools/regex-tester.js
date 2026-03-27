(function () {
  'use strict';

  const patternInput = document.getElementById('regex-pattern');
  const testInput = document.getElementById('regex-input');
  const outputEl = document.getElementById('regex-output');
  const matchCountText = document.getElementById('match-count-text');
  const matchBeacon = document.getElementById('match-beacon');
  const matchDetailsCard = document.getElementById('match-details-card');
  const matchDetails = document.getElementById('match-details');
  const errorEl = document.getElementById('regex-error');

  const flagCheckboxes = {
    g: document.getElementById('flag-g'),
    i: document.getElementById('flag-i'),
    m: document.getElementById('flag-m'),
    s: document.getElementById('flag-s'),
  };

  let debounceTimer = null;

  function getFlags() {
    let flags = '';
    Object.entries(flagCheckboxes).forEach(([flag, checkbox]) => {
      if (checkbox.checked) flags += flag;
    });
    return flags;
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function highlightMatches(text, regex) {
    const parts = [];
    let lastIndex = 0;
    let match;

    // Reset regex lastIndex for global patterns
    regex.lastIndex = 0;

    while ((match = regex.exec(text)) !== null) {
      // Prevent infinite loops on zero-length matches
      if (match.index === regex.lastIndex) {
        regex.lastIndex++;
      }

      // Add text before match
      if (match.index > lastIndex) {
        parts.push(escapeHtml(text.slice(lastIndex, match.index)));
      }

      // Add highlighted match
      const matchText = escapeHtml(match[0]);
      parts.push(
        '<span class="rounded-cyber px-0.5" style="background: rgba(202, 190, 255, 0.2); border-bottom: 2px solid rgba(202, 190, 255, 0.6);">' +
          matchText +
          '</span>'
      );

      lastIndex = match.index + match[0].length;

      // Break if not global to avoid infinite loop
      if (!regex.global) break;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(escapeHtml(text.slice(lastIndex)));
    }

    return parts.join('');
  }

  function renderMatchDetails(matches) {
    if (matches.length === 0) {
      matchDetailsCard.style.display = 'none';
      return;
    }

    matchDetailsCard.style.display = 'block';
    matchDetails.innerHTML = matches
      .map((m, i) => {
        let groupsHtml = '';
        if (m.groups.length > 0) {
          groupsHtml = m.groups
            .map(
              (g, gi) =>
                '<div class="ml-4 text-on-surface/40">' +
                '<span class="text-secondary">Group ' +
                (gi + 1) +
                ':</span> ' +
                '<span class="text-on-surface/70">' +
                escapeHtml(g === undefined ? 'undefined' : g) +
                '</span>' +
                '</div>'
            )
            .join('');
        }

        return (
          '<div class="p-3 rounded-cyber" style="background: rgba(19, 19, 19, 0.5);">' +
          '<div class="flex items-center justify-between mb-1">' +
          '<span class="text-xs font-mono text-primary">Match ' +
          (i + 1) +
          '</span>' +
          '<span class="text-xs font-mono text-on-surface/30">index ' +
          m.index +
          '</span>' +
          '</div>' +
          '<div class="font-mono text-sm text-on-surface/80 break-all">' +
          escapeHtml(m.text) +
          '</div>' +
          groupsHtml +
          '</div>'
        );
      })
      .join('');
  }

  function update() {
    const pattern = patternInput.value;
    const testStr = testInput.value;

    // Clear error
    errorEl.style.display = 'none';

    // Empty state
    if (!pattern || !testStr) {
      outputEl.innerHTML =
        '<span class="text-on-surface/30 italic">Enter a pattern and test string above</span>';
      matchCountText.textContent = 'No matches';
      matchBeacon.className = 'w-2 h-2 rounded-full bg-on-surface/20';
      matchDetailsCard.style.display = 'none';
      return;
    }

    // Build regex
    let regex;
    try {
      regex = new RegExp(pattern, getFlags());
    } catch (e) {
      errorEl.textContent = e.message;
      errorEl.style.display = 'block';
      outputEl.innerHTML =
        '<span class="text-on-surface/30 italic">Fix the pattern error above</span>';
      matchCountText.textContent = 'Invalid pattern';
      matchBeacon.className = 'w-2 h-2 rounded-full bg-red-500';
      matchDetailsCard.style.display = 'none';
      return;
    }

    // Find all matches
    const matches = [];
    let m;
    const findRegex = new RegExp(pattern, getFlags().includes('g') ? getFlags() : getFlags() + 'g');
    findRegex.lastIndex = 0;

    while ((m = findRegex.exec(testStr)) !== null) {
      if (m.index === findRegex.lastIndex) {
        findRegex.lastIndex++;
      }
      const groups = [];
      for (let i = 1; i < m.length; i++) {
        groups.push(m[i]);
      }
      matches.push({
        text: m[0],
        index: m.index,
        groups: groups,
      });
      // If original regex is not global, only show first match
      if (!getFlags().includes('g')) break;
    }

    // Update match count
    const count = matches.length;
    matchCountText.textContent =
      count === 0 ? 'No matches' : count + ' match' + (count === 1 ? '' : 'es');
    matchBeacon.className =
      'w-2 h-2 rounded-full ' + (count > 0 ? 'bg-secondary-container' : 'bg-on-surface/20');

    // Highlight output
    outputEl.innerHTML = highlightMatches(testStr, new RegExp(pattern, getFlags()));

    // Render match details
    renderMatchDetails(matches);
  }

  function debouncedUpdate() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(update, 150);
  }

  // Event listeners
  patternInput.addEventListener('input', debouncedUpdate);
  testInput.addEventListener('input', debouncedUpdate);
  Object.values(flagCheckboxes).forEach((cb) => {
    cb.addEventListener('change', debouncedUpdate);
  });
})();
