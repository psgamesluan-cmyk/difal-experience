export type RuleStatus = 'validated' | 'pending' | 'expired' | 'unsupported'

export interface TaxRule {
  id: string
  status: RuleStatus
  jurisdiction: string
  scope: string
  rate?: string
  effectiveFrom: string
  effectiveTo: string | null
  checkedOn: string
  sourceTitle: string
  provision: string
  sourceUrl: string
  limitations: string[]
}

export const TAX_RULES: TaxRule[] = [
  {
    id: 'RSF-22-8-EXPIRED',
    status: 'expired',
    jurisdiction: 'Interestadual · faixa regional histórica',
    scope: 'Operações originadas nas Regiões Sul ou Sudeste, exceto ES, e destinadas às Regiões Norte, Nordeste ou Centro-Oeste, ou ao ES, no período inicial de 1989.',
    rate: '8%',
    effectiveFrom: '1989-06-01',
    effectiveTo: '1989-12-31',
    checkedOn: '2026-10-17',
    sourceTitle: 'Resolução do Senado Federal nº 22/1989',
    provision: 'Art. 1º, parágrafo único, I',
    sourceUrl: 'https://legis.senado.leg.br/norma/586152/publicacao/15646891',
    limitations: ['A alíquota de 8% vigorou somente em 1989; a faixa foi 7% a partir de 01/01/1990.'],
  },
  {
    id: 'RSF-22-12',
    status: 'validated',
    jurisdiction: 'Interestadual · regra geral',
    scope: 'Operações interestaduais não abrangidas pela faixa regional de 7% nem pela Resolução do Senado nº 13/2012.',
    rate: '12%',
    effectiveFrom: '1989-06-01',
    effectiveTo: null,
    checkedOn: '2026-10-17',
    sourceTitle: 'Resolução do Senado Federal nº 22/1989',
    provision: 'Art. 1º, caput',
    sourceUrl: 'https://legis.senado.leg.br/norma/586152/publicacao/15646891',
    limitations: ['A regra geral cede à faixa regional de 7% nas origens e destinos descritos no parágrafo único.', 'A natureza da mercadoria e regras específicas ainda devem ser verificadas.'],
  },
  {
    id: 'RSF-22-7',
    status: 'validated',
    jurisdiction: 'Interestadual · faixa regional',
    scope: 'Operação originada nas Regiões Sul ou Sudeste (exceto Espírito Santo) e destinada às Regiões Norte, Nordeste ou Centro-Oeste, ou ao Espírito Santo.',
    rate: '7%',
    effectiveFrom: '1990-01-01',
    effectiveTo: null,
    checkedOn: '2026-10-17',
    sourceTitle: 'Resolução do Senado Federal nº 22/1989',
    provision: 'Art. 1º, parágrafo único, II',
    sourceUrl: 'https://legis.senado.leg.br/norma/586152/publicacao/15646891',
    limitations: ['A classificação regional considera origem e destino, não apenas o destino.', 'A regra de 4% para importados e as exceções da própria operação exigem análise.'],
  },
  {
    id: 'RSF-13-4',
    status: 'validated',
    jurisdiction: 'Interestadual · bens e mercadorias importados',
    scope: 'Bens não submetidos a industrialização após o desembaraço ou industrializados com Conteúdo de Importação superior a 40%, respeitadas as exceções legais.',
    rate: '4%',
    effectiveFrom: '2013-01-01',
    effectiveTo: null,
    checkedOn: '2026-10-17',
    sourceTitle: 'Resolução do Senado Federal nº 13/2012',
    provision: 'Arts. 1º a 3º',
    sourceUrl: 'https://legis.senado.leg.br/norma/586999/publicacao?tipoDocumento=RSF&tipoTexto=ATU',
    limitations: ['A alíquota só é aplicável após validação do Conteúdo de Importação e das exceções do art. 1º, § 4º, e art. 2º.', 'O formulário não calcula nem certifica Conteúdo de Importação.'],
  },
  {
    id: 'RO-ICMS-19_5',
    status: 'validated',
    jurisdiction: 'Rondônia · alíquota interna modal',
    scope: 'Demais casos, quando não incidir alíquota específica, benefício, redução, isenção ou regime especial.',
    rate: '19,5%',
    effectiveFrom: '2024-01-12',
    effectiveTo: null,
    checkedOn: '2026-10-17',
    sourceTitle: 'RICMS/RO, Decreto nº 22.721/2018, Anexo I',
    provision: 'Art. 12, I, “e”; redação do Decreto nº 29.048/2024',
    sourceUrl: 'https://legislacao.sefin.ro.gov.br/Download?arquivo=72c9e2d5be10c850f17e2de12f8ed220.pdf&nome=D18-22721%20DECRETO%20NOVO%20RICMS%20-%20Consolid.%20ate%20Dec.%2031274-26.pdf',
    limitations: ['19,5% é a alíquota modal residual, não uma alíquota universal nem sinônimo de carga efetiva.', 'A classificação fiscal do produto é indispensável para afastar alíquota específica e FECOEP.'],
  },
  {
    id: 'RO-ICMS-17_5-EXPIRED',
    status: 'expired',
    jurisdiction: 'Rondônia · alíquota modal histórica',
    scope: 'Demais casos antes da alteração de 2024.',
    rate: '17,5%',
    effectiveFrom: '2016-03-20',
    effectiveTo: '2024-01-11',
    checkedOn: '2026-10-17',
    sourceTitle: 'RICMS/RO, Decreto nº 22.721/2018, Anexo I',
    provision: 'Art. 12, I, “e”; redação anterior ao Decreto nº 29.048/2024',
    sourceUrl: 'https://legislacao.sefin.ro.gov.br/Download?arquivo=72c9e2d5be10c850f17e2de12f8ed220.pdf&nome=D18-22721%20DECRETO%20NOVO%20RICMS%20-%20Consolid.%20ate%20Dec.%2031274-26.pdf',
    limitations: ['Não deve ser usada para operações a partir de 12/01/2024.'],
  },
  {
    id: 'SP-ICMS-18',
    status: 'validated',
    jurisdiction: 'São Paulo · alíquota interna geral',
    scope: 'Regra geral interna, salvo alíquota específica, benefício, redução, isenção ou regime especial.',
    rate: '18%',
    effectiveFrom: '2009-01-01',
    effectiveTo: null,
    checkedOn: '2026-10-17',
    sourceTitle: 'Lei estadual nº 6.374/1989',
    provision: 'Art. 34, I',
    sourceUrl: 'https://legislacao.fazenda.sp.gov.br/Paginas/lei034.aspx',
    limitations: ['A alíquota depende da mercadoria e da operação; a alíquota geral não resolve exceções.'],
  },
  {
    id: 'RO-FECOEP-2-PENDING-ITEM',
    status: 'pending',
    jurisdiction: 'Rondônia · FECOEP',
    scope: 'Adicional de 2% em operações destinadas a consumidor final não contribuinte em RO apenas para produtos listados no art. 27-A da Lei nº 688/1996.',
    rate: '2%',
    effectiveFrom: '2016-09-25',
    effectiveTo: null,
    checkedOn: '2026-10-17',
    sourceTitle: 'Lei Complementar estadual nº 842/2015, alterada pela LC nº 879/2016',
    provision: 'Art. 7º',
    sourceUrl: 'https://legislacao.sefin.ro.gov.br/Download?arquivo=a25ba834c77832cb55c65319c5196e93.pdf&nome=LC842-2015.pdf',
    limitations: ['Não há identificação/classificação de produto no app para testar o rol do art. 27-A.', 'FCP não está incorporado ao DIFAL nem incluído no resultado.'],
  },
  {
    id: 'DIFAL-METHOD-PENDING',
    status: 'pending',
    jurisdiction: 'Cálculo do diferencial · estadual e temporal',
    scope: 'Fórmula, bases e forma de apuração do ICMS devido à origem e ao destino na operação concreta.',
    effectiveFrom: '2022-01-05',
    effectiveTo: null,
    checkedOn: '2026-10-17',
    sourceTitle: 'Lei Complementar nº 190/2022, que altera a Lei Complementar nº 87/1996',
    provision: 'Art. 1º, nova redação dos arts. 11 a 13 e inclusão do art. 24-A da LC nº 87/1996',
    sourceUrl: 'https://planalto.gov.br/ccivil_03/leis/lcp/lcp190.htm',
    limitations: ['A lei prevê bases distintas para origem e destino em hipóteses específicas e exige consulta à legislação estadual, portais fiscais e às obrigações da operação.', 'Este projeto não contém base versionada por NCM, estado e vigência nem metodologia estadual integralmente validada.'],
  },
]

