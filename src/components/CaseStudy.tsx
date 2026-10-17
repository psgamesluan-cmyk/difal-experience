import { useState } from 'react'

interface CaseStudyProps {
  onReviewConcept: () => void
  onGoQuiz: () => void
}

const pathways = [
  { id: 'ro-sp', label: 'Rondônia → São Paulo', origin: 'RO', destination: 'SP', interstate: '12%', internal: '18% · alíquota geral paulista', internalState: 'A regra geral consta do art. 34, I, da Lei paulista nº 6.374/1989; pode haver exceção por produto ou operação.', footnote: 'Pela RSF nº 22/1989, a faixa de 7% não corresponde a uma saída da Região Norte para o Sudeste.' },
  { id: 'sp-ro', label: 'São Paulo → Rondônia', origin: 'SP', destination: 'RO', interstate: '7%', internal: '19,5% · alíquota modal residual de RO', internalState: 'O RICMS/RO prevê 19,5% nos demais casos desde 12/01/2024; é necessário verificar se o produto tem alíquota específica, benefício ou FECOEP.', footnote: 'A aplicação da faixa regional depende da origem Sul/Sudeste e destino Norte, Nordeste, Centro-Oeste ou ES.' },
  { id: 'sp-pa', label: 'São Paulo → Pará', origin: 'SP', destination: 'PA', interstate: '7%', internal: 'Não verificada nesta auditoria', internalState: 'A alíquota interna do Pará, o tratamento do produto e eventuais adicionais precisam ser conferidos na legislação estadual vigente para a data da operação.', footnote: 'O Pará é um destino da Região Norte. A regra de 7% decorre da trajetória prevista na RSF nº 22/1989, sob as condições anotadas.' },
  { id: 'pr-ro', label: 'Paraná → Rondônia', origin: 'PR', destination: 'RO', interstate: '7%', internal: '19,5% · alíquota modal residual de RO', internalState: 'O RICMS/RO prevê 19,5% nos demais casos desde 12/01/2024; produto, benefícios e FECOEP continuam pendentes de identificação.', footnote: 'Paraná integra a Região Sul; Rondônia integra a Região Norte.' },
]

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
  const [selected, setSelected] = useState(pathways[1]!.id)
  const current = pathways.find((path) => path.id === selected) ?? pathways[1]!

  return (
    <div className="case-study case-study--audit">
      <div className="case-study__topline"><span>CASOS DE REFERÊNCIA · MERCADORIA NACIONAL A CONFIRMAR</span><span>CONSULTA NORMATIVA · 17/10/2026</span></div>
      <div className="case-audit__notice"><strong>Sem valor de recolhimento demonstrado</strong><p>As trajetórias abaixo permitem conferir a regra federal de referência para a alíquota interestadual. Não foram fornecidos data fiscal concreta, NCM, documentos, composição da base ou evidências sobre benefícios. Por isso, não há fórmula nem resultado numérico de DIFAL.</p></div>
      <div className="case-audit__layout">
        <div className="case-audit__routes" role="group" aria-label="Selecione uma trajetória para ver as regras de referência">
          {pathways.map((path, index) => <button className={selected === path.id ? 'is-selected' : ''} type="button" aria-pressed={selected === path.id} key={path.id} onClick={() => setSelected(path.id)}><span>0{index + 1}</span><strong>{path.label}</strong><i aria-hidden="true">→</i></button>)}
        </div>
        <article className="case-audit__detail" aria-live="polite">
          <span className="eyebrow">TRAJETÓRIA {current.origin} → {current.destination}</span>
          <h3>{current.label}</h3>
          <dl>
            <div><dt>Tipo considerado</dt><dd>Venda interestadual de mercadoria para consumidor final não contribuinte; cenário didático, ainda sem classificação do produto.</dd></div>
            <div><dt>Data de referência jurídica</dt><dd>17/10/2026, data desta consulta. A data efetiva da operação deve ser informada antes de selecionar a legislação aplicável.</dd></div>
            <div><dt>Alíquota interestadual de referência</dt><dd><strong>{current.interstate}</strong> pela regra regional ou geral da Resolução do Senado nº 22/1989, se mercadoria nacional e sem exceção.</dd></div>
            <div><dt>Alíquota interna no destino</dt><dd>{current.internal}. {current.internalState}</dd></div>
            <div><dt>Base, fórmula e resultado</dt><dd>Não determinados. Faltam NCM, data da operação, valor fiscal e componentes da base; a LC nº 190/2022 alterou regras de base para hipóteses do DIFAL.</dd></div>
            <div><dt>FCP e recolhimento</dt><dd>Não calculados. Para consumidor final não contribuinte, a regra geral constitucional atribui responsabilidade ao remetente, sujeita às normas da operação; o FECOEP/RO incide apenas nas hipóteses e produtos previstos.</dd></div>
          </dl>
          <p className="case-audit__footnote">{current.footnote} Se a mercadoria for importada ou atender aos critérios da Resolução nº 13/2012, a referência interestadual pode ser 4%, observadas suas exceções.</p>
          <a href="https://legis.senado.leg.br/norma/586152/publicacao/15646891" target="_blank" rel="noreferrer">Resolução nº 22/1989 · abrir fonte oficial <span aria-hidden="true">↗</span></a>
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
