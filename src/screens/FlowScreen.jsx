import MiniChart from '../components/MiniChart';
import TransactionRow from '../components/TransactionRow';
import { CATEGORIES, CURRENCY, MONTH_LABELS } from '../data/config';

// Builds the last 5 months of total expense data for the monthly chart
function buildMonthlyData(transactions) {
  const now = new Date();
  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (4 - i), 1);
    const monthStr = d.toISOString().slice(0, 7); // "YYYY-MM"
    return transactions
      .filter((t) => t.type === 'expense' && t.date.startsWith(monthStr))
      .reduce((sum, t) => sum + t.amount, 0);
  });
}

function buildMonthlyLabels() {
  const now = new Date();
  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (4 - i), 1);
    return MONTH_LABELS[d.getMonth()];
  });
}

export default function FlowScreen({ data, onDeleteTransaction }) {
  const { monthIncome, monthExpenses, categoryTotals, transactions, monthTransactions } = data;

  const sortedCategories = CATEGORIES
    .map((c) => ({ ...c, total: categoryTotals[c.key] || 0 }))
    .filter((c) => c.total > 0)
    .sort((a, b) => b.total - a.total);

  const maxCategory = sortedCategories[0]?.total || 1;

  const monthlyData = buildMonthlyData(transactions);
  const monthlyLabels = buildMonthlyLabels();

  const incomeRatio = monthIncome > 0
    ? Math.min(100, Math.round((monthIncome / Math.max(monthIncome, monthExpenses)) * 100))
    : 0;
  const expenseRatio = monthIncome > 0
    ? Math.min(100, Math.round((monthExpenses / Math.max(monthIncome, monthExpenses)) * 100))
    : 0;

  return (
    <div className="screen fade-slide-in">
      <div className="page-header">
        <div className="page-label">Overview</div>
        <div className="page-title">Flow</div>
      </div>

      <div className="screen-scroll">

        {/* ── Income vs Expenses bar ───────────────────────── */}
        <div className="card">
          <div className="card-label">Money flow · This month</div>

          <div className="flow-bar-wrap">
            <div className="flow-bar-labels">
              <span>Income</span>
              <span>{CURRENCY}{monthIncome.toLocaleString()}</span>
            </div>
            <div className="flow-track">
              <div className="flow-fill" style={{ width: `${incomeRatio}%` }} />
            </div>
          </div>

          <div className="flow-bar-wrap">
            <div className="flow-bar-labels">
              <span>Expenses</span>
              <span>{CURRENCY}{monthExpenses.toLocaleString()}</span>
            </div>
            <div className="flow-track">
              <div className="flow-fill muted" style={{ width: `${expenseRatio}%` }} />
            </div>
          </div>
        </div>

        {/* ── Category breakdown ───────────────────────────── */}
        {sortedCategories.length > 0 && (
          <div className="card">
            <div className="card-label">Category breakdown</div>
            <div className="cat-breakdown">
              {sortedCategories.map((cat) => (
                <div key={cat.key} className="cat-row-item">
                  <span className="cat-name">{cat.label}</span>
                  <div className="cat-track">
                    <div
                      className="cat-fill"
                      style={{ width: `${Math.round((cat.total / maxCategory) * 100)}%` }}
                    />
                  </div>
                  <span className="cat-value">
                    {CURRENCY}{cat.total.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Monthly comparison chart ─────────────────────── */}
        <div className="card">
          <div className="card-label">Monthly comparison</div>
          <MiniChart
            data={monthlyData}
            labels={monthlyLabels}
            activeIndex={4}
          />
        </div>

        {/* ── All transactions this month ──────────────────── */}
        <div className="card">
          <div className="card-label">
            This month · {monthTransactions.length} transactions
          </div>
          {monthTransactions.length === 0 ? (
            <div className="empty-state">No transactions this month yet</div>
          ) : (
            [...monthTransactions]
              .sort((a, b) => b.date.localeCompare(a.date))
              .map((tx) => (
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
