export type RecipientKind = 'taxpayer' | 'nonTaxpayer'

export interface CalculationInput {
  operationValue: number
  interstateRate: number
  destinationRate: number
}

export interface CalculationResult {
  rateDifference: number
  illustrativeAmount: number | null
}

export function calculateIllustrativeDifal({
  operationValue,
  interstateRate,
  destinationRate,
}: CalculationInput): CalculationResult {
  const rateDifference = destinationRate - interstateRate

  return {
    rateDifference,
    illustrativeAmount:
      operationValue > 0 && rateDifference >= 0
        ? Math.round(operationValue * rateDifference) / 100
        : null,
  }
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function formatRate(value: number): string {
  return `${new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 }).format(value)}%`
}
