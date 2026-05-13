import { useState } from 'react';
import MiniChart from '../components/MiniChart';
import TransactionRow from '../components/TransactionRow';
import { CATEGORIES, CURRENCY, MONTH_LABELS } from '../data/config';

// Builds last 5 months of expense totals
function buildMonthlyData(transactions) {
  const now = new Date();
  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (4 - i), 1);
    const monthStr = d.toISOString().slice(0, 7);
    return transactions
      .filter((t) => t.type === 'expense' && t.date.startsWith(monthStr))
      .reduce((sum, t) => sum + t.amount, 0);
  });
}

// Returns the YYYY-MM string for each of the last 5 months
function buildMonthKeys() {
  const now = new Date();
  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (4 - i), 1);
    return d.toISOString().slice(0, 7);
  });
}

function buildMonthlyLabels() {
  const now = new Date();
  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (4 - i), 1);
    return MONTH_LABELS[d.getMonth()];
  });
}

// "2026-05" → "May 2026"
function formatMonthKey(key) {
  const [year, month] = key.split('-');
  return `${MONTH_LABELS[parseInt(month, 10) - 1]} ${year}`;
}

export default function FlowScreen({ data, onDeleteTransaction }) {
  const { categoryTotals, transactions, monthTransactions, monthIncome, monthExpenses } = data;

  // Which month bar is selected — default is current month (index 4)
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(4);

  const monthlyData   = buildMonthlyData(transactions);
  const monthlyLabels = buildMonthlyLabels();
  const monthKeys     = buildMonthKeys();

  const selectedMonthKey   = monthKeys[selectedMonthIndex];
  const isCurrentMonth     = selectedMonthIndex === 4;
  const selectedMonthLabel = formatMonthKey(selectedMonthKey);

  // Transactions for the selected month
  const selectedTxs = transactions.filter((t) => t.date.startsWith(selectedMonthKey));
  const selectedIncome   = selectedTxs.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const selectedExpenses = selectedTxs.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  // Category breakdown for selected month
  const selectedCatTotals = selectedTxs
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => { acc[t.category] = (acc[t.category] || 0) + t.amount; return acc; }, {});

  const sortedCategories = CATEGORIES
    .map((c) => ({ ...c, total: selectedCatTotals[c.key] || 0 }))
    .filter((c) => c.total > 0)
    .sort((a, b) => b.total - a.total);

  const maxCategory = sortedCategories[0]?.total || 1;

  const incomeRatio   = Math.min(100, selectedIncome > 0 || selectedExpenses > 0
    ? Math.round((selectedIncome / Math.max(selectedIncome, selectedExpenses)) * 100) : 0);
  const expenseRatio  = Math.min(100, selectedIncome > 0 || selectedExpenses > 0
    ? Math.round((selectedExpenses / Math.max(selectedIncome, selectedExpenses)) * 100) : 0);

  return (
    <div className="screen fade-slide-in">
      <div className="page-header">
        <div className="page-label">Overview</div>
        <div className="page-title">Flow</div>
      </div>

      <div className="screen-scroll">

        {/* ── Monthly comparison chart — tappable ──────────── */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
            <div className="card-label" style={{ marginBottom: 0 }}>Monthly comparison</div>
            {!isCurrentMonth && (
              <button
                onClick={() => setSelectedMonthIndex(4)}
                style={{ fontSize: 11, color: 'var(--gray-400)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--ff)' }}
              >
                Back to this month
              </button>
            )}
          </div>
          <MiniChart
            data={monthlyData}
            labels={monthlyLabels}
            activeIndex={selectedMonthIndex}
            onBarClick={(i) => setSelectedMonthIndex(i)}
          />
        </div>

        {/* ── Money flow for selected month ─────────────────── */}
        <div className="card">
          <div className="card-label">Money flow · {selectedMonthLabel}</div>
          <div className="flow-bar-wrap">
            <div className="flow-bar-labels">
              <span>Income</span>
              <span>{CURRENCY}{selectedIncome.toLocaleString()}</span>
            </div>
            <div className="flow-track">
              <div className="flow-fill" style={{ width: `${incomeRatio}%` }} />
            </div>
          </div>
          <div className="flow-bar-wrap">
            <div className="flow-bar-labels">
              <span>Expenses</span>
              <span>{CURRENCY}{selectedExpenses.toLocaleString()}</span>
            </div>
            <div className="flow-track">
              <div className="flow-fill muted" style={{ width: `${expenseRatio}%` }} />
            </div>
          </div>
        </div>

        {/* ── Category breakdown for selected month ────────── */}
        {sortedCategories.length > 0 && (
          <div className="card">
            <div className="card-label">Categories · {selectedMonthLabel}</div>
            <div className="cat-breakdown">
              {sortedCategories.map((cat) => (
                <div key={cat.key} className="cat-row-item">
                  <span className="cat-name">{cat.label}</span>
                  <div className="cat-track">
                    <div className="cat-fill" style={{ width: `${Math.round((cat.total / maxCategory) * 100)}%` }} />
                  </div>
                  <span className="cat-value">{CURRENCY}{cat.total.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Transactions for selected month ───────────────── */}
        <div className="card">
          <div className="card-label">
            {selectedMonthLabel} · {selectedTxs.length} transaction{selectedTxs.length !== 1 ? 's' : ''}
          </div>
          {selectedTxs.length === 0 ? (
            <div className="empty-state">No transactions for {selectedMonthLabel}</div>
          ) : (
            [...selectedTxs]
              .sort((a, b) => b.date.localeCompare(a.date))
              .map((tx) => (
                <TransactionRow key={tx.id} transaction={tx} onDelete={onDeleteTransaction} />
              ))
          )}
        </div>

      </div>
    </div>
  );
}
