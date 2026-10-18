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
        <span className="eyebrow">COMO ENTENDER O CÁLCULO</span>
        <h3 id="difal-calculation-explainer-title">A lógica do DIFAL por dentro</h3>
        <p className="calculation-explainer__lead">
          O método de base dupla organiza a comparação entre a tributação da origem e a do destino. A sequência abaixo explica a lógica; a modalidade e a fórmula aplicáveis precisam ser confirmadas para cada operação.
        </p>

        <ol className="calculation-explainer__steps">
          <li>
            <h4>Identifique as alíquotas</h4>
            <p>A alíquota interestadual corresponde à operação entre estados. A alíquota interna é a pertinente ao estado de destino. Os percentuais dependem da operação, do produto, da origem da mercadoria e da legislação vigente.</p>
          </li>
          <li>
            <h4>Encontre o ICMS interestadual</h4>
            <p>Identifique a base de origem prevista para o caso e aplique a alíquota interestadual correspondente. O ICMS destacado na nota documenta a operação, mas não deve ser confundido automaticamente com o valor final do DIFAL.</p>
            <div className="calculation-explainer__formula" role="math" aria-label="ICMS interestadual é igual à base de origem aplicável multiplicada pela alíquota interestadual">
              ICMS<sub>inter</sub> = B<sub>origem</sub> × a<sub>inter</sub>
            </div>
          </li>
          <li>
            <h4>Determine a primeira base</h4>
            <p>A primeira base é formada conforme as regras da operação e representa o ponto de partida para identificar o imposto da origem. A forma como o ICMS de origem entra nessa base — ou é considerado na passagem para a base do destino — depende da metodologia legal aplicável.</p>
          </li>
          <li>
            <h4>Entenda a formação “por dentro”</h4>
            <p>Quando a regra determina que o próprio ICMS integre sua base, o imposto faz parte do valor sobre o qual sua alíquota incide. Por isso, não basta multiplicar diretamente o valor líquido inicial pela alíquota interna: é preciso encontrar a base que, depois de incluir o imposto, corresponda àquele valor líquido.</p>
            <div className="calculation-explainer__formula" role="math" aria-label="Base por dentro é igual ao valor líquido dividido por um menos a alíquota interna, quando essa estrutura for a prevista">
              B<sub>destino</sub> = V<sub>líquido</sub> ÷ (1 − a<sub>interna</sub>)
            </div>
            <p className="calculation-explainer__variables"><strong>Variáveis:</strong> B<sub>destino</sub> é a base do destino; V<sub>líquido</sub> é o valor de partida definido pela metodologia aplicável, após os ajustes legalmente previstos; a<sub>interna</sub> é a alíquota interna expressa em forma decimal. A divisão por (1 − a<sub>interna</sub>) mostra a inclusão do imposto na própria base. Esta relação algébrica ilustra o “gross-up”; não é uma fórmula universal de DIFAL.</p>
          </li>
          <li>
            <h4>Calcule o ICMS interno do destino</h4>
            <p>Com a base do destino definida segundo a regra aplicável, determine o ICMS interno correspondente usando a alíquota interna pertinente. A base e os ajustes precisam seguir a metodologia da hipótese analisada.</p>
            <div className="calculation-explainer__formula" role="math" aria-label="ICMS interno de destino é igual à base de destino definida pela regra multiplicada pela alíquota interna">
              ICMS<sub>destino</sub> = B<sub>destino</sub> × a<sub>interna</sub>
            </div>
          </li>
          <li>
            <h4>Apure a diferença</h4>
            <p>O DIFAL é a diferença tributária determinada pelas regras daquela operação, considerando as bases e os valores pertinentes. Só se comparam parcelas calculadas de forma compatível com a mesma metodologia legal; não se deve subtrair quaisquer dois valores de ICMS sem essa conferência.</p>
          </li>
          <li>
            <h4>Confira o que pode alterar a apuração</h4>
            <p>Tipo de destinatário e finalidade da aquisição, classificação do produto, composição da base, benefícios fiscais, eventual FCP e legislação vigente podem mudar o tratamento. Base dupla não é obrigatória em toda operação: confirme primeiro qual hipótese e metodologia se aplicam.</p>
          </li>
        </ol>
      </section>
    </div>
  )
}
