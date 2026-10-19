import { CASE_STUDY_PATHWAYS } from '../data/caseStudyPathways.ts'
import { determineOperationBase, isValidDate, resolveFcp, resolveInternalRate, resolveInterstateRate, resolveResponsibility, RULES_CHECKED_ON, type GoodsOrigin, type TaxScenarioInput } from './taxEngine.ts'

export function resolveCaseStudyPathway(pathwayId: string, operationDate: string, goodsOrigin: GoodsOrigin) {
  const pathway = CASE_STUDY_PATHWAYS.find(({ id }) => id === pathwayId)
  if (!pathway) return null
  const scenario: TaxScenarioInput = {
    scenario: 'final-consumer-sale', origin: pathway.origin, destination: pathway.destination,
    operationDate, productClassification: '', recipient: 'non-taxpayer', purpose: 'not-applicable', goodsOrigin,
    specialTreatment: 'unknown', taxRegime: 'unknown', productValueCents: null, freightCents: null,
    insuranceCents: null, accessoryExpensesCents: null, ipiCents: null, unconditionalDiscountCents: null,
  }
  const internalReference = resolveInternalRate(pathway.destination, operationDate)
  const caseStudyInternal = pathway.id === 'sp-pa' && isValidDate(operationDate) && operationDate <= RULES_CHECKED_ON
    ? {
        status: 'pending' as const,
        rate: '19%',
        rule: internalReference.rule,
        note: 'Referência interna de 19% adotada para o Pará neste material didático; a validação por produto e hipótese continua pendente. Ela é distinta da alíquota interestadual de 7%; a diferença nominal é de 12 pontos percentuais. Benefícios e a base legal da operação ainda precisam ser verificados antes de qualquer apuração.',
      }
    : internalReference
  return {
    pathway,
    interstate: resolveInterstateRate(pathway.origin, pathway.destination, operationDate, goodsOrigin),
    internal: caseStudyInternal,
    fund: resolveFcp(pathway.destination),
    base: determineOperationBase(scenario),
    responsibility: resolveResponsibility(scenario),
    scenario,
  }
}
