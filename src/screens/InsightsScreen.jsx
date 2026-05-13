import { CATEGORIES, CURRENCY } from '../data/config';

// Day-of-week labels
const DOW_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Builds spend totals per day of the week (0=Sun … 6=Sat) from all transactions
function buildDayOfWeekData(transactions) {
  const totals = Array(7).fill(0);
  transactions
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      const dow = new Date(t.date + 'T00:00:00').getDay();
      totals[dow] += t.amount;
    });
  return totals;
}

export default function InsightsScreen({ data }) {
  const {
    monthIncome,
    monthExpenses,
    weekSpend,
    lastWeekSpend,
    weekChange,
    topCategoryKey,
    weekCategoryTotals,
    transactions,
  } = data;

  const topCategory = CATEGORIES.find((c) => c.key === topCategoryKey);
  const topCategoryWeekSpend = weekCategoryTotals[topCategoryKey] || 0;
  const topCategoryTxCount = transactions.filter(
    (t) => t.type === 'expense' && t.category === topCategoryKey
  ).length;

  const weekTrend = weekChange < 0 ? 'down' : weekChange > 0 ? 'up' : 'neutral';
  const weekChangeAbs = Math.abs(weekChange);

  const spendingPct = monthIncome > 0
    ? Math.min(100, Math.round((monthExpenses / monthIncome) * 100))
    : 0;

  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  const daysRemaining = daysInMonth - new Date().getDate();

  const dowData = buildDayOfWeekData(transactions);
  const maxDow = Math.max(...dowData, 1);
  // Sort by value descending, show top 5 days
  const sortedDow = DOW_LABELS
    .map((label, i) => ({ label, total: dowData[i] }))
    .filter((d) => d.total > 0)
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  return (
    <div className="screen fade-slide-in">
      <div className="page-header">
        <div className="page-label">Patterns</div>
        <div className="page-title">Insights</div>
      </div>

      <div className="screen-scroll">

        {/* ── Top category ─────────────────────────────────── */}
        {topCategory ? (
          <div className="big-insight">
            <div className="big-insight-head">
              <div className="big-insight-label">Top category · This week</div>
              <div className="big-insight-tag">{topCategory.label}</div>
            </div>
            <div className="big-insight-val">
              {CURRENCY}{topCategoryWeekSpend.toLocaleString()}
            </div>
            <div className="big-insight-sub">
              {topCategory.emoji} {topCategory.label} — across {topCategoryTxCount} transaction{topCategoryTxCount !== 1 ? 's' : ''}
            </div>
          </div>
        ) : (
          <div className="big-insight">
            <div className="big-insight-label">Top category · This week</div>
            <div className="big-insight-sub" style={{ marginTop: 8 }}>
              Add some expenses to see your top spending category
            </div>
          </div>
        )}

        {/* ── Week vs last week ────────────────────────────── */}
        <div className="big-insight">
          <div className="big-insight-head">
            <div className="big-insight-label">Week vs last week</div>
            {weekChange !== 0 && (
              <span className={`trend-badge ${weekTrend}`}>
                {weekTrend === 'down' ? `↓ ${weekChangeAbs}% less` : `↑ ${weekChangeAbs}% more`}
              </span>
            )}
          </div>
          <div className="big-insight-val">
            {CURRENCY}{weekSpend.toLocaleString()}{' '}
            {lastWeekSpend > 0 && (
              <small>vs {CURRENCY}{lastWeekSpend.toLocaleString()}</small>
            )}
          </div>
          <div className="big-insight-sub">
            {weekChange < 0
              ? 'Spending decreased this week — good awareness'
              : weekChange > 0
              ? 'Spending increased compared to last week'
              : lastWeekSpend === 0
              ? 'Not enough data to compare yet'
              : 'Same spending level as last week'}
          </div>
        </div>

        {/* ── Spending pace ─────────────────────────────────── */}
        {monthIncome > 0 && (
          <div className="big-insight">
            <div className="big-insight-head">
              <div className="big-insight-label">Spending pace · This month</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '8px' }}>
              <div className="big-insight-val" style={{ marginBottom: 0 }}>
                {CURRENCY}{monthExpenses.toLocaleString()}
              </div>
              <span style={{ fontSize: '13px', color: 'var(--gray-400)' }}>
                of {CURRENCY}{monthIncome.toLocaleString()} income
              </span>
            </div>
            <div style={{
              height: '5px',
              background: 'var(--gray-100)',
              borderRadius: '3px',
              overflow: 'hidden',
              marginBottom: '8px',
            }}>
              <div style={{
                width: `${spendingPct}%`,
                height: '100%',
                borderRadius: '3px',
                background: spendingPct > 85 ? 'var(--red-mid)' : 'var(--black)',
                transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)',
              }} />
            </div>
            <div className="big-insight-sub">
              {spendingPct}% of income spent — {daysRemaining} day{daysRemaining !== 1 ? 's' : ''} remaining
            </div>
          </div>
        )}

        {/* ── Spend by day of week ─────────────────────────── */}
        {sortedDow.length > 0 && (
          <div className="card">
            <div className="card-label">Spend by day of week</div>
            <div className="cat-breakdown">
              {sortedDow.map(({ label, total }) => (
                <div key={label} className="cat-row-item">
                  <span className="cat-name">{label}</span>
                  <div className="cat-track">
                    <div
                      className="cat-fill"
                      style={{ width: `${Math.round((total / maxDow) * 100)}%` }}
                    />
                  </div>
                  <span className="cat-value">
                    {CURRENCY}{Math.round(total).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Empty nudge ──────────────────────────────────── */}
        {transactions.filter((t) => t.type === 'expense').length === 0 && (
          <div className="empty-state">
            Add a few expenses and insights will appear here
          </div>
        )}

      </div>
    </div>
  );
}
