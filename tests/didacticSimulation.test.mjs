import test from 'node:test'
import assert from 'node:assert/strict'
import { simulateDidacticDifal } from '../src/lib/didacticSimulation.ts'
import { CASE_STUDY_PATHWAYS } from '../src/data/caseStudyPathways.ts'
import { resolveCaseStudyPathway } from '../src/lib/caseStudy.ts'

const base = {
  scenario: 'final-consumer-sale', recipient: 'non-taxpayer', productValue: '100,00',
  freight: '', insurance: '', accessories: '', ipi: '', discount: '',
  interstateRate: '7', internalRate: '18', fcpRate: '',
}

test('simula diferença simples com valores conhecidos e não aplica FCP automaticamente', () => {
  const result = simulateDidacticDifal(base)
  assert.equal(result.valid, true)
  assert.equal(result.baseCents, 10_000n)
  assert.equal(result.difalCents, 1_100n)
  assert.equal(result.fcpCents, null)
  assert.ok(result.steps.some((step) => step.includes('11,00')))
  assert.ok(result.premises.some((premise) => premise.includes('Nenhum FCP foi aplicado automaticamente')))
})

test('calcula FCP manual em linha separada, sem somá-lo ao DIFAL', () => {
  const result = simulateDidacticDifal({ ...base, fcpRate: '2' })
  assert.equal(result.difalCents, 1_100n)
  assert.equal(result.fcpCents, 200n)
  assert.ok(result.steps.some((step) => step.includes('não somado ao DIFAL')))
})

test('permite a conta didática nas quatro trajetórias da apresentação quando as premissas são fornecidas', () => {
  for (const route of CASE_STUDY_PATHWAYS) {
    const resolvedRoute = resolveCaseStudyPathway(route.id, '2026-10-17', 'domestic')
    assert.equal(resolvedRoute?.pathway.origin, route.origin)
    assert.equal(resolvedRoute?.pathway.destination, route.destination)
    const result = simulateDidacticDifal(base)
    assert.equal(result.valid, true, route.label)
    assert.equal(result.difalCents, 1_100n, route.label)
  }
})

test('recusa campos vazios, formatos inválidos e alíquota interna abaixo da interestadual sem mostrar valor', () => {
  for (const input of [
    { ...base, productValue: '' },
    { ...base, productValue: 'texto' },
    { ...base, interstateRate: '' },
    { ...base, internalRate: '6' },
    { ...base, freight: '-1,00' },
  ]) {
    const result = simulateDidacticDifal(input)
    assert.equal(result.valid, false)
    assert.equal(result.difalCents, null)
    assert.ok(result.errors.length > 0)
  }
})

test('não confunde modalidades e destinatários para os quais a fórmula demonstrativa não foi configurada', () => {
  for (const input of [
    { ...base, scenario: 'taxpayer-acquisition' },
    { ...base, recipient: 'taxpayer' },
    { ...base, recipient: 'unknown' },
  ]) {
    const result = simulateDidacticDifal(input)
    assert.equal(result.valid, false)
    assert.equal(result.difalCents, null)
    assert.match(result.errors.join(' '), /fórmula|modalidade|consumidor/i)
  }
})
