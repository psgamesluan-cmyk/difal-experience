import type { BrazilianStateCode } from './taxRules.ts'

export type InternalRateStatus = 'validated-residual' | 'pending' | 'expired'

export interface StateInternalRateRule {
  state: BrazilianStateCode
  status: InternalRateStatus
  rate: string | null
  effectiveFrom: string | null
  effectiveTo: string | null
  scope: string
  act: string | null
  provision: string | null
  sourceTitle: string
  sourceUrl: string
  checkedOn: string
  limitations: string[]
}

const pendingRule = (state: BrazilianStateCode, agency: string, url: string): StateInternalRateRule => ({
  state,
  status: 'pending',
  rate: null,
  effectiveFrom: null,
  effectiveTo: null,
  scope: 'Alíquota interna residual e eventuais exceções por mercadoria/operação ainda não foram confirmadas em ato oficial vigente.',
  act: null,
  provision: null,
  sourceTitle: `${agency} · portal oficial de legislação`,
  sourceUrl: url,
  checkedOn: '2026-10-17',
  limitations: ['Pendente localizar e conferir o ato, artigo, redação, vigência e exceções do produto. Não usar percentual preliminar como regra.'],
})

export const STATE_INTERNAL_RATE_RULES: Record<BrazilianStateCode, StateInternalRateRule> = {
  AC: pendingRule('AC', 'SEFAZ/AC', 'https://www.sefaz.ac.gov.br/'),
  AL: pendingRule('AL', 'SEFAZ/AL', 'https://www.sefaz.al.gov.br/'),
  AP: pendingRule('AP', 'SEFAZ/AP', 'https://www.sefaz.ap.gov.br/'),
  AM: pendingRule('AM', 'SEFAZ/AM', 'https://www.sefaz.am.gov.br/'),
  BA: pendingRule('BA', 'SEFAZ/BA', 'https://www.sefaz.ba.gov.br/'),
  CE: pendingRule('CE', 'SEFAZ/CE', 'https://www.sefaz.ce.gov.br/'),
  DF: pendingRule('DF', 'Receita do Distrito Federal', 'https://www.receita.fazenda.df.gov.br/'),
  ES: pendingRule('ES', 'SEFAZ/ES', 'https://sefaz.es.gov.br/'),
  GO: pendingRule('GO', 'Casa Civil/GO · legislação', 'https://legisla.casacivil.go.gov.br/'),
  MA: pendingRule('MA', 'SEFAZ/MA', 'https://www.sefaz.ma.gov.br/'),
  MT: pendingRule('MT', 'SEFAZ/MT', 'https://www.sefaz.mt.gov.br/'),
  MS: pendingRule('MS', 'SEFAZ/MS', 'https://www.sefaz.ms.gov.br/'),
  MG: pendingRule('MG', 'SEF/MG', 'https://www.fazenda.mg.gov.br/empresas/legislacao_tributaria/'),
  PA: pendingRule('PA', 'SEFA/PA', 'https://www.sefa.pa.gov.br/'),
  PB: pendingRule('PB', 'SEFAZ/PB', 'https://www.sefaz.pb.gov.br/'),
  PR: pendingRule('PR', 'SEFA/PR', 'https://www.fazenda.pr.gov.br/'),
  PE: pendingRule('PE', 'SEFAZ/PE', 'https://www.sefaz.pe.gov.br/'),
  PI: pendingRule('PI', 'SEFAZ/PI', 'https://portal.sefaz.pi.gov.br/'),
  RJ: pendingRule('RJ', 'SEFAZ/RJ · legislação', 'https://legislacao.fazenda.rj.gov.br/'),
  RN: pendingRule('RN', 'SET/RN', 'https://www.set.rn.gov.br/'),
  RS: {
    state: 'RS', status: 'validated-residual', rate: '17%', effectiveFrom: '2022-01-01', effectiveTo: null,
    scope: 'Alíquota residual geral; deve ser substituída por alíquota específica, benefício ou carga efetiva aplicável ao item.',
    act: 'RICMS/RS · Decreto nº 37.699/1997', provision: 'Livro I, art. 27, X',
    sourceTitle: 'Receita Estadual do RS · legislação e orientação oficial',
    sourceUrl: 'https://atendimento.receita.rs.gov.br/como-calcular-o-imposto-devido-em-funcao-da-ec-87-62700a4e68b7b',
    checkedOn: '2026-10-17', limitations: ['17% é regra residual geral, não confirma a alíquota de uma mercadoria específica nem eventual AMPARA/RS.'],
  },
  RO: {
    state: 'RO', status: 'validated-residual', rate: '19.5%', effectiveFrom: '2024-01-12', effectiveTo: null,
    scope: 'Demais casos, quando não incidir alíquota específica, benefício, redução, isenção ou regime especial.',
    act: 'RICMS/RO · Decreto nº 22.721/2018', provision: 'Anexo I, art. 12, I, “e”; redação do Decreto nº 29.048/2024',
    sourceTitle: 'SEFIN/RO · RICMS consolidado',
    sourceUrl: 'https://legislacao.sefin.ro.gov.br/Download?arquivo=72c9e2d5be10c850f17e2de12f8ed220.pdf&nome=D18-22721%20DECRETO%20NOVO%20RICMS%20-%20Consolid.%20ate%20Dec.%2031274-26.pdf',
    checkedOn: '2026-10-17', limitations: ['Alíquota residual, não universal; NCM e benefícios ainda devem ser analisados.'],
  },
  RR: {
    state: 'RR', status: 'validated-residual', rate: '20%', effectiveFrom: '2023-03-30', effectiveTo: null,
    scope: 'Demais mercadorias e serviços; não substitui alíquota específica, isenção, redução, benefício ou regime especial.',
    act: 'Lei estadual nº 59/1993, com redação da Lei nº 1.767/2022', provision: 'Art. 32, I, “d”; vigência após 90 dias da publicação de 30/12/2022',
    sourceTitle: 'SEFAZ/RR · Lei nº 1.767/2022 e legislação estadual',
    sourceUrl: 'https://www.sefaz.rr.gov.br/component/jdownloads/?Itemid=402&catid=1302&id=23597&m=0&task=download.send',
    checkedOn: '2026-10-17', limitations: ['20% é residual; o RICMS atualizado em outubro de 2026 deve ser consultado para confirmar exceções por produto e operação. FCP/FECOP não auditado.'],
  },
  SC: pendingRule('SC', 'SEF/SC · legislação', 'https://legislacao.sef.sc.gov.br/'),
  SP: {
    state: 'SP', status: 'validated-residual', rate: '18%', effectiveFrom: '2009-01-01', effectiveTo: null,
    scope: 'Regra interna geral, salvo alíquota específica, benefício, redução, isenção ou regime especial.',
    act: 'Lei estadual nº 6.374/1989', provision: 'Art. 34, I',
    sourceTitle: 'SEFAZ/SP · Lei nº 6.374/1989',
    sourceUrl: 'https://legislacao.fazenda.sp.gov.br/Paginas/lei034.aspx',
    checkedOn: '2026-10-17', limitations: ['Alíquota geral residual, sujeita às exceções por produto e operação.'],
  },
  SE: pendingRule('SE', 'SEFAZ/SE', 'https://www.sefaz.se.gov.br/'),
  TO: pendingRule('TO', 'SEFAZ/TO · legislação', 'https://dtri.sefaz.to.gov.br/'),
}

export function getInternalRateRule(state: BrazilianStateCode): StateInternalRateRule {
  return STATE_INTERNAL_RATE_RULES[state]
}
