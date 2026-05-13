import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'moneyflow_v1';

const uid = () => Math.random().toString(36).slice(2, 9);

// Get today as YYYY-MM-DD
export const today = () => new Date().toISOString().split('T')[0];

// Get YYYY-MM from a date string
export const yearMonth = (dateStr) => dateStr.slice(0, 7);

// Offset from today by N days
function offsetDate(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

// ─── Seed data — built inside a function so offsetDate is ready ───
function buildSeedData() {
  return {
    transactions: [
      { id: uid(), type: 'expense', amount: 18,   category: 'food',          note: 'Lunch · Café',      date: today() },
      { id: uid(), type: 'expense', amount: 6,    category: 'food',          note: 'Coffee',             date: today() },
      { id: uid(), type: 'expense', amount: 4,    category: 'transport',     note: 'Morning transit',    date: today() },
      { id: uid(), type: 'expense', amount: 120,  category: 'bills',         note: 'Power bill',         date: offsetDate(-1) },
      { id: uid(), type: 'expense', amount: 34,   category: 'entertainment', note: 'Cinema',             date: offsetDate(-3) },
      { id: uid(), type: 'expense', amount: 62,   category: 'shopping',      note: 'Online order',       date: offsetDate(-5) },
      { id: uid(), type: 'expense', amount: 48,   category: 'food',          note: 'Groceries',          date: offsetDate(-5) },
      { id: uid(), type: 'expense', amount: 96,   category: 'gym',           note: 'Monthly membership', date: offsetDate(-7) },
      { id: uid(), type: 'income',  amount: 4200, category: null,            note: 'Salary',             date: offsetDate(-12) },
    ],
    subscriptions: [
      { id: uid(), name: 'Spotify',        emoji: '🎵', amount: 12, cycle: 'monthly', nextDate: offsetDate(5)  },
      { id: uid(), name: 'Netflix',        emoji: '📺', amount: 18, cycle: 'monthly', nextDate: offsetDate(9)  },
      { id: uid(), name: 'Gym membership', emoji: '💪', amount: 60, cycle: 'monthly', nextDate: offsetDate(19) },
      { id: uid(), name: 'iCloud Storage', emoji: '☁️', amount: 4,  cycle: 'monthly', nextDate: offsetDate(2)  },
      { id: uid(), name: 'Claude Pro',     emoji: '🤖', amount: 20, cycle: 'monthly', nextDate: offsetDate(7)  },
      { id: uid(), name: 'News app',       emoji: '📰', amount: 14, cycle: 'monthly', nextDate: offsetDate(21) },
    ],
  };
}

// Advance a subscription's nextDate forward by its cycle until it's in the future
function advanceSubDate(sub) {
  let next = new Date(sub.nextDate + 'T00:00:00');
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  if (next >= now) return sub; // already in the future, nothing to do

  while (next < now) {
    if (sub.cycle === 'weekly')  next.setDate(next.getDate() + 7);
    else if (sub.cycle === 'annual') next.setFullYear(next.getFullYear() + 1);
    else next.setMonth(next.getMonth() + 1); // monthly
  }

  return { ...sub, nextDate: next.toISOString().split('T')[0] };
}

// Load from localStorage, or fall back to fresh seed data
function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Auto-advance any subscriptions whose nextDate has passed
      const advanced = {
        ...parsed,
        subscriptions: parsed.subscriptions.map(advanceSubDate),
      };
      return advanced;
    }
  } catch (_) {}
  return buildSeedData();
}

function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (_) {}
}

// ─────────────────────────────────────────────────────────────
export function useMoneyFlow() {
  const [data, setData] = useState(loadData);

  useEffect(() => {
    saveData(data);
  }, [data]);

  const currentMonth = yearMonth(today());

  const monthTransactions = data.transactions.filter(
    (t) => yearMonth(t.date) === currentMonth
  );

  const monthIncome = monthTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const monthExpenses = monthTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netFlow = monthIncome - monthExpenses;

  const subsTotal = Math.round(data.subscriptions.reduce((sum, s) => {
    if (s.cycle === 'weekly')  return sum + s.amount * 52 / 12;
    if (s.cycle === 'annual')  return sum + s.amount / 12;
    return sum + s.amount; // monthly
  }, 0));

  const todaySpend = data.transactions
    .filter((t) => t.type === 'expense' && t.date === today())
    .reduce((sum, t) => sum + t.amount, 0);

  const weekAgo = offsetDate(-7);
  const weekTransactions = data.transactions.filter(
    (t) => t.type === 'expense' && t.date >= weekAgo
  );
  const weekSpend = weekTransactions.reduce((sum, t) => sum + t.amount, 0);

  const twoWeeksAgo = offsetDate(-14);
  const lastWeekSpend = data.transactions
    .filter((t) => t.type === 'expense' && t.date >= twoWeeksAgo && t.date < weekAgo)
    .reduce((sum, t) => sum + t.amount, 0);

  const weekChange = lastWeekSpend > 0
    ? Math.round(((weekSpend - lastWeekSpend) / lastWeekSpend) * 100)
    : 0;

  const categoryTotals = monthTransactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});

  const weekCategoryTotals = weekTransactions.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {});

  const topCategoryKey = Object.entries(weekCategoryTotals)
    .sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  const weeklyChartData = Array.from({ length: 7 }, (_, i) => {
    const d = offsetDate(i - 6);
    return data.transactions
      .filter((t) => t.type === 'expense' && t.date === d)
      .reduce((sum, t) => sum + t.amount, 0);
  });

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

  const addSubscription = useCallback((name, emoji, amount, cycle = 'monthly', nextDate = null) => {
    const sub = { id: uid(), name, emoji, amount: Number(amount), cycle, nextDate: nextDate || offsetDate(30) };
    setData((d) => ({ ...d, subscriptions: [sub, ...d.subscriptions] }));
  }, []);

  const deleteSubscription = useCallback((id) => {
    setData((d) => ({ ...d, subscriptions: d.subscriptions.filter((s) => s.id !== id) }));
  }, []);

  return {
    transactions: data.transactions,
    subscriptions: data.subscriptions,
    monthIncome,
    monthExpenses,
    netFlow,
    subsTotal,
    todaySpend,
    weekSpend,
    lastWeekSpend,
    weekChange,
    categoryTotals,
    weekCategoryTotals,
    topCategoryKey,
    weeklyChartData,
    monthTransactions,
    nextSub,
    daysUntilNextSub,
    addExpense,
    addIncome,
    deleteTransaction,
    addSubscription,
    deleteSubscription,
  };
}
