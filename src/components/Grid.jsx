const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function tag(ex) {
  if (ex.status === 'upcoming') {
    const [y, m, d] = ex.beginDate.slice(0, 10).split('-').map(Number)
    return { text: `Opens ${d} ${MONTHS[m - 1]}`, closing: false }
  }
  if (ex.status === 'current' && ex.daysLeft <= 10) {
    return { text: ex.daysLeft <= 0 ? 'Closing' : 'Last days', closing: true }
  }
  return null
}

export default function Grid({ items, onOpen, isSaved, onToggleSave }) {
  return (
    <main className="grid">
      {items.map((ex, i) => {
        const t = tag(ex)
        const saved = isSaved(ex.id)
        return (
          <div
            key={ex.id}
            className={`card${ex.image ? '' : ' card--text'}`}
            onClick={() => onOpen(ex.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onOpen(ex.id)
              }
            }}
            role="button"
            tabIndex={0}
            aria-label={ex.title}
          >
            {ex.image && (
              <img
                src={ex.image}
                alt={ex.title}
                loading={i < 4 ? 'eager' : 'lazy'}
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
            )}
            <span className="card-body">
              <span className="card-meta micro">
                <span>{String(i + 1).padStart(2, '0')} / {ex.type}</span>
                <span className="card-meta-right">
                  {t && (
                    <span className={t.closing ? 'card-tag--closing' : 'card-tag--soon'}>
                      {t.text}
                    </span>
                  )}
                  <button
                    className={`save-btn${saved ? ' card-tag--closing' : ' card-tag--soon'}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      onToggleSave(ex.id)
                    }}
                    aria-pressed={saved}
                    aria-label={saved ? 'Remove from saved' : 'Save exhibition'}
                  >
                    {saved ? 'Saved' : 'Save'}
                  </button>
                </span>
              </span>
              <span>
                {!ex.image && <span className="card-rule" />}
                <span className="card-title">{ex.title}</span>
                <span className="card-venue micro" style={{ display: 'block' }}>
                  {ex.venue}
                  {ex.city ? ` · ${ex.city}` : ''}
                </span>
              </span>
            </span>
          </div>
        )
      })}
    </main>
  )
}
