import { useState } from 'react';
import { CURRENCY } from '../data/config';

function formatNextDate(dateStr, daysUntil) {
  const d = new Date(dateStr + 'T00:00:00');
  const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  if (daysUntil === 0) return `Today · ${label}`;
  if (daysUntil === 1) return `Tomorrow · ${label}`;
  return `In ${daysUntil} days · ${label}`;
}

function daysUntil(dateStr) {
  const today = new Date().toISOString().split('T')[0];
  return Math.max(0, Math.ceil((new Date(dateStr) - new Date(today)) / 86400000));
}

export default function SubsScreen({ data, onDeleteSubscription, onAddSubscription }) {
  const { subscriptions, subsTotal, nextSub, daysUntilNextSub } = data;

  // ── Add subscription form state ──────────────────────────────
  const [showForm, setShowForm] = useState(false);
  const [formName,   setFormName]   = useState('');
  const [formEmoji,  setFormEmoji]  = useState('');
  const [formAmount, setFormAmount] = useState('');

  function handleAdd() {
    if (!formName || !formAmount) return;
    onAddSubscription(
      formName.trim(),
      formEmoji.trim() || '📦',
      parseFloat(formAmount)
    );
    setFormName('');
    setFormEmoji('');
    setFormAmount('');
    setShowForm(false);
  }

  return (
    <div className="screen fade-slide-in">
      <div className="page-header">
        <div className="page-label">Recurring</div>
        <div className="page-title">Subscriptions</div>
      </div>

      <div className="screen-scroll">

        {/* ── Monthly total strip ──────────────────────────── */}
        <div className="total-strip">
          <div className="total-strip-label">Monthly total</div>
          <div className="total-strip-val">
            {CURRENCY}{subsTotal.toLocaleString()} <small>/ mo</small>
          </div>
        </div>

        {/* ── Next charge alert ────────────────────────────── */}
        {nextSub && (
          <div className="insight-chip">
            <div className="insight-icon" aria-hidden="true">📅</div>
            <div className="insight-text">
              Next charge:{' '}
              <strong>{nextSub.name} {CURRENCY}{nextSub.amount}</strong>
              {' '}— {daysUntilNextSub === 0 ? 'today' : `in ${daysUntilNextSub} day${daysUntilNextSub === 1 ? '' : 's'}`}
            </div>
          </div>
        )}

        {/* ── Subscriptions list ───────────────────────────── */}
        <div className="card">
          <div className="card-label">
            Active · {subscriptions.length} subscription{subscriptions.length !== 1 ? 's' : ''}
          </div>

          {subscriptions.length === 0 ? (
            <div className="empty-state">No subscriptions yet — add one below</div>
          ) : (
            [...subscriptions]
              .sort((a, b) => a.nextDate.localeCompare(b.nextDate))
              .map((sub) => {
                const days = daysUntil(sub.nextDate);
                return (
                  <div key={sub.id} className="sub-row">
                    <div className="sub-logo" aria-hidden="true">{sub.emoji}</div>
                    <div className="sub-info">
                      <div className="sub-name">{sub.name}</div>
                      <div className="sub-cycle">
                        {sub.cycle === 'monthly' ? 'Monthly' : 'Annual'}
                        {' · '}
                        {formatNextDate(sub.nextDate, days)}
                      </div>
                    </div>
                    <div className="sub-amount">{CURRENCY}{sub.amount}</div>
                    <button
                      className="sub-delete"
                      onClick={() => onDeleteSubscription(sub.id)}
                      aria-label={`Delete ${sub.name}`}
                    >
                      ×
                    </button>
                  </div>
                );
              })
          )}
        </div>

        {/* ── Add subscription form ────────────────────────── */}
        {showForm ? (
          <div className="card">
            <div className="card-label">New subscription</div>
            <div className="sub-form">
              <input
                type="text"
                placeholder="Name (e.g. Netflix)"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                autoFocus
              />
              <input
                type="text"
                placeholder="Emoji (e.g. 📺) — optional"
                value={formEmoji}
                onChange={(e) => setFormEmoji(e.target.value)}
              />
              <input
                type="number"
                placeholder={`Amount per month (${CURRENCY})`}
                value={formAmount}
                onChange={(e) => setFormAmount(e.target.value)}
                inputMode="decimal"
              />
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setShowForm(false)}
                  style={{
                    flex: 1,
                    padding: '13px',
                    borderRadius: 'var(--radius-xs)',
                    border: '0.5px solid var(--gray-200)',
                    background: 'var(--gray-100)',
                    color: 'var(--gray-600)',
                    fontFamily: 'var(--ff)',
                    fontSize: '14px',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAdd}
                  style={{
                    flex: 2,
                    padding: '13px',
                    borderRadius: 'var(--radius-xs)',
                    border: 'none',
                    background: 'var(--black)',
                    color: 'var(--white)',
                    fontFamily: 'var(--ff)',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                  }}
                >
                  Add subscription
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowForm(true)}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: 'var(--radius-sm)',
              border: '0.5px dashed var(--gray-200)',
              background: 'transparent',
              color: 'var(--gray-400)',
              fontFamily: 'var(--ff)',
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'border-color 0.15s, color 0.15s',
            }}
            onMouseEnter={(e) => { e.target.style.borderColor = 'var(--black)'; e.target.style.color = 'var(--black)'; }}
            onMouseLeave={(e) => { e.target.style.borderColor = 'var(--gray-200)'; e.target.style.color = 'var(--gray-400)'; }}
          >
            + Add subscription
          </button>
        )}

      </div>
    </div>
  );
}
