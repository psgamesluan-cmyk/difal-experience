import test from 'node:test'
import assert from 'node:assert/strict'
import { evaluateTaxScenario, parseCurrencyToCents, selectInterstateReference } from '../src/lib/taxEngine.ts'
import { getTaxRule } from '../src/data/taxRules.ts'

function scenario(overrides = {}) {
  return {
    scenario: 'final-consumer-sale',
    origin: 'SP',
    destination: 'RO',
    operationDate: '2026-10-17',
    productClassification: 'NCM não confirmada',
    recipient: 'non-taxpayer',
    purpose: 'not-applicable',
    goodsOrigin: 'domestic',
    specialTreatment: 'none-declared',
    taxRegime: 'normal',
    productValueCents: 100_000n,
    freightCents: null,
    insuranceCents: null,
    accessoryExpensesCents: null,
    ipiCents: null,
    unconditionalDiscountCents: null,
    ...overrides,
  }
}

test('seleciona as referências interestaduais da Resolução nº 22/1989 pelas duas regiões', () => {
  const references = [
    ['RO', 'SP', '12%'],
    ['SP', 'RO', '7%'],
    ['SP', 'PA', '7%'],
    ['PR', 'RO', '7%'],
  ]
  for (const [origin, destination, expected] of references) {
    assert.equal(selectInterstateReference(origin, destination, '2026-10-17', 'domestic')?.rate, expected, `${origin} -> ${destination}`)
  }
})

test('inverter origem e destino refaz a seleção da regra regional', () => {
  assert.equal(selectInterstateReference('SP', 'RO', '2026-10-17', 'domestic')?.rate, '7%')
  assert.equal(selectInterstateReference('RO', 'SP', '2026-10-17', 'domestic')?.rate, '12%')
})

test('seleciona a alíquota regional histórica de 8% somente em 1989 e 7% desde 1990', () => {
  assert.equal(selectInterstateReference('SP', 'RO', '1989-06-01', 'domestic')?.rate, '8%')
  assert.equal(selectInterstateReference('SP', 'RO', '1989-12-31', 'domestic')?.rate, '8%')
  assert.equal(selectInterstateReference('SP', 'RO', '1990-01-01', 'domestic')?.rate, '7%')
})

test('não seleciona silenciosamente 4% para importados sem verificar critérios e exceções', () => {
  const result = selectInterstateReference('SP', 'RO', '2026-10-17', 'imported')
  assert.equal(result?.rate, null)
  assert.equal(result?.rule?.status, 'validated')
  assert.match(result?.note ?? '', /Conteúdo de Importação/)
})

test('mercadoria de origem desconhecida deixa a referência interestadual pendente', () => {
  assert.equal(selectInterstateReference('SP', 'RO', '2026-10-17', 'unknown')?.rate, null)
})

test('não cria referência para operação interna', () => {
  assert.equal(selectInterstateReference('RO', 'RO', '2026-10-17', 'domestic'), null)
})

test('rejeita data inexistente e data posterior à base verificada', () => {
  assert.equal(selectInterstateReference('SP', 'RO', '2026-02-31', 'domestic'), null)
  assert.equal(evaluateTaxScenario(scenario({ operationDate: '2027-01-01' })).status, 'invalid')
})

test('usa centavos inteiros para ler valores em português sem arredondamento binário', () => {
  assert.equal(parseCurrencyToCents('R$ 1.234,56'), 123_456n)
  assert.equal(parseCurrencyToCents('1234.56'), 123_456n)
  assert.equal(parseCurrencyToCents('1.234'), 123_400n)
  assert.equal(parseCurrencyToCents('1.234.567'), 123_456_700n)
  assert.equal(parseCurrencyToCents('0,01'), 1n)
  assert.equal(parseCurrencyToCents('1.234.56'), null)
  assert.equal(parseCurrencyToCents('-1,00'), null)
})

test('não calcula DIFAL nem FCP mesmo quando há uma referência federal de alíquota', () => {
  const result = evaluateTaxScenario(scenario())
  assert.equal(result.status, 'not-supported')
  assert.equal(result.calculation, null)
  assert.equal(result.interstateReference?.rate, '7%')
  assert.match(result.title, /não suportado/)
})

