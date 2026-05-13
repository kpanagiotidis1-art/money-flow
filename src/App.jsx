import { useState } from 'react';
import './index.css';

import { useMoneyFlow }  from './hooks/useMoneyFlow';
import BottomNav         from './components/BottomNav';
import AddSheet          from './components/AddSheet';
import HomeScreen        from './screens/HomeScreen';
import FlowScreen        from './screens/FlowScreen';
import SubsScreen        from './screens/SubsScreen';
import InsightsScreen    from './screens/InsightsScreen';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [showAdd,   setShowAdd]   = useState(false);

  const moneyFlow = useMoneyFlow();

  function renderScreen() {
    switch (activeTab) {
      case 'home':     return <HomeScreen     data={moneyFlow} onDeleteTransaction={moneyFlow.deleteTransaction} />;
      case 'flow':     return <FlowScreen     data={moneyFlow} onDeleteTransaction={moneyFlow.deleteTransaction} />;
      case 'subs':     return <SubsScreen     data={moneyFlow} onDeleteSubscription={moneyFlow.deleteSubscription} onAddSubscription={moneyFlow.addSubscription} />;
      case 'insights': return <InsightsScreen data={moneyFlow} />;
      default:         return null;
    }
  }

  return (
    <>
      {/* sheet-open class freezes the screen's touch layer while add sheet is open */}
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
