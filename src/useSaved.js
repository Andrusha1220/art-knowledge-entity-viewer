import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'em-cartaz:saved'

function readStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? new Set(JSON.parse(raw)) : new Set()
  } catch {
    return new Set()
  }
}

export function useSaved() {
  const [saved, setSaved] = useState(readStored)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...saved]))
    } catch {
      // storage unavailable (private browsing, quota) — save state just won't persist
    }
  }, [saved])

  const toggle = useCallback((id) => {
    setSaved((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const isSaved = useCallback((id) => saved.has(id), [saved])

  return { savedCount: saved.size, isSaved, toggle }
}
