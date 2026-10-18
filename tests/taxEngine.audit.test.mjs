import test from 'node:test'
import assert from 'node:assert/strict'
import {
  calculateDifalOnValidatedBase,
  calculateFcpOnValidatedBase,
  determineOperationBase,
  evaluateTaxScenario,
  parseCurrencyToCents,
  resolveFcp,
  resolveInternalRate,
  resolveInterstateRate,
} from '../src/lib/taxEngine.ts'
import { STATE_INTERNAL_RATE_RULES } from '../src/data/stateInternalRates.ts'
import { STATE_REGIONS } from '../src/data/taxRules.ts'

const states = Object.keys(STATE_REGIONS)

function scenario(overrides = {}) {
  return {
    scenario: 'final-consumer-sale',
    origin: 'SP',
    destination: 'RO',
    operationDate: '2026-10-17',
    productClassification: '',
    recipient: 'non-taxpayer',
    purpose: 'not-applicable',
    goodsOrigin: 'domestic',
    specialTreatment: 'unknown',
    taxRegime: 'unknown',
    productValueCents: 100_000n,
    freightCents: null,
    insuranceCents: null,
    accessoryExpensesCents: null,
    ipiCents: null,
    unconditionalDiscountCents: null,
    ...overrides,
  }
}

test('as 27 UFs têm um registro estadual: alíquota residual validada ou pendência explícita', () => {
  assert.equal(states.length, 27)
  assert.equal(Object.keys(STATE_INTERNAL_RATE_RULES).length, 27)
  for (const state of states) {
    const rule = STATE_INTERNAL_RATE_RULES[state]
    assert.equal(rule.state, state)
    if (rule.status === 'validated-residual') {
      assert.ok(rule.rate && rule.effectiveFrom && rule.act && rule.provision && rule.sourceUrl)
    } else {
      assert.equal(rule.rate, null, `${state} não deve adotar taxa preliminar como regra`)
      assert.ok(rule.limitations.length > 0)
    }
  }
})

test('a matriz cobre 729 combinações: 702 referências direcionais ficam condicionais e 27 internas fora do DIFAL', () => {
  let interStatePairs = 0
  let sameStatePairs = 0
  for (const origin of states) {
    for (const destination of states) {
      const result = resolveInterstateRate(origin, destination, '2026-10-17', 'domestic')
      if (origin === destination) {
        sameStatePairs++
        assert.equal(result, null, `${origin} → ${destination} não é par interestadual`)
      } else {
        interStatePairs++
        assert.ok(result, `${origin} → ${destination} precisa ter resultado`)
        assert.equal(result.status, 'pending')
        assert.ok(['7%', '12%'].includes(result.rate), `${origin} → ${destination}: ${result.rate}`)
        assert.ok(result.rule?.sourceUrl)
      }
    }
  }
  assert.equal(interStatePairs, 702)
  assert.equal(sameStatePairs, 27)
})

test('RS → RR em 16/10/2026 resolve 7%, alíquota interna residual de RR e responsabilidade, mas bloqueia sem base/NCM/FCP', () => {
  const input = scenario({ origin: 'RS', destination: 'RR', operationDate: '2026-10-16', goodsOrigin: 'domestic', recipient: 'non-taxpayer' })
  const result = evaluateTaxScenario(input)
  assert.equal(result.status, 'pending')
  assert.equal(result.interstateReference?.rate, '7%')
  assert.equal(result.interstateReference?.rule?.id, 'RSF-22-7')
  assert.equal(result.internalReference?.rate, '20%')
  assert.equal(result.internalReference?.rule?.effectiveFrom, '2023-03-30')
  assert.equal(result.responsibility.party, 'Remetente (regra geral)')
  assert.equal(result.base?.status, 'pending')
  assert.equal(result.fcp?.status, 'pending')
  assert.equal(result.calculation, null)
  assert.match(result.reason, /base/)
  assert.match(result.reason, /FCP/)
  assert.match(result.memory?.interstateRule ?? '', /Resolução/)
  assert.match(result.memory?.destinationRule ?? '', /Lei estadual nº 59/)
})

