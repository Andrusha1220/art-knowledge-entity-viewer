import { useCallback, useEffect, useMemo, useState } from 'react'
import { exhibitions, onViewCount } from './data.js'
import { useSaved } from './useSaved.js'
import Grid from './components/Grid.jsx'
import MapView from './components/MapView.jsx'
import Post from './components/Post.jsx'

const NOW = new Date()
const MONTH = NOW.toLocaleString('en-GB', { month: 'long' })

const EMPTY_MESSAGE = {
  upcoming: 'No upcoming exhibitions right now.',
  saved: 'Nothing saved yet — tap Save on a card to keep it here.',
}

export default function App() {
  const [view, setView] = useState('grid')
  const [filter, setFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState(null)
  const [selectedId, setSelectedId] = useState(null)
  const [mapFocus, setMapFocus] = useState(null)
  const [scrolled, setScrolled] = useState(false)
  const { savedCount, isSaved, toggle: toggleSaved } = useSaved()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const visible = useMemo(() => {
    let list = exhibitions
    if (filter === 'upcoming') list = list.filter((e) => e.status === 'upcoming')
    else if (filter === 'saved') list = list.filter((e) => isSaved(e.id))
    if (typeFilter) list = list.filter((e) => e.type === typeFilter)
    return list
  }, [filter, isSaved, typeFilter])

  const statusWord = filter === 'upcoming' ? 'upcoming' : filter === 'saved' ? 'saved' : 'on view'
  const liveLabel =
    filter === 'all' && !typeFilter
      ? `${onViewCount} on view`
      : `${visible.length} ${typeFilter ? `${typeFilter.toLowerCase()} ` : ''}${statusWord}`

  const selected = exhibitions.find((e) => e.id === selectedId) || null

  const openMapAt = useCallback((coords) => {
    setSelectedId(null)
    setMapFocus(coords)
    setView('map')
  }, [])

  useEffect(() => {
    document.body.style.overflow = selected ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [selected])

  return (
    <>
      <header className={`masthead${scrolled ? ' scrolled' : ''}`}>
        <div className="masthead-top micro">
          <div className="masthead-top-left">
            <span>Now Showing · {MONTH} {NOW.getFullYear()}</span>
            <nav className="filter-switch" aria-label="Filter">
              <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>
                All
              </button>
              <button
                className={filter === 'upcoming' ? 'active' : ''}
                onClick={() => setFilter('upcoming')}
              >
                Upcoming
              </button>
              <button className={filter === 'saved' ? 'active' : ''} onClick={() => setFilter('saved')}>
                Saved{savedCount > 0 ? ` (${savedCount})` : ''}
              </button>
            </nav>
            <nav className="filter-switch" aria-label="Exhibition type">
              <button
                className={typeFilter === 'Solo' ? 'active' : ''}
                onClick={() => setTypeFilter((t) => (t === 'Solo' ? null : 'Solo'))}
              >
                Solo
              </button>
              <button
                className={typeFilter === 'Group' ? 'active' : ''}
                onClick={() => setTypeFilter((t) => (t === 'Group' ? null : 'Group'))}
              >
                Group
              </button>
            </nav>
          </div>
          <span className="live">● {liveLabel}</span>
        </div>
        <h1 className="wordmark">
          Em <em>Cartaz</em>
        </h1>
        <div className="masthead-bottom">
          <p className="micro">A field guide to exhibitions worth the airfare</p>
          <nav className="view-switch micro" aria-label="View">
            <button className={view === 'grid' ? 'active' : ''} onClick={() => setView('grid')}>
              Grid
            </button>
            <button className={view === 'map' ? 'active' : ''} onClick={() => setView('map')}>
              Map
            </button>
          </nav>
        </div>
      </header>

      {view === 'grid' ? (
        visible.length ? (
          <Grid items={visible} onOpen={setSelectedId} isSaved={isSaved} onToggleSave={toggleSaved} />
        ) : (
          <p className="empty-state micro">
            {typeFilter
              ? `No ${typeFilter.toLowerCase()} exhibitions match these filters.`
              : EMPTY_MESSAGE[filter]}
          </p>
        )
      ) : (
        <MapView items={visible} focus={mapFocus} onOpen={setSelectedId} />
      )}

      {view === 'grid' && (
        <footer className="colophon micro">
          <span>Em Cartaz — now showing, wherever the walls are</span>
        </footer>
      )}

      {selected && (
        <Post
          exhibition={selected}
          onClose={() => setSelectedId(null)}
          onShowOnMap={openMapAt}
          isSaved={isSaved}
          onToggleSave={toggleSaved}
        />
      )}
    </>
  )
}
