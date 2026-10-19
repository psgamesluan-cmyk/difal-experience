import test from 'node:test'
import assert from 'node:assert/strict'
import { CASE_STUDY_PATHWAYS } from '../src/data/caseStudyPathways.ts'
import { resolveCaseStudyPathway } from '../src/lib/caseStudy.ts'

test('todas as trajetórias práticas usam os mesmos resolvedores e não carregam alíquotas/fundos estáticos', () => {
  const expectedRates = new Map([['ro-sp', '12%'], ['sp-ro', '7%'], ['sp-pa', '7%'], ['pr-ro', '7%']])
  assert.equal(CASE_STUDY_PATHWAYS.length, 4)
  for (const path of CASE_STUDY_PATHWAYS) {
    const resolved = resolveCaseStudyPathway(path.id, '2026-10-17', 'domestic')
    assert.ok(resolved)
    assert.equal(resolved.interstate?.rate, expectedRates.get(path.id))
    assert.equal(resolved.internal.rule?.state, path.destination)
    assert.equal(resolved.fund.state, path.destination)
    assert.equal(resolved.base.difalBaseCents, null)
    assert.equal(resolved.scenario.productValueCents, null)
  }
})

test('São Paulo → Pará não recebe FECOEP/RO; a situação do FCP permanece parcial e temporalmente limitada', () => {
  const result = resolveCaseStudyPathway('sp-pa', '2026-10-17', 'domestic')
  assert.ok(result)
  assert.equal(result.pathway.destination, 'PA')
  assert.equal(result.interstate?.rate, '7%')
  assert.equal(result.internal.status, 'pending')
  assert.equal(result.fund.fundName, null)
  assert.equal(result.fund.validation, 'partially-confirmed')
  assert.equal(result.fund.checkedOn, '2025-02-25')
  assert.doesNotMatch(result.fund.reason, /FECOEP\/RO/)
  assert.equal(result.base.difalBaseCents, null)
})

test('São Paulo → Pará exibe 7% interestadual e 19% interno do Pará, com ressalva didática', () => {
  const spToPa = resolveCaseStudyPathway('sp-pa', '2026-10-17', 'domestic')
  const roToSp = resolveCaseStudyPathway('ro-sp', '2026-10-17', 'domestic')
  assert.ok(spToPa && roToSp)
  assert.equal(spToPa.pathway.destination, 'PA')
  assert.equal(roToSp.pathway.destination, 'SP')
  assert.equal(spToPa.interstate?.rate, '7%')
  assert.equal(spToPa.internal.rate, '19%')
  assert.equal(spToPa.internal.status, 'pending')
  assert.match(spToPa.internal.note, /validação por produto e hipótese continua pendente/)
  assert.match(spToPa.internal.note, /distinta da alíquota interestadual de 7%/)
  assert.match(spToPa.internal.note, /12 pontos percentuais/)
  assert.equal(roToSp.internal.rate, '18%')
  assert.equal(spToPa.fund.state, 'PA')
  assert.equal(roToSp.fund.state, 'SP')
  assert.notEqual(spToPa.interstate?.rate, spToPa.internal.rate)
})

test('São Paulo → Pará não reaproveita a referência didática de 19% para data posterior à revisão', () => {
  const future = resolveCaseStudyPathway('sp-pa', '2027-01-01', 'domestic')
  assert.ok(future)
  assert.equal(future.interstate?.rate, null)
  assert.equal(future.internal.rate, null)
  assert.equal(future.internal.status, 'pending')
})

test('as alíquotas interestaduais seguem a direção legal e vinculam FECOEP apenas quando o destino é RO', () => {
  const roToSp = resolveCaseStudyPathway('ro-sp', '2026-10-17', 'domestic')
  const spToRo = resolveCaseStudyPathway('sp-ro', '2026-10-17', 'domestic')
  const prToRo = resolveCaseStudyPathway('pr-ro', '2026-10-17', 'domestic')
  assert.ok(roToSp && spToRo && prToRo)
  assert.equal(roToSp.interstate?.rate, '12%')
  assert.equal(roToSp.interstate?.rule?.id, 'RSF-22-12')
  assert.match(roToSp.interstate?.note ?? '', /referência federal geral de 12%/i)
  assert.equal(spToRo.interstate?.rate, '7%')
  assert.equal(spToRo.interstate?.rule?.id, 'RSF-22-7')
  assert.match(spToRo.interstate?.note ?? '', /origem Sul\/Sudeste.*destino Norte/i)
  assert.equal(roToSp.internal.rate, '18%')
  assert.equal(roToSp.fund.fundName, null)
  assert.equal(prToRo.interstate?.rate, '7%')
  assert.equal(prToRo.internal.rate, '19.5%')
  assert.equal(prToRo.fund.fundName, 'FECOEP/RO')
  assert.equal(prToRo.fund.rate, '2%')
})

test('percorrer todas as trajetórias refaz alíquotas, estado de destino e fundo para cada seleção', () => {
  const expectedRates = new Map([['ro-sp', '12%'], ['sp-ro', '7%'], ['sp-pa', '7%'], ['pr-ro', '7%']])
  const resolved = CASE_STUDY_PATHWAYS.map(({ id }) => resolveCaseStudyPathway(id, '2026-10-17', 'domestic'))
  assert.equal(resolved.length, 4)
  resolved.forEach((result, index) => {
    const pathway = CASE_STUDY_PATHWAYS[index]
    assert.ok(pathway)
    assert.ok(result)
    assert.equal(result.pathway.id, pathway.id)
    assert.equal(result.interstate?.rate, expectedRates.get(pathway.id))
    assert.equal(result.internal.rule?.state, pathway.destination)
    assert.equal(result.fund.state, pathway.destination)
  })
})

test('troca de data e origem da mercadoria invalida/atualiza referências dependentes', () => {
  const domestic = resolveCaseStudyPathway('sp-pa', '2026-10-17', 'domestic')
  const imported = resolveCaseStudyPathway('sp-pa', '2026-10-17', 'imported')
  const future = resolveCaseStudyPathway('sp-pa', '2027-01-01', 'domestic')
  assert.ok(domestic && imported && future)
  assert.equal(domestic.interstate?.rate, '7%')
  assert.equal(imported.interstate?.rate, null)
  assert.equal(imported.interstate?.status, 'pending')
  assert.match(imported.interstate?.note ?? '', /conteúdo de importação/i)
  assert.equal(future.interstate?.rate, null)
  assert.equal(future.internal.rate, null)
})