test('registra frete, seguro e IPI sem somá-los a uma base presumida', () => {
  const result = evaluateTaxScenario(scenario({ freightCents: 5_000n, insuranceCents: 1_500n, ipiCents: 2_000n }))
  assert.equal(result.calculation, null)
  assert.ok(result.alerts.some((alert) => alert.includes('não foram somados à base')))
})

test('vendas a consumidor final contribuinte e não contribuinte não recebem a mesma apuração automática', async (context) => {
  for (const recipient of ['taxpayer', 'non-taxpayer']) {
    await context.test(recipient, () => {
      const result = evaluateTaxScenario(scenario({ recipient }))
      assert.equal(result.status, 'not-supported')
      assert.equal(result.calculation, null)
    })
  }
})

test('o regime de apuração desconhecido permanece explícito no resultado', () => {
  const result = evaluateTaxScenario(scenario({ taxRegime: 'unknown' }))
  assert.ok(result.alerts.some((alert) => alert.includes('regime de apuração')))
  assert.equal(result.calculation, null)
})

test('exige identificação mínima e valores monetários válidos antes da triagem', () => {
  assert.equal(evaluateTaxScenario(scenario({ origin: '' })).status, 'invalid')
  assert.equal(evaluateTaxScenario(scenario({ destination: 'SP' })).status, 'invalid')
  assert.equal(evaluateTaxScenario(scenario({ productValueCents: null })).status, 'invalid')
  assert.equal(evaluateTaxScenario(scenario({ productValueCents: 0n })).status, 'invalid')
  assert.equal(evaluateTaxScenario(scenario({ freightCents: -1n })).status, 'invalid')
  assert.equal(evaluateTaxScenario(scenario({ invalidMoneyFields: ['frete'] })).status, 'invalid')
  assert.equal(evaluateTaxScenario(scenario({ recipient: 'unknown' })).status, 'invalid')
})

test('não habilita cenário sem destinatário classificado', () => {
  const result = evaluateTaxScenario(scenario({ recipient: 'unknown' }))
  assert.equal(result.status, 'invalid')
  assert.match(result.reason, /Identifique se o consumidor final/)
})

test('bloqueia automaticamente as finalidades de aquisição sem regras estaduais completas', async (context) => {
  for (const purpose of ['use-consumption', 'fixed-assets', 'resale', 'industrialization', 'other']) {
    await context.test(purpose, () => {
      const result = evaluateTaxScenario(scenario({ scenario: 'taxpayer-acquisition', recipient: 'taxpayer', purpose }))
      assert.equal(result.status, 'not-supported')
      assert.equal(result.calculation, null)
    })
  }
})

test('bloqueia automaticamente importados e tratamentos fiscais especiais', async (context) => {
  for (const input of [
    { goodsOrigin: 'imported' },
    { specialTreatment: 'present' },
    { specialTreatment: 'unknown' },
  ]) {
    await context.test(JSON.stringify(input), () => {
      const result = evaluateTaxScenario(scenario(input))
      assert.equal(result.status, 'not-supported')
      assert.equal(result.calculation, null)
    })
  }
})

test('impede o uso de regra marcada como vencida', () => {
  const historical = getTaxRule('RO-ICMS-17_5-EXPIRED')
  assert.equal(historical?.status, 'expired')
  assert.equal(historical?.effectiveTo, '2024-01-11')
  assert.notEqual(historical?.status, 'validated')
})

test('não aplica retroativamente a alíquota modal atual de Rondônia', () => {
  const prior = evaluateTaxScenario(scenario({ operationDate: '2023-12-31' }))
  const current = evaluateTaxScenario(scenario({ operationDate: '2024-01-12' }))
  assert.ok(prior.sourceRuleIds.includes('RO-ICMS-17_5-EXPIRED'))
  assert.ok(!prior.sourceRuleIds.includes('RO-ICMS-19_5'))
  assert.ok(current.sourceRuleIds.includes('RO-ICMS-19_5'))
  assert.equal(prior.calculation, null)
  assert.equal(current.calculation, null)
})

test('a falta de destino suportado não inventa alíquota interna estadual', () => {
  const result = evaluateTaxScenario(scenario({ origin: 'SP', destination: 'PA' }))
  assert.equal(result.status, 'not-supported')
  assert.equal(result.interstateReference?.rate, '7%')
  assert.equal(result.sourceRuleIds.includes('SP-ICMS-18'), false)
  assert.equal(result.calculation, null)
})
