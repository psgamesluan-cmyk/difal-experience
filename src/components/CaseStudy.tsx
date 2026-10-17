import { useState } from 'react'
import { formatCurrency } from '../lib/difal'

interface CaseStudyProps {
  onReviewConcept: () => void
  onGoQuiz: () => void
}

const steps = [
  { label: 'A venda', title: 'Uma compra cruza a fronteira estadual.', body: 'Uma empresa fornecedora localizada em São Paulo vende uma mercadoria por R$ 1.000,00 para uma pessoa consumidora final em Rondônia. Neste exercício, a pessoa compradora não é contribuinte do ICMS.', stat: 'SP  →  RO', note: 'Cenário fictício para estudo' },
  { label: 'Alíquotas do exercício', title: 'Os percentuais são premissas, não dados oficiais.', body: 'Para demonstrar a operação matemática, o exercício adota uma alíquota interestadual hipotética de 12% e uma alíquota interna hipotética de 20% no destino.', stat: '12%  /  20%', note: 'Percentuais hipotéticos' },
  { label: 'A diferença', title: 'Subtraímos as alíquotas assumidas.', body: 'A alíquota interna hipotética do destino menos a alíquota interestadual hipotética resulta em uma diferença de 8 pontos percentuais.', stat: '20% − 12% = 8 p.p.', note: 'Diferença aritmética do exercício' },
  { label: 'O cálculo didático', title: 'Aplicamos a diferença à base simplificada.', body: 'A base de cálculo é assumida como R$ 1.000,00 apenas para o exercício: R$ 1.000,00 × 8% resulta em R$ 80,00.', stat: `${formatCurrency(1000)} × 8% = ${formatCurrency(80)}`, note: 'Resultado ilustrativo' },
  { label: 'Responsabilidade', title: 'Quem recolhe, em regra, neste cenário?', body: 'Como o caso considera consumidor final não contribuinte, o remetente é o responsável geral pelo recolhimento do diferencial, ressalvadas as condições e particularidades jurídicas da operação.', stat: 'REMETENTE', note: 'Regra geral constitucional · verificar o caso concreto' },
  { label: 'Conclusão', title: 'O resultado depende das premissas adotadas.', body: 'Sob as premissas simplificadas do exercício, o diferencial ilustrativo é R$ 80,00. Esse valor não constitui orientação para recolhimento real.', stat: formatCurrency(80), note: 'Exemplo didático · não fiscal' },
]

export function CaseStudy({ onReviewConcept, onGoQuiz }: CaseStudyProps) {
  const [step, setStep] = useState(0)
  const isSummary = step === steps.length
  const current = steps[Math.min(step, steps.length - 1)]!

  const restart = () => setStep(0)

  return (
    <div className="case-study">
      <div className="case-study__topline"><span>CASO DIDÁTICO · SP → RO</span><span>{isSummary ? 'RESUMO' : `ETAPA ${step + 1} DE ${steps.length}`}</span></div>
      <div className="case-study__progress" role="progressbar" aria-label="Progresso do estudo de caso" aria-valuemin={0} aria-valuemax={steps.length} aria-valuenow={isSummary ? steps.length : step + 1}><span style={{ width: `${(isSummary ? steps.length : step + 1) / steps.length * 100}%` }} /></div>
      {!isSummary ? <div className="case-stage" key={step}>
        <div className="case-stage__copy"><span className="case-stage__number">0{step + 1}</span><span className="eyebrow">{current.label}</span><h3>{current.title}</h3><p>{current.body}</p></div>
        <div className="case-stage__figure"><span className="case-stage__stat">{current.stat}</span><span className="case-stage__note">{current.note}</span>{step === 0 && <div className="case-route" aria-label="Rota do fornecedor em São Paulo até o consumidor em Rondônia"><span>São Paulo<small>origem</small></span><i aria-hidden="true" /><span>Rondônia<small>destino</small></span></div>}{step === 2 && <div className="difference-equation"><span>20%<small>interna hipotética</small></span><b>−</b><span>12%<small>interestadual hipotética</small></span><strong>8 p.p.</strong></div>}</div>
      </div> : <div className="case-summary" key="summary">
        <span className="eyebrow">SÍNTESE DO EXERCÍCIO</span><h3>O que aprendemos neste cenário?</h3>
        <dl className="case-summary__grid">
          <div><dt>Contexto</dt><dd>Venda interestadual fictícia de SP para RO, destinada a consumidor final não contribuinte.</dd></div>
          <div><dt>Dados utilizados</dt><dd>Valor assumido de R$ 1.000,00; alíquota interestadual hipotética de 12%; alíquota interna hipotética de 20%.</dd></div>
          <div><dt>Fórmula didática</dt><dd>Base assumida × (alíquota interna − alíquota interestadual).</dd></div>
          <div><dt>Resultado ilustrativo</dt><dd>8 pontos percentuais de diferença; R$ 80,00 sob as premissas simplificadas do exercício.</dd></div>
          <div><dt>Responsabilidade geral</dt><dd>Remetente, pois o destinatário foi descrito como não contribuinte, observadas as normas aplicáveis.</dd></div>
          <div><dt>Limitações</dt><dd>O resultado não é orientação de recolhimento real. Alíquotas, base e procedimentos precisam ser verificados para cada operação.</dd></div>
        </dl>
        <button className="text-button case-study__restart" type="button" onClick={restart}>Rever as etapas <span aria-hidden="true">↻</span></button>
      </div>}
      <div className="case-study__controls"><button className="button button--outline" type="button" disabled={step === 0} onClick={() => setStep((currentStep) => Math.max(0, currentStep - 1))}>← Anterior</button>{!isSummary && <button className="button button--primary" type="button" onClick={() => setStep((currentStep) => Math.min(steps.length, currentStep + 1))}>{step === steps.length - 1 ? 'Ver resumo' : 'Próxima etapa'} <span aria-hidden="true">→</span></button>}</div>
      {isSummary && <div className="case-study__final-actions"><button className="text-button" type="button" onClick={onReviewConcept}>Revisar o conceito <span aria-hidden="true">↑</span></button><button className="button button--primary" type="button" onClick={onGoQuiz}>Ir para o quiz <span aria-hidden="true">→</span></button></div>}
    </div>
  )
}
