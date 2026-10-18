import type { ReactNode } from 'react'

interface ChapterFrameProps {
  id: string
  number: string
  label: string
  title: string
  intro?: string
  children: ReactNode
  tone?: 'light' | 'dark' | 'mist'
  className?: string
}

export function ChapterFrame({
  id,
  number,
  label,
  title,
  intro,
  children,
  tone = 'light',
  className = '',
}: ChapterFrameProps) {
  return (
    <section className={`chapter chapter--${tone} ${className}`} id={id} aria-labelledby={`${id}-title`}>
      <div className="chapter__inner">
        <header className="chapter__heading">
          <div className="chapter__kicker"><span>{number}</span><span className="chapter__rule" /><span>{label}</span></div>
          <h2 id={`${id}-title`}>{title}</h2>
          {intro && <p className="chapter__intro">{intro}</p>}
        </header>
        <div className="chapter__content">{children}</div>
      </div>
    </section>
  )
}
