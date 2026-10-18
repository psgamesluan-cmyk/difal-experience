import { parseCurrencyToCents, type ScenarioKind, type RecipientStatus } from './taxEngine.ts'

export interface DidacticSimulationInput {
  scenario: ScenarioKind
  recipient: RecipientStatus
  productValue: string
  freight: string
  insurance: string
  accessories: string
  ipi: string
  discount: string
  interstateRate: string
  internalRate: string
  fcpRate: string
}

export interface DidacticSimulationResult {
  valid: boolean
  errors: string[]
  baseCents: bigint | null
  difalCents: bigint | null
  fcpCents: bigint | null
  interstateBasisPoints: bigint | null
  internalBasisPoints: bigint | null
  fcpBasisPoints: bigint | null
  steps: string[]
  premises: string[]
}

function parseRate(value: string): bigint | null {
  const normalized = value.trim().replace('%', '').replace(',', '.')
  if (!/^(?:\d{1,2})(?:\.\d{1,2})?$|^100(?:\.00?)?$/.test(normalized)) return null
  const [whole = '', fractional = ''] = normalized.split('.')
  const basisPoints = BigInt(whole) * 100n + BigInt((fractional + '00').slice(0, 2))
  return basisPoints <= 10_000n ? basisPoints : null
}

function formatPercent(basisPoints: bigint): string {
  const whole = basisPoints / 100n
  const fraction = (basisPoints % 100n).toString().padStart(2, '0')
  return `${whole},${fraction}%`
}

function formatMoney(cents: bigint): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(cents) / 100)
}

function roundHalfUp(numerator: bigint, denominator: bigint): bigint {
  const quotient = numerator / denominator
  const remainder = numerator % denominator
  return remainder * 2n >= denominator ? quotient + 1n : quotient
}

export function simulateDidacticDifal(input: DidacticSimulationInput): DidacticSimulationResult {
  const errors: string[] = []
  if (input.scenario !== 'final-consumer-sale') errors.push('O exemplo acadêmico configurado usa venda interestadual a consumidor final; escolha essa modalidade ou use a triagem de regras validadas.')
  if (input.scenario === 'final-consumer-sale' && input.recipient !== 'non-taxpayer') errors.push('Para esta fórmula didática, selecione consumidor final não contribuinte. Outras modalidades exigem método próprio.')
  const products = parseCurrencyToCents(input.productValue)
  if (products === null || products <= 0n) errors.push('Informe um valor de mercadoria válido e maior que zero.')
  const optionalAmounts = [
    ['Frete', input.freight, 1n], ['Seguro', input.insurance, 1n], ['Despesas acessórias', input.accessories, 1n],
    ['IPI', input.ipi, 1n], ['Desconto incondicional', input.discount, -1n],
  ] as const
  let base = products ?? 0n
  for (const [label, raw, multiplier] of optionalAmounts) {
    if (!raw.trim()) continue
    const cents = parseCurrencyToCents(raw)
    if (cents === null || cents < 0n) errors.push(`${label}: informe um valor não negativo válido.`)
    else base += cents * multiplier
  }
  if (base <= 0n) errors.push('A base didática resultante precisa ser maior que zero.')
  const interstate = parseRate(input.interstateRate)
  const internal = parseRate(input.internalRate)
  if (interstate === null) errors.push('Informe uma alíquota interestadual válida como premissa manual (0% a 100%).')
  if (internal === null) errors.push('Informe uma alíquota interna válida como premissa manual (0% a 100%).')
  if (interstate !== null && internal !== null && internal < interstate) errors.push('Nesta fórmula demonstrativa, a alíquota interna deve ser igual ou maior que a interestadual.')
  const fcp = input.fcpRate.trim() ? parseRate(input.fcpRate) : null
  if (input.fcpRate.trim() && fcp === null) errors.push('A premissa manual de FCP deve estar entre 0% e 100%.')
  if (errors.length || products === null || interstate === null || internal === null) {
    return { valid: false, errors, baseCents: null, difalCents: null, fcpCents: null, interstateBasisPoints: interstate, internalBasisPoints: internal, fcpBasisPoints: fcp, steps: [], premises: [] }
  }
  const difal = roundHalfUp(base * (internal - interstate), 10_000n)
  const fcpAmount = fcp === null ? null : roundHalfUp(base * fcp, 10_000n)
  return {
    valid: true, errors: [], baseCents: base, difalCents: difal, fcpCents: fcpAmount,
    interstateBasisPoints: interstate, internalBasisPoints: internal, fcpBasisPoints: fcp,
    steps: [
      `Base simplificada = mercadoria ${formatMoney(products)} + parcelas informadas${input.discount.trim() ? ' − desconto incondicional' : ''} = ${formatMoney(base)}.`,
      `Diferença de alíquotas = ${formatPercent(internal)} − ${formatPercent(interstate)} = ${formatPercent(internal - interstate)}.`,
      `DIFAL didático = ${formatMoney(base)} × ${formatPercent(internal - interstate)} = ${formatMoney(difal)} (arredondado ao centavo).`,
      ...(fcp !== null && fcpAmount !== null ? [`FCP separado = ${formatMoney(base)} × ${formatPercent(fcp)} = ${formatMoney(fcpAmount)}; não somado ao DIFAL.`] : []),
    ],
    premises: [
      'As alíquotas são premissas digitadas pelo usuário e não estão confirmadas juridicamente pelo sistema.',
      'Exemplo usa diferença simples sobre a base simplificada informada; a adequação da fórmula depende da hipótese tributária concreta.',
      'Frete, seguro, despesas e IPI preenchidos foram incluídos; o desconto incondicional preenchido foi subtraído apenas para demonstrar a conta.',
      ...(fcp === null ? ['Nenhum FCP foi aplicado automaticamente.'] : ['FCP foi informado manualmente e calculado em linha separada; a incidência e a base precisam de validação legal.']),
      'Não contempla benefício, ST, FECOEP, regime especial, exceção de produto ou outros componentes jurídicos da base.',
    ],
  }
}
