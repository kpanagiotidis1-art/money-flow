import { useState, useEffect } from 'react';
import './index.css';

import { supabase }      from './lib/supabase';
import { useMoneyFlow }  from './hooks/useMoneyFlow';
import AuthScreen        from './screens/AuthScreen';
import BottomNav         from './components/BottomNav';
import AddSheet          from './components/AddSheet';
import HomeScreen        from './screens/HomeScreen';
import FlowScreen        from './screens/FlowScreen';
import SubsScreen        from './screens/SubsScreen';
import InsightsScreen    from './screens/InsightsScreen';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [showAdd,   setShowAdd]   = useState(false);

  // ── Auth state ───────────────────────────────────────────────
  // session is null while loading or logged out, populated when logged in
  const [session,  setSession]  = useState(undefined); // undefined = still loading

  useEffect(() => {
    // Get the current session on first load
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for login/logout events and update automatically
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Pass the user's ID into the data hook — it only fetches when userId exists
  const userId    = session?.user?.id ?? null;
  const moneyFlow = useMoneyFlow(userId);

  // ── Loading state ────────────────────────────────────────────
  // session===undefined means we haven't heard back from Supabase yet
  if (session === undefined) {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f8f7' }}>
        <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24, color: '#b0aea8' }}>Money Flow</div>
      </div>
    );
  }

  // ── Not logged in — show auth screen ─────────────────────────
  if (!session) {
    return <AuthScreen />;
  }

  // ── Logged in — show the app ──────────────────────────────────
  function renderScreen() {
    switch (activeTab) {
      case 'home':     return <HomeScreen     data={moneyFlow} onDeleteTransaction={moneyFlow.deleteTransaction} onLogout={() => supabase.auth.signOut()} />;
      case 'flow':     return <FlowScreen     data={moneyFlow} onDeleteTransaction={moneyFlow.deleteTransaction} />;
      case 'subs':     return <SubsScreen     data={moneyFlow} onDeleteSubscription={moneyFlow.deleteSubscription} onAddSubscription={moneyFlow.addSubscription} />;
      case 'insights': return <InsightsScreen data={moneyFlow} />;
      default:         return null;
    }
  }

  return (
    <>
      <div className={`app-shell${showAdd ? ' sheet-open' : ''}`}>
        {renderScreen()}
        <BottomNav
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onAddPress={() => setShowAdd(true)}
        />
      </div>

      {showAdd && (
        <AddSheet
          onAddExpense={moneyFlow.addExpense}
          onAddIncome={moneyFlow.addIncome}
          onClose={() => setShowAdd(false)}
        />
      )}
    </>
  );
}
