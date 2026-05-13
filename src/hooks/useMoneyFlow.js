import { useState, useEffect, useCallback } from 'react';

// ─────────────────────────────────────────────────────────────
// useMoneyFlow  —  the single source of truth for all app data.
//
// All transactions, income, and subscriptions live here.
// Data is saved to localStorage so it persists between sessions.
// Every screen reads from this hook — nothing is stored elsewhere.
// ─────────────────────────────────────────────────────────────

const STORAGE_KEY = 'moneyflow_v1';

// Helper: generate a simple unique ID
const uid = () => Math.random().toString(36).slice(2, 9);

// Helper: get today's date as a YYYY-MM-DD string
export const today = () => new Date().toISOString().split('T')[0];

// Helper: get YYYY-MM for a given date string
export const yearMonth = (dateStr) => dateStr.slice(0, 7);

// ─── Seed data so the app isn't empty on first load ──────────
const SEED_DATA = {
  transactions: [
    { id: uid(), type: 'expense', amount: 18,   category: 'food',          note: 'Lunch · Café',     date: today() },
    { id: uid(), type: 'expense', amount: 6,    category: 'food',          note: 'Coffee',            date: today() },
    { id: uid(), type: 'expense', amount: 4,    category: 'transport',     note: 'Morning transit',   date: today() },
    { id: uid(), type: 'expense', amount: 120,  category: 'bills',         note: 'Power bill',        date: offsetDate(-1) },
    { id: uid(), type: 'expense', amount: 34,   category: 'entertainment', note: 'Cinema',            date: offsetDate(-3) },
    { id: uid(), type: 'expense', amount: 62,   category: 'shopping',      note: 'Online order',      date: offsetDate(-5) },
    { id: uid(), type: 'expense', amount: 48,   category: 'food',          note: 'Groceries',         date: offsetDate(-5) },
    { id: uid(), type: 'expense', amount: 96,   category: 'gym',           note: 'Monthly membership',date: offsetDate(-7) },
    { id: uid(), type: 'income',  amount: 4200, category: null,            note: 'Salary',            date: offsetDate(-12) },
  ],
  subscriptions: [
    { id: uid(), name: 'Spotify',        emoji: '🎵', amount: 12,  cycle: 'monthly', nextDate: offsetDate(5)  },
    { id: uid(), name: 'Netflix',        emoji: '📺', amount: 18,  cycle: 'monthly', nextDate: offsetDate(9)  },
    { id: uid(), name: 'Gym membership', emoji: '💪', amount: 60,  cycle: 'monthly', nextDate: offsetDate(19) },
    { id: uid(), name: 'iCloud Storage', emoji: '☁️', amount: 4,   cycle: 'monthly', nextDate: offsetDate(2)  },
    { id: uid(), name: 'Claude Pro',     emoji: '🤖', amount: 20,  cycle: 'monthly', nextDate: offsetDate(7)  },
    { id: uid(), name: 'News app',       emoji: '📰', amount: 14,  cycle: 'monthly', nextDate: offsetDate(21) },
  ],
};

function offsetDate(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

// ─── Load from localStorage or fall back to seed data ────────
function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return SEED_DATA;
}

// ─── Save to localStorage ─────────────────────────────────────
function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (_) {}
}

