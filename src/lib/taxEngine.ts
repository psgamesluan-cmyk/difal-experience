import { getTaxRule, STATE_REGIONS, type BrazilianStateCode, type TaxRule } from '../data/taxRules.ts'
import { getInternalRateRule, type StateInternalRateRule } from '../data/stateInternalRates.ts'
import { resolveApplicableFund, type StateFundReference } from '../data/stateFunds.ts'

export type ScenarioKind = 'final-consumer-sale' | 'taxpayer-acquisition'
export type RecipientStatus = 'taxpayer' | 'non-taxpayer' | 'unknown'
export type AcquisitionPurpose = 'use-consumption' | 'fixed-assets' | 'resale' | 'industrialization' | 'other' | 'not-applicable'
export type GoodsOrigin = 'domestic' | 'imported' | 'unknown'
export type SpecialTreatment = 'none-declared' | 'present' | 'unknown'
export type TaxRegime = 'normal' | 'simples' | 'special' | 'unknown'
export type ResolutionStatus = 'resolved' | 'pending' | 'not-applicable'

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
  status: ResolutionStatus
  rate: string | null
  rule: TaxRule | null
  note: string
}

export interface InternalRateReference {
  status: ResolutionStatus
  rate: string | null
  rule: StateInternalRateRule | null
  note: string
}

export interface BaseResolution {
  status: ResolutionStatus
  operationValueCents: bigint | null
  difalBaseCents: bigint | null
  fcpBaseCents: bigint | null
  method: string | null
  reasons: string[]
}

export interface FcpResolution extends StateFundReference {
  status: ResolutionStatus
  baseCents: bigint | null
  amountCents: bigint | null
  reason: string
}

export interface CalculationMemory {
  scenario: string
  operationDate: string
  route: string
  interstateRule: string
  destinationRule: string
  baseMethod: string
  rounding: string
  blockers: string[]
}

export interface TaxEngineResult {
  status: 'invalid' | 'pending' | 'not-applicable'
  title: string
  reason: string
  interstateReference: InterstateReference | null
  internalReference: InternalRateReference | null
  base: BaseResolution | null
  fcp: FcpResolution | null
  responsibility: { status: ResolutionStatus; party: string | null; basis: string }
  calculation: null
  alerts: string[]
  sourceRuleIds: string[]
  memory: CalculationMemory | null
}

const VALID_DATE = /^\d{4}-\d{2}-\d{2}$/
export const RULES_CHECKED_ON = '2026-10-17'