test('RR → RS é assimétrico: 12% interestadual e 17% residual do RS, sem presumir base nem FCP', () => {
  const result = evaluateTaxScenario(scenario({ origin: 'RR', destination: 'RS', operationDate: '2026-10-16', goodsOrigin: 'domestic', recipient: 'non-taxpayer' }))
  assert.equal(result.interstateReference?.rate, '12%')
  assert.equal(result.internalReference?.rate, '17%')
  assert.equal(result.calculation, null)
  assert.equal(result.base?.status, 'pending')
  assert.equal(result.fcp?.status, 'pending')
})

test('regra interestadual direcional seleciona 7% RS→RR e 12% RR→RS', () => {
  assert.equal(resolveInterstateRate('RS', 'RR', '2026-10-16', 'domestic')?.rate, '7%')
  assert.equal(resolveInterstateRate('RR', 'RS', '2026-10-16', 'domestic')?.rate, '12%')
})

test('alíquota interna residual de RR respeita data e remete à lei estadual', () => {
  const rule = resolveInternalRate('RR', '2026-10-16')
  assert.equal(rule.status, 'resolved')
  assert.equal(rule.rate, '20%')
  assert.match(rule.rule?.act ?? '', /Lei estadual nº 59\/1993/)
  assert.equal(resolveInternalRate('RR', '2023-03-29').status, 'pending')
  assert.equal(resolveInternalRate('RR', '2023-03-30').rate, '20%')
})

test('percentuais de RS→RR produzem valor reproduzível somente sobre base legal previamente validada', () => {
  const base = 100_000n
  assert.equal(calculateDifalOnValidatedBase(base, '20%', '7%'), 13_000n)
  assert.equal(calculateFcpOnValidatedBase(base, '2%'), 2_000n)
  assert.equal(calculateDifalOnValidatedBase(1n, '50%', '0%'), 1n, 'arredondamento meio para cima em centavos')
  assert.throws(() => calculateDifalOnValidatedBase(base, '7%', '12%'), RangeError)
  assert.throws(() => calculateFcpOnValidatedBase(base, '-2%'), TypeError)
})

test('função da base não soma componentes sem classificação e fatos fiscais suficientes', () => {
  const result = determineOperationBase(scenario({ freightCents: 10_000n, insuranceCents: 2_000n, ipiCents: 3_000n }))
  assert.equal(result.status, 'pending')
  assert.equal(result.operationValueCents, null)
  assert.equal(result.difalBaseCents, null)
  assert.equal(result.fcpBaseCents, null)
  assert.ok(result.reasons.some((reason) => reason.includes('frete')))
  assert.ok(result.reasons.some((reason) => reason.includes('IPI')))
  assert.ok(result.reasons.some((reason) => reason.includes('NCM')))
})

test('FCP de RR permanece pendente sem regra por produto, operação, base e vigência', () => {
  const result = resolveFcp('RR')
  assert.equal(result.status, 'pending')
  assert.equal(result.rate, null)
  assert.equal(result.amountCents, null)
  assert.match(result.reason, /legislação da UF, da operação, da mercadoria e da data/)
})

test('12% é aplicado a todas as demais combinações nacionais e 7% somente na faixa regional', () => {
  assert.equal(resolveInterstateRate('RO', 'SP', '2026-10-17', 'domestic')?.rate, '12%')
  assert.equal(resolveInterstateRate('SP', 'RO', '2026-10-17', 'domestic')?.rate, '7%')
  assert.equal(resolveInterstateRate('ES', 'RR', '2026-10-17', 'domestic')?.rate, '12%')
  assert.equal(resolveInterstateRate('MG', 'ES', '2026-10-17', 'domestic')?.rate, '7%')
})

test('importação e origem desconhecida ficam pendentes até comprovar condições e exceções da RSF 13/2012', () => {
  for (const goodsOrigin of ['imported', 'unknown']) {
    const result = resolveInterstateRate('RS', 'RR', '2026-10-16', goodsOrigin)
    assert.equal(result?.status, 'pending')
    assert.equal(result?.rate, null)
    assert.match(result?.note ?? '', /conteúdo de importação|origem nacional ou importada/i)
  }
})

