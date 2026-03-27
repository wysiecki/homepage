(function () {
  'use strict';

  const cronInput = document.getElementById('cron-input');
  const descriptionEl = document.getElementById('cron-description');
  const nextRunsEl = document.getElementById('cron-next-runs');
  const errorEl = document.getElementById('cron-error');
  const fieldEls = [0, 1, 2, 3, 4].map((i) => document.getElementById('cron-field-' + i));

  const FIELD_NAMES = ['minute', 'hour', 'day of month', 'month', 'day of week'];
  const FIELD_RANGES = [
    [0, 59],
    [0, 23],
    [1, 31],
    [1, 12],
    [0, 7],
  ];

  const MONTH_NAMES = [
    '',
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const DOW_NAMES = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];

  let debounceTimer = null;

  // Parse a single cron field into an array of valid values
  function parseField(field, min, max) {
    const values = new Set();

    const parts = field.split(',');
    for (const part of parts) {
      if (part === '*') {
        for (let i = min; i <= max; i++) values.add(i);
      } else if (part.includes('/')) {
        const [range, stepStr] = part.split('/');
        const step = parseInt(stepStr, 10);
        if (isNaN(step) || step <= 0) throw new Error('Invalid step: ' + part);
        let start = min;
        let end = max;
        if (range !== '*') {
          if (range.includes('-')) {
            const [a, b] = range.split('-').map(Number);
            start = a;
            end = b;
          } else {
            start = parseInt(range, 10);
          }
        }
        for (let i = start; i <= end; i += step) values.add(i);
      } else if (part.includes('-')) {
        const [a, b] = part.split('-').map(Number);
        if (isNaN(a) || isNaN(b)) throw new Error('Invalid range: ' + part);
        for (let i = a; i <= b; i++) values.add(i);
      } else {
        const val = parseInt(part, 10);
        if (isNaN(val)) throw new Error('Invalid value: ' + part);
        values.add(val);
      }
    }

    // Validate all values are in range
    for (const v of values) {
      if (v < min || v > max) {
        throw new Error(
          'Value ' +
            v +
            ' out of range for ' +
            FIELD_NAMES[FIELD_RANGES.findIndex((r) => r[0] === min && r[1] === max)] +
            ' (' +
            min +
            '-' +
            max +
            ')'
        );
      }
    }

    return Array.from(values).sort((a, b) => a - b);
  }

  // Generate human-readable description
  function describeField(field, fieldIndex) {
    if (field === '*') return '';

    const [min, max] = FIELD_RANGES[fieldIndex];

    if (field.includes('/')) {
      const [range, step] = field.split('/');
      if (range === '*') {
        return 'every ' + step + ' ' + FIELD_NAMES[fieldIndex] + (parseInt(step) > 1 ? 's' : '');
      }
      return 'every ' + step + ' ' + FIELD_NAMES[fieldIndex] + 's from ' + range;
    }

    if (field.includes(',')) {
      const vals = field.split(',');
      if (fieldIndex === 4) return vals.map((v) => DOW_NAMES[parseInt(v)] || v).join(', ');
      if (fieldIndex === 3) return vals.map((v) => MONTH_NAMES[parseInt(v)] || v).join(', ');
      return vals.join(', ');
    }

    if (field.includes('-')) {
      const [a, b] = field.split('-');
      if (fieldIndex === 4)
        return (DOW_NAMES[parseInt(a)] || a) + ' through ' + (DOW_NAMES[parseInt(b)] || b);
      if (fieldIndex === 3)
        return (MONTH_NAMES[parseInt(a)] || a) + ' through ' + (MONTH_NAMES[parseInt(b)] || b);
      return a + ' through ' + b;
    }

    if (fieldIndex === 4) return DOW_NAMES[parseInt(field)] || field;
    if (fieldIndex === 3) return MONTH_NAMES[parseInt(field)] || field;

    return field;
  }

  function generateDescription(fields) {
    const [minute, hour, dom, month, dow] = fields;
    const parts = [];

    // Time description
    if (minute === '*' && hour === '*') {
      parts.push('Every minute');
    } else if (minute === '*') {
      parts.push('Every minute');
      if (hour !== '*') {
        parts.push('during hour ' + describeField(hour, 1));
      }
    } else if (hour === '*') {
      if (minute.includes('/')) {
        parts.push(
          describeField(minute, 0).charAt(0).toUpperCase() + describeField(minute, 0).slice(1)
        );
      } else {
        parts.push('At minute ' + describeField(minute, 0) + ' of every hour');
      }
    } else {
      // Specific time
      const hourVal =
        hour.includes(',') || hour.includes('-') || hour.includes('/') ? null : parseInt(hour);
      const minVal =
        minute.includes(',') || minute.includes('-') || minute.includes('/')
          ? null
          : parseInt(minute);

      if (hourVal !== null && minVal !== null && !isNaN(hourVal) && !isNaN(minVal)) {
        const h = hourVal % 12 || 12;
        const ampm = hourVal < 12 ? 'AM' : 'PM';
        const m = minVal.toString().padStart(2, '0');
        parts.push('At ' + h + ':' + m + ' ' + ampm);
      } else {
        if (minute.includes('/')) {
          parts.push(
            describeField(minute, 0).charAt(0).toUpperCase() + describeField(minute, 0).slice(1)
          );
        } else {
          parts.push('At minute ' + describeField(minute, 0));
        }
        if (hour !== '*') {
          parts.push('past hour ' + describeField(hour, 1));
        }
      }
    }

    // Day of month
    if (dom !== '*') {
      parts.push('on day ' + describeField(dom, 2) + ' of the month');
    }

    // Month
    if (month !== '*') {
      parts.push('in ' + describeField(month, 3));
    }

    // Day of week
    if (dow !== '*') {
      const dowDesc = describeField(dow, 4);
      if (dom === '*') {
        parts.push('on ' + dowDesc);
      } else {
        parts.push('and on ' + dowDesc);
      }
    }

    return parts.join(', ') + '.';
  }

  // Calculate next N run times
  function getNextRuns(fields, n) {
    const [minuteVals, hourVals, domVals, monthVals, dowVals] = fields.map((f, i) =>
      parseField(f, FIELD_RANGES[i][0], FIELD_RANGES[i][1])
    );

    // Normalize day-of-week: 7 -> 0 (both mean Sunday)
    const normalizedDow = dowVals.map((d) => (d === 7 ? 0 : d));
    const dowSet = new Set(normalizedDow);
    const monthSet = new Set(monthVals);
    const domSet = new Set(domVals);
    const hourSet = new Set(hourVals);
    const minuteSet = new Set(minuteVals);

    const runs = [];
    const now = new Date();
    const candidate = new Date(now);
    candidate.setSeconds(0);
    candidate.setMilliseconds(0);
    // Start from next minute
    candidate.setMinutes(candidate.getMinutes() + 1);

    const maxIterations = 525600; // One year of minutes
    let iterations = 0;

    while (runs.length < n && iterations < maxIterations) {
      iterations++;

      const cMonth = candidate.getMonth() + 1;
      const cDom = candidate.getDate();
      const cDow = candidate.getDay();
      const cHour = candidate.getHours();
      const cMinute = candidate.getMinutes();

      if (
        monthSet.has(cMonth) &&
        domSet.has(cDom) &&
        dowSet.has(cDow) &&
        hourSet.has(cHour) &&
        minuteSet.has(cMinute)
      ) {
        runs.push(new Date(candidate));
      }

      candidate.setMinutes(candidate.getMinutes() + 1);
    }

    return runs;
  }

  function formatDate(date) {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];

    const day = days[date.getDay()];
    const month = months[date.getMonth()];
    const dom = date.getDate();
    const year = date.getFullYear();
    const h = date.getHours();
    const m = date.getMinutes().toString().padStart(2, '0');
    const ampm = h < 12 ? 'AM' : 'PM';
    const h12 = h % 12 || 12;

    return day + ', ' + month + ' ' + dom + ', ' + year + ' at ' + h12 + ':' + m + ' ' + ampm;
  }

  function relativeTime(date) {
    const now = new Date();
    const diffMs = date - now;
    const diffMin = Math.floor(diffMs / 60000);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffMin < 1) return 'now';
    if (diffMin < 60) return 'in ' + diffMin + ' min';
    if (diffHour < 24) return 'in ' + diffHour + 'h ' + (diffMin % 60) + 'm';
    if (diffDay < 7) return 'in ' + diffDay + ' day' + (diffDay > 1 ? 's' : '');
    return 'in ' + Math.floor(diffDay / 7) + ' week' + (Math.floor(diffDay / 7) > 1 ? 's' : '');
  }

  function update() {
    const raw = cronInput.value.trim();
    errorEl.style.display = 'none';

    if (!raw) {
      descriptionEl.textContent = 'Enter a cron expression above.';
      nextRunsEl.innerHTML = '';
      fieldEls.forEach((el) => (el.textContent = ''));
      return;
    }

    const fields = raw.split(/\s+/);
    if (fields.length !== 5) {
      errorEl.textContent =
        'Expected 5 fields (minute hour day-of-month month day-of-week), got ' +
        fields.length +
        '.';
      errorEl.style.display = 'block';
      descriptionEl.textContent = '';
      nextRunsEl.innerHTML = '';
      return;
    }

    // Update visual field breakdown
    fields.forEach((f, i) => {
      if (fieldEls[i]) fieldEls[i].textContent = f;
    });

    // Validate and generate description
    try {
      // Validate all fields parse correctly
      fields.forEach((f, i) => parseField(f, FIELD_RANGES[i][0], FIELD_RANGES[i][1]));

      const description = generateDescription(fields);
      descriptionEl.textContent = description;

      // Calculate next runs
      const runs = getNextRuns(fields, 5);
      if (runs.length === 0) {
        nextRunsEl.innerHTML =
          '<p class="text-on-surface/30 text-sm italic">No upcoming runs found within the next year.</p>';
      } else {
        nextRunsEl.innerHTML = runs
          .map(
            (date, i) =>
              '<div class="flex items-center justify-between py-2 px-3 rounded-cyber' +
              (i % 2 === 0 ? '' : '') +
              '" style="background: rgba(19, 19, 19, 0.3);">' +
              '<div class="flex items-center gap-3">' +
              '<span class="text-xs font-mono text-primary w-4">' +
              (i + 1) +
              '</span>' +
              '<span class="text-sm font-mono text-on-surface/70">' +
              formatDate(date) +
              '</span>' +
              '</div>' +
              '<span class="text-xs font-mono text-on-surface/30">' +
              relativeTime(date) +
              '</span>' +
              '</div>'
          )
          .join('');
      }
    } catch (e) {
      errorEl.textContent = e.message;
      errorEl.style.display = 'block';
      descriptionEl.textContent = '';
      nextRunsEl.innerHTML = '';
    }
  }

  function debouncedUpdate() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(update, 150);
  }

  // Event listeners
  cronInput.addEventListener('input', debouncedUpdate);

  // Preset buttons
  document.querySelectorAll('[data-cron]').forEach((btn) => {
    btn.addEventListener('click', () => {
      cronInput.value = btn.getAttribute('data-cron');
      update();
    });
  });

  // Initial render
  update();
})();
