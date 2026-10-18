import { useEffect, useState, type CSSProperties } from 'react'

const confettiPieces = Array.from({ length: 30 }, (_, index) => {
  const seed = index * 47 + 19
  const palette = ['#63d9e8', '#9bbaff', '#d8c18a', '#f6f8fc', '#7f9bd0']
  return {
    color: palette[index % palette.length],
    delay: (index % 8) * 0.09,
    drift: ((seed * 13) % 240) - 120,
    duration: 4.6 + (index % 6) * 0.35,
    burst: ((seed * 17) % 240) - 120,
    rotate: ((seed * 29) % 620) - 310,
    left: `${((seed * 31) % 101) - 50}vw`,
    shape: index % 3 === 0 ? 'round' : index % 3 === 1 ? 'line' : 'square',
    size: 3 + (index % 3),
  }
})

export function FinalizationPage() {
  const [celebrationActive, setCelebrationActive] = useState(() => typeof window !== 'undefined' && !window.matchMedia('(prefers-reduced-motion: reduce)').matches)

  useEffect(() => {
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handleMotionChange = () => {
      setCelebrationActive(!motionPreference.matches)
    }
    const timer = celebrationActive ? window.setTimeout(() => setCelebrationActive(false), 7200) : undefined

    motionPreference.addEventListener('change', handleMotionChange)
    return () => {
      if (timer !== undefined) window.clearTimeout(timer)
      motionPreference.removeEventListener('change', handleMotionChange)
    }
  }, [celebrationActive])

  return (
    <main className="finalization-page">
      <div className="finalization-page__grain" aria-hidden="true" />
      {celebrationActive && (
        <div className="finalization-confetti" aria-hidden="true">
          {confettiPieces.map((piece, index) => (
            <span
              className={`finalization-confetti__piece finalization-confetti__piece--${piece.shape}`}
              key={index}
              style={{
                '--confetti-color': piece.color,
                '--confetti-delay': `${piece.delay}s`,
                '--confetti-drift': `${piece.drift}px`,
                '--confetti-duration': `${piece.duration}s`,
                '--confetti-burst': `${piece.burst}px`,
                '--confetti-rotate': `${piece.rotate}deg`,
                '--confetti-left': piece.left,
                '--confetti-size': `${piece.size}px`,
              } as CSSProperties}
            />
          ))}
        </div>
      )}

      <header className="finalization-header">
        <a className="brand" href="/#home" aria-label="DIFAL Experience, voltar ao início">
          <span className="brand__mark">D</span>
          <span className="brand__name">DIFAL<small>EXPERIENCE</small></span>
        </a>
        <span className="finalization-header__label">PERCURSO CONCLUÍDO</span>
      </header>

      <div className="finalization-page__rule" aria-hidden="true"><span /></div>

      <section className="finalization-content" aria-labelledby="finalization-title">
        <div className="finalization-content__index" aria-hidden="true"><span>09</span><i /></div>
        <p className="eyebrow finalization-content__eyebrow">APRESENTAÇÃO ENCERRADA <span>·</span> DIFAL E ICMS</p>
        <h1 id="finalization-title">Obrigado por <em>acompanhar.</em></h1>
        <p className="finalization-content__message">Esperamos que este percurso tenha ajudado a compreender como o DIFAL se relaciona com as operações interestaduais e com as regras aplicáveis a cada caso.</p>
        <p className="finalization-content__note">Conteúdo acadêmico · consulte sempre a legislação vigente e as fontes oficiais.</p>
        <a className="button finalization-content__button" href="/#fontes">
          Voltar ao conteúdo
          <svg aria-hidden="true" width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M15.5 9h-12m5 5-5-5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </a>
      </section>

      <footer className="finalization-footer">
        <span>FIM DA APRESENTAÇÃO</span>
        <span className="finalization-footer__line" aria-hidden="true" />
        <a href="/#home">DIFAL EXPERIENCE</a>
      </footer>
    </main>
  )
}
