import { useState } from 'react';
import MiniChart from '../components/MiniChart';
import TransactionRow from '../components/TransactionRow';
import { CURRENCY, DAY_LABELS } from '../data/config';
import { CATEGORIES } from '../data/config';

function currentMonthLabel() {
  return new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

// Returns YYYY-MM-DD for N days offset from today
function offsetDate(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

// e.g. "2026-05-13" → "Tuesday, May 13"
function formatFullDate(dateStr) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  });
}

export default function HomeScreen({ data, onDeleteTransaction }) {
  const {
    monthIncome, monthExpenses, netFlow, subsTotal,
    todaySpend, weekSpend, weekChange,
    weeklyChartData, transactions, topCategoryKey,
  } = data;

  // Which day bar is selected (0=6 days ago … 6=today). Default = today.
  const todayDowIndex = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
  const [selectedDayIndex, setSelectedDayIndex] = useState(6);

  const recentTransactions = transactions.slice(0, 5);
  const topCategory = CATEGORIES.find((c) => c.key === topCategoryKey);

  const weekTrend = weekChange < 0 ? 'down' : weekChange > 0 ? 'up' : 'neutral';
  const weekChangeAbs = Math.abs(weekChange);
  const weekTrendLabel = weekChange < 0
    ? `↓ ${weekChangeAbs}% vs last week`
    : weekChange > 0
    ? `↑ ${weekChangeAbs}% vs last week`
    : 'Same as last week';

  // Transactions for the selected day bar
  const selectedDate = offsetDate(selectedDayIndex - 6);
  const selectedDayTxs = transactions.filter(
    (t) => t.type === 'expense' && t.date === selectedDate
  );
  const selectedDayTotal = selectedDayTxs.reduce((s, t) => s + t.amount, 0);
  const isToday = selectedDayIndex === 6;

  return (
    <div className="screen fade-slide-in">
      <div className="page-header">
        <div className="page-label">{currentMonthLabel()}</div>
        <div className="page-title">Money Flow</div>
      </div>

      <div className="screen-scroll">

        {/* ── Net hero ─────────────────────────────────────── */}
        <div className="net-hero">
          <div className="net-hero-month">Net this month</div>
          <div className="net-hero-amount">
            <span>{CURRENCY}</span>{netFlow.toLocaleString()}
          </div>
          <div className="net-pills">
            <div className="net-pill">
              <div className="net-pill-label">In</div>
              <div className="net-pill-value positive">{CURRENCY}{monthIncome.toLocaleString()}</div>
            </div>
            <div className="net-pill">
              <div className="net-pill-label">Out</div>
              <div className="net-pill-value negative">{CURRENCY}{monthExpenses.toLocaleString()}</div>
            </div>
            <div className="net-pill">
              <div className="net-pill-label">Subs</div>
              <div className="net-pill-value">{CURRENCY}{subsTotal.toLocaleString()}</div>
            </div>
          </div>
        </div>

        {/* ── Snapshots ─────────────────────────────────────── */}
        <div className="snapshot-row">
          <div className="snapshot-card">
            <div className="snapshot-period">Today</div>
            <div className="snapshot-amount"><span>{CURRENCY}</span>{todaySpend.toLocaleString()}</div>
            <div className="snapshot-sub">
              {transactions.filter((t) => t.type === 'expense' && t.date === new Date().toISOString().split('T')[0]).length} transactions
            </div>
          </div>
          <div className="snapshot-card">
            <div className="snapshot-period">This week</div>
            <div className="snapshot-amount"><span>{CURRENCY}</span>{weekSpend.toLocaleString()}</div>
            <div className="snapshot-sub">
              <span className={`trend-badge ${weekTrend}`}>{weekTrendLabel}</span>
            </div>
          </div>
        </div>

        {/* ── Weekly spend chart — tappable ─────────────────── */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
            <div className="card-label" style={{ marginBottom: 0 }}>Spend trend · This week</div>
            {!isToday && (
              <button
                onClick={() => setSelectedDayIndex(6)}
                style={{ fontSize: 11, color: 'var(--gray-400)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--ff)' }}
              >
                Back to today
              </button>
            )}
          </div>

          <MiniChart
            data={weeklyChartData}
            labels={DAY_LABELS}
            activeIndex={selectedDayIndex}
            onBarClick={(i) => setSelectedDayIndex(i)}
          />

          {/* Selected day detail */}
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: '0.5px solid var(--gray-100)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                {isToday ? 'Today' : formatFullDate(selectedDate)}
              </span>
              <span style={{ fontSize: 16, fontWeight: 500, color: 'var(--black)' }}>
                {CURRENCY}{selectedDayTotal.toLocaleString()}
              </span>
            </div>
            {selectedDayTxs.length === 0 ? (
              <div style={{ fontSize: 13, color: 'var(--gray-400)', padding: '8px 0' }}>Nothing spent this day</div>
            ) : (
              selectedDayTxs.map((tx) => (
                <TransactionRow key={tx.id} transaction={tx} onDelete={onDeleteTransaction} />
              ))
            )}
          </div>
        </div>

        {/* ── Insights ──────────────────────────────────────── */}
        {(topCategory || weekChange !== 0) && (
          <div className="card">
            <div className="card-label">Insights</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {topCategory && (
                <div className="insight-chip">
                  <div className="insight-icon" aria-hidden="true">📊</div>
                  <div className="insight-text"><strong>{topCategory.label}</strong> is your top category this week</div>
                </div>
              )}
              {weekChange !== 0 && (
                <div className="insight-chip">
                  <div className="insight-icon" aria-hidden="true">{weekTrend === 'down' ? '📉' : '📈'}</div>
                  <div className="insight-text">
                    Spending is <strong>{weekTrend === 'down' ? `down ${weekChangeAbs}%` : `up ${weekChangeAbs}%`}</strong> vs last week
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Recent transactions ───────────────────────────── */}
        <div className="card">
          <div className="card-label">Recent transactions</div>
          {recentTransactions.length === 0 ? (
            <div className="empty-state">No transactions yet — tap + to add one</div>
          ) : (
            recentTransactions.map((tx) => (
              <TransactionRow key={tx.id} transaction={tx} onDelete={onDeleteTransaction} />
            ))
          )}
        </div>

      </div>
    </div>
  );
}
