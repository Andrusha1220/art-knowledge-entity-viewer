import { useEffect } from 'react'

function statusLabel(ex) {
  if (ex.status === 'upcoming') {
    const d = new Date(ex.beginDate)
    return { text: `Opens ${d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}`, hot: false }
  }
  if (ex.status === 'closed') return { text: 'Closed', hot: false }
  if (ex.daysLeft <= 10) {
    return { text: ex.daysLeft <= 0 ? 'Closes today' : `${ex.daysLeft} days left`, hot: true }
  }
  return { text: 'On view', hot: false }
}

export default function Post({ exhibition: ex, onClose, onShowOnMap, isSaved, onToggleSave }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const status = statusLabel(ex)
  const saved = isSaved(ex.id)

  return (
    <div className="post-backdrop" onClick={onClose}>
      <article className="post" onClick={(e) => e.stopPropagation()}>
        <button className="post-close" onClick={onClose} aria-label="Close">
          ×
        </button>

        {ex.image ? (
          <div className="post-media">
            <img
              src={ex.image}
              alt={ex.title}
              onError={(e) => {
                e.currentTarget.parentElement.classList.add('post-media--empty')
                e.currentTarget.parentElement.innerHTML = '<span>sem imagem</span>'
              }}
            />
          </div>
        ) : (
          <div className="post-media post-media--empty">
            <span>sem imagem</span>
          </div>
        )}

        <div className="post-info">
          <div className="post-kicker micro">
            <span>{ex.type} exhibition</span>
            <span className={status.hot ? 'closing' : ''}>{status.text}</span>
          </div>

          <h2 className="post-title">{ex.title}</h2>

          <div className="post-field">
            <span className="micro">Dates</span>
            <p>{ex.dates || 'Dates to be announced'}</p>
          </div>

          <div className="post-field">
            <span className="micro">Venue</span>
            <p>
              {ex.venue}
              {ex.organizer && ex.organizer !== ex.venue && (
                <span style={{ color: 'var(--grey)', fontSize: 15, display: 'block' }}>
                  {ex.organizer}
                </span>
              )}
              {ex.address && (
                <span style={{ color: 'var(--grey)', fontSize: 15, display: 'block' }}>
                  {ex.address}
                </span>
              )}
            </p>
          </div>

          {ex.openingNote && (
            <div className="post-field">
              <span className="micro">Opening</span>
              <p style={{ fontSize: 15, color: 'var(--grey)' }}>{ex.openingNote}</p>
            </div>
          )}

          <div className="post-actions micro">
            <button
              className={`btn${saved ? ' btn--red' : ''}`}
              onClick={() => onToggleSave(ex.id)}
              aria-pressed={saved}
            >
              {saved ? 'Saved ✓' : 'Save'}
            </button>
            {ex.coords && (
              <button className="btn btn--red" onClick={() => onShowOnMap(ex.coords)}>
                View on map
              </button>
            )}
            {(ex.www || ex.profileUrl) && (
              <a
                className="btn"
                href={ex.www || ex.profileUrl}
                target="_blank"
                rel="noreferrer"
              >
                Details ↗
              </a>
            )}
          </div>
        </div>
      </article>
    </div>
  )
}
