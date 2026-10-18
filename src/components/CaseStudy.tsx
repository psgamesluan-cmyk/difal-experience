import { useState } from 'react'
import { CASE_STUDY_PATHWAYS } from '../data/caseStudyPathways'
import type { GoodsOrigin } from '../lib/taxEngine'
import { resolveCaseStudyPathway } from '../lib/caseStudy'

interface CaseStudyProps {
  onReviewConcept: () => void
  onGoQuiz: () => void
}

const workflow = [
  'Identifique remetente, destinatário e a operação documentada.',
  'Confirme a condição do destinatário perante o ICMS.',
  'Determine a finalidade e a classificação fiscal da mercadoria.',
  'Confira origem e destino fiscais, incluindo eventual destino físico diferente.',
  'Fixe a data da operação para consultar a regra vigente naquele dia.',
  'Determine a base legal e seus componentes; não presuma que o total da nota é a base.',
  'Valide alíquotas interna e interestadual, importação, exceções e benefícios.',
  'Aplique somente a metodologia de cálculo prevista para aquela hipótese.',
  'Apure DIFAL e FCP separadamente, quando efetivamente incidentes.',
  'Confirme responsável, cadastro, prazo, guia e procedimento nos portais fiscais competentes.',
]

export function CaseStudy({ onReviewConcept, onGoQuiz }: CaseStudyProps) {
  const [selected, setSelected] = useState(CASE_STUDY_PATHWAYS[2]!.id)
  const [operationDate, setOperationDate] = useState('2026-10-17')
  const [goodsOrigin, setGoodsOrigin] = useState<GoodsOrigin>('domestic')
  const resolution = resolveCaseStudyPathway(selected, operationDate, goodsOrigin) ?? resolveCaseStudyPathway(CASE_STUDY_PATHWAYS[2]!.id, operationDate, goodsOrigin)!
  const { pathway: current, interstate, internal, fund, base, responsibility } = resolution
  const formattedOperationDate = operationDate ? new Date(`${operationDate}T12:00:00`).toLocaleDateString('pt-BR') : 'Não informada'

  return (
    <div className="case-study case-study--audit">
      <div className="case-study__topline"><span>CASOS DE REFERÊNCIA · VENDA A CONSUMIDOR FINAL NÃO CONTRIBUINTE</span><label>Data da operação <input type="date" value={operationDate} onChange={(event) => setOperationDate(event.target.value)} /></label><label>Origem da mercadoria <select value={goodsOrigin} onChange={(event) => setGoodsOrigin(event.target.value as GoodsOrigin)}><option value="domestic">Nacional declarada</option><option value="imported">Importada / conteúdo de importação</option><option value="unknown">Não identificada</option></select></label></div>
      <div className="case-audit__notice"><strong>Sem valor de recolhimento demonstrado</strong><p>A data e a origem declarada atualizam as referências abaixo. Sem NCM, documento fiscal, composição legal da base, benefícios e prova do conteúdo de importação, não demonstramos valor de recolhimento nem fórmula numérica de DIFAL.</p></div>
      <div className="case-audit__layout">
        <div className="case-audit__routes" role="group" aria-label="Selecione uma trajetória para ver as regras de referência">
          {CASE_STUDY_PATHWAYS.map((path, index) => <button className={selected === path.id ? 'is-selected' : ''} type="button" aria-pressed={selected === path.id} key={path.id} onClick={() => setSelected(path.id)}><span>0{index + 1}</span><strong>{path.label}</strong><i aria-hidden="true">→</i></button>)}
        </div>
        <article className="case-audit__detail" aria-live="polite">
          <span className="eyebrow">TRAJETÓRIA {current.origin} → {current.destination}</span>
          <h3>{current.label}</h3>
          <dl>
            <div><dt>Tipo considerado</dt><dd>Venda interestadual de mercadoria para consumidor final não contribuinte; tratamento especial e regime estadual ainda não identificados.</dd></div>
            <div><dt>Data da operação</dt><dd>{formattedOperationDate}. A vigência é resolvida pela data escolhida; consulta em 17/10/2026.</dd></div>
            <div><dt>Alíquota interestadual</dt><dd><strong>{interstate?.rate ?? 'Pendente'}</strong> · {interstate?.note ?? 'Informe uma data válida e verifique a origem/destino.'}{interstate?.rule && <> <a href={interstate.rule.sourceUrl} target="_blank" rel="noreferrer">{interstate.rule.sourceTitle} · {interstate.rule.provision}</a></>}</dd></div>
            <div><dt>Alíquota interna no destino ({current.destination})</dt><dd><strong>{internal.rate ?? 'Pendente de validação'}</strong> · {internal.note}{internal.rule?.act ? <> Fonte: {internal.rule.act}, {internal.rule.provision}, desde {internal.rule.effectiveFrom}. <a href={internal.rule.sourceUrl} target="_blank" rel="noreferrer">Abrir referência estadual</a></> : ''}</dd></div>
            <div><dt>Base, fórmula e resultado</dt><dd>{base.method} Pendências: {base.reasons.join('; ')}. Sem base validada, não há valor de DIFAL.</dd></div>
            <div><dt>Fundo/adicional do destino ({current.destination})</dt><dd>{fund.fundName ? `${fund.fundName} · ${fund.rate ?? 'percentual pendente'}. ` : ''}{fund.reason} <a href={fund.sourceUrl} target="_blank" rel="noreferrer">{fund.sourceTitle}</a> · consultado em {fund.checkedOn}. Responsabilidade geral indicada: {responsibility.party ?? 'pendente'} — {responsibility.basis}</dd></div>
          </dl>
          <p className="case-audit__footnote">A referência federal de 4% só poderá ser aplicada após confirmar os critérios, documentos e exceções da Resolução nº 13/2012 para a mercadoria.</p>
        </article>
      </div>

      <section className="case-audit__workflow" aria-labelledby="case-workflow-title">
        <span className="eyebrow">DO PEDIDO À OBRIGAÇÃO</span><h3 id="case-workflow-title">Dez verificações antes de recolher.</h3>
        <ol>{workflow.map((item, index) => <li key={item}><span>{String(index + 1).padStart(2, '0')}</span><p>{item}</p></li>)}</ol>
      </section>
      <p className="case-study__disclaimer">As alíquotas são referências normativas gerais, não valores finais de apuração. Mercadorias sujeitas a alíquotas específicas, substituição tributária, isenção, redução de base, benefícios fiscais, regimes especiais ou FCP exigem análise própria. Consulte a legislação e os portais oficiais de origem e destino.</p>
      <div className="case-study__final-actions"><button className="text-button" type="button" onClick={onReviewConcept}>Revisar o conceito <span aria-hidden="true">↑</span></button><button className="button button--primary" type="button" onClick={onGoQuiz}>Ir para o quiz <span aria-hidden="true">→</span></button></div>
    </div>
  )
}
