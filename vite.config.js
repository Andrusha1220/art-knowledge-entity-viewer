import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Let `import data from './x.geojson'` return the parsed object, like .json does.
function geojson() {
  return {
    name: 'geojson-as-json',
    enforce: 'pre',
    transform(code, id) {
      if (id.endsWith('.geojson')) {
        return { code: `export default ${code}`, map: null }
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [geojson(), react()],
})
