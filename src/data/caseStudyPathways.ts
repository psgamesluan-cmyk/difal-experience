import type { BrazilianStateCode } from './taxRules.ts'

export interface CaseStudyPathway {
  id: string
  label: string
  origin: BrazilianStateCode
  destination: BrazilianStateCode
}

export const CASE_STUDY_PATHWAYS: CaseStudyPathway[] = [
  { id: 'ro-sp', label: 'Rondônia → São Paulo', origin: 'RO', destination: 'SP' },
  { id: 'sp-ro', label: 'São Paulo → Rondônia', origin: 'SP', destination: 'RO' },
  { id: 'sp-pa', label: 'São Paulo → Pará', origin: 'SP', destination: 'PA' },
  { id: 'pr-ro', label: 'Paraná → Rondônia', origin: 'PR', destination: 'RO' },
]