export type BrazilianStateCode =
  | 'AC' | 'AL' | 'AP' | 'AM' | 'BA' | 'CE' | 'DF' | 'ES' | 'GO' | 'MA' | 'MT' | 'MS'
  | 'MG' | 'PA' | 'PB' | 'PR' | 'PE' | 'PI' | 'RJ' | 'RN' | 'RS' | 'RO' | 'RR' | 'SC'
  | 'SP' | 'SE' | 'TO'

export type BrazilianRegion = 'Norte' | 'Nordeste' | 'Centro-Oeste' | 'Sudeste' | 'Sul'

export const STATE_REGIONS: Record<BrazilianStateCode, BrazilianRegion> = {
  AC: 'Norte', AL: 'Nordeste', AP: 'Norte', AM: 'Norte', BA: 'Nordeste', CE: 'Nordeste',
  DF: 'Centro-Oeste', ES: 'Sudeste', GO: 'Centro-Oeste', MA: 'Nordeste', MT: 'Centro-Oeste',
  MS: 'Centro-Oeste', MG: 'Sudeste', PA: 'Norte', PB: 'Nordeste', PR: 'Sul', PE: 'Nordeste',
  PI: 'Nordeste', RJ: 'Sudeste', RN: 'Nordeste', RS: 'Sul', RO: 'Norte', RR: 'Norte',
  SC: 'Sul', SP: 'Sudeste', SE: 'Nordeste', TO: 'Norte',
}

export function getTaxRule(id: string): TaxRule | undefined {
  return TAX_RULES.find((rule) => rule.id === id)
}
