import { useEffect, useMemo, useRef } from 'react'
import L from 'leaflet'
import { groupVenues } from '../data.js'

function popupHtml(venue) {
  const shows = venue.shows
    .map(
      (ex) => `
      <button class="popup-show" data-id="${ex.id}">
        ${
          ex.preview
            ? `<img src="${ex.preview}" alt="" onerror="this.style.display='none'" />`
            : `<span class="ph">×</span>`
        }
        <span>
          <span class="t">${ex.title}</span>
          <span class="d micro" style="display:block">${ex.dates || 'Dates TBA'}</span>
        </span>
      </button>`
    )
    .join('')
  return `
    <div class="popup">
      <span class="micro">${venue.name}${venue.city ? ` · ${venue.city}` : ''}</span>
      ${shows}
    </div>`
}

export default function MapView({ items, focus, onOpen }) {
  const mapEl = useRef(null)
  const venues = useMemo(() => groupVenues(items), [items])
  const unmappedCount = useMemo(() => items.filter((ex) => !ex.coords).length, [items])

  useEffect(() => {
    const map = L.map(mapEl.current, {
      zoomControl: false,
      attributionControl: true,
      worldCopyJump: true,
    })

    L.control.zoom({ position: 'bottomright' }).addTo(map)

    L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      {
        attribution: '© OpenStreetMap · © CARTO',
        subdomains: 'abcd',
        maxZoom: 19,
      }
    ).addTo(map)

    const group = L.featureGroup()
    let focusMarker = null

    venues.forEach((venue) => {
      const marker = L.marker(venue.coords, {
        icon: L.divIcon({
          className: 'venue-dot',
          html: '<span></span>',
          iconSize: [14, 14],
          iconAnchor: [7, 7],
        }),
        title: venue.name,
      })

      marker.bindPopup(popupHtml(venue), { closeButton: true })
      marker.on('popupopen', (e) => {
        e.popup
          .getElement()
          .querySelectorAll('.popup-show')
          .forEach((btn) =>
            btn.addEventListener('click', () => onOpen(btn.dataset.id))
          )
      })

      marker.addTo(group)
      if (focus && venue.coords[0] === focus[0] && venue.coords[1] === focus[1]) {
        focusMarker = marker
      }
    })

    group.addTo(map)

    if (focus) {
      map.setView(focus, 15)
      if (focusMarker) focusMarker.openPopup()
    } else if (venues.length) {
      map.fitBounds(group.getBounds(), { padding: [60, 60], maxZoom: 13 })
    } else {
      map.setView([20, 0], 2)
    }

    return () => map.remove()
  }, [focus, onOpen, venues])

  return (
    <div className="map-wrap">
      <div ref={mapEl} className="map" />
      <div className="map-legend micro">
        <b>●</b> {venues.length} venues mapped
        {unmappedCount > 0 && ` · ${unmappedCount} without a pin`}
      </div>
    </div>
  )
}
