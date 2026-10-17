import { useEffect, useId, useMemo, useState } from 'react'

type Position = [longitude: number, latitude: number]
type PolygonCoordinates = Position[][]
type GeoFeature = {
  properties: { codarea: string }
  geometry:
    | { type: 'Polygon'; coordinates: PolygonCoordinates }
    | { type: 'MultiPolygon'; coordinates: PolygonCoordinates[] }
}

interface RouteDiagramProps {
  compact?: boolean
  emphasized?: 'origin' | 'destination' | 'flow'
  direction?: 'sp-ro' | 'ro-sp'
}

const width = 470
const height = 470
const margin = 34
const capitals = {
  ro: { name: 'Porto Velho', code: 'RO', longitude: -63.90389, latitude: -8.76194 },
  sp: { name: 'São Paulo', code: 'SP', longitude: -46.63389, latitude: -23.55028 },
}

function rawAlbers([longitude, latitude]: Position): Position {
  const radians = Math.PI / 180
  const phi1 = -5 * radians
  const phi2 = -42 * radians
  const phi0 = -20 * radians
  const lambda0 = -54 * radians
  const phi = latitude * radians
  const lambda = longitude * radians
  const n = (Math.sin(phi1) + Math.sin(phi2)) / 2
  const c = Math.cos(phi1) ** 2 + 2 * n * Math.sin(phi1)
  const rho = Math.sqrt(c - 2 * n * Math.sin(phi)) / n
  const rho0 = Math.sqrt(c - 2 * n * Math.sin(phi0)) / n
  return [rho * Math.sin(n * (lambda - lambda0)), rho0 - rho * Math.cos(n * (lambda - lambda0))]
}

function ringsOf(feature: GeoFeature): PolygonCoordinates[] {
  return feature.geometry.type === 'Polygon' ? [feature.geometry.coordinates] : feature.geometry.coordinates
}

function createMapLayout(features: GeoFeature[]) {
  const projected = features.map((feature) => ({
    feature,
    polygons: ringsOf(feature).map((polygon) => polygon.map((ring) => ring.map(rawAlbers))),
  }))
  const points = projected.flatMap(({ polygons }) => polygons.flatMap((polygon) => polygon.flat()))
  const xMin = Math.min(...points.map(([x]) => x))
  const xMax = Math.max(...points.map(([x]) => x))
  const yMin = Math.min(...points.map(([, y]) => y))
  const yMax = Math.max(...points.map(([, y]) => y))
  const scale = Math.min((width - margin * 2) / (xMax - xMin), (height - margin * 2) / (yMax - yMin))
  const mapWidth = (xMax - xMin) * scale
  const mapHeight = (yMax - yMin) * scale
  const offsetX = (width - mapWidth) / 2
  const offsetY = (height - mapHeight) / 2
  const mapPoint = ([x, y]: Position): Position => [
    offsetX + (x - xMin) * scale,
    height - offsetY - (y - yMin) * scale,
  ]
  const project = ([longitude, latitude]: Position): Position => {
    const [x, y] = rawAlbers([longitude, latitude])
    return mapPoint([x, y])
  }
  const pathFor = (polygons: PolygonCoordinates[]) => polygons.map((polygon) => polygon.map((ring) => ring.map((point, index) => {
    const [x, y] = mapPoint(point)
    return `${index === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`
  }).join(' ') + 'Z').join(' ')).join(' ')
  return { states: projected.map(({ feature, polygons }) => ({ code: feature.properties.codarea, path: pathFor(polygons) })), project }
}

function greatCircle(from: Position, to: Position, segments = 36): Position[] {
  const radians = Math.PI / 180
  const vector = ([longitude, latitude]: Position): [number, number, number] => {
    const lambda = longitude * radians
    const phi = latitude * radians
    return [Math.cos(phi) * Math.cos(lambda), Math.cos(phi) * Math.sin(lambda), Math.sin(phi)]
  }
  const a = vector(from)
  const b = vector(to)
  const angle = Math.acos(Math.min(1, Math.max(-1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2])))
  return Array.from({ length: segments + 1 }, (_, index) => {
    const t = index / segments
    const divisor = Math.sin(angle)
    const startWeight = Math.sin((1 - t) * angle) / divisor
    const endWeight = Math.sin(t * angle) / divisor
    const x = startWeight * a[0] + endWeight * b[0]
    const y = startWeight * a[1] + endWeight * b[1]
    const z = startWeight * a[2] + endWeight * b[2]
    return [Math.atan2(y, x) / radians, Math.atan2(z, Math.hypot(x, y)) / radians] as Position
  })
}

