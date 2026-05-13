import { useState } from 'react';
import { CURRENCY } from '../data/config';

const CYCLES = [
  { key: 'weekly',  label: 'Weekly'  },
  { key: 'monthly', label: 'Monthly' },
  { key: 'annual',  label: 'Annual'  },
];

function daysUntil(dateStr) {
  const today = new Date().toISOString().split('T')[0];
  return Math.max(0, Math.ceil((new Date(dateStr) - new Date(today)) / 86400000));
}

function formatNextDate(dateStr, days) {
  const label = new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  if (days === 0) return `Today · ${label}`;
  if (days === 1) return `Tomorrow · ${label}`;
  return `${label} · in ${days} days`;
}

function cycleLabel(cycle) {
  return CYCLES.find((c) => c.key === cycle)?.label ?? cycle;
}

// Convert any cycle to a monthly cost equivalent for the total
function toMonthlyEquivalent(amount, cycle) {
  if (cycle === 'weekly')  return amount * 52 / 12;
  if (cycle === 'annual')  return amount / 12;
  return amount; // monthly
}

export default function SubsScreen({ data, onDeleteSubscription, onAddSubscription }) {
  const { subscriptions, nextSub, daysUntilNextSub } = data;

  const [showForm,    setShowForm]    = useState(false);
  const [formName,    setFormName]    = useState('');
  const [formEmoji,   setFormEmoji]   = useState('');
  const [formAmount,  setFormAmount]  = useState('');
  const [formCycle,   setFormCycle]   = useState('monthly');
  const [formDate,    setFormDate]    = useState('');

  // Monthly equivalent total across all cycles
  const monthlyTotal = subscriptions.reduce(
    (sum, s) => sum + toMonthlyEquivalent(s.amount, s.cycle), 0
  );

  function handleAdd() {
    if (!formName.trim() || !formAmount) return;
    // Default next date to today if none picked
    const nextDate = formDate || new Date().toISOString().split('T')[0];
    onAddSubscription(
      formName.trim(),
      formEmoji.trim() || '📦',
      parseFloat(formAmount),
      formCycle,
      nextDate,
    );
    setFormName(''); setFormEmoji(''); setFormAmount('');
    setFormCycle('monthly'); setFormDate('');
    setShowForm(false);
  }

  function resetForm() {
    setFormName(''); setFormEmoji(''); setFormAmount('');
    setFormCycle('monthly'); setFormDate('');
    setShowForm(false);
  }

  const btnBase = {
    fontFamily: 'var(--ff)', fontSize: 13, fontWeight: 500,
    padding: '6px 14px', borderRadius: 99, border: 'none', cursor: 'pointer',
  };

  return (
    <div className="screen fade-slide-in">
      <div className="page-header">
        <div className="page-label">Recurring</div>
        <div className="page-title">Subscriptions</div>
      </div>

      <div className="screen-scroll">

        {/* ── Monthly equivalent total ──────────────────────── */}
        <div className="total-strip">
          <div className="total-strip-label">Monthly equivalent</div>
          <div className="total-strip-val">
            {CURRENCY}{Math.round(monthlyTotal).toLocaleString()} <small>/ mo</small>
          </div>
        </div>

        {/* ── Next charge ───────────────────────────────────── */}
        {nextSub && (
          <div className="insight-chip">
            <div className="insight-icon" aria-hidden="true">📅</div>
            <div className="insight-text">
              Next charge: <strong>{nextSub.name} {CURRENCY}{nextSub.amount}</strong>
              {' '}— {daysUntilNextSub === 0 ? 'today' : `in ${daysUntilNextSub} day${daysUntilNextSub === 1 ? '' : 's'}`}
            </div>
          </div>
        )}

        {/* ── List ─────────────────────────────────────────── */}
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
                        {cycleLabel(sub.cycle)} · {formatNextDate(sub.nextDate, days)}
                      </div>
                    </div>
                    <div className="sub-amount">
                      {CURRENCY}{sub.amount}
                      <div style={{ fontSize: 10, color: 'var(--gray-400)', textAlign: 'right' }}>
                        {sub.cycle !== 'monthly' ? `${CURRENCY}${Math.round(toMonthlyEquivalent(sub.amount, sub.cycle))}/mo` : ''}
                      </div>
                    </div>
                    <button
                      className="sub-delete"
                      onClick={() => onDeleteSubscription(sub.id)}
                      aria-label={`Delete ${sub.name}`}
                    >×</button>
                  </div>
                );
              })
          )}
        </div>

        {/* ── Add form ──────────────────────────────────────── */}
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
                placeholder={`Amount (${CURRENCY})`}
                value={formAmount}
                onChange={(e) => setFormAmount(e.target.value)}
                inputMode="decimal"
              />

              {/* Cycle picker */}
              <div>
                <div style={{ fontSize: 11, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>
                  Billing cycle
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {CYCLES.map((c) => (
                    <button
                      key={c.key}
                      type="button"
                      onClick={() => setFormCycle(c.key)}
                      style={{
                        ...btnBase,
                        background: formCycle === c.key ? 'var(--black)' : 'var(--gray-100)',
                        color: formCycle === c.key ? 'var(--white)' : 'var(--gray-600)',
                      }}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Next payment date */}
              <div>
                <div style={{ fontSize: 11, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>
                  Next payment date
                </div>
                <input
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  style={{ width: '100%', fontFamily: 'var(--ff)', fontSize: 14, padding: '10px 12px', borderRadius: 'var(--radius-xs)', border: '0.5px solid var(--gray-200)', background: 'var(--gray-50)', color: 'var(--black)', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  onClick={resetForm}
                  style={{ flex: 1, padding: 13, borderRadius: 'var(--radius-xs)', border: '0.5px solid var(--gray-200)', background: 'var(--gray-100)', color: 'var(--gray-600)', fontFamily: 'var(--ff)', fontSize: 14, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAdd}
                  style={{ flex: 2, padding: 13, borderRadius: 'var(--radius-xs)', border: 'none', background: 'var(--black)', color: 'var(--white)', fontFamily: 'var(--ff)', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}
                >
                  Add subscription
                </button>
              </div>

            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            style={{
              width: '100%', padding: 14, borderRadius: 'var(--radius-sm)',
              border: '0.5px dashed var(--gray-200)', background: 'transparent',
              color: 'var(--gray-400)', fontFamily: 'var(--ff)', fontSize: 14, cursor: 'pointer',
            }}
          >
            + Add subscription
          </button>
        )}

      </div>
    </div>
  );
}
