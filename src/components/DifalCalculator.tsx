import { useMemo, useState, type FormEvent } from 'react'
import { TAX_RULES, type BrazilianStateCode } from '../data/taxRules'
import {
  evaluateTaxScenario,
  parseCurrencyToCents,
  type AcquisitionPurpose,
  type GoodsOrigin,
  type RecipientStatus,
  type ScenarioKind,
  type SpecialTreatment,
  type TaxRegime,
} from '../lib/taxEngine'
import { simulateDidacticDifal } from '../lib/didacticSimulation'

const states: Array<[BrazilianStateCode, string]> = [
  ['AC', 'Acre'], ['AL', 'Alagoas'], ['AP', 'Amapá'], ['AM', 'Amazonas'], ['BA', 'Bahia'], ['CE', 'Ceará'],
  ['DF', 'Distrito Federal'], ['ES', 'Espírito Santo'], ['GO', 'Goiás'], ['MA', 'Maranhão'], ['MT', 'Mato Grosso'],
  ['MS', 'Mato Grosso do Sul'], ['MG', 'Minas Gerais'], ['PA', 'Pará'], ['PB', 'Paraíba'], ['PR', 'Paraná'],
  ['PE', 'Pernambuco'], ['PI', 'Piauí'], ['RJ', 'Rio de Janeiro'], ['RN', 'Rio Grande do Norte'], ['RS', 'Rio Grande do Sul'],
  ['RO', 'Rondônia'], ['RR', 'Roraima'], ['SC', 'Santa Catarina'], ['SP', 'São Paulo'], ['SE', 'Sergipe'], ['TO', 'Tocantins'],
]

const stateName = (code: string) => states.find(([state]) => state === code)?.[1] ?? code
const dateChecked = '17/10/2026'

