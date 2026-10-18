import type { BrazilianStateCode } from './taxRules.ts'

export type FundValidation = 'partially-confirmed' | 'pending'

export interface StateFundReference {
  state: BrazilianStateCode
  fundName: string | null
  rate: string | null
  validation: FundValidation
  checkedOn: string
  sourceTitle: string
  sourceUrl: string
  scope: string
  limitations: string[]
}

const pendingFund = (state: BrazilianStateCode): StateFundReference => ({
  state,
  fundName: null,
  rate: null,
  validation: 'pending',
  checkedOn: '2026-10-17',
  sourceTitle: `Legislação estadual de ${state} ainda não conferida para FCP/adicional`,
  sourceUrl: 'https://www.confaz.fazenda.gov.br/',
  scope: 'A incidência, o nome do fundo, a alíquota e a base dependem da legislação da UF, da operação, da mercadoria e da data.',
  limitations: ['Não presumir adicional nem transferir para esta UF o fundo de outra UF.'],
})

export const STATE_FUND_REFERENCES: Record<BrazilianStateCode, StateFundReference> = {
  AC: pendingFund('AC'), AL: pendingFund('AL'), AP: pendingFund('AP'), AM: pendingFund('AM'), BA: pendingFund('BA'),
  CE: pendingFund('CE'), DF: pendingFund('DF'), ES: pendingFund('ES'), GO: pendingFund('GO'), MA: pendingFund('MA'),
  MT: pendingFund('MT'), MS: pendingFund('MS'), MG: pendingFund('MG'),
  PA: {
    state: 'PA', fundName: null, rate: null, validation: 'partially-confirmed', checkedOn: '2025-02-25',
    sourceTitle: 'Portal Nacional da NF-e · Tabela de Alíquotas de FCP por UF (25/02/2025)',
    sourceUrl: 'https://www.nfe.fazenda.gov.br/portal/listaConteudo.aspx',
    scope: 'A tabela nacional consultada não lista FCP para o Pará na versão atualizada em 25/02/2025.',
    limitations: ['A tabela é de 2025 e não comprova eventual mudança posterior até a data de referência 17/10/2026.', 'Não foi localizada nesta auditoria confirmação estadual atualizada para cada produto e operação.'],
  },
  PB: pendingFund('PB'), PR: pendingFund('PR'), PE: pendingFund('PE'), PI: pendingFund('PI'), RJ: pendingFund('RJ'),
  RN: pendingFund('RN'),
  RS: pendingFund('RS'),
  RO: {
    state: 'RO', fundName: 'FECOEP/RO', rate: '2%', validation: 'partially-confirmed', checkedOn: '2026-10-17',
    sourceTitle: 'Lei Complementar estadual nº 842/2015, alterada pela LC nº 879/2016',
    sourceUrl: 'https://legislacao.sefin.ro.gov.br/Download?arquivo=a25ba834c77832cb55c65319c5196e93.pdf&nome=LC842-2015.pdf',
    scope: 'Adicional de 2% somente nos produtos e operações previstos em lei, incluindo as hipóteses do art. 27-A da Lei nº 688/1996.',
    limitations: ['Sem classificação fiscal e dados da operação não é possível decidir a incidência. Não somar ao DIFAL automaticamente.'],
  },
  RR: pendingFund('RR'), SC: pendingFund('SC'), SP: pendingFund('SP'), SE: pendingFund('SE'), TO: pendingFund('TO'),
}

export function resolveApplicableFund(destination: BrazilianStateCode): StateFundReference {
  return STATE_FUND_REFERENCES[destination]
}
