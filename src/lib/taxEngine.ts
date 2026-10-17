import { getTaxRule, STATE_REGIONS, type BrazilianStateCode, type TaxRule } from '../data/taxRules.ts'

export type ScenarioKind = 'final-consumer-sale' | 'taxpayer-acquisition'
export type RecipientStatus = 'taxpayer' | 'non-taxpayer' | 'unknown'
export type AcquisitionPurpose = 'use-consumption' | 'fixed-assets' | 'resale' | 'industrialization' | 'other' | 'not-applicable'
export type GoodsOrigin = 'domestic' | 'imported' | 'unknown'
export type SpecialTreatment = 'none-declared' | 'present' | 'unknown'
export type TaxRegime = 'normal' | 'simples' | 'special' | 'unknown'

export interface TaxScenarioInput {
  scenario: ScenarioKind
  origin: BrazilianStateCode | ''
  destination: BrazilianStateCode | ''
  operationDate: string
  productClassification: string
  recipient: RecipientStatus
  purpose: AcquisitionPurpose
  goodsOrigin: GoodsOrigin
  specialTreatment: SpecialTreatment
  taxRegime: TaxRegime
  productValueCents: bigint | null
  freightCents: bigint | null
  insuranceCents: bigint | null
  accessoryExpensesCents: bigint | null
  ipiCents: bigint | null
  unconditionalDiscountCents: bigint | null
  invalidMoneyFields?: string[]
}

export interface InterstateReference {
  rate: string | null
  rule: TaxRule | null
  note: string
}

export interface TaxEngineResult {
  status: 'invalid' | 'not-supported'
  title: string
  reason: string
  interstateReference: InterstateReference | null
  calculation: null
  alerts: string[]
  sourceRuleIds: string[]
}

const VALID_DATE = /^\d{4}-\d{2}-\d{2}$/

function isValidDate(value: string): boolean {
  if (!VALID_DATE.test(value)) return false
  const parsed = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value
}

export function parseCurrencyToCents(input: string): bigint | null {
  const raw = input.trim().replace(/^R\$\s*/i, '').replace(/\s/g, '')
  if (!raw) return null

  let normalized = raw
  if (raw.includes(',')) {
    if (!/^\d{1,3}(\.\d{3})*(,\d{1,2})?$/.test(raw) && !/^\d+(,\d{1,2})?$/.test(raw)) return null
    normalized = raw.replace(/\./g, '').replace(',', '.')
  } else if (raw.includes('.')) {
    if (/^\d{1,3}(\.\d{3})+$/.test(raw)) normalized = raw.replace(/\./g, '')
    else if (!/^\d+\.\d{1,2}$/.test(raw)) return null
  } else if (!/^\d+$/.test(raw)) return null

  const [whole = '', fraction = ''] = normalized.split('.')
  try {
    return BigInt(whole) * 100n + BigInt((fraction + '00').slice(0, 2))
  } catch {
    return null
  }
}

export function selectInterstateReference(
  origin: BrazilianStateCode,
  destination: BrazilianStateCode,
  operationDate: string,
  goodsOrigin: GoodsOrigin,
): InterstateReference | null {
  if (!isValidDate(operationDate)) return null
  if (origin === destination) return null
  if (operationDate > '2026-10-17') return { rate: null, rule: null, note: 'A data é posterior à última revisão manual desta base (17/10/2026).'
  }
  if (operationDate < '1989-06-01') return { rate: null, rule: null, note: 'A matriz federal de referência ainda não cobre esta data.' }

  if (goodsOrigin === 'imported' || goodsOrigin === 'unknown') {
    return {
      rate: null,
      rule: getTaxRule('RSF-13-4') ?? null,
      note: 'A referência de alíquota interestadual está pendente: é necessário verificar origem, Conteúdo de Importação e exceções da Resolução nº 13/2012.',
    }
  }

  const originRegion = STATE_REGIONS[origin]
  const destinationRegion = STATE_REGIONS[destination]
  const southSoutheastOrigin = originRegion === 'Sul' || (originRegion === 'Sudeste' && origin !== 'ES')
  const regionalDestination = ['Norte', 'Nordeste', 'Centro-Oeste'].includes(destinationRegion) || destination === 'ES'

  if (southSoutheastOrigin && regionalDestination && operationDate < '1990-01-01') {
    return { rate: '8%', rule: getTaxRule('RSF-22-8-EXPIRED') ?? null, note: 'Referência histórica restrita a 01/06/1989–31/12/1989, conforme a redação original da Resolução nº 22/1989.' }
  }

  if (operationDate >= '1990-01-01' && southSoutheastOrigin && regionalDestination) {
    return { rate: '7%', rule: getTaxRule('RSF-22-7') ?? null, note: 'Referência federal para mercadoria declarada nacional, sujeita à confirmação de classificação fiscal e exceções.' }
  }

  const rule = getTaxRule('RSF-22-12') ?? null
  if (!rule || operationDate < rule.effectiveFrom) return { rate: null, rule: null, note: 'Não há regra federal de referência validada para essa data.' }
  return { rate: '12%', rule, note: 'Referência federal geral para mercadoria declarada nacional, sujeita à confirmação de classificação fiscal e exceções.' }
}