export function DifalCalculator() {
  const [mode, setMode] = useState<'didactic' | 'validated'>('didactic')
  const [scenario, setScenario] = useState<ScenarioKind>('final-consumer-sale')
  const [origin, setOrigin] = useState<BrazilianStateCode | ''>('SP')
  const [destination, setDestination] = useState<BrazilianStateCode | ''>('RO')
  const [operationDate, setOperationDate] = useState('')
  const [recipient, setRecipient] = useState<RecipientStatus>('non-taxpayer')
  const [purpose, setPurpose] = useState<AcquisitionPurpose>('not-applicable')
  const [goodsOrigin, setGoodsOrigin] = useState<GoodsOrigin>('unknown')
  const [specialTreatment, setSpecialTreatment] = useState<SpecialTreatment>('unknown')
  const [taxRegime, setTaxRegime] = useState<TaxRegime>('unknown')
  const [ncm, setNcm] = useState('')
  const [amounts, setAmounts] = useState({ products: '', freight: '', insurance: '', accessories: '', ipi: '', discount: '' })
  const [wasSubmitted, setWasSubmitted] = useState(false)
  const [copyFeedback, setCopyFeedback] = useState('')
  const [manualRates, setManualRates] = useState({ interstate: '', internal: '', fcp: '' })

  const result = useMemo(() => {
    if (!wasSubmitted || mode !== 'validated') return null
    return evaluateTaxScenario({
      scenario,
      origin,
      destination,
      operationDate,
      productClassification: ncm,
      recipient,
      purpose,
      goodsOrigin,
      specialTreatment,
      taxRegime,
      invalidMoneyFields: Object.entries(amounts)
        .filter(([, raw]) => raw.trim() !== '' && parseCurrencyToCents(raw) === null)
        .map(([key]) => ({ products: 'produtos', freight: 'frete', insurance: 'seguro', accessories: 'despesas acessórias', ipi: 'IPI', discount: 'desconto incondicional' })[key as keyof typeof amounts] ?? key),
      productValueCents: parseCurrencyToCents(amounts.products),
      freightCents: amounts.freight.trim() ? parseCurrencyToCents(amounts.freight) : null,
      insuranceCents: amounts.insurance.trim() ? parseCurrencyToCents(amounts.insurance) : null,
      accessoryExpensesCents: amounts.accessories.trim() ? parseCurrencyToCents(amounts.accessories) : null,
      ipiCents: amounts.ipi.trim() ? parseCurrencyToCents(amounts.ipi) : null,
      unconditionalDiscountCents: amounts.discount.trim() ? parseCurrencyToCents(amounts.discount) : null,
    })
  }, [amounts, destination, goodsOrigin, mode, ncm, operationDate, origin, purpose, recipient, scenario, specialTreatment, taxRegime, wasSubmitted])

  const didacticResult = useMemo(() => wasSubmitted && mode === 'didactic' ? simulateDidacticDifal({
    scenario, recipient, productValue: amounts.products, freight: amounts.freight, insurance: amounts.insurance,
    accessories: amounts.accessories, ipi: amounts.ipi, discount: amounts.discount,
    interstateRate: manualRates.interstate, internalRate: manualRates.internal, fcpRate: manualRates.fcp,
  }) : null, [amounts, manualRates, mode, recipient, scenario, wasSubmitted])

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setWasSubmitted(true)
    setCopyFeedback('')
  }

  const reset = () => {
    setMode('didactic')
    setScenario('final-consumer-sale')
    setOrigin('SP')
    setDestination('RO')
    setOperationDate('')
    setRecipient('non-taxpayer')
    setPurpose('not-applicable')
    setGoodsOrigin('unknown')
    setSpecialTreatment('unknown')
    setTaxRegime('unknown')
    setNcm('')
    setAmounts({ products: '', freight: '', insurance: '', accessories: '', ipi: '', discount: '' })
    setManualRates({ interstate: '', internal: '', fcp: '' })
    setWasSubmitted(false)
    setCopyFeedback('')
  }

  const copyReport = async () => {
    if (didacticResult?.valid) {
      const simulationText = [`SIMULAÇÃO DIDÁTICA · ${origin} → ${destination}`, `Base demonstrativa: R$ ${amounts.products}`, `Alíquotas informadas: interna ${manualRates.internal}% · interestadual ${manualRates.interstate}%`, ...didacticResult.steps, ...didacticResult.premises.map((premise) => `Premissa: ${premise}`)].join('\n')
      try { await navigator.clipboard.writeText(simulationText); setCopyFeedback('Demonstrativo copiado.') }
      catch { setCopyFeedback('Não foi possível copiar automaticamente. Selecione o texto do demonstrativo.') }
      return
    }
    if (!result) return
    const text = [
      result.title,
      `Operação: ${stateName(origin)} (${origin}) → ${stateName(destination)} (${destination})`,
      `Data informada: ${operationDate || 'não informada'}`,
      `Conclusão: ${result.reason}`,
      `Referência interestadual: ${result.interstateReference?.rate ?? 'não determinada'} — ${result.interstateReference?.note ?? ''}`,
      `Referência interna de ${destination}: ${result.internalReference?.rate ?? 'pendente'} — ${result.internalReference?.note ?? ''}`,
      `Responsável geral indicado: ${result.responsibility.party ?? 'pendente'} — ${result.responsibility.basis}`,
      `Base: ${result.base?.method ?? 'não determinada'} — ${result.base?.reasons.join('; ') ?? ''}`,
      `FCP: ${result.fcp?.reason ?? 'não avaliado'}`,
      ...result.alerts.map((alert) => `Alerta: ${alert}`),
      'Nenhum valor de DIFAL ou FCP foi calculado.',
      'Ferramenta educacional; confirme a legislação, os documentos fiscais e a administração tributária competente.',
    ].join('\n')
    try {
      await navigator.clipboard.writeText(text)
      setCopyFeedback('Demonstrativo copiado.')
    } catch {
      setCopyFeedback('Não foi possível copiar automaticamente. Selecione o texto do demonstrativo.')
    }
  }

  const identifiedRuleIds = result?.sourceRuleIds ?? []
  const identifiedRules = TAX_RULES.filter((rule) => identifiedRuleIds.includes(rule.id))

  const loadRsRrExample = () => {
    setScenario('final-consumer-sale')
    setOrigin('RS')
    setDestination('RR')
    setOperationDate('2026-10-16')
    setRecipient('non-taxpayer')
    setPurpose('not-applicable')
    setGoodsOrigin('domestic')
    setSpecialTreatment('unknown')
    setTaxRegime('unknown')
    setWasSubmitted(false)
    setCopyFeedback('')
  }

  return (
    <div className="tax-calculator" aria-label="Triagem educacional de operação sujeita a possível DIFAL">
      <div className="tax-calculator__intro">
        <div><span className="eyebrow">CALCULADORA EDUCACIONAL · REFERÊNCIAS REVISADAS EM {dateChecked}</span><h3>Comece pela operação.</h3><p>Escolha entre uma demonstração matemática com premissas manuais e uma triagem separada de regras efetivamente validadas.</p></div>
        <span className="tax-calculator__badge"><i />Simulação didática<br />disponível</span>
      </div>

      <fieldset className="tax-form__scenario tax-form__mode"><legend>Modo de uso</legend>
        <label className={mode === 'didactic' ? 'is-selected' : ''}><input type="radio" name="mode" checked={mode === 'didactic'} onChange={() => { setMode('didactic'); setWasSubmitted(false) }} /><span><strong>Simulação didática</strong><small>Calcula uma fórmula demonstrativa com alíquotas que você informa.</small></span></label>
        <label className={mode === 'validated' ? 'is-selected' : ''}><input type="radio" name="mode" checked={mode === 'validated'} onChange={() => { setMode('validated'); setWasSubmitted(false) }} /><span><strong>Triagem de regras validadas</strong><small>Não calcula se os elementos jurídicos e a base não estiverem efetivamente confirmados.</small></span></label>
      </fieldset>

      <div className="tax-calculator__preset"><p><strong>Conferir o caso RS → RR</strong><span>Exemplo de referência para 16/10/2026. Preenche a rota, a natureza da operação e o destinatário; não inventa preço nem NCM.</span></p><button className="button button--outline" type="button" onClick={loadRsRrExample}>Preencher RS → RR</button></div>

      <form onSubmit={submit} className="tax-form">
        <section className="tax-form__step" aria-labelledby="tax-step-operation">
          <div className="tax-form__step-heading"><span>01</span><div><h4 id="tax-step-operation">Identifique a operação</h4><p>Escolha o cenário e indique a origem, o destino e a data da saída ou entrada.</p></div></div>
          <fieldset className="tax-form__scenario"><legend>Tipo de operação</legend>
            <label className={scenario === 'final-consumer-sale' ? 'is-selected' : ''}><input type="radio" name="scenario" value="final-consumer-sale" checked={scenario === 'final-consumer-sale'} onChange={() => { setScenario('final-consumer-sale'); setPurpose('not-applicable'); setWasSubmitted(false) }} /><span><strong>Venda a consumidor final</strong><small>Operação interestadual destinada a consumidor final.</small></span></label>
            <label className={scenario === 'taxpayer-acquisition' ? 'is-selected' : ''}><input type="radio" name="scenario" value="taxpayer-acquisition" checked={scenario === 'taxpayer-acquisition'} onChange={() => { setScenario('taxpayer-acquisition'); setRecipient('taxpayer'); setPurpose('use-consumption'); setWasSubmitted(false) }} /><span><strong>Aquisição por contribuinte</strong><small>Informe a finalidade para verificar a hipótese aplicável.</small></span></label>
          </fieldset>
          <div className="tax-form__grid">
            <label className="tax-field"><span>Estado de origem</span><select value={origin} onChange={(event) => { setOrigin(event.target.value as BrazilianStateCode); setWasSubmitted(false) }} required>{states.map(([code, name]) => <option key={code} value={code}>{name} ({code})</option>)}</select></label>
            <label className="tax-field"><span>Estado de destino</span><select value={destination} onChange={(event) => { setDestination(event.target.value as BrazilianStateCode); setWasSubmitted(false) }} required>{states.map(([code, name]) => <option key={code} value={code}>{name} ({code})</option>)}</select></label>
            <label className="tax-field"><span>Data da operação</span><input type="date" value={operationDate} max="2026-10-17" onChange={(event) => { setOperationDate(event.target.value); setWasSubmitted(false) }} required={mode === 'validated'} /><small>Necessária para a triagem temporal; opcional para a conta matemática demonstrativa.</small></label>
            <label className="tax-field"><span>Origem da mercadoria</span><select value={goodsOrigin} onChange={(event) => { setGoodsOrigin(event.target.value as GoodsOrigin); setWasSubmitted(false) }}><option value="unknown">Não verificada</option><option value="domestic">Nacional confirmada</option><option value="imported">Importada ou com conteúdo de importação</option></select><small>Mercadoria importada pode estar sujeita à Resolução do Senado nº 13/2012.</small></label>
          </div>
          {mode === 'didactic' && <div className="tax-form__grid tax-form__grid--three tax-form__manual-rates">
            <label className="tax-field"><span>Alíquota interestadual adotada (%) *</span><input type="text" inputMode="decimal" value={manualRates.interstate} onChange={(event) => { setManualRates((current) => ({ ...current, interstate: event.target.value })); setWasSubmitted(false) }} placeholder="Informada por você" required /><small>Premissa didática; o sistema não a certifica.</small></label>
            <label className="tax-field"><span>Alíquota interna adotada (%) *</span><input type="text" inputMode="decimal" value={manualRates.internal} onChange={(event) => { setManualRates((current) => ({ ...current, internal: event.target.value })); setWasSubmitted(false) }} placeholder="Informada por você" required /><small>Premissa didática; verifique a regra da UF e do produto.</small></label>
            <label className="tax-field"><span>FCP manual (%) · opcional</span><input type="text" inputMode="decimal" value={manualRates.fcp} onChange={(event) => { setManualRates((current) => ({ ...current, fcp: event.target.value })); setWasSubmitted(false) }} placeholder="Deixe em branco para não aplicar" /><small>Se informado, aparece em linha separada e nunca é somado automaticamente ao DIFAL.</small></label>
          </div>}
        </section>

        <section className="tax-form__step" aria-labelledby="tax-step-status">
          <div className="tax-form__step-heading"><span>02</span><div><h4 id="tax-step-status">Informe a condição fiscal</h4><p>Os campos variam conforme o cenário selecionado.</p></div></div>
          {scenario === 'final-consumer-sale' ? <div className="tax-form__grid tax-form__grid--two">
            <label className="tax-field"><span>Consumidor final</span><select value={recipient} onChange={(event) => { setRecipient(event.target.value as RecipientStatus); setWasSubmitted(false) }}><option value="unknown">Ainda não identificado</option><option value="taxpayer">Contribuinte do ICMS</option><option value="non-taxpayer">Não contribuinte do ICMS</option></select></label>
            <p className="tax-help">A Constituição prevê responsáveis distintos conforme a condição do destinatário. Isso não determina, sozinho, a base, o valor nem os prazos de recolhimento.</p>
          </div> : <div className="tax-form__grid tax-form__grid--two">
            <label className="tax-field"><span>Finalidade da aquisição</span><select value={purpose} onChange={(event) => { setPurpose(event.target.value as AcquisitionPurpose); setWasSubmitted(false) }}><option value="not-applicable">Selecione</option><option value="use-consumption">Uso ou consumo</option><option value="fixed-assets">Ativo imobilizado</option><option value="resale">Revenda</option><option value="industrialization">Industrialização</option><option value="other">Outra finalidade</option></select></label>
            <p className="tax-help">Uso/consumo e ativo imobilizado têm previsão específica na LC nº 87/1996; revenda e industrialização exigem outra análise e não recebem DIFAL automaticamente nesta ferramenta.</p>
          </div>}
          <div className="tax-form__grid tax-form__grid--three tax-form__grid--metadata">
            <label className="tax-field"><span>NCM ou descrição fiscal</span><input type="text" inputMode="numeric" value={ncm} onChange={(event) => { setNcm(event.target.value); setWasSubmitted(false) }} placeholder="Ex.: código NCM ou descrição do item" /><small>A classificação é necessária para confirmar alíquotas específicas, benefícios, ST e FECOEP.</small></label>
            <label className="tax-field"><span>Regime, benefício ou tratamento especial</span><select value={specialTreatment} onChange={(event) => { setSpecialTreatment(event.target.value as SpecialTreatment); setWasSubmitted(false) }}><option value="unknown">Não verificado</option><option value="none-declared">Sem tratamento especial confirmado</option><option value="present">Há benefício, ST, isenção, redução ou regime especial</option></select><small>O app não verifica automaticamente cadastros, convênios, regimes ou benefícios estaduais.</small></label>
            <label className="tax-field"><span>Regime de apuração do ICMS</span><select value={taxRegime} onChange={(event) => { setTaxRegime(event.target.value as TaxRegime); setWasSubmitted(false) }}><option value="unknown">Não identificado</option><option value="normal">Regime normal</option><option value="simples">Simples Nacional</option><option value="special">Regime especial ou outro</option></select><small>O enquadramento pode alterar regras, obrigações e elegibilidade.</small></label>
          </div>
        </section>

        <section className="tax-form__step" aria-labelledby="tax-step-values">
          <div className="tax-form__step-heading"><span>03</span><div><h4 id="tax-step-values">Registre os valores disponíveis</h4><p>Informe parcelas separadas, quando conhecidas. Elas não serão somadas automaticamente à base de cálculo.</p></div></div>
          <div className="tax-form__grid tax-form__grid--three">
            {([['products', 'Valor dos produtos', true], ['freight', 'Frete', false], ['insurance', 'Seguro', false], ['accessories', 'Despesas acessórias', false], ['ipi', 'IPI', false], ['discount', 'Desconto incondicional', false]] as const).map(([key, label, required]) => <label className="tax-field" key={key}><span>{label}{required ? ' *' : ''}</span><div className="tax-field__currency"><b>R$</b><input type="text" inputMode="decimal" value={amounts[key]} onChange={(event) => { setAmounts((current) => ({ ...current, [key]: event.target.value })); setWasSubmitted(false) }} placeholder="0,00" required={required} aria-label={label} /></div></label>)}
          </div>
          <p className="tax-help tax-help--wide">Na simulação didática, parcelas preenchidas são somadas e o desconto incondicional é subtraído, conforme premissa visível no resultado. Na triagem validada, o sistema não as soma automaticamente à base legal.</p>
        </section>

        <div className="tax-form__actions"><button className="button button--primary" type="submit">Analisar cenário <span aria-hidden="true">→</span></button><button className="button button--outline" type="button" onClick={reset}>Limpar dados</button></div>
      </form>

      {didacticResult && <section className={`tax-result tax-result--${didacticResult.valid ? 'simulation' : 'invalid'}`} aria-live="polite" aria-labelledby="didactic-result-title">
        <div className="tax-result__header"><span className="eyebrow">SIMULAÇÃO DIDÁTICA · {origin} → {destination}</span><h3 id="didactic-result-title">{didacticResult.valid ? 'Demonstração matemática' : 'Complete ou corrija os dados'}</h3><p>{didacticResult.valid ? 'Este valor resulta somente das premissas informadas. Não é apuração fiscal nem confirmação de incidência ou recolhimento.' : 'Nenhum resultado numérico foi produzido. Revise os itens indicados e tente novamente.'}</p></div>
        {didacticResult.valid ? <>
          <div className="tax-result__simulation-values"><article><span>Base simplificada</span><strong>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(didacticResult.baseCents) / 100)}</strong></article><article><span>DIFAL da simulação</span><strong>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(didacticResult.difalCents) / 100)}</strong></article>{didacticResult.fcpCents !== null && <article><span>FCP separado, informado manualmente</span><strong>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(didacticResult.fcpCents) / 100)}</strong></article>}</div>
          <div className="tax-result__simulation-detail"><h4>Etapas da conta</h4><ol>{didacticResult.steps.map((step) => <li key={step}>{step}</li>)}</ol><h4>Premissas e limites</h4><ul>{didacticResult.premises.map((premise) => <li key={premise}>{premise}</li>)}</ul></div>
        </> : <ul className="tax-result__alerts">{didacticResult.errors.map((error) => <li key={error}>{error}</li>)}</ul>}
        <div className="tax-result__actions"><button className="button button--outline" type="button" onClick={() => window.print()}>Imprimir demonstrativo</button><button className="text-button" type="button" onClick={copyReport}>Copiar resumo <span aria-hidden="true">↗</span></button><span role="status">{copyFeedback}</span></div>
      </section>}

      {result && <section className={`tax-result tax-result--${result.status}`} aria-live="polite" aria-labelledby="tax-result-title">
        <div className="tax-result__header"><span className="eyebrow">RESULTADO DA TRIAGEM · {origin} → {destination}</span><h3 id="tax-result-title">{result.title}</h3><p>{result.reason}</p></div>
        {result.interstateReference && <div className="tax-result__reference"><span>Referência de alíquota interestadual</span><strong>{result.interstateReference.rate ?? 'Pendente de validação'}</strong><p>{result.interstateReference.note}</p>{result.interstateReference.rule && <a href={result.interstateReference.rule.sourceUrl} target="_blank" rel="noreferrer">{result.interstateReference.rule.sourceTitle} · {result.interstateReference.rule.provision}</a>}</div>}
        {result.internalReference && <div className="tax-result__reference"><span>Alíquota interna residual do destino · {destination}</span><strong>{result.internalReference.rate ?? 'Pendente de validação'}</strong><p>{result.internalReference.note}</p>{result.internalReference.rule && <><p><strong>{result.internalReference.rule.act ?? 'Ato e artigo pendentes'}</strong>{result.internalReference.rule.provision ? ` · ${result.internalReference.rule.provision}` : ''}{result.internalReference.rule.effectiveFrom ? ` · vigência desde ${result.internalReference.rule.effectiveFrom}` : ''}</p><a href={result.internalReference.rule.sourceUrl} target="_blank" rel="noreferrer">{result.internalReference.rule.sourceTitle}</a></>}</div>}
        {result.memory && <details className="tax-result__rules"><summary>Ver módulos, memória e pendências</summary><div><article><strong>Cenário e responsabilidade</strong><p>{result.memory.scenario} · responsável geral: {result.responsibility.party ?? 'não definido'}.</p><p>{result.responsibility.basis}</p></article><article><strong>Base e FCP</strong><p>{result.memory.baseMethod}</p><p>{result.fcp?.reason}</p><p>Arredondamento: {result.memory.rounding}</p></article><article><strong>Regras consultadas</strong><p>Interestadual: {result.memory.interstateRule}</p><p>Destino: {result.memory.destinationRule}</p><p>Data da operação: {result.memory.operationDate} · trajetória: {result.memory.route}.</p></article></div></details>}
        <div className="tax-result__no-calculation"><strong>DIFAL e FCP: não calculados</strong><span>Este resultado é uma triagem, não um valor para recolhimento.</span></div>
        <ul className="tax-result__alerts">{result.alerts.map((alert) => <li key={alert}>{alert}</li>)}</ul>
        {identifiedRules.length > 0 && <details className="tax-result__rules"><summary>Ver regras consultadas e status</summary><div>{identifiedRules.map((rule) => <article key={rule.id}><strong>{rule.id} · {rule.status === 'validated' ? 'validada no escopo descrito' : rule.status === 'pending' ? 'pendente' : rule.status === 'expired' ? 'vencida' : 'não suportada'}</strong><p>{rule.sourceTitle} · {rule.provision} · vigência a partir de {rule.effectiveFrom}{rule.effectiveTo ? ` até ${rule.effectiveTo}` : ''}. Consultada em {dateChecked}.</p><a href={rule.sourceUrl} target="_blank" rel="noreferrer">Abrir fonte oficial</a></article>)}</div></details>}
        <div className="tax-result__actions"><button className="button button--outline" type="button" onClick={() => window.print()}>Imprimir demonstrativo</button><button className="text-button" type="button" onClick={copyReport}>Copiar resumo <span aria-hidden="true">↗</span></button><span role="status">{copyFeedback}</span></div>
      </section>}

      <p className="tax-calculator__disclaimer">Ferramenta educacional e informativa. Não substitui a conferência da legislação vigente na data da operação, dos documentos fiscais nem das orientações da administração tributária competente. A base normativa é revisada manualmente; não existe atualização automática.</p>
    </div>
  )
}
