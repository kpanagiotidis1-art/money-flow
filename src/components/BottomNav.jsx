// BottomNav — the 5-item tab bar at the bottom of the screen.
// The centre button opens the AddSheet.
// activeTab is one of: 'home' | 'flow' | 'subs' | 'insights'

export default function BottomNav({ activeTab, onTabChange, onAddPress }) {
  const tabs = [
    {
      key: 'home',
      label: 'Home',
      icon: (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z" />
          <path d="M9 21V12h6v9" />
        </svg>
      ),
    },
    {
      key: 'flow',
      label: 'Flow',
      icon: (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="3" y="12" width="4" height="9" rx="1" />
          <rect x="10" y="7" width="4" height="14" rx="1" />
          <rect x="17" y="3" width="4" height="18" rx="1" />
        </svg>
      ),
    },
    null, // centre add button placeholder
    {
      key: 'subs',
      label: 'Subs',
      icon: (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 2a10 10 0 100 20A10 10 0 0012 2z" />
          <path d="M12 6v6l4 2" />
        </svg>
      ),
    },
    {
      key: 'insights',
      label: 'Insights',
      icon: (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
      ),
    },
  ];

  return (
    <nav className="bottom-nav" aria-label="Main navigation">
      {tabs.map((tab, i) => {
        // Centre slot — the add button
        if (tab === null) {
          return (
            <button
              key="add"
              className="nav-add-btn"
              onClick={onAddPress}
              aria-label="Add transaction"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </button>
          );
        }

        return (
          <button
            key={tab.key}
            className={`nav-btn${activeTab === tab.key ? ' active' : ''}`}
            onClick={() => onTabChange(tab.key)}
            aria-label={tab.label}
            aria-current={activeTab === tab.key ? 'page' : undefined}
          >
            {tab.icon}
            <span className="nav-btn-label">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
