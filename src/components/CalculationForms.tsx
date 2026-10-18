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
    </div>
  )
}
