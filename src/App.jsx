import { useState } from 'react';
import './index.css';

import { useMoneyFlow } from './hooks/useMoneyFlow';
import BottomNav        from './components/BottomNav';
import AddSheet         from './components/AddSheet';
import HomeScreen       from './screens/HomeScreen';
import FlowScreen       from './screens/FlowScreen';
import SubsScreen       from './screens/SubsScreen';
import InsightsScreen   from './screens/InsightsScreen';

// ─────────────────────────────────────────────────────────────
// App — the root component.
//
// This is intentionally simple:
//   1. All state comes from useMoneyFlow
//   2. Tab navigation is just a string: 'home' | 'flow' | 'subs' | 'insights'
//   3. The AddSheet overlay sits at the top level so it appears above everything
// ─────────────────────────────────────────────────────────────

export default function App() {
  const [activeTab,  setActiveTab]  = useState('home');
  const [showAdd,    setShowAdd]    = useState(false);

  // All data and actions come from this one hook
  const moneyFlow = useMoneyFlow();

  function renderScreen() {
    switch (activeTab) {
      case 'home':
        return (
          <HomeScreen
            data={moneyFlow}
            onDeleteTransaction={moneyFlow.deleteTransaction}
          />
        );
      case 'flow':
        return (
          <FlowScreen
            data={moneyFlow}
            onDeleteTransaction={moneyFlow.deleteTransaction}
          />
        );
      case 'subs':
        return (
          <SubsScreen
            data={moneyFlow}
            onDeleteSubscription={moneyFlow.deleteSubscription}
            onAddSubscription={moneyFlow.addSubscription}
          />
        );
      case 'insights':
        return (
          <InsightsScreen
            data={moneyFlow}
          />
        );
      default:
        return null;
    }
  }

  return (
    <div className="app-shell">

      {/* Active screen */}
      {renderScreen()}

      {/* Add transaction sheet (shown on top of everything) */}
      {showAdd && (
        <AddSheet
          onAddExpense={moneyFlow.addExpense}
          onAddIncome={moneyFlow.addIncome}
          onClose={() => setShowAdd(false)}
        />
      )}

      {/* Bottom navigation */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onAddPress={() => setShowAdd(true)}
      />

    </div>
  );
}
