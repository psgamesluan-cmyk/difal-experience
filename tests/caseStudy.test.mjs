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

test('Pará → São Paulo atualiza imediatamente destino, alíquota interna e fundo', () => {
  const paraToSp = resolveCaseStudyPathway('sp-pa', '2026-10-17', 'domestic')
  const spToPara = resolveCaseStudyPathway('ro-sp', '2026-10-17', 'domestic')
  assert.ok(paraToSp && spToPara)
  assert.equal(paraToSp.pathway.destination, 'PA')
  assert.equal(spToPara.pathway.destination, 'SP')
  assert.equal(paraToSp.internal.rate, null)
  assert.equal(spToPara.internal.rate, '18%')
  assert.equal(paraToSp.fund.state, 'PA')
  assert.equal(spToPara.fund.state, 'SP')
  assert.notEqual(paraToSp.interstate?.rate, spToPara.interstate?.rate)
})

test('RO → SP e PR → RO usam origem e destino direcionais e vinculam FECOEP apenas quando o destino é RO', () => {
  const roToSp = resolveCaseStudyPathway('ro-sp', '2026-10-17', 'domestic')
  const prToRo = resolveCaseStudyPathway('pr-ro', '2026-10-17', 'domestic')
  assert.ok(roToSp && prToRo)
  assert.equal(roToSp.interstate?.rate, '12%')
  assert.equal(roToSp.internal.rate, '18%')
  assert.equal(roToSp.fund.fundName, null)
  assert.equal(prToRo.interstate?.rate, '7%')
  assert.equal(prToRo.internal.rate, '19.5%')
  assert.equal(prToRo.fund.fundName, 'FECOEP/RO')
  assert.equal(prToRo.fund.rate, '2%')
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