test('alíquota regional histórica de 8% vence ao fim de 1989 e vira 7% em 1990', () => {
  assert.equal(resolveInterstateRate('SP', 'RR', '1989-12-31', 'domestic')?.rate, '8%')
  assert.equal(resolveInterstateRate('SP', 'RR', '1990-01-01', 'domestic')?.rate, '7%')
  assert.equal(resolveInterstateRate('SP', 'RR', '1989-12-31', 'domestic')?.rule?.status, 'expired')
})

test('separa inválido, operação não aplicável e pendência normativa', () => {
  assert.equal(evaluateTaxScenario(scenario({ origin: '' })).status, 'invalid')
  assert.equal(evaluateTaxScenario(scenario({ operationDate: '2026-02-31' })).status, 'invalid')
  assert.equal(evaluateTaxScenario(scenario({ origin: 'SP', destination: 'SP' })).status, 'not-applicable')
  assert.equal(evaluateTaxScenario(scenario({ origin: 'SP', destination: 'PA' })).internalReference?.status, 'pending')
  assert.equal(evaluateTaxScenario(scenario({ origin: 'SP', destination: 'PA' })).status, 'pending')
})

test('identifica separadamente os cenários de venda a contribuinte, não contribuinte e aquisição', () => {
  const nonTaxpayer = evaluateTaxScenario(scenario({ recipient: 'non-taxpayer' }))
  const taxpayer = evaluateTaxScenario(scenario({ recipient: 'taxpayer' }))
  const acquisition = evaluateTaxScenario(scenario({ scenario: 'taxpayer-acquisition', recipient: 'taxpayer', purpose: 'fixed-assets' }))
  assert.match(nonTaxpayer.memory?.scenario ?? '', /não contribuinte/)
  assert.equal(nonTaxpayer.responsibility.party, 'Remetente (regra geral)')
  assert.match(taxpayer.memory?.scenario ?? '', /contribuinte$/)
  assert.equal(taxpayer.responsibility.party, 'Destinatário contribuinte (regra geral)')
  assert.match(acquisition.memory?.scenario ?? '', /ativo imobilizado/i)
  assert.equal(acquisition.responsibility.party, 'Adquirente contribuinte (regra geral)')
  for (const result of [nonTaxpayer, taxpayer, acquisition]) assert.equal(result.calculation, null)
})

test('datas futuras e posteriores à revisão são recusadas, sem usar regras retroativamente', () => {
  assert.equal(resolveInterstateRate('RS', 'RR', '2027-01-01', 'domestic')?.status, 'pending')
  assert.equal(resolveInternalRate('RR', '2023-03-29').rate, null)
  assert.equal(resolveInternalRate('RR', '2024-01-01').rate, '20%')
})

test('usa centavos inteiros e parser monetário pt-BR sem ponto flutuante', () => {
  assert.equal(parseCurrencyToCents('R$ 1.234,56'), 123_456n)
  assert.equal(parseCurrencyToCents('1234.56'), 123_456n)
  assert.equal(parseCurrencyToCents('1.234'), 123_400n)
  assert.equal(parseCurrencyToCents('0,01'), 1n)
  assert.equal(parseCurrencyToCents('1.234.56'), null)
  assert.equal(parseCurrencyToCents('-1,00'), null)
})

test('relatório explica precisamente por que não há valor final', () => {
  const result = evaluateTaxScenario(scenario({ origin: 'RS', destination: 'RR', operationDate: '2026-10-16', goodsOrigin: 'domestic' }))
  assert.equal(result.title, 'Regras identificadas; falta validar a base e o tratamento do item')
  assert.equal(result.calculation, null)
  assert.ok(result.alerts.some((alert) => alert.includes('NCM')))
  assert.ok(result.alerts.some((alert) => alert.includes('FCP')))
  assert.ok(result.memory?.blockers.length)
})