export function RouteDiagram({ compact = false, emphasized = 'flow', direction = 'sp-ro' }: RouteDiagramProps) {
  const [features, setFeatures] = useState<GeoFeature[] | null>(null)
  const [loadError, setLoadError] = useState(false)
  const generatedId = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const map = useMemo(() => features ? createMapLayout(features) : null, [features])
  const origin = direction === 'sp-ro' ? capitals.sp : capitals.ro
  const destination = direction === 'sp-ro' ? capitals.ro : capitals.sp
  const originPoint = map?.project([origin.longitude, origin.latitude])
  const destinationPoint = map?.project([destination.longitude, destination.latitude])
  const routePath = map && originPoint && destinationPoint
    ? greatCircle([origin.longitude, origin.latitude], [destination.longitude, destination.latitude])
      .map((point, index) => {
        const [x, y] = map.project(point)
        return `${index === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`
      }).join(' ')
    : ''

  useEffect(() => {
    const controller = new AbortController()
    fetch('/data/brazil-states.geojson', { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error('Não foi possível carregar a malha do IBGE.')
        return response.json() as Promise<{ features: GeoFeature[] }>
      })
      .then((data) => setFeatures(data.features))
      .catch((error: unknown) => {
        if (error instanceof Error && error.name === 'AbortError') return
        setLoadError(true)
      })
    return () => controller.abort()
  }, [])

  const labelFor = (capital: typeof capitals.ro | typeof capitals.sp, point: Position, direction: 'ro' | 'sp') => {
    const [x, y] = point
    const isRo = direction === 'ro'
    const tx = x + (isRo ? 12 : -12)
    const ty = y + (isRo ? -12 : 20)
    return (
      <g className={`map-city map-city--${direction}`} transform={`translate(${tx} ${ty})`} textAnchor={isRo ? 'start' : 'end'}>
        <text className="map-city__code" y="-17">CAPITAL · {capital.code}</text>
        <text className="map-city__name" y="0">{capital.name}</text>
      </g>
    )
  }

  const roPoint = map?.project([capitals.ro.longitude, capitals.ro.latitude])
  const spPoint = map?.project([capitals.sp.longitude, capitals.sp.latitude])

  return (
    <div className={`route-visual${compact ? ' route-visual--compact' : ''}`} aria-label="Mapa das unidades federativas do Brasil com rota entre Rondônia e São Paulo">
      {map && originPoint && destinationPoint && roPoint && spPoint ? (
        <svg className="route-map" viewBox={`0 0 ${width} ${height}`} role="img" aria-labelledby={`route-title-${generatedId} route-desc-${generatedId}`}>
          <title id={`route-title-${generatedId}`}>Mapa geográfico do Brasil: {origin.name}, {origin.code}, até {destination.name}, {destination.code}</title>
          <desc id={`route-desc-${generatedId}`}>Malha estadual geográfica do IBGE em projeção Albers. A rota animada liga as capitais {origin.name} e {destination.name}, com os estados de Rondônia e São Paulo destacados.</desc>
          <defs>
            <linearGradient id={`route-line-${generatedId}`} x1="0" x2="1" y1="0" y2="1">
              <stop offset="0" stopColor="#63D9E8" />
              <stop offset="1" stopColor="#5B8CFF" />
            </linearGradient>
            <marker id={`route-arrow-${generatedId}`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0 0 10 5 0 10Z" fill="#63D9E8" />
            </marker>
          </defs>
          <g className="brazil-states" aria-hidden="true">
            {map.states.map(({ code, path }) => <path key={code} className={`brazil-state${code === '11' ? ' brazil-state--ro' : ''}${code === '35' ? ' brazil-state--sp' : ''}`} d={path} />)}
          </g>
          <path className="route-track is-active" d={routePath} style={{ stroke: `url(#route-line-${generatedId})` }} markerEnd={`url(#route-arrow-${generatedId})`} />
          <g className="route-parcel" key={direction}>
            <g>
              <rect x="-9" y="-7" width="18" height="14" rx="2" />
              <path d="M-9-3 0 1 9-3M0 1V7M-4-5 4-2" />
              <animateMotion dur="5s" repeatCount="indefinite" rotate="auto" path={routePath} />
            </g>
          </g>
          {([['ro', capitals.ro, roPoint], ['sp', capitals.sp, spPoint]] as const).map(([key, capital, point]) => (
            <g key={key}>
              <circle className={`route-node route-node--${key}${emphasized === (direction === 'sp-ro' ? key === 'sp' ? 'origin' : 'destination' : key === 'ro' ? 'origin' : 'destination') ? ' is-active' : ''}`} cx={point[0]} cy={point[1]} r="5.5" />
              <path className={`map-city-leader map-city-leader--${key}`} d={`M${point[0]},${point[1]} L${point[0] + (key === 'ro' ? 9 : -9)},${point[1] + (key === 'ro' ? -8 : 10)}`} />
              {labelFor(capital, point, key)}
            </g>
          ))}
        </svg>
      ) : (
        <div className="route-map__status" role={loadError ? 'alert' : 'status'}>{loadError ? 'Não foi possível carregar a malha geográfica local do IBGE.' : 'Carregando o mapa geográfico do Brasil…'}</div>
      )}
      <div className="route-note">
        <span className="route-note__index">{origin.code} → {destination.code}</span>
        <span>Rota entre as capitais · <a href="https://servicodados.ibge.gov.br/api/docs/malhas?versao=3" target="_blank" rel="noreferrer">Malha geográfica simplificada do IBGE</a></span>
      </div>
    </div>
  )
}
