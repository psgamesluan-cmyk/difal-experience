import { useEffect, useMemo, useRef, useState } from 'react'
import { calculateIllustrativeDifal, formatCurrency, formatRate, type RecipientKind } from '../lib/difal'

const example = { value: '1000', interstate: '12', destination: '20' }
const currencyInput = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 2 })

export function DifalCalculator() {
  const [value, setValue] = useState(example.value)
  const [isValueFocused, setIsValueFocused] = useState(false)
  const valueInputRef = useRef<HTMLInputElement>(null)
  const [interstateRate, setInterstateRate] = useState(example.interstate)
  const [destinationRate, setDestinationRate] = useState(example.destination)
  const [recipient, setRecipient] = useState<RecipientKind>('nonTaxpayer')
  const [showSteps, setShowSteps] = useState(false)

  const parsed = useMemo(() => {
    const normalizedValue = value.trim().replace(/\s|R\$/g, '')
    const hasBrazilianDecimal = normalizedValue.includes(',')
    const isBrazilianGroupedInteger = /^\d{1,3}(\.\d{3})+$/.test(normalizedValue)
    const operationValue = Number(hasBrazilianDecimal
      ? normalizedValue.replace(/\./g, '').replace(',', '.')
      : isBrazilianGroupedInteger ? normalizedValue.replace(/\./g, '') : normalizedValue)
    const interstate = Number(interstateRate)
    const destination = Number(destinationRate)
    const validValue = value.trim() !== '' && Number.isFinite(operationValue) && operationValue > 0 && operationValue <= 2_000_000
    const validInterstate = interstateRate.trim() !== '' && Number.isFinite(interstate) && interstate >= 0 && interstate <= 40
    const validDestination = destinationRate.trim() !== '' && Number.isFinite(destination) && destination >= 0 && destination <= 40

    return {
      operationValue,
      interstate,
      destination,
      validValue,
      validInterstate,
      validDestination,
      valid: validValue && validInterstate && validDestination,
    }
  }, [value, interstateRate, destinationRate])

  const result = parsed.valid
    ? calculateIllustrativeDifal({ operationValue: parsed.operationValue, interstateRate: parsed.interstate, destinationRate: parsed.destination })
    : null
  const hasNegativeDifference = result !== null && result.rateDifference < 0
  const amount = result?.illustrativeAmount
  const sliderValue = Number.isFinite(parsed.operationValue) ? Math.min(2_000_000, Math.max(0, parsed.operationValue)) : 0
  const displayValue = !isValueFocused && parsed.validValue ? currencyInput.format(parsed.operationValue).replace(/^R\$\s?/, '') : value

  useEffect(() => {
    if (isValueFocused) valueInputRef.current?.select()
  }, [isValueFocused])
  const restoreExample = () => {
    setValue(example.value)
    setInterstateRate(example.interstate)
    setDestinationRate(example.destination)
  }

  return (
    <div className="calculator" aria-label="Calculadora didática ilustrativa">
      <div className="calculator__inputs">
        <div className="calculator__topline"><span className="eyebrow">SIMULAÇÃO DIDÁTICA</span><span className="calculator__limits">Limites dos campos: 0–40% · até R$ 2.000.000</span></div>
        <div className="field field--wide">
          <span>Valor assumido da operação</span>
          <span className="field__unit">R$</span>
          <input ref={valueInputRef} id="operation-value" inputMode="decimal" type="text" autoComplete="off" value={displayValue} onFocus={() => setIsValueFocused(true)} onBlur={() => setIsValueFocused(false)} onChange={(event) => setValue(event.target.value)} aria-label="Valor assumido da operação em reais" aria-invalid={!parsed.validValue} aria-describedby="value-hint value-error" />
          <small id="value-hint">Hipótese simplificada de base de cálculo.</small>
          <input className="range-control range-control--amount" aria-label="Ajustar valor assumido da operação em passos de R$ 1.000" type="range" min="0" max="2000000" step="1000" value={sliderValue} onChange={(event) => setValue(event.target.value)} />
          {!parsed.validValue && <small className="field__error" id="value-error" role="alert">Informe um valor maior que zero e até R$ 2.000.000.</small>}
        </div>
        <div className="rate-fields">
          <label className="field" htmlFor="interstate-rate">
            <span>Alíquota interestadual</span>
            <span className="field__control"><input id="interstate-rate" type="number" min="0" max="40" step="0.01" value={interstateRate} onChange={(event) => setInterstateRate(event.target.value)} aria-describedby="interstate-error" /><span>%</span></span>
            <input className="range-control" aria-label="Ajustar alíquota interestadual" type="range" min="0" max="40" step="0.5" value={parsed.validInterstate ? parsed.interstate : 0} onChange={(event) => setInterstateRate(event.target.value)} />
            {!parsed.validInterstate && <small className="field__error" id="interstate-error" role="alert">Use uma alíquota entre 0% e 40%.</small>}
          </label>
          <label className="field" htmlFor="destination-rate">
            <span>Alíquota interna hipotética do destino</span>
            <span className="field__control"><input id="destination-rate" type="number" min="0" max="40" step="0.01" value={destinationRate} onChange={(event) => setDestinationRate(event.target.value)} aria-describedby="destination-error" /><span>%</span></span>
            <input className="range-control" aria-label="Ajustar alíquota interna hipotética do destino" type="range" min="0" max="40" step="0.5" value={parsed.validDestination ? parsed.destination : 0} onChange={(event) => setDestinationRate(event.target.value)} />
            {!parsed.validDestination && <small className="field__error" id="destination-error" role="alert">Use uma alíquota entre 0% e 40%.</small>}
          </label>
        </div>
        <label className="field field--select" htmlFor="recipient-kind">
          <span>Condição do destinatário</span>
          <select id="recipient-kind" value={recipient} onChange={(event) => setRecipient(event.target.value as RecipientKind)}>
            <option value="taxpayer">Consumidor final contribuinte</option>
            <option value="nonTaxpayer">Consumidor final não contribuinte</option>
          </select>
          <small>Usada para contextualizar a responsabilidade geral, não altera a fórmula simplificada.</small>
        </label>
        <div className="calculator__actions">
          <button className="button button--outline" type="button" onClick={restoreExample}>Restaurar exemplo</button>
          <button className="text-button" type="button" aria-expanded={showSteps} aria-controls="calculation-steps" onClick={() => setShowSteps((current) => !current)}>{showSteps ? 'Ocultar etapas' : 'Ver cálculo passo a passo'} <span aria-hidden="true">{showSteps ? '−' : '+'}</span></button>
        </div>
      </div>
      <div className="calculator__result">
        <div className="calculator__result-meta"><span>DIFERENÇA ILUSTRATIVA</span><span className="status-dot" />{result && !hasNegativeDifference ? `${formatRate(result.rateDifference)} · ${result.rateDifference.toLocaleString('pt-BR')} p.p.` : 'Aguardando valores válidos'}</div>
        <div className="rate-compare" aria-label={parsed.valid ? `Alíquota interestadual ${formatRate(parsed.interstate)} e interna ${formatRate(parsed.destination)}` : 'Preencha alíquotas válidas'}>
          <div className="rate-compare__row"><span>Interestadual</span><strong>{parsed.validInterstate ? formatRate(parsed.interstate) : '—'}</strong><i style={{ width: `${parsed.validInterstate ? parsed.interstate / 40 * 100 : 0}%` }} /></div>
          <div className="rate-compare__row rate-compare__row--destination"><span>Interna do destino</span><strong>{parsed.validDestination ? formatRate(parsed.destination) : '—'}</strong><i style={{ width: `${parsed.validDestination ? parsed.destination / 40 * 100 : 0}%` }} /></div>
        </div>
        <p className="result-equation">Base assumida × (alíquota interna − interestadual)</p>
        <output className={`result-amount${hasNegativeDifference ? ' result-amount--muted' : ''}`} aria-live="polite">{!parsed.valid ? '—' : hasNegativeDifference ? 'Sem resultado' : formatCurrency(amount ?? 0)}</output>
        <p className="result-caption">{!parsed.valid ? 'Corrija os campos indicados para atualizar a simulação.' : hasNegativeDifference ? 'Diferença negativa. A simulação não indica DIFAL devido.' : 'Resultado ilustrativo; não é valor fiscal definitivo.'}</p>
        <div className="responsibility-chip"><span>RESPONSABILIDADE GERAL</span><strong>{recipient === 'taxpayer' ? 'Destinatário contribuinte' : 'Remetente'}</strong><small>Observe a legislação e as condições da operação.</small></div>
      </div>
      {showSteps && <ol className="calculation-steps" id="calculation-steps">
        <li><span>01</span><p>Base hipotética usada: <strong>{parsed.validValue ? currencyInput.format(parsed.operationValue) : 'valor inválido'}</strong>.</p></li>
        <li><span>02</span><p>Alíquota interestadual: <strong>{parsed.validInterstate ? formatRate(parsed.interstate) : 'inválida'}</strong>.</p></li>
        <li><span>03</span><p>Alíquota interna hipotética de destino: <strong>{parsed.validDestination ? formatRate(parsed.destination) : 'inválida'}</strong>.</p></li>
        <li><span>04</span><p>Diferença entre as alíquotas: <strong>{result ? `${formatRate(result.rateDifference)} (${result.rateDifference.toLocaleString('pt-BR')} p.p.)` : 'indisponível'}</strong>.</p></li>
        <li><span>05</span><p>Aplicação ilustrativa: <strong>{result && !hasNegativeDifference ? `${currencyInput.format(parsed.operationValue)} × ${formatRate(result.rateDifference)}` : 'não aplicável'}</strong>.</p></li>
        <li><span>06</span><p>Resultado didático: <strong>{amount !== null && amount !== undefined ? formatCurrency(amount) : 'sem resultado válido'}</strong>.</p></li>
      </ol>}
      <p className="calculator__disclaimer">A apuração real pode depender da base legal, de componentes da operação, da legislação do destino, de benefícios, adicionais e outros fatores. Esta fórmula não substitui o cálculo fiscal aplicável ao caso concreto.</p>
    </div>
  )
}
