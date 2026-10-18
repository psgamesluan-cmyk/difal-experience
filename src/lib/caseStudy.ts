import { CASE_STUDY_PATHWAYS } from '../data/caseStudyPathways.ts'
import { determineOperationBase, resolveFcp, resolveInternalRate, resolveInterstateRate, resolveResponsibility, type GoodsOrigin, type TaxScenarioInput } from './taxEngine.ts'

export function resolveCaseStudyPathway(pathwayId: string, operationDate: string, goodsOrigin: GoodsOrigin) {
  const pathway = CASE_STUDY_PATHWAYS.find(({ id }) => id === pathwayId)
  if (!pathway) return null
  const scenario: TaxScenarioInput = {
    scenario: 'final-consumer-sale', origin: pathway.origin, destination: pathway.destination,
    operationDate, productClassification: '', recipient: 'non-taxpayer', purpose: 'not-applicable', goodsOrigin,
    specialTreatment: 'unknown', taxRegime: 'unknown', productValueCents: null, freightCents: null,
    insuranceCents: null, accessoryExpensesCents: null, ipiCents: null, unconditionalDiscountCents: null,
  }
  return {
    pathway,
    interstate: resolveInterstateRate(pathway.origin, pathway.destination, operationDate, goodsOrigin),
    internal: resolveInternalRate(pathway.destination, operationDate),
    fund: resolveFcp(pathway.destination),
    base: determineOperationBase(scenario),
    responsibility: resolveResponsibility(scenario),
    scenario,
  }
}