// ─────────────────────────────────────────────────────────────
export function useMoneyFlow() {
  const [data, setData] = useState(loadData);

  // Persist whenever data changes
  useEffect(() => {
    saveData(data);
  }, [data]);

  // ── Derived: current month string e.g. "2026-05" ────────────
  const currentMonth = yearMonth(today());

  // ── Transactions this month ──────────────────────────────────
  const monthTransactions = data.transactions.filter(
    (t) => yearMonth(t.date) === currentMonth
  );

  // ── Income this month ────────────────────────────────────────
  const monthIncome = monthTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  // ── Expenses this month ──────────────────────────────────────
  const monthExpenses = monthTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  // ── Net flow ─────────────────────────────────────────────────
  const netFlow = monthIncome - monthExpenses;

  // ── Subscriptions monthly total ──────────────────────────────
  const subsTotal = data.subscriptions
    .filter((s) => s.cycle === 'monthly')
    .reduce((sum, s) => sum + s.amount, 0);

  // ── Today's spend ────────────────────────────────────────────
  const todaySpend = data.transactions
    .filter((t) => t.type === 'expense' && t.date === today())
    .reduce((sum, t) => sum + t.amount, 0);

  // ── This week's spend (last 7 days) ──────────────────────────
  const weekAgo = offsetDate(-7);
  const weekTransactions = data.transactions.filter(
    (t) => t.type === 'expense' && t.date >= weekAgo
  );
  const weekSpend = weekTransactions.reduce((sum, t) => sum + t.amount, 0);

  // ── Last week's spend (7–14 days ago) ────────────────────────
  const twoWeeksAgo = offsetDate(-14);
  const lastWeekSpend = data.transactions
    .filter((t) => t.type === 'expense' && t.date >= twoWeeksAgo && t.date < weekAgo)
    .reduce((sum, t) => sum + t.amount, 0);

  // ── Week-on-week % change ─────────────────────────────────────
  const weekChange = lastWeekSpend > 0
    ? Math.round(((weekSpend - lastWeekSpend) / lastWeekSpend) * 100)
    : 0;

  // ── Category totals this month ───────────────────────────────
  const categoryTotals = monthTransactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});

  // ── Top category this week ───────────────────────────────────
  const weekCategoryTotals = weekTransactions.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {});
  const topCategoryKey = Object.entries(weekCategoryTotals)
    .sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  // ── Daily spend for the last 7 days (for chart) ──────────────
  const weeklyChartData = Array.from({ length: 7 }, (_, i) => {
    const d = offsetDate(i - 6);
    return data.transactions
      .filter((t) => t.type === 'expense' && t.date === d)
      .reduce((sum, t) => sum + t.amount, 0);
  });

  // ── Next upcoming subscription ────────────────────────────────
  const nextSub = [...data.subscriptions]
    .sort((a, b) => a.nextDate.localeCompare(b.nextDate))
    .find((s) => s.nextDate >= today()) ?? null;

  const daysUntilNextSub = nextSub
    ? Math.ceil((new Date(nextSub.nextDate) - new Date(today())) / 86400000)
    : null;

  // ─── Actions ─────────────────────────────────────────────────

  const addExpense = useCallback((amount, category, note = '') => {
    const tx = { id: uid(), type: 'expense', amount: Number(amount), category, note, date: today() };
    setData((d) => ({ ...d, transactions: [tx, ...d.transactions] }));
  }, []);

  const addIncome = useCallback((amount, note = '') => {
    const tx = { id: uid(), type: 'income', amount: Number(amount), category: null, note, date: today() };
    setData((d) => ({ ...d, transactions: [tx, ...d.transactions] }));
  }, []);

  const deleteTransaction = useCallback((id) => {
    setData((d) => ({ ...d, transactions: d.transactions.filter((t) => t.id !== id) }));
  }, []);

  const addSubscription = useCallback((name, emoji, amount, cycle = 'monthly') => {
    const sub = { id: uid(), name, emoji, amount: Number(amount), cycle, nextDate: offsetDate(30) };
    setData((d) => ({ ...d, subscriptions: [sub, ...d.subscriptions] }));
  }, []);

  const deleteSubscription = useCallback((id) => {
    setData((d) => ({ ...d, subscriptions: d.subscriptions.filter((s) => s.id !== id) }));
  }, []);

  return {
    // Raw data
    transactions: data.transactions,
    subscriptions: data.subscriptions,

    // Derived totals
    monthIncome,
    monthExpenses,
    netFlow,
    subsTotal,
    todaySpend,
    weekSpend,
    lastWeekSpend,
    weekChange,

    // Breakdowns
    categoryTotals,
    weekCategoryTotals,
    topCategoryKey,
    weeklyChartData,
    monthTransactions,

    // Subscriptions
    nextSub,
    daysUntilNextSub,

    // Actions
    addExpense,
    addIncome,
    deleteTransaction,
    addSubscription,
    deleteSubscription,
  };
}
