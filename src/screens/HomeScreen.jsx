import MiniChart from '../components/MiniChart';
import TransactionRow from '../components/TransactionRow';
import { CURRENCY, DAY_LABELS } from '../data/config';
import { CATEGORIES } from '../data/config';

// Formats the current month nicely e.g. "May 2026"
function currentMonthLabel() {
  return new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export default function HomeScreen({ data, onDeleteTransaction }) {
  const {
    monthIncome,
    monthExpenses,
    netFlow,
    subsTotal,
    todaySpend,
    weekSpend,
    weekChange,
    weeklyChartData,
    transactions,
    topCategoryKey,
  } = data;

  const recentTransactions = transactions.slice(0, 5);
  const topCategory = CATEGORIES.find((c) => c.key === topCategoryKey);

  // Week change display
  const weekChangeAbs = Math.abs(weekChange);
  const weekTrend = weekChange < 0 ? 'down' : weekChange > 0 ? 'up' : 'neutral';
  const weekTrendLabel = weekChange < 0
    ? `↓ ${weekChangeAbs}% vs last week`
    : weekChange > 0
    ? `↑ ${weekChangeAbs}% vs last week`
    : 'Same as last week';

  return (
    <div className="screen fade-slide-in">
      <div className="page-header">
        <div className="page-label">{currentMonthLabel()}</div>
        <div className="page-title">Money Flow</div>
      </div>

      <div className="screen-scroll">

        {/* ── Net hero card ────────────────────────────────── */}
        <div className="net-hero">
          <div className="net-hero-month">Net this month</div>
          <div className="net-hero-amount">
            <span>{CURRENCY}</span>
            {netFlow.toLocaleString()}
          </div>
          <div className="net-pills">
            <div className="net-pill">
              <div className="net-pill-label">In</div>
              <div className="net-pill-value positive">
                {CURRENCY}{monthIncome.toLocaleString()}
              </div>
            </div>
            <div className="net-pill">
              <div className="net-pill-label">Out</div>
              <div className="net-pill-value negative">
                {CURRENCY}{monthExpenses.toLocaleString()}
              </div>
            </div>
            <div className="net-pill">
              <div className="net-pill-label">Subs</div>
              <div className="net-pill-value">
                {CURRENCY}{subsTotal.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* ── Today / This week snapshots ──────────────────── */}
        <div className="snapshot-row">
          <div className="snapshot-card">
            <div className="snapshot-period">Today</div>
            <div className="snapshot-amount">
              <span>{CURRENCY}</span>{todaySpend.toLocaleString()}
            </div>
            <div className="snapshot-sub">
              {transactions.filter((t) => {
                const d = new Date().toISOString().split('T')[0];
                return t.type === 'expense' && t.date === d;
              }).length} transactions
            </div>
          </div>

          <div className="snapshot-card">
            <div className="snapshot-period">This week</div>
            <div className="snapshot-amount">
              <span>{CURRENCY}</span>{weekSpend.toLocaleString()}
            </div>
            <div className="snapshot-sub">
              <span className={`trend-badge ${weekTrend}`}>
                {weekTrendLabel}
              </span>
            </div>
          </div>
        </div>

        {/* ── Weekly spend chart ───────────────────────────── */}
        <div className="card">
          <div className="card-label">Spend trend · This week</div>
          <MiniChart
            data={weeklyChartData}
            labels={DAY_LABELS}
            activeIndex={new Date().getDay() === 0 ? 6 : new Date().getDay() - 1}
          />
        </div>

        {/* ── Insights ─────────────────────────────────────── */}
        {(topCategory || weekChange !== 0) && (
          <div className="card">
            <div className="card-label">Insights</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {topCategory && (
                <div className="insight-chip">
                  <div className="insight-icon" aria-hidden="true">📊</div>
                  <div className="insight-text">
                    <strong>{topCategory.label}</strong> is your top category this week
                  </div>
                </div>
              )}
              {weekChange !== 0 && (
                <div className="insight-chip">
                  <div className="insight-icon" aria-hidden="true">
                    {weekTrend === 'down' ? '📉' : '📈'}
                  </div>
                  <div className="insight-text">
                    Spending is{' '}
                    <strong>{weekTrend === 'down' ? `down ${weekChangeAbs}%` : `up ${weekChangeAbs}%`}</strong>
                    {' '}compared to last week
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Recent transactions ──────────────────────────── */}
        <div className="card">
          <div className="card-label">Recent transactions</div>
          {recentTransactions.length === 0 ? (
            <div className="empty-state">No transactions yet — tap + to add one</div>
          ) : (
            recentTransactions.map((tx) => (
              <TransactionRow
                key={tx.id}
                transaction={tx}
                onDelete={onDeleteTransaction}
              />
            ))
          )}
        </div>

      </div>
    </div>
  );
}
