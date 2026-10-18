# Auditoria estrutural da calculadora DIFAL

**Data:** 17/10/2026. **Estado observado antes desta correção:** commit `1903411`.

## Achados anteriores à implementação

1. A mensagem `Cenário não suportado para cálculo automático` é escrita em `src/lib/taxEngine.ts` por `evaluateTaxScenario`. A função não possui caminho de sucesso: toda entrada válida termina em `status: 'not-supported'` e `calculation: null`.
2. A rejeição é incondicional, não resultado de uma validação individual. A razão genérica lista várias lacunas sem separar os dados faltantes do usuário das regras estaduais ainda ausentes.
3. A seleção interestadual está misturada no mesmo módulo de validação/avaliação. Ela cobre regra federal geral 12%, faixa regional 7% e alguns status de importação, mas não valida a hipótese completa da Resolução nº 13/2012 nem exceções por natureza da operação.
4. As alíquotas internas estão codificadas como casos especiais para RO e SP dentro de `evaluateTaxScenario`; as outras 25 UFs retornam sem regra de destino. Não existe catálogo central estadual de vigências para as 27 UFs.
5. Os componentes de interface já separam os valores de produtos, frete, seguro, despesas, IPI e desconto, mas o motor nunca determina uma base. Também não calcula ICMS/DIFAL, FCP, arredondamento ou memória de cálculo.
6. O teste existente tinha 29 casos, mas não percorria os 729 pares direcionais (incluindo 27 combinações internas), não tinha regressão RS→RR/RR→RS e não testava regras de alíquota interna para RR.
7. O material de auditoria anterior documenta corretamente que não se deve inventar uma conta; contudo, o rótulo universal de “não suportado” esconde a distinção entre regra resolvida, dado ausente e pendência normativa.

## Decisão de implementação

Separar os módulos de operação, vigência/alíquotas interestaduais, alíquota interna por UF, base, FCP, responsabilidade e memória de cálculo. As regras federais gerais podem resolver trajetórias domésticas por direção; alíquotas estaduais não confirmadas continuam explicitamente pendentes. A calculadora só poderá apresentar valor quando todos os requisitos do cenário estiverem validados. A matriz será testada integralmente sem rotular automaticamente como resolvidas as combinações cujo tratamento depende de mercadoria, exceção ou lei estadual.

## Escopo jurídico pesquisado e limites

A Resolução do Senado nº 22/1989 foi conferida no texto oficial do Planalto: 12% como regra geral e 7% para trajetórias Sul/Sudeste (exceto ES) aos destinos enumerados, a partir de 1990. A legislação oficial de Roraima localizada nesta auditoria confirma 20% para as demais mercadorias, em regra residual, com efeitos da Lei nº 1.767/2022 a partir de 30/03/2023; há também legislação atualizada pela SEFAZ/RR até outubro de 2026. A legislação federal da LC nº 190/2022 distingue as bases legais por hipótese (LC 87/1996, art. 13, IX e X, §§ 3º, 6º e 7º).

Ainda não foi validada nesta auditoria a legislação interna de mercadoria específica, o rol estadual completo de FCP, nem toda a metodologia de composição/gross-up de base para todos os 27 entes. Esses itens permanecem bloqueadores de cálculo quando pertinentes. Nenhuma tabela preliminar ou resultado de mecanismo de busca será tratado como validação legal suficiente.

## Implementação e validação executadas

A revisão adicionou `src/data/stateInternalRates.ts` com entradas para as 27 UFs. Foram validadas somente taxas residuais de RS (17%), RO (19,5%, com histórico de 17,5%), RR (20%) e SP (18%). As outras 23 UFs permanecem sem percentual e bloqueiam o cálculo; a entrada guarda portal oficial, data da consulta, escopo e pendência, mas esses portais ainda não equivalem à validação do ato estadual. Não há cobertura nacional de alíquotas internas concluída.

`src/lib/taxEngine.ts` separa: validação da operação e data; referência interestadual; taxa interna residual por UF/vigência; base de cálculo; FCP; responsabilidade; funções monetárias em centavos; e memória/pendências. A matriz automática percorre todas as 729 combinações direcionais para mercadoria nacional declarada: 702 pares entre UFs recebem uma referência federal direcional candidata (7% ou 12%) com status pendente até validar mercadoria e exceções; 27 pares da mesma UF são não aplicáveis a DIFAL interestadual. Essa matriz não valida NCM, exceções, origem efetiva ou a lei estadual do produto. Importados e origem desconhecida seguem pendentes, pois o formulário não comprova os requisitos da RSF nº 13/2012.

A alíquota de RR foi vinculada à Lei estadual nº 59/1993, art. 32, I, “d”, com redação da Lei nº 1.767/2022 e início dos efeitos em 30/03/2023. A regra é residual (“demais mercadorias e serviços”), não prova a taxa de um item específico. O FCP/FECOP em RR permanece pendente.

O caso RS→RR em 16/10/2026 identifica a referência federal condicional de 7%, a alíquota residual de RR de 20% e a responsabilidade geral do remetente para consumidor final não contribuinte. O inverso RR→RS identifica 12% e 17% residuais. Em ambos, o motor bloqueia valor: base legal, classificação do produto, exceções e FCP não foram confirmados. Funções aritméticas isoladas usam centavos inteiros e arredondamento half-up, mas não estão conectadas a uma base legal concluída; portanto não representam apuração do caso.

A interface ganhou um atalho de preenchimento do cenário RS→RR e apresenta referência, vigência, responsabilidade e motivos de bloqueio. Os demais campos monetários continuam editáveis e não são somados automaticamente. O layout do formulário mantém o padrão existente e ajusta o atalho em telas estreitas.

## Verificações

- 46 testes automatizados passaram: suíte anterior preservada/adaptada e novos testes de matriz, RS→RR, RR→RS, vigência de RR/RO, pendências, base, FCP, responsabilidade e arredondamento.
- Verificação TypeScript: aprovada.
- ESLint: aprovado.
- Build de produção: aprovado.

## Pendências por impacto

1. **Crítico — nenhuma apuração monetária está habilitada.** A base geral continua pendente e não há validação completa de composição, base por dentro/por fora e documentos fiscais por hipótese.
2. **Alto — 23 UFs sem ato estadual confirmado** na tabela central; para as quatro taxas residuais registradas ainda faltam exceções por mercadoria e operação.
3. **Alto — FCP/FECOP sem matriz oficial por UF, produto, operação, base e vigência.**
4. **Alto — regras de mercadorias, benefícios, redução, isenção, ST, regimes especiais e exceções da alíquota de 4% sem mecanismo de consulta/validação de NCM.**
5. **Médio — responsabilidade identificada somente como regra geral em cenários limitados; prazos, inscrições, guias e obrigações acessórias não resolvidos.**
6. **Médio — regras federais interestaduais são referência condicional baseada na UF e declaração de mercadoria nacional.** A matriz de 702 pares é teste de seleção, não prova jurídica individual nem substitui a validação da operação.

A mudança elimina a rejeição universal e genérica, mas não torna a ferramenta uma calculadora nacional pronta para recolhimento. Ela separa estados válidos, pendências e dados inválidos e impede que lacunas produzam um valor apresentado como apuração.