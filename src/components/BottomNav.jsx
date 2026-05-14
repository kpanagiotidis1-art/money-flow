// BottomNav — 5-item tab bar with logout on the far right.

export default function BottomNav({ activeTab, onTabChange, onAddPress, onLogout }) {
  const tabs = [
    {
      key: 'home', label: 'Home',
      icon: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z"/><path d="M9 21V12h6v9"/></svg>,
    },
    {
      key: 'flow', label: 'Flow',
      icon: <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="12" width="4" height="9" rx="1"/><rect x="10" y="7" width="4" height="14" rx="1"/><rect x="17" y="3" width="4" height="18" rx="1"/></svg>,
    },
    null, // centre add button
    {
      key: 'subs', label: 'Subs',
      icon: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 100 20A10 10 0 0012 2z"/><path d="M12 6v6l4 2"/></svg>,
    },
    {
      key: 'insights', label: 'Insights',
      icon: <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>,
    },
  ];

  return (
    <nav className="bottom-nav" aria-label="Main navigation">
      {tabs.map((tab, i) => {
        if (tab === null) {
          return (
            <button key="add" className="nav-add-btn" onClick={onAddPress} aria-label="Add transaction">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>
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

      {/* Logout — small, unobtrusive, outside the main tab flow */}
      <button
        onClick={onLogout}
        aria-label="Log out"
        style={{
          position: 'absolute', top: 10, right: 14,
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--gray-400)', padding: 4,
        }}
        title="Log out"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
          <polyline points="16 17 21 12 16 7"/>
          <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
      </button>
    </nav>
  );
}
