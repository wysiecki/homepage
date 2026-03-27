/**
 * Self-contained analytics dashboard HTML template.
 * Rendered by Express, uses Chart.js for visualizations.
 */

function generateDashboard() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Analytics — wysiecki.de</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg: #0a0a0f;
      --surface: #12121a;
      --surface-2: #1a1a26;
      --surface-3: #22222e;
      --border: #2a2a3a;
      --text: #e4e4ed;
      --text-muted: #8888a0;
      --primary: #a855f7;
      --primary-dim: rgba(168, 85, 247, 0.15);
      --cyan: #22d3ee;
      --pink: #ec4899;
      --green: #34d399;
      --amber: #fbbf24;
      --red: #f87171;
    }
    body {
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.5;
      min-height: 100vh;
    }
    .container { max-width: 1200px; margin: 0 auto; padding: 2rem 1.5rem; }
    header {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem;
    }
    header h1 { font-size: 1.5rem; font-weight: 700; letter-spacing: -0.02em; }
    header h1 span { color: var(--primary); }
    .range-btns { display: flex; gap: 0.5rem; }
    .range-btns button {
      padding: 0.4rem 1rem; border-radius: 0.5rem;
      border: 1px solid var(--border); background: var(--surface);
      color: var(--text-muted); cursor: pointer; font-size: 0.8rem;
      font-weight: 500; transition: all 0.15s;
    }
    .range-btns button:hover { border-color: var(--primary); color: var(--text); }
    .range-btns button.active {
      background: var(--primary-dim); border-color: var(--primary);
      color: var(--primary);
    }
    .cards {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem; margin-bottom: 2rem;
    }
    .card {
      background: var(--surface); border: 1px solid var(--border);
      border-radius: 0.75rem; padding: 1.25rem;
    }
    .card-label { font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.25rem; }
    .card-value { font-size: 1.75rem; font-weight: 700; letter-spacing: -0.02em; }
    .card-sub { font-size: 0.75rem; color: var(--text-muted); margin-top: 0.25rem; }
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem; }
    .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; margin-bottom: 1rem; }
    @media (max-width: 900px) { .grid-2, .grid-3 { grid-template-columns: 1fr; } }
    .panel {
      background: var(--surface); border: 1px solid var(--border);
      border-radius: 0.75rem; padding: 1.25rem; margin-bottom: 1rem;
    }
    .panel h2 { font-size: 0.85rem; font-weight: 600; color: var(--text-muted); margin-bottom: 1rem; text-transform: uppercase; letter-spacing: 0.05em; }
    .chart-wrap { position: relative; height: 280px; }
    .chart-wrap-sm { position: relative; height: 220px; }
    table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
    th { text-align: left; color: var(--text-muted); font-weight: 500; padding: 0.5rem 0; border-bottom: 1px solid var(--border); }
    td { padding: 0.5rem 0; border-bottom: 1px solid var(--border); }
    td:last-child, th:last-child { text-align: right; }
    .bar { display: flex; align-items: center; gap: 0.75rem; }
    .bar-fill { height: 6px; border-radius: 3px; background: var(--primary); min-width: 2px; }
    .loading { text-align: center; padding: 4rem; color: var(--text-muted); }
    .error { color: var(--red); text-align: center; padding: 2rem; }
    .mono { font-family: 'Roboto Mono', monospace; }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1><span>&#9679;</span> Analytics</h1>
      <div class="range-btns">
        <button data-range="today">Today</button>
        <button data-range="7d" class="active">7 Days</button>
        <button data-range="30d">30 Days</button>
        <button data-range="all">All Time</button>
      </div>
    </header>

    <div id="content">
      <div class="loading">Loading analytics data&hellip;</div>
    </div>
  </div>

  <script src="/api/analytics/static/chart.min.js"></script>
  <script>
    (function() {
      const TOKEN = new URLSearchParams(location.search).get('token') || '';
      let currentRange = '7d';
      let charts = {};

      const RANGES = {
        today: { from: today(), to: today() },
        '7d': { from: daysAgo(7), to: today() },
        '30d': { from: daysAgo(30), to: today() },
        all: { from: '2000-01-01', to: today() },
      };

      function today() { return new Date().toISOString().slice(0, 10); }
      function daysAgo(n) { const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString().slice(0, 10); }

      // Range buttons
      document.querySelectorAll('.range-btns button').forEach(btn => {
        btn.addEventListener('click', () => {
          document.querySelectorAll('.range-btns button').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          currentRange = btn.dataset.range;
          loadData();
        });
      });

      async function loadData() {
        const r = RANGES[currentRange];
        try {
          const res = await fetch('/api/analytics/data?from=' + r.from + '&to=' + r.to + '&token=' + TOKEN);
          if (!res.ok) throw new Error('HTTP ' + res.status);
          const data = await res.json();
          render(data);
        } catch (err) {
          document.getElementById('content').innerHTML =
            '<div class="error">Failed to load data: ' + err.message + '</div>';
        }
      }

      function render(data) {
        const s = data.summary[currentRange] || data.summary['30d'];
        const topPage = data.topPages[0];

        document.getElementById('content').innerHTML = [
          // Summary cards
          '<div class="cards">',
            card('Page Views', fmt(s.views), ''),
            card('Unique Visitors', fmt(s.visitors), ''),
            card('Top Page', topPage ? topPage.path : '—', topPage ? fmt(topPage.views) + ' views' : ''),
            card('Pages / Visitor', s.visitors ? (s.views / s.visitors).toFixed(1) : '—', ''),
          '</div>',

          // Views over time
          '<div class="panel"><h2>Views Over Time</h2><div class="chart-wrap"><canvas id="chart-views"></canvas></div></div>',

          // Top pages + referrers
          '<div class="grid-2">',
            '<div class="panel"><h2>Top Pages</h2>' + tableHTML(data.topPages, 'path', 'views') + '</div>',
            '<div class="panel"><h2>Top Referrers</h2>' + tableHTML(data.topReferrers, 'referrer', 'views') + '</div>',
          '</div>',

          // Browsers + OS + Devices
          '<div class="grid-3">',
            '<div class="panel"><h2>Browsers</h2><div class="chart-wrap-sm"><canvas id="chart-browsers"></canvas></div></div>',
            '<div class="panel"><h2>Operating Systems</h2><div class="chart-wrap-sm"><canvas id="chart-os"></canvas></div></div>',
            '<div class="panel"><h2>Devices</h2><div class="chart-wrap-sm"><canvas id="chart-devices"></canvas></div></div>',
          '</div>',

          // Countries
          '<div class="panel"><h2>Countries</h2>' + tableHTML(data.countries, 'country', 'count') + '</div>',
        ].join('');

        renderCharts(data);
      }

      function card(label, value, sub) {
        return '<div class="card"><div class="card-label">' + label + '</div><div class="card-value">' + value + '</div>' +
          (sub ? '<div class="card-sub">' + sub + '</div>' : '') + '</div>';
      }

      function fmt(n) {
        if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
        if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
        return String(n);
      }

      function tableHTML(rows, keyCol, valCol) {
        if (!rows || !rows.length) return '<p style="color:var(--text-muted);font-size:0.85rem;">No data yet.</p>';
        const max = Math.max(...rows.map(r => r[valCol]));
        return '<table>' + rows.map(r => {
          const pct = max > 0 ? (r[valCol] / max * 100) : 0;
          const displayKey = esc(String(r[keyCol] || '(direct)'));
          return '<tr><td><div class="bar"><div class="bar-fill" style="width:' + pct + '%"></div><span>' +
            displayKey + '</span></div></td><td class="mono">' + fmt(r[valCol]) + '</td></tr>';
        }).join('') + '</table>';
      }

      function esc(s) {
        return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
      }

      function renderCharts(data) {
        // Destroy old charts
        Object.values(charts).forEach(c => c.destroy());
        charts = {};

        const gridColor = 'rgba(255,255,255,0.06)';
        const tickColor = '#8888a0';

        Chart.defaults.color = tickColor;
        Chart.defaults.font.family = "'Inter', system-ui, sans-serif";

        // Views over time (line)
        const vot = data.viewsOverTime || [];
        charts.views = new Chart(document.getElementById('chart-views'), {
          type: 'line',
          data: {
            labels: vot.map(d => d.date.slice(5)),
            datasets: [
              {
                label: 'Views',
                data: vot.map(d => d.views),
                borderColor: '#a855f7',
                backgroundColor: 'rgba(168, 85, 247, 0.1)',
                fill: true,
                tension: 0.3,
                pointRadius: vot.length > 30 ? 0 : 3,
                pointHoverRadius: 5,
              },
              {
                label: 'Visitors',
                data: vot.map(d => d.visitors),
                borderColor: '#22d3ee',
                backgroundColor: 'rgba(34, 211, 238, 0.08)',
                fill: true,
                tension: 0.3,
                pointRadius: vot.length > 30 ? 0 : 3,
                pointHoverRadius: 5,
              },
            ],
          },
          options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { position: 'top', labels: { usePointStyle: true, padding: 16 } } },
            scales: {
              x: { grid: { color: gridColor }, ticks: { maxTicksLimit: 14 } },
              y: { grid: { color: gridColor }, beginAtZero: true },
            },
          },
        });

        // Doughnut helper
        const COLORS = ['#a855f7', '#22d3ee', '#ec4899', '#34d399', '#fbbf24', '#f87171', '#818cf8', '#fb923c'];

        function doughnut(id, items, labelKey, valKey) {
          charts[id] = new Chart(document.getElementById(id), {
            type: 'doughnut',
            data: {
              labels: items.map(i => i[labelKey]),
              datasets: [{
                data: items.map(i => i[valKey]),
                backgroundColor: COLORS.slice(0, items.length),
                borderWidth: 0,
              }],
            },
            options: {
              responsive: true, maintainAspectRatio: false,
              cutout: '65%',
              plugins: {
                legend: { position: 'right', labels: { usePointStyle: true, padding: 12, font: { size: 11 } } },
              },
            },
          });
        }

        doughnut('chart-browsers', data.browsers || [], 'browser', 'count');
        doughnut('chart-os', data.operatingSystems || [], 'os', 'count');
        doughnut('chart-devices', data.devices || [], 'deviceType', 'count');
      }

      loadData();
    })();
  </script>
</body>
</html>`;
}

module.exports = { generateDashboard };
