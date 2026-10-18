import test from 'node:test'
import assert from 'node:assert/strict'
import { CALCULATION_STATE_ORDER, DIAGONAL_VALUES, getMatrixRate, INTERSTATE_RATE_CONDITIONS } from '../src/data/calculationForms.ts'

test('preserva as quatro linhas de condições e o texto das três alíquotas da primeira imagem', () => {
  assert.deepEqual(INTERSTATE_RATE_CONDITIONS.map(({ rate }) => rate), ['12%', '12%', '7%', '4%'])
  assert.match(INTERSTATE_RATE_CONDITIONS[2].text, /para o estado do ES$/)
  assert.match(INTERSTATE_RATE_CONDITIONS[3].text, /transporte aéreo interestadual de passageiros, carga e mala postal\.$/)
})

test('reconstrói a matriz completa 27 × 27 com as diagonais e destaca SP → PA em 7%', () => {
  assert.equal(CALCULATION_STATE_ORDER.length, 27)
  for (const origin of CALCULATION_STATE_ORDER) {
    for (const destination of CALCULATION_STATE_ORDER) {
      assert.match(getMatrixRate(origin, destination), /^(?:7|12|17|18|19|19\.5|20|20\.5|21)$/)
    }
    assert.equal(getMatrixRate(origin, origin), DIAGONAL_VALUES[origin])
  }
  assert.equal(getMatrixRate('SP', 'PA'), '7')
  assert.equal(getMatrixRate('PR', 'RO'), '7')
  assert.equal(getMatrixRate('RO', 'SP'), '12')
})
