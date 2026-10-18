# Auditoria da seção 07 — aplicação prática

**Data da revisão:** 17/10/2026. **Referência da versão anterior:** `1903411`.

## Inventário antes das alterações

- A seção 07 é renderizada por `src/components/CaseStudy.tsx` e oferece quatro botões de trajetória: RO→SP, SP→RO, SP→PA e PR→RO.
- A escolha atualiza o card pelo estado React `selected`, porém percentuais, alíquotas internas e explicações eram atributos fixos no array local do componente.
- O texto de “FCP e recolhimento” era um parágrafo fixo compartilhado por todas as rotas; mencionava FECOEP/RO quando o destino podia ser SP ou PA. A territorialização do fundo estava errada.
- A seção não usava os resolvedores da calculadora principal. `src/lib/taxEngine.ts` possuía seleção direcional interestadual, catálogo interno em `src/data/stateInternalRates.ts`, bloqueio de base, FCP e responsabilidade. A divergência permitia que o card e a calculadora apresentassem estados diferentes.
- Não havia seletor de data ou origem da mercadoria na seção 07. A data mostrada era apenas a consulta de 17/10/2026 e os cards fixavam a premissa de mercadoria nacional, ainda sem comprovação.
- A base e o valor eram explicitamente não calculados; não existia fórmula monetária nesta seção.

## Alterações

- As quatro trajetórias agora são somente uma lista de origem/destino em `src/data/caseStudyPathways.ts`. Os percentuais e estados de validação vêm dos mesmos resolvedores usados pela calculadora.
- `src/lib/caseStudy.ts` monta o cenário didático para consumidor final não contribuinte e resolve alíquota interestadual, interna, fundo/adicional, base e responsável. As trocas de rota recalculam todos esses dados; a seção também permite selecionar data e origem declarada da mercadoria.
- FCP/adicional é territorializado por `src/data/stateFunds.ts`. A referência do FECOEP/RO só aparece quando RO é o destino. O card SP→PA não recebe o nome ou percentual de Rondônia.
- Para o Pará, o registro é **parcial**: a tabela nacional da NF-e localizada, atualizada em 25/02/2025, não lista FCP para PA. Como a data de consulta do projeto é 17/10/2026 e não foi localizada confirmação estadual que cubra mudanças após 2025 e cada hipótese de produto/operação, o card mantém a ressalva e não declara ausência definitiva nem calcula adicional. [Portal Nacional da NF-e — documentos e tabelas](https://www.nfe.fazenda.gov.br/portal/listaConteudo.aspx)
- O FECOEP/RO permanece parcial: a LC estadual nº 842/2015, com alteração da LC nº 879/2016, indica adicional de 2% limitado aos produtos/operações previstos; sem NCM e fatos fiscais, não se conclui incidência. [LC nº 842/2015, SEFIN/RO](https://legislacao.sefin.ro.gov.br/Download?arquivo=a25ba834c77832cb55c65319c5196e93.pdf&nome=LC842-2015.pdf)
- O card mostra fonte e vigência quando disponíveis. A alíquota interna do Pará continua pendente no catálogo, portanto não se apresenta um valor estadual sem validação.
- Sem NCM, documento fiscal, base e tratamento de produto, não há valor DIFAL/FCP. Para as quatro rotas didáticas, a operação continua explicitamente identificada como venda a consumidor final não contribuinte; a responsabilidade é apresentada como regra geral, não como determinação fiscal individual.

## Testes e escopo

Os testes novos percorrem as quatro trajetórias e verificam as taxas direcionais, as taxas internas disponíveis, associação de fundo ao destino, ausência de base fictícia, RSF 13/2012 pendente para mercadoria importada, alteração de data e troca de rota. Incluem SP→PA, PA→SP, RO→SP, PR→RO e alteração sucessiva dos parâmetros do resolvedor. A matriz de 729 pares permanece coberta em `tests/taxEngine.audit.test.mjs`; ela verifica referência federal direcional condicional, não validação jurídica por mercadoria.

Limitações: a legislação estadual de PA para ICMS interno e mudanças de FCP após a tabela NF-e de 2025 ainda precisam de validação oficial; 23 UFs permanecem pendentes de alíquota interna no catálogo geral; FCP/adicionais não estão integralmente cadastrados para todas as UFs; a base e o cálculo final não são habilitados. Por isso, esta seção não fornece valor de recolhimento.
