import { CALCULATION_STATE_ORDER, getMatrixRate, INTERSTATE_RATE_CONDITIONS } from '../data/calculationForms'

export function CalculationForms() {
  return (
    <div className="calculation-forms">
      <section className="calculation-form" aria-labelledby="calculation-form-1">
        <span className="eyebrow" id="calculation-form-1">FORMA DE CÁLCULO 1</span>
        <div className="calculation-form__table-wrap" role="region" aria-label="Tabela de alíquotas interestaduais, forma de cálculo 1" tabIndex={0}>
          <table className="calculation-form__rates-table">
            <tbody>
              <tr><th scope="row" rowSpan={2}>{INTERSTATE_RATE_CONDITIONS[0].rate}</th><td>{INTERSTATE_RATE_CONDITIONS[0].text}</td></tr>
              <tr><td>{INTERSTATE_RATE_CONDITIONS[1].text}</td></tr>
              <tr><th scope="row">{INTERSTATE_RATE_CONDITIONS[2].rate}</th><td>{INTERSTATE_RATE_CONDITIONS[2].text}</td></tr>
              <tr><th scope="row">{INTERSTATE_RATE_CONDITIONS[3].rate}</th><td>{INTERSTATE_RATE_CONDITIONS[3].text}</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="calculation-form" aria-labelledby="calculation-form-2">
        <span className="eyebrow" id="calculation-form-2">FORMA DE CÁLCULO 2</span>
        <div className="calculation-form__table-wrap calculation-form__table-wrap--matrix" role="region" aria-label="Matriz de alíquotas por origem e destino, forma de cálculo 2; deslize horizontalmente para ver todas as colunas" tabIndex={0}>
          <table className="calculation-form__matrix">
            <caption className="sr-only">Matriz de origem e destino apresentada na imagem de referência</caption>
            <thead>
              <tr><th aria-hidden="true" colSpan={2} rowSpan={2}></th><th colSpan={CALCULATION_STATE_ORDER.length} scope="colgroup">DESTINO</th></tr>
              <tr>{CALCULATION_STATE_ORDER.map((state) => <th scope="col" key={state}>{state}</th>)}</tr>
            </thead>
            <tbody>
              {CALCULATION_STATE_ORDER.map((origin, index) => <tr key={origin}>
                {index === 0 && <th className="calculation-form__origin-label" scope="rowgroup" rowSpan={CALCULATION_STATE_ORDER.length}>ORIGEM</th>}
                <th scope="row">{origin}</th>
                {CALCULATION_STATE_ORDER.map((destination) => <td className={origin === destination ? 'is-diagonal' : undefined} key={destination}>{getMatrixRate(origin, destination)}</td>)}
              </tr>)}
            </tbody>
          </table>
        </div>
      </section>

      <section className="calculation-form" aria-labelledby="calculation-form-3">
        <h3 id="calculation-form-3">Qual é a base de cálculo para as alíquotas (OP e DIFAL)?</h3>
        <div className="calculation-form__table-wrap" role="region" aria-label="Tabela da base de cálculo por tipo de destinatário, forma de cálculo 3" tabIndex={0}>
          <table className="calculation-form__base-table">
            <tbody>
              <tr>
                <th rowSpan={2} scope="rowgroup">Base de cálculo<br />ICMS na Origem<br />e DIFAL</th>
                <th scope="col">Destinatário<br />CONTRIBUINTE</th>
                <th scope="col">Destinatário<br />NÃO CONTRIBUINTE</th>
              </tr>
              <tr>
                <td>Base Única ou<br />Base Dupla</td>
                <td>Base Única</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="calculation-explainer" aria-labelledby="difal-calculation-explainer-title">
        <span className="eyebrow">CÁLCULO · EXPLICAÇÃO DIDÁTICA</span>
        <h3 id="difal-calculation-explainer-title">Como calcular o DIFAL</h3>
        <p className="calculation-explainer__lead">O DIFAL (Diferencial de Alíquota do ICMS) é a diferença entre o ICMS calculado conforme a alíquota interna do estado de destino e a parcela correspondente à alíquota interestadual, observadas as regras aplicáveis à operação.</p>
        <p className="calculation-explainer__lead">A forma de determinar a base de cálculo depende da natureza da operação e da legislação aplicável. Entre as metodologias estudadas estão a base única e a base dupla, também chamada de cálculo “por dentro”.</p>

        <section className="calculation-explainer__topic" aria-labelledby="difal-base-title">
          <h4 id="difal-base-title">1. Composição da base de cálculo</h4>
          <p>Como ponto de partida, a base de cálculo considera o valor da operação e os componentes que a legislação determina incluir.</p>
          <div className="calculation-explainer__formula" role="math" aria-label="Base de referência é o valor da mercadoria mais frete, seguro e despesas acessórias, menos descontos incondicionais, observadas as regras legais aplicáveis.">Base de referência = valor da mercadoria + frete + seguro + despesas acessórias − descontos incondicionais, observadas as regras legais aplicáveis.</div>
          <p>O IPI, o ICMS e outros componentes devem ser tratados conforme a natureza da operação e as normas aplicáveis. Não se deve incluir ou excluir um componente automaticamente sem verificar a hipótese tributária correspondente.</p>
        </section>

        <section className="calculation-explainer__topic" aria-labelledby="difal-method-a-title">
          <h4 id="difal-method-a-title">2. Método A — Base única</h4>
          <p>Nesse exemplo didático, utiliza-se o mesmo valor de operação como base para as duas alíquotas, calculando a diferença entre elas.</p>
          <p><strong>Dados do exemplo:</strong></p>
          <ul className="calculation-explainer__data"><li>Valor da operação: R$ 1.000,00</li><li>Alíquota interestadual: 12%</li><li>Alíquota interna do destino: 18%</li></ul>
          <h5>Passo 1 — Calcular a diferença entre as alíquotas</h5>
          <div className="calculation-explainer__formula" role="math" aria-label="18 por cento menos 12 por cento é igual a 6 por cento">18% − 12% = 6%</div>
          <h5>Passo 2 — Aplicar a diferença à base de cálculo</h5>
          <div className="calculation-explainer__formula" role="math" aria-label="DIFAL é 1.000 reais vezes 6 por cento, ou 1.000 reais vezes 0,06">DIFAL = R$ 1.000,00 × 6%<br />DIFAL = R$ 1.000,00 × 0,06</div>
          <p className="calculation-explainer__result">Resultado ilustrativo: <strong>R$ 60,00.</strong></p>
          <p>Esse resultado corresponde à fórmula simplificada de base única apresentada no exemplo. Para aplicá-la a uma operação real, é necessário confirmar se a metodologia é juridicamente adequada à operação e ao estado de destino.</p>
        </section>

        <section className="calculation-explainer__topic" aria-labelledby="difal-method-b-title">
          <h4 id="difal-method-b-title">3. Método B — Base dupla ou cálculo “por dentro”</h4>
          <p>No cálculo por dentro, o ICMS integra sua própria base de cálculo, conforme a metodologia legal aplicável. Por isso, a base utilizada para o imposto do destino pode ser diferente do valor inicial da operação.</p>
          <p>Para demonstrar a matemática, utilizaremos os mesmos valores:</p>
          <ul className="calculation-explainer__data"><li>Valor da operação: R$ 1.000,00</li><li>Alíquota interestadual: 12%</li><li>Alíquota interna do destino: 18%</li></ul>
          <h5>Passo 1 — Calcular o ICMS interestadual</h5>
          <div className="calculation-explainer__formula" role="math" aria-label="ICMS interestadual é o valor da operação vezes a alíquota interestadual: mil reais vezes doze por cento, igual a cento e vinte reais.">ICMS interestadual = valor da operação × alíquota interestadual<br />ICMS interestadual = R$ 1.000,00 × 12%<br />ICMS interestadual = R$ 120,00.</div>
          <h5>Passo 2 — Determinar a base ajustada</h5>
          <p>Para este exemplo didático, utilizaremos a fórmula:</p>
          <div className="calculation-explainer__formula" role="math" aria-label="Base ajustada é valor da operação menos ICMS interestadual, dividido por um menos alíquota interna do destino.">Base ajustada = (valor da operação − ICMS interestadual) ÷ (1 − alíquota interna do destino)<br />Base ajustada = (R$ 1.000,00 − R$ 120,00) ÷ (1 − 0,18)<br />Base ajustada = R$ 880,00 ÷ 0,82<br />Base ajustada ≈ R$ 1.073,17.</div>
          <h5>Passo 3 — Calcular o ICMS total do destino</h5>
          <div className="calculation-explainer__formula" role="math" aria-label="ICMS do destino é a base ajustada vezes a alíquota interna: 1.073 reais e 17 centavos vezes 18 por cento, aproximadamente 193 reais e 17 centavos.">ICMS do destino = base ajustada × alíquota interna<br />ICMS do destino = R$ 1.073,17 × 18%<br />ICMS do destino ≈ R$ 193,17.</div>
          <h5>Passo 4 — Calcular a diferença</h5>
          <div className="calculation-explainer__formula" role="math" aria-label="DIFAL ilustrativo é ICMS do destino menos ICMS interestadual: 193 reais e 17 centavos menos 120 reais.">DIFAL ilustrativo = ICMS do destino − ICMS interestadual<br />DIFAL ilustrativo = R$ 193,17 − R$ 120,00</div>
          <p className="calculation-explainer__result">Resultado ilustrativo: <strong>R$ 73,17.</strong></p>
          <p>Esse resultado demonstra a aplicação matemática da fórmula descrita. A fórmula e a forma de determinar a base devem ser confirmadas para a hipótese tributária específica antes de tratar o resultado como valor efetivamente devido.</p>
        </section>

        <section className="calculation-explainer__topic" aria-labelledby="difal-rates-title">
          <h4 id="difal-rates-title">4. Alíquotas interestaduais</h4>
          <p>As alíquotas interestaduais dependem da origem, do destino, da natureza da mercadoria e das regras legais aplicáveis.</p>
          <p>Como referências gerais:</p>
          <ul className="calculation-explainer__data"><li>7%: aplica-se a determinadas operações originadas nas regiões Sul e Sudeste, ressalvado o Espírito Santo, destinadas às regiões Norte, Nordeste e Centro-Oeste e ao Espírito Santo.</li><li>12%: aplica-se às demais operações abrangidas pela regra geral, observadas as exceções.</li><li>4%: pode aplicar-se a determinadas operações interestaduais com mercadorias importadas ou que atendam aos critérios legais relativos ao conteúdo de importação, observadas as exceções previstas na legislação.</li></ul>
          <p>Essas alíquotas não devem ser escolhidas apenas com base no nome dos estados. É necessário verificar a direção da operação e as condições previstas nas normas pertinentes.</p>
        </section>

        <section className="calculation-explainer__topic" aria-labelledby="difal-fcp-title">
          <h4 id="difal-fcp-title">5. E o FCP?</h4>
          <p>O Fundo de Combate à Pobreza (FCP), quando previsto e aplicável, deve ser analisado separadamente conforme a legislação do estado pertinente, o produto e a operação.</p>
          <p>A alíquota, a base, a incidência e a forma de recolhimento não são necessariamente iguais em todos os estados. Por isso, não se deve adicionar automaticamente 1% ou 2% ao cálculo sem verificar a regra específica.</p>
        </section>

        <section className="calculation-explainer__topic calculation-explainer__conclusion" aria-labelledby="difal-conclusion-title">
          <h4 id="difal-conclusion-title">Conclusão</h4>
          <p>A diferença entre os dois exemplos está na metodologia utilizada para determinar a base e calcular o imposto. Na demonstração de base única, a diferença de 6 pontos percentuais aplicada a R$ 1.000,00 resulta em R$ 60,00. Na demonstração de base dupla apresentada, a fórmula gera um resultado aproximado de R$ 73,17.</p>
          <p>Os dois resultados são exemplos matemáticos didáticos, e não uma afirmação de que ambas as metodologias podem ser escolhidas livremente para qualquer operação. A legislação aplicável determina qual metodologia deve ser utilizada em cada caso.</p>
        </section>
      </section>
    </div>
  )
}
