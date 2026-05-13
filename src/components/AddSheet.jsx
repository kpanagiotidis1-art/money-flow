import { useState } from 'react';
import { CATEGORIES, CURRENCY } from '../data/config';

// AddSheet — slides up from the bottom when the user taps +
// Handles both expenses (with category) and income entries.

export default function AddSheet({ onAddExpense, onAddIncome, onClose }) {
  const [value, setValue]         = useState('');       // numeric string being built
  const [type, setType]           = useState('expense'); // 'expense' | 'income'
  const [category, setCategory]   = useState('food');
  const [note, setNote]           = useState('');

  // ── Number pad logic ─────────────────────────────────────────
  function handleKey(key) {
    if (key === 'del') {
      setValue((v) => v.slice(0, -1));
    } else if (key === '.') {
      if (!value.includes('.')) setValue((v) => v + '.');
    } else {
      // Limit to 7 digits total, 2 decimal places
      if (value.includes('.')) {
        const decimals = value.split('.')[1];
        if (decimals?.length >= 2) return;
      }
      if (value.replace('.', '').length >= 7) return;
      setValue((v) => v + key);
    }
  }

  // ── Confirm add ──────────────────────────────────────────────
  function handleConfirm() {
    const amount = parseFloat(value);
    if (!amount || amount <= 0) { onClose(); return; }

    if (type === 'expense') {
      onAddExpense(amount, category, note);
    } else {
      onAddIncome(amount, note);
    }
    onClose();
  }

  const displayAmount = value ? `${CURRENCY}${value}` : `${CURRENCY}0`;

  return (
    <div className="add-overlay" role="dialog" aria-modal="true" aria-label="Add transaction">
      {/* Tap backdrop to close */}
      <div
        style={{ position: 'absolute', inset: 0 }}
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="add-sheet">
        <div className="add-sheet-handle" aria-hidden="true" />

        {/* Header */}
        <div className="add-sheet-header">
          <div className="add-sheet-title">
            {type === 'expense' ? 'Add expense' : 'Add income'}
          </div>
          <button className="add-close-btn" onClick={onClose} aria-label="Close">×</button>
        </div>

        {/* Amount display */}
        <div className="add-amount-display">
          <div className={`add-amount-number${!value ? ' empty' : ''}`}>
            {displayAmount}
          </div>

          {/* Expense vs Income toggle */}
          <div className="add-type-toggle">
            <button
              className={`type-btn${type === 'expense' ? ' active' : ''}`}
              onClick={() => setType('expense')}
            >
              Expense
            </button>
            <button
              className={`type-btn${type === 'income' ? ' active' : ''}`}
              onClick={() => setType('income')}
            >
              Income
            </button>
          </div>
        </div>

        {/* Category selector (only for expenses) */}
        {type === 'expense' && (
          <div className="add-cats" role="group" aria-label="Category">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                className={`cat-btn${category === cat.key ? ' selected' : ''}`}
                onClick={() => setCategory(cat.key)}
                aria-pressed={category === cat.key}
              >
                <span className="cat-btn-emoji" aria-hidden="true">{cat.emoji}</span>
                <span className="cat-btn-label">{cat.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Note input */}
        <div style={{ padding: '8px 14px 0', borderBottom: '0.5px solid var(--gray-100)' }}>
          <input
            type="text"
            placeholder={type === 'expense' ? 'Note (e.g. Lunch)' : 'Source (e.g. Salary)'}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            style={{
              width: '100%',
              fontFamily: 'var(--ff)',
              fontSize: '14px',
              padding: '10px 12px',
              borderRadius: 'var(--radius-xs)',
              border: '0.5px solid var(--gray-200)',
              background: 'var(--gray-50)',
              color: 'var(--black)',
              outline: 'none',
              marginBottom: '10px',
            }}
          />
        </div>

        {/* Number pad */}
        <div className="add-numpad" role="group" aria-label="Number pad">
          {['1','2','3','4','5','6','7','8','9','.','0','del'].map((key) => (
            <button
              key={key}
              className={`num-key${key === 'del' ? ' del' : ''}`}
              onClick={() => handleKey(key)}
              aria-label={key === 'del' ? 'Delete' : key}
            >
              {key === 'del' ? '⌫' : key}
            </button>
          ))}
        </div>

        {/* Confirm */}
        <button className="add-confirm-btn" onClick={handleConfirm}>
          {type === 'expense' ? 'Add expense' : 'Add income'}
        </button>
      </div>
    </div>
  );
}
