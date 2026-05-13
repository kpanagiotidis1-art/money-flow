// MiniChart — bar chart for weekly or monthly spending.
// Pass onBarClick(index) to make bars tappable.

export default function MiniChart({ data = [], labels = [], activeIndex, onBarClick }) {
  const max = Math.max(...data, 1);
  const clickable = typeof onBarClick === 'function';

  return (
    <div>
      <div className="mini-chart">
        {data.map((value, i) => (
          <div
            key={i}
            className={`mini-bar${i === activeIndex ? ' active' : ''}`}
            style={{
              height: Math.max(4, Math.round((value / max) * 52)) + 'px',
              cursor: clickable ? 'pointer' : 'default',
              opacity: activeIndex !== undefined && i !== activeIndex ? 0.4 : 1,
              transition: 'opacity 0.2s, height 0.4s',
            }}
            onClick={() => clickable && onBarClick(i)}
            aria-label={`${labels[i] ?? i}: $${Math.round(value)}`}
            role={clickable ? 'button' : undefined}
          />
        ))}
      </div>
      {labels.length > 0 && (
        <div className="mini-bar-labels">
          {labels.map((l, i) => (
            <span
              key={i}
              style={{
                fontWeight: i === activeIndex ? 500 : 400,
                color: i === activeIndex ? 'var(--black)' : undefined,
                cursor: clickable ? 'pointer' : 'default',
              }}
              onClick={() => clickable && onBarClick(i)}
            >
              {l}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
