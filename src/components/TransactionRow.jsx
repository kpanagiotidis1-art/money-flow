import { CATEGORIES, CURRENCY } from '../data/config';

// Maps a category key to its emoji for display
function getCategoryEmoji(key) {
  return CATEGORIES.find((c) => c.key === key)?.emoji ?? '✦';
}

// Formats a date string like "2026-05-13" → "May 13"
function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function TransactionRow({ transaction, onDelete }) {
  const { type, amount, category, note, date } = transaction;
  const isIncome = type === 'income';

  return (
    <div className="tx-row">
      <div className="tx-icon" aria-hidden="true">
        {isIncome ? '💰' : getCategoryEmoji(category)}
      </div>

      <div className="tx-info">
        <div className="tx-name">{note || (isIncome ? 'Income' : 'Expense')}</div>
        <div className="tx-cat">
          {isIncome ? 'Income' : CATEGORIES.find((c) => c.key === category)?.label ?? category}
          {' · '}
          {formatDate(date)}
        </div>
      </div>

      <div className={`tx-amount ${isIncome ? 'in' : 'out'}`}>
        {isIncome ? '+' : '−'}{CURRENCY}{amount.toLocaleString()}
      </div>

      {onDelete && (
        <button
          className="tx-delete"
          onClick={() => onDelete(transaction.id)}
          aria-label={`Delete ${note || 'transaction'}`}
        >
          ×
        </button>
      )}
    </div>
  );
}