export function evaluateTaxScenario(input: TaxScenarioInput): TaxEngineResult {
  if (!input.origin || !input.destination) return invalid('Informe os estados de origem e destino.')
  if (input.origin === input.destination) return invalid('Selecione estados diferentes para uma operação interestadual.')
  if (!isValidDate(input.operationDate)) return invalid('Informe uma data de operação válida.')
  if (input.operationDate > '2026-10-17') return invalid('A data informada está depois da última verificação desta base de regras (17/10/2026).')
  if (input.productValueCents === null || input.productValueCents <= 0n) return invalid('Informe um valor de produtos válido e maior que zero.')
  if (input.invalidMoneyFields?.length) return invalid(`Revise os valores informados em: ${input.invalidMoneyFields.join(', ')}.`)
  if ([input.freightCents, input.insuranceCents, input.accessoryExpensesCents, input.ipiCents, input.unconditionalDiscountCents].some((value) => value !== null && value < 0n)) return invalid('Componentes financeiros não podem ter valores negativos.')
  if (input.scenario === 'final-consumer-sale' && input.recipient === 'unknown') return invalid('Identifique se o consumidor final é contribuinte do ICMS.')
  if (input.scenario === 'taxpayer-acquisition' && input.purpose === 'not-applicable') return invalid('Selecione a finalidade da aquisição.')

  const interstateReference = selectInterstateReference(input.origin, input.destination, input.operationDate, input.goodsOrigin)
  const methodRule = getTaxRule('DIFAL-METHOD-PENDING')
  const roCurrentRule = getTaxRule('RO-ICMS-19_5')
  const roHistoricalRule = getTaxRule('RO-ICMS-17_5-EXPIRED')
  const destinationRule = input.destination === 'RO'
    ? input.operationDate >= (roCurrentRule?.effectiveFrom ?? '9999-12-31')
      ? roCurrentRule
      : input.operationDate >= (roHistoricalRule?.effectiveFrom ?? '9999-12-31') && input.operationDate <= (roHistoricalRule?.effectiveTo ?? '')
        ? roHistoricalRule
        : undefined
    : input.destination === 'SP' && input.operationDate >= '2009-01-01' ? getTaxRule('SP-ICMS-18') : undefined
  const alerts = [
    'A alíquota interna por produto, benefícios, base de cálculo e metodologia estadual não estão validados conjuntamente para esta operação.',
    'Frete, seguro, despesas acessórias, IPI e descontos foram coletados como informações; não foram somados à base.',
    'FCP, substituição tributária, isenção, redução, regime especial e mercadoria com alíquota específica não são calculados.',
    'A responsabilidade e os prazos de pagamento dependem da legislação e do enquadramento aplicáveis à operação concreta.',
  ]
  if (input.goodsOrigin === 'imported' || input.goodsOrigin === 'unknown') alerts.unshift('O tratamento de mercadoria importada depende do Conteúdo de Importação e das exceções da Resolução nº 13/2012.')
  if (!input.productClassification.trim()) alerts.unshift('A NCM ou a descrição fiscal do produto não foi informada; alíquotas específicas e regras por mercadoria não podem ser verificadas.')
  if (input.specialTreatment !== 'none-declared') alerts.unshift('Há tratamento fiscal especial ou ele não foi descartado; o cenário deve ser analisado fora do cálculo automático.')
  if (input.taxRegime === 'unknown') alerts.unshift('O regime de apuração do ICMS não foi identificado; obrigações e forma de cálculo podem depender desse enquadramento.')
  if (input.destination === 'RO') alerts.push('Em Rondônia, a alíquota modal de 19,5% é residual; o FECOEP de 2% alcança produtos específicos e não pode ser aplicado sem validar o art. 27-A da Lei nº 688/1996.')

  return {
    status: 'not-supported',
    title: 'Cenário não suportado para cálculo automático',
    reason: 'A base disponível registra algumas referências normativas, mas não contém regras versionadas por mercadoria, operação, componente de base, FCP e vigência suficientes para apurar um valor confiável. Nenhum valor de DIFAL é produzido.',
    interstateReference,
    calculation: null,
    alerts,
    sourceRuleIds: [interstateReference?.rule?.id, destinationRule?.id, methodRule?.id].filter((id): id is string => Boolean(id)),
  }
}

function invalid(reason: string): TaxEngineResult {
  return { status: 'invalid', title: 'Dados incompletos ou inválidos', reason, interstateReference: null, calculation: null, alerts: [], sourceRuleIds: [] }
}