export function isValidDate(value: string): boolean {
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

/** Deterministic, directional federal reference for a confirmed domestic good. */
export function resolveInterstateRate(
  origin: BrazilianStateCode,
  destination: BrazilianStateCode,
  operationDate: string,
  goodsOrigin: GoodsOrigin,
): InterstateReference | null {
  if (!isValidDate(operationDate) || origin === destination) return null
  if (operationDate > RULES_CHECKED_ON) return { status: 'pending', rate: null, rule: null, note: `Data posterior à revisão manual de ${RULES_CHECKED_ON}; valide os atos vigentes na data.` }
  if (operationDate < '1989-06-01') return { status: 'pending', rate: null, rule: null, note: 'A matriz federal disponível não cobre essa data.' }
  if (goodsOrigin !== 'domestic') {
    return {
      status: 'pending', rate: null, rule: getTaxRule('RSF-13-4') ?? null,
      note: goodsOrigin === 'unknown'
        ? 'Confirme a origem nacional ou importada por documentação fiscal. Sem isso, a regra de 4% não pode ser excluída nem aplicada.'
        : 'Informe se a mercadoria cumpre os critérios de conteúdo de importação/processamento e as exceções da Resolução nº 13/2012. “Importada” isoladamente não valida 4%.',
    }
  }

  const originRegion = STATE_REGIONS[origin]
  const destinationRegion = STATE_REGIONS[destination]
  const regionalOrigin = originRegion === 'Sul' || (originRegion === 'Sudeste' && origin !== 'ES')
  const regionalDestination = ['Norte', 'Nordeste', 'Centro-Oeste'].includes(destinationRegion) || destination === 'ES'

  if (regionalOrigin && regionalDestination && operationDate < '1990-01-01') {
    return { status: 'pending', rate: '8%', rule: getTaxRule('RSF-22-8-EXPIRED') ?? null, note: 'Referência histórica de 8% entre 01/06/1989 e 31/12/1989; confirme classificação, origem e exceções da operação.' }
  }
  if (regionalOrigin && regionalDestination && operationDate >= '1990-01-01') {
    return { status: 'pending', rate: '7%', rule: getTaxRule('RSF-22-7') ?? null, note: 'Referência federal regional de 7% para origem Sul/Sudeste (exceto ES) e destino Norte, Nordeste, Centro-Oeste ou ES; confirme classificação da mercadoria e exceções da operação.' }
  }
  return { status: 'pending', rate: '12%', rule: getTaxRule('RSF-22-12') ?? null, note: 'Referência federal geral de 12% para mercadoria declarada nacional; confirme classificação da mercadoria e exceções da operação.' }
}

/** Backward-compatible name for existing callers; new code should use resolveInterstateRate. */
export const selectInterstateReference = resolveInterstateRate

export function resolveInternalRate(state: BrazilianStateCode, operationDate: string): InternalRateReference {
  const rule = getInternalRateRule(state)
  if (!isValidDate(operationDate)) return { status: 'pending', rate: null, rule, note: 'Informe uma data válida para selecionar a regra estadual pela vigência.' }
  if (operationDate > RULES_CHECKED_ON) return { status: 'pending', rate: null, rule, note: `Data posterior à revisão manual de ${RULES_CHECKED_ON}.` }
  if (state === 'RO' && operationDate < '2024-01-12') {
    const historical = getTaxRule('RO-ICMS-17_5-EXPIRED')
    if (historical && operationDate >= historical.effectiveFrom && (!historical.effectiveTo || operationDate <= historical.effectiveTo)) {
      return { status: 'resolved', rate: historical.rate ?? null, rule: { ...rule, status: 'validated-residual', rate: historical.rate ?? null, effectiveFrom: historical.effectiveFrom, effectiveTo: historical.effectiveTo, act: historical.sourceTitle, provision: historical.provision, sourceTitle: historical.sourceTitle, sourceUrl: historical.sourceUrl, scope: historical.scope, limitations: historical.limitations }, note: 'Alíquota modal histórica residual de RO; verificar se o item estava sujeito a regra específica.' }
    }
  }
  if (rule.status === 'pending') return { status: 'pending', rate: null, rule, note: `${state}: falta confirmar a alíquota interna residual, o ato/artigo e a vigência no portal oficial. A taxa preliminar não foi adotada.` }
  if ((rule.effectiveFrom && operationDate < rule.effectiveFrom) || (rule.effectiveTo && operationDate > rule.effectiveTo)) {
    return { status: 'pending', rate: null, rule, note: `${state}: a regra conhecida não cobre a data informada; é necessário localizar a redação vigente naquele período.` }
  }
  return { status: 'resolved', rate: rule.rate, rule, note: `${state}: ${rule.rate} é referência residual geral, não valida a mercadoria nem afasta alíquota específica, benefício ou regime.` }
}

export function validateOperation(input: TaxScenarioInput): string[] {
  const issues: string[] = []
  if (!input.origin || !input.destination) issues.push('Informe origem e destino.')
  if (!isValidDate(input.operationDate)) issues.push('Informe uma data real da operação no formato AAAA-MM-DD.')
  if (input.operationDate > RULES_CHECKED_ON) issues.push(`A data é posterior à última revisão manual (${RULES_CHECKED_ON}).`)
  if (input.productValueCents === null || input.productValueCents <= 0n) issues.push('Informe o valor dos produtos maior que zero.')
  if (input.invalidMoneyFields?.length) issues.push(`Revise os campos monetários inválidos: ${input.invalidMoneyFields.join(', ')}.`)
  if ([input.freightCents, input.insuranceCents, input.accessoryExpensesCents, input.ipiCents, input.unconditionalDiscountCents].some((value) => value !== null && value < 0n)) issues.push('Frete, seguro, despesas, IPI e desconto não podem ser negativos.')
  if (input.scenario === 'final-consumer-sale' && input.recipient === 'unknown') issues.push('Identifique se o consumidor final é contribuinte do ICMS.')
  if (input.scenario === 'taxpayer-acquisition' && input.purpose === 'not-applicable') issues.push('Selecione a finalidade da aquisição.')
  return issues
}

export function determineOperationBase(input: TaxScenarioInput): BaseResolution {
  const missing: string[] = []
  if (input.productValueCents === null || input.productValueCents <= 0n) missing.push('valor válido da operação/documento fiscal')
  if (input.freightCents !== null || input.insuranceCents !== null || input.accessoryExpensesCents !== null) {
    missing.push('documentação sobre quem contratou/pagou o frete e a natureza dos encargos, para evitar inclusão ou exclusão incorreta')
  }
  if (input.ipiCents !== null) missing.push('enquadramento do IPI na hipótese e confirmação de inclusão na base aplicável')
  if (input.unconditionalDiscountCents !== null) missing.push('confirmação documental do desconto e de seu tratamento na hipótese concreta')
  if (!input.productClassification.trim()) missing.push('NCM/classificação fiscal e verificação de regras específicas, redução, isenção e substituição tributária')
  missing.push('confirmação de que os valores informados correspondem ao valor da operação na base legal aplicável, incluindo ICMS próprio uma única vez')
  return {
    status: 'pending', operationValueCents: null, difalBaseCents: null, fcpBaseCents: null,
    method: input.scenario === 'final-consumer-sale' && input.recipient === 'non-taxpayer'
      ? 'LC 87/1996, art. 13, X e § 7º: valor da operação/preço do serviço e alíquota interna do destino para estabelecer a base; dados fiscais ainda não bastam para compor uma base.'
      : 'A hipótese selecionada segue regra própria de base (LC 87/1996, art. 13, IX ou X, conforme o fato); não determinada sem classificação e documentação.',
    reasons: [...new Set(missing)],
  }
}

export function resolveFcp(destination: BrazilianStateCode): FcpResolution {
  const fund = resolveApplicableFund(destination)
  return {
    ...fund,
    status: 'pending', baseCents: null, amountCents: null,
    reason: fund.validation === 'partially-confirmed'
      ? `${fund.scope} Para a data e o produto concretos, a incidência/base ainda precisa de confirmação. ${fund.limitations.join(' ')}`
      : `FCP/adicional em ${destination} pendente: ${fund.scope} ${fund.limitations.join(' ')}`,
  }
}

export function resolveResponsibility(input: TaxScenarioInput): TaxEngineResult['responsibility'] {
  if (input.scenario === 'final-consumer-sale' && input.recipient === 'non-taxpayer') {
    return { status: 'resolved', party: 'Remetente (regra geral)', basis: 'CF, art. 155, § 2º, VIII, “b”; LC nº 87/1996, art. 4º, § 2º, II, com LC nº 190/2022.' }
  }
  if (input.scenario === 'final-consumer-sale' && input.recipient === 'taxpayer') {
    return { status: 'resolved', party: 'Destinatário contribuinte (regra geral)', basis: 'CF, art. 155, § 2º, VIII, “a”; LC nº 87/1996, art. 4º, § 2º, I, com LC nº 190/2022.' }
  }
  if (input.scenario === 'taxpayer-acquisition' && ['use-consumption', 'fixed-assets'].includes(input.purpose)) {
    return { status: 'resolved', party: 'Adquirente contribuinte (regra geral)', basis: 'LC nº 87/1996, arts. 4º, § 2º, I, 12, XV e 13, IX; confirmar implementação e exceções estaduais.' }
  }
  return { status: 'pending', party: null, basis: 'Revenda, industrialização e demais finalidades exigem verificar a operação subsequente e obrigações estaduais; não presumir DIFAL.' }
}

/** Decimal integer calculation for a base supplied and independently validated under the selected legal method. */
export function calculateDifalOnValidatedBase(baseCents: bigint, internalRatePercent: string, interstateRatePercent: string): bigint {
  const internalBasisPoints = parsePercentToBasisPoints(internalRatePercent)
  const interstateBasisPoints = parsePercentToBasisPoints(interstateRatePercent)
  if (baseCents < 0n) throw new RangeError('A base validada não pode ser negativa.')
  if (internalBasisPoints === null || interstateBasisPoints === null) throw new TypeError('Percentual inválido.')
  const difference = internalBasisPoints - interstateBasisPoints
  if (difference < 0n) throw new RangeError('A alíquota interna não pode ser menor que a interestadual nesta função.')
  return roundHalfUp(baseCents * difference, 10_000n)
}

export function calculateFcpOnValidatedBase(baseCents: bigint, fcpRatePercent: string): bigint {
  const basisPoints = parsePercentToBasisPoints(fcpRatePercent)
  if (baseCents < 0n || basisPoints === null || basisPoints < 0n) throw new TypeError('Base ou percentual de FCP inválido.')
  return roundHalfUp(baseCents * basisPoints, 10_000n)
}

function parsePercentToBasisPoints(value: string): bigint | null {
  const normalized = value.trim().replace('%', '').replace(',', '.')
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null
  const [whole = '', fractional = ''] = normalized.split('.')
  return BigInt(whole) * 100n + BigInt((fractional + '00').slice(0, 2))
}

function roundHalfUp(numerator: bigint, denominator: bigint): bigint {
  const quotient = numerator / denominator
  const remainder = numerator % denominator
  return remainder * 2n >= denominator ? quotient + 1n : quotient
}

export function evaluateTaxScenario(input: TaxScenarioInput): TaxEngineResult {
  const invalidIssues = validateOperation(input)
  if (invalidIssues.length) return invalidResult(invalidIssues)
  const origin = input.origin as BrazilianStateCode
  const destination = input.destination as BrazilianStateCode
  if (origin === destination) {
    return {
      status: 'not-applicable', title: 'Operação interna — DIFAL interestadual não se aplica',
      reason: 'Origem e destino são a mesma UF. Isso não exclui eventual ICMS interno ou outra obrigação tributária.',
      interstateReference: null, internalReference: resolveInternalRate(destination, input.operationDate), base: null, fcp: null,
      responsibility: { status: 'not-applicable', party: null, basis: 'Não é uma operação interestadual.' }, calculation: null,
      alerts: [], sourceRuleIds: [], memory: null,
    }
  }

  const interstateReference = resolveInterstateRate(origin, destination, input.operationDate, input.goodsOrigin)
  const internalReference = resolveInternalRate(destination, input.operationDate)
  const base = determineOperationBase(input)
  const fcp = resolveFcp(destination)
  const responsibility = resolveResponsibility(input)
  const alerts = [
    ...base.reasons,
    ...(internalReference.status === 'pending' ? [internalReference.note] : []),
    ...(interstateReference?.status === 'pending' ? [interstateReference.note] : []),
    fcp.reason,
    ...(input.goodsOrigin === 'imported' || input.goodsOrigin === 'unknown' ? ['A origem do produto não basta para decidir a alíquota de 4%; valide Conteúdo de Importação e exceções da RSF nº 13/2012.'] : []),
    ...(input.specialTreatment !== 'none-declared' ? ['Benefício, isenção, redução, substituição tributária ou regime especial não foi descartado; consulte o ato estadual aplicável.'] : []),
    ...(input.taxRegime === 'unknown' ? ['Regime de apuração não identificado; confirme o enquadramento e seus efeitos para esta obrigação.'] : []),
  ]
  const stateRule = internalReference.rule
  const federalRule = interstateReference?.rule
  const sourceRuleIds = [federalRule?.id, stateRule?.act ? (stateRule.state === 'RO' ? (input.operationDate < '2024-01-12' ? 'RO-ICMS-17_5-EXPIRED' : 'RO-ICMS-19_5') : `${stateRule.state}-INTERNAL-RATE`) : undefined].filter((id): id is string => Boolean(id))
  const reason = makeSpecificReason(interstateReference, internalReference, base, fcp, input)

  return {
    status: 'pending',
    title: 'Regras identificadas; falta validar a base e o tratamento do item',
    reason,
    interstateReference,
    internalReference,
    base,
    fcp,
    responsibility,
    calculation: null,
    alerts: [...new Set(alerts)],
    sourceRuleIds,
    memory: {
      scenario: input.scenario === 'final-consumer-sale'
        ? `Venda a consumidor final ${input.recipient === 'taxpayer' ? 'contribuinte' : 'não contribuinte'}`
        : `Aquisição por contribuinte · finalidade ${{ 'use-consumption': 'uso ou consumo', 'fixed-assets': 'ativo imobilizado', resale: 'revenda', industrialization: 'industrialização', other: 'outra finalidade', 'not-applicable': 'não informada' }[input.purpose]}`,
      operationDate: input.operationDate,
      route: `${input.origin} → ${input.destination}`,
      interstateRule: interstateReference?.rule ? `${interstateReference.rule.sourceTitle} · ${interstateReference.rule.provision} · ${interstateReference.rule.effectiveFrom}` : 'Pendente',
      destinationRule: stateRule?.act ? `${stateRule.act} · ${stateRule.provision} · ${stateRule.effectiveFrom}` : 'Pendente de confirmação oficial',
      baseMethod: base.method ?? 'Não determinada',
      rounding: 'Não aplicado: nenhuma base ou incidência foi validada para este item. Funções monetárias usam centavos inteiros e arredondamento half-up apenas quando chamadas com base juridicamente validada.',
      blockers: [...new Set(alerts)],
    },
  }
}

function makeSpecificReason(
  interstate: InterstateReference | null,
  internal: InternalRateReference,
  base: BaseResolution,
  fcp: FcpResolution,
  input: TaxScenarioInput,
): string {
  const reasons: string[] = []
  if (!interstate || interstate.status !== 'resolved') reasons.push(`alíquota interestadual: ${interstate?.note ?? 'não resolvida'}`)
  if (internal.status !== 'resolved') reasons.push(`alíquota interna de ${input.destination}: ${internal.note}`)
  if (base.status !== 'resolved') reasons.push(`base: ${base.reasons.join('; ')}`)
  if (fcp.status !== 'resolved' && fcp.status !== 'not-applicable') reasons.push(`FCP: ${fcp.reason}`)
  if (input.productClassification.trim() && input.specialTreatment === 'none-declared') reasons.push('A classificação foi digitada, mas não é cruzada com uma tabela oficial de alíquotas, benefícios, ST, reduções ou FCP.')
  reasons.push('Nenhum valor foi calculado porque pelo menos um fundamento ou componente necessário ainda não foi validado.')
  return reasons.join(' ')
}

function invalidResult(issues: string[]): TaxEngineResult {
  return {
    status: 'invalid', title: 'Corrija os dados da operação', reason: issues.join(' '),
    interstateReference: null, internalReference: null, base: null, fcp: null,
    responsibility: { status: 'pending', party: null, basis: 'Não determinada: existem dados inválidos ou faltantes.' },
    calculation: null, alerts: issues, sourceRuleIds: [], memory: null,
  }
}
