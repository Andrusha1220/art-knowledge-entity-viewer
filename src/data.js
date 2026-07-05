import geojson from './exhibitions.geojson'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function parseDate(iso) {
  if (!iso) return null
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number)
  return new Date(y, m - 1, d)
}

const TODAY = (() => {
  const n = new Date()
  return new Date(n.getFullYear(), n.getMonth(), n.getDate())
})()

function fmt(date, withYear) {
  return `${date.getDate()} ${MONTHS[date.getMonth()]}${withYear ? ` ${date.getFullYear()}` : ''}`
}

export function formatRange(begin, end) {
  const b = parseDate(begin)
  const e = parseDate(end)
  if (b && e) {
    const sameYear = b.getFullYear() === e.getFullYear()
    return `${fmt(b, !sameYear)} — ${fmt(e, true)}`
  }
  if (b) return `From ${fmt(b, true)}` // open-ended run, no closing date
  return ''
}

export function daysLeft(end) {
  const e = parseDate(end)
  if (!e) return Infinity
  return Math.round((e - TODAY) / 86400000)
}

// on view now / opening later / closed — drives the status line and live count
function statusOf(begin, end) {
  const b = parseDate(begin)
  const e = parseDate(end)
  if (b && b > TODAY) return 'upcoming'
  if (e && e < TODAY) return 'closed'
  return 'current'
}

export const exhibitions = geojson.features.map((f) => {
  const ex = f.properties.exhibition
  const v = ex.venue || {}
  const images = (ex.images || []).filter((i) => i.image_url)
  const coords =
    f.geometry && Array.isArray(f.geometry.coordinates)
      ? [f.geometry.coordinates[1], f.geometry.coordinates[0]] // [lat, lng]
      : null
  const addressParts = [v.address, v.zip, v.city?.name].filter(Boolean)

  return {
    id: ex.id,
    title: ex.title,
    artist: ex.artist || null,
    type: ex.type === 'S' ? 'Solo' : 'Group',
    beginDate: ex.begin_date,
    endDate: ex.end_date,
    dates: formatRange(ex.begin_date, ex.end_date),
    endLabel: parseDate(ex.end_date) ? fmt(parseDate(ex.end_date), true) : 'Ongoing',
    daysLeft: daysLeft(ex.end_date),
    status: statusOf(ex.begin_date, ex.end_date),
    venue: v.name || 'Unknown venue',
    city: v.city?.name || null,
    address: addressParts.length ? addressParts.join(', ') : null,
    organizer: ex.organizer?.name || '',
    organizerType: ex.organizer?.type || '',
    coords,
    image: images[0]?.image_url || null,
    preview: images[0]?.preview_url || null,
    images,
    opening: ex.opening,
    openingNote: ex.opening?.description?.trim() || null,
    profileUrl: ex.links?.profile || null,
    www: ex.links?.www || null,
    isFeatured: ex.is_featured,
  }
})

export const onViewCount = exhibitions.filter((e) => e.status === 'current').length

export const cities = [...new Set(exhibitions.map((e) => e.city).filter(Boolean))]

// One map point per unique venue location; some galleries host several shows.
export function groupVenues(list) {
  return Object.values(
    list
      .filter((ex) => ex.coords)
      .reduce((acc, ex) => {
        const key = ex.coords.join(',')
        if (!acc[key]) acc[key] = { key, name: ex.venue, city: ex.city, coords: ex.coords, shows: [] }
        acc[key].shows.push(ex)
        return acc
      }, {})
  )
}

export const venues = groupVenues(exhibitions)

export const unmappedCount = exhibitions.filter((ex) => !ex.coords).length
