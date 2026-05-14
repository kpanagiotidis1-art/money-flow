import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

// ─────────────────────────────────────────────────────────────
// useMoneyFlow — all app data, now backed by Supabase.
//
// Architecture:
//   - transactions and subscriptions are fetched from Supabase on mount
//   - all writes (add/delete) go to Supabase immediately
//   - local state mirrors the database — UI stays fast and reactive
//   - localStorage is no longer used for transactions/subscriptions
// ─────────────────────────────────────────────────────────────

const uid = () => Math.random().toString(36).slice(2, 9);

export const today = () => new Date().toISOString().split('T')[0];
export const yearMonth = (dateStr) => dateStr.slice(0, 7);

function offsetDate(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

function advanceSubDate(sub) {
  let next = new Date(sub.next_date + 'T00:00:00');
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  if (next >= now) return sub;
  while (next < now) {
    if (sub.cycle === 'weekly')       next.setDate(next.getDate() + 7);
    else if (sub.cycle === 'annual')  next.setFullYear(next.getFullYear() + 1);
    else                              next.setMonth(next.getMonth() + 1);
  }
  return { ...sub, next_date: next.toISOString().split('T')[0] };
}

// ─────────────────────────────────────────────────────────────
export function useMoneyFlow(userId) {
  const [transactions,   setTransactions]   = useState([]);
  const [subscriptions,  setSubscriptions]  = useState([]);
  const [loading,        setLoading]        = useState(true);

  // ── Fetch all data on mount (or when user changes) ──────────
  useEffect(() => {
    if (!userId) return;
    setLoading(true);

    async function fetchAll() {
      // Fetch transactions — newest first
      const { data: txData } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      // Fetch subscriptions — soonest first
      const { data: subData } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .order('next_date', { ascending: true });

      setTransactions(txData ?? []);

      // Auto-advance any stale subscription dates
      const advanced = (subData ?? []).map(advanceSubDate);
      setSubscriptions(advanced);

      // If any dates were advanced, save them back to Supabase
      advanced.forEach(async (sub, i) => {
        if (sub.next_date !== (subData ?? [])[i]?.next_date) {
          await supabase
            .from('subscriptions')
            .update({ next_date: sub.next_date })
            .eq('id', sub.id);
        }
      });

      setLoading(false);
    }

    fetchAll();
  }, [userId]);

  // ── Derived values ──────────────────────────────────────────
  const currentMonth = yearMonth(today());

  const monthTransactions = transactions.filter(
    (t) => yearMonth(t.date) === currentMonth
  );

  const monthIncome = monthTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const monthExpenses = monthTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const netFlow = monthIncome - monthExpenses;

  const subsTotal = Math.round(subscriptions.reduce((sum, s) => {
    if (s.cycle === 'weekly')  return sum + s.amount * 52 / 12;
    if (s.cycle === 'annual')  return sum + s.amount / 12;
    return sum + Number(s.amount);
  }, 0));

  const todaySpend = transactions
    .filter((t) => t.type === 'expense' && t.date === today())
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const weekAgo = offsetDate(-7);
  const weekTransactions = transactions.filter(
    (t) => t.type === 'expense' && t.date >= weekAgo
  );
  const weekSpend = weekTransactions.reduce((sum, t) => sum + Number(t.amount), 0);

  const twoWeeksAgo = offsetDate(-14);
  const lastWeekSpend = transactions
    .filter((t) => t.type === 'expense' && t.date >= twoWeeksAgo && t.date < weekAgo)
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const weekChange = lastWeekSpend > 0
    ? Math.round(((weekSpend - lastWeekSpend) / lastWeekSpend) * 100)
    : 0;

  const categoryTotals = monthTransactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
      return acc;
    }, {});

  const weekCategoryTotals = weekTransactions.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
    return acc;
  }, {});

  const topCategoryKey = Object.entries(weekCategoryTotals)
    .sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  const weeklyChartData = Array.from({ length: 7 }, (_, i) => {
    const d = offsetDate(i - 6);
    return transactions
      .filter((t) => t.type === 'expense' && t.date === d)
      .reduce((sum, t) => sum + Number(t.amount), 0);
  });

  const nextSub = [...subscriptions]
    .sort((a, b) => a.next_date.localeCompare(b.next_date))
    .find((s) => s.next_date >= today()) ?? null;

  const daysUntilNextSub = nextSub
    ? Math.ceil((new Date(nextSub.next_date) - new Date(today())) / 86400000)
    : null;

  // ── Actions — write to Supabase, then update local state ────

  const addExpense = useCallback(async (amount, category, note = '') => {
    const row = {
      user_id: userId,
      type: 'expense',
      amount: Number(amount),
      category,
      note,
      date: today(),
    };
    const { data, error } = await supabase
      .from('transactions')
      .insert(row)
      .select()
      .single();
    if (!error && data) {
      setTransactions((prev) => [data, ...prev]);
    }
  }, [userId]);

  const addIncome = useCallback(async (amount, note = '') => {
    const row = {
      user_id: userId,
      type: 'income',
      amount: Number(amount),
      category: null,
      note,
      date: today(),
    };
    const { data, error } = await supabase
      .from('transactions')
      .insert(row)
      .select()
      .single();
    if (!error && data) {
      setTransactions((prev) => [data, ...prev]);
    }
  }, [userId]);

  const deleteTransaction = useCallback(async (id) => {
    await supabase.from('transactions').delete().eq('id', id);
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addSubscription = useCallback(async (name, emoji, amount, cycle = 'monthly', nextDate = null) => {
    const row = {
      user_id: userId,
      name,
      emoji,
      amount: Number(amount),
      cycle,
      next_date: nextDate || offsetDate(30),
    };
    const { data, error } = await supabase
      .from('subscriptions')
      .insert(row)
      .select()
      .single();
    if (!error && data) {
      setSubscriptions((prev) => [...prev, data]);
    }
  }, [userId]);

  const deleteSubscription = useCallback(async (id) => {
    await supabase.from('subscriptions').delete().eq('id', id);
    setSubscriptions((prev) => prev.filter((s) => s.id !== id));
  }, []);

  return {
    // Raw data
    transactions,
    subscriptions,
    loading,

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
