import { useState } from 'react';
import { CATEGORIES, CURRENCY } from '../data/config';

export default function AddSheet({ onAddExpense, onAddIncome, onClose }) {
  const [value, setValue]       = useState('');
  const [type, setType]         = useState('expense');
  const [category, setCategory] = useState('food');
  const [note, setNote]         = useState('');
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState('');

  function handleKey(key) {
    if (key === 'del') { setValue(v => v.slice(0, -1)); return; }
    if (key === '.') { if (!value.includes('.')) setValue(v => v + '.'); return; }
    if (value.includes('.') && value.split('.')[1]?.length >= 2) return;
    if (value.replace('.', '').length >= 6) return;
    setValue(v => v + key);
  }

  // async — waits for Supabase to confirm before closing
  async function handleConfirm() {
    const amount = parseFloat(value);
    if (!amount || amount <= 0) return;
    setSaving(true);
    setError('');
    try {
      if (type === 'expense') await onAddExpense(amount, category, note);
      else await onAddIncome(amount, note);
      onClose();
    } catch (e) {
      setError('Failed to save. Please try again.');
      setSaving(false);
    }
  }

  // Input font-size must be 16px+ to prevent iOS zoom on focus
  const inputStyle = {
    width: '100%', fontFamily: "'DM Sans', sans-serif",
    fontSize: 16, // 16px minimum — below this iOS auto-zooms
    padding: '10px 12px', borderRadius: 10,
    border: '1px solid #e4e3df', background: '#f8f8f7',
    color: '#0a0a0a', outline: 'none', boxSizing: 'border-box',
  };

  return (
    <>
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        zIndex: 9998, background: 'rgba(0,0,0,0.5)', pointerEvents: 'none',
      }} />

      <div style={{
        position: 'fixed', left: 0, right: 0, bottom: 0,
        zIndex: 9999, background: '#ffffff',
        borderRadius: '20px 20px 0 0',
        display: 'flex', flexDirection: 'column',
        maxHeight: '92vh', overflow: 'hidden',
      }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #f0efed' }}>
          <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, color: '#0a0a0a' }}>
            {type === 'expense' ? 'Add expense' : 'Add income'}
          </span>
          <button onClick={onClose} style={{ background: '#f0efed', border: 'none', borderRadius: '50%', width: 32, height: 32, fontSize: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b6966' }}>×</button>
        </div>

        {/* Amount */}
        <div style={{ textAlign: 'center', padding: '20px 20px 14px', borderBottom: '1px solid #f0efed' }}>
          <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 52, color: value ? '#0a0a0a' : '#e4e3df', lineHeight: 1 }}>
            {CURRENCY}{value || '0'}
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 12 }}>
            <button onClick={() => setType('expense')} style={{ padding: '6px 20px', borderRadius: 99, border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500, background: type === 'expense' ? '#0a0a0a' : '#f0efed', color: type === 'expense' ? '#fff' : '#6b6966' }}>Expense</button>
            <button onClick={() => setType('income')} style={{ padding: '6px 20px', borderRadius: 99, border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500, background: type === 'income' ? '#0a0a0a' : '#f0efed', color: type === 'income' ? '#fff' : '#6b6966' }}>Income</button>
          </div>
        </div>

        {/* Categories */}
        {type === 'expense' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, padding: '12px 14px', borderBottom: '1px solid #f0efed' }}>
            {CATEGORIES.map(cat => (
              <button key={cat.key} onClick={() => setCategory(cat.key)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, padding: '10px 4px', borderRadius: 10, border: 'none', cursor: 'pointer', background: category === cat.key ? '#0a0a0a' : '#f8f8f7' }}>
                <span style={{ fontSize: 18, lineHeight: 1 }}>{cat.emoji}</span>
                <span style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.06em', color: category === cat.key ? 'rgba(255,255,255,0.75)' : '#b0aea8', fontFamily: "'DM Sans', sans-serif" }}>{cat.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Note */}
        <div style={{ padding: '10px 14px', borderBottom: '1px solid #f0efed' }}>
          <input
            type="text"
            placeholder={type === 'expense' ? 'Note — e.g. Lunch' : 'Source — e.g. Salary'}
            value={note}
            onChange={e => setNote(e.target.value)}
            style={inputStyle}
          />
        </div>

        {/* Error */}
        {error && (
          <div style={{ padding: '8px 14px', fontSize: 13, color: '#c0392b', background: '#fceeed', textAlign: 'center' }}>
            {error}
          </div>
        )}

        {/* Numpad */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}>
          {['1','2','3','4','5','6','7','8','9','.','0','del'].map(key => (
            <button key={key} onClick={() => handleKey(key)} style={{ border: 'none', borderTop: '1px solid #f0efed', borderRight: '1px solid #f0efed', background: '#ffffff', fontSize: key === 'del' ? 18 : 24, fontFamily: "'DM Sans', sans-serif", color: '#0a0a0a', height: 60, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {key === 'del' ? '⌫' : key}
            </button>
          ))}
        </div>

        {/* Confirm */}
        <div style={{ padding: '12px 14px 32px' }}>
          <button onClick={handleConfirm} disabled={saving} style={{ width: '100%', padding: 17, borderRadius: 14, border: 'none', cursor: saving ? 'not-allowed' : 'pointer', background: (value && parseFloat(value) > 0) ? '#0a0a0a' : '#e4e3df', color: '#ffffff', fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em', opacity: saving ? 0.7 : 1 }}>
            {saving ? 'Saving…' : type === 'expense' ? 'Add expense' : 'Add income'}
          </button>
        </div>

      </div>
    </>
  );
}
