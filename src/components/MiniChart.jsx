// MiniChart — a simple bar chart for weekly or monthly spending.
// Pass an array of numbers and it renders proportional bars.
// The `activeIndex` bar is highlighted in black.
// Labels appear below (pass a labels array matching the data length).

export default function MiniChart({ data = [], labels = [], activeIndex }) {
  const max = Math.max(...data, 1); // avoid division by zero

  return (
    <div>
      <div className="mini-chart">
        {data.map((value, i) => (
          <div
            key={i}
            className={`mini-bar${i === activeIndex ? ' active' : ''}`}
            style={{ height: Math.max(4, Math.round((value / max) * 52)) + 'px' }}
            aria-label={`${labels[i] ?? i}: $${Math.round(value)}`}
          />
        ))}
      </div>
      {labels.length > 0 && (
        <div className="mini-bar-labels">
          {labels.map((l, i) => (
            <span key={i}>{l}</span>
          ))}
        </div>
      )}
    </div>
  );
}
