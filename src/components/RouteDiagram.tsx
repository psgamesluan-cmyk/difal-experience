interface RouteDiagramProps {
  compact?: boolean
  emphasized?: 'origin' | 'destination' | 'flow'
}

export function RouteDiagram({ compact = false, emphasized = 'flow' }: RouteDiagramProps) {
  return (
    <div className={`route-visual${compact ? ' route-visual--compact' : ''}`} aria-label="Diagrama conceitual de uma operação interestadual entre São Paulo e Rondônia">
      <svg className="route-map" viewBox="0 0 720 470" role="img" aria-labelledby="route-title route-desc">
        <title id="route-title">Fluxo conceitual de uma mercadoria entre estados</title>
        <desc id="route-desc">Uma mercadoria sai do estado de origem e segue ao consumidor final no estado de destino. As regras de recolhimento variam conforme a operação.</desc>
        <defs>
          <pattern id="map-dots" width="28" height="28" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="currentColor" opacity=".18" />
          </pattern>
          <linearGradient id="route-line" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="#63D9E8" />
            <stop offset="1" stopColor="#5B8CFF" />
          </linearGradient>
        </defs>
        <path className="map-shape" d="M96 54 187 37l31 30 83-13 43 39 59-13 38 28 65-8 35 47-19 43 42 52-33 41 8 48-58 23-42 51-68-12-53 34-59-19-58 11-21-42-50-15-14-45-38-14 11-51-31-37 18-44-15-51 36-24-8-49Z" />
        <path className="map-grid" d="M96 54 187 37l31 30 83-13 43 39 59-13 38 28 65-8 35 47-19 43 42 52-33 41 8 48-58 23-42 51-68-12-53 34-59-19-58 11-21-42-50-15-14-45-38-14 11-51-31-37 18-44-15-51 36-24-8-49Z" />
        <path className={`route-track ${emphasized === 'flow' ? 'is-active' : ''}`} d="M528 349 C 455 335, 438 270, 390 250 S 301 188, 223 168" />
        <circle className={`route-node route-node--origin ${emphasized === 'origin' ? 'is-active' : ''}`} cx="528" cy="349" r="10" />
        <circle className={`route-node route-node--destination ${emphasized === 'destination' ? 'is-active' : ''}`} cx="223" cy="168" r="10" />
        <g className="route-parcel" transform="translate(383 250)">
          <rect x="-17" y="-13" width="34" height="27" rx="4" />
          <path d="M-17-5 0 3 17-5M0 3V14M-7-10l17 6" />
        </g>
        <g className="route-label route-label--origin" transform="translate(493 390)">
          <text className="route-label__overline" x="0" y="0">ORIGEM · SP</text>
          <text className="route-label__main" x="0" y="24">São Paulo</text>
          <text className="route-label__sub" x="0" y="45">remetente</text>
        </g>
        <g className="route-label route-label--destination" transform="translate(117 111)">
          <text className="route-label__overline" x="0" y="0">DESTINO · RO</text>
          <text className="route-label__main" x="0" y="24">Rondônia</text>
          <text className="route-label__sub" x="0" y="45">consumidor final</text>
        </g>
      </svg>
      <div className="route-note">
        <span className="route-note__index">01 / FLUXO</span>
        <span>A regra de recolhimento depende da operação e da condição do destinatário.</span>
      </div>
    </div>
  )
}
