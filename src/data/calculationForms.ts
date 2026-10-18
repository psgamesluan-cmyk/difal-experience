import type { BrazilianStateCode } from './taxRules.ts'

export const CALCULATION_STATE_ORDER: BrazilianStateCode[] = [
  'AC', 'AL', 'AM', 'AP', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
  'PA', 'PB', 'PR', 'PE', 'PI', 'RN', 'RS', 'RJ', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
]

const REGIONS: Record<BrazilianStateCode, 'N' | 'NE' | 'CO' | 'S' | 'SE'> = {
  AC: 'N', AL: 'NE', AM: 'N', AP: 'N', BA: 'NE', CE: 'NE', DF: 'CO', ES: 'SE', GO: 'CO',
  MA: 'NE', MT: 'CO', MS: 'CO', MG: 'SE', PA: 'N', PB: 'NE', PR: 'S', PE: 'NE', PI: 'NE',
  RN: 'NE', RS: 'S', RJ: 'SE', RO: 'N', RR: 'N', SC: 'S', SP: 'SE', SE: 'NE', TO: 'N',
}

export const DIAGONAL_VALUES: Partial<Record<BrazilianStateCode, string>> = {
  AC: '19', AL: '19', AM: '20', AP: '18', BA: '19', CE: '20', DF: '20', ES: '17', GO: '17',
  MA: '20', MT: '17', MS: '17', MG: '18', PA: '19', PB: '20', PR: '19', PE: '20.5', PI: '21',
  RN: '18', RS: '17', RJ: '20', RO: '19.5', RR: '20', SC: '17', SP: '18', SE: '19', TO: '20',
}

export function getMatrixRate(origin: BrazilianStateCode, destination: BrazilianStateCode): string {
  if (origin === destination) return DIAGONAL_VALUES[origin] ?? ''
  const originRegion = REGIONS[origin]
  const destinationRegion = REGIONS[destination]
  const reducedRateOrigin = originRegion === 'S' || (originRegion === 'SE' && origin !== 'ES')
  const reducedRateDestination = ['N', 'NE', 'CO'].includes(destinationRegion) || destination === 'ES'
  return reducedRateOrigin && reducedRateDestination ? '7' : '12'
}

export const INTERSTATE_RATE_CONDITIONS = [
  {
    rate: '12%',
    text: 'Quando a saída interestadual é dos estados das regiões CO, N, NE e do estado do ES para os demais estados',
  },
  {
    rate: '12%',
    text: 'Quando a saída interestadual é dos estados das regiões S, SE, exceto o estado do ES, para os estados das regiões S e SE, exceto ES',
  },
  {
    rate: '7%',
    text: 'Quando a saída interestadual é dos estados das regiões S, SE, exceto o estado do ES, para os estados das regiões CO, N e NE e para o estado do ES',
  },
  {
    rate: '4%',
    text: 'Quando a saída de mercadoria importada ou transporte aéreo interestadual de passageiros, carga e mala postal.',
  },
] as const
