# Modo de simulação didática da calculadora

**Data:** 17/10/2026.

## Modos

- **Simulação didática:** demonstra uma conta com alíquotas informadas pelo usuário. O escopo implementado é venda interestadual a consumidor final não contribuinte, usando diferença simples entre alíquotas sobre base simplificada digitada.
- **Triagem de regras validadas:** permanece separada e não produz valor de DIFAL/FCP enquanto base, incidência, produto, vigência e demais elementos necessários não estiverem validados.

O resultado didático mostra base simplificada, alíquotas e etapas. Parcelas monetárias opcionais preenchidas são somadas à mercadoria e o desconto incondicional é subtraído como convenção matemática explícita do exemplo, não como parecer sobre sua composição jurídica. Não se afirma que a fórmula seja adequada para a operação fiscal concreta.

O FCP não é inferido do estado ou de qualquer fundo cadastrado. Sem percentual, não aparece conta de FCP. Se a pessoa digitar um percentual manual, o sistema calcula a demonstração em linha separada e não soma esse valor ao DIFAL. FECOEP/RO, benefícios, substituição tributária, regimes especiais e incidências específicas não são aplicados automaticamente.

## Limites

Para venda a consumidor contribuinte e aquisição por contribuinte, a interface pede que se use a triagem validada. Ainda não há fórmula acadêmica configurada para essas modalidades. Dados inválidos ou ausentes não geram valores numéricos. Alterar operação, rota, data, campos ou modo invalida o resultado anterior.

Os campos de alíquota são premissas manuais e não são apresentados como oficiais. Os casos de referência SP→RO, RO→SP, SP→PA e PR→RO continuam disponíveis na seção prática; o modo didático aceita qualquer origem/destino selecionados quando a pessoa fornecer as premissas da demonstração.

## Arquivos e validação

- `src/lib/didacticSimulation.ts`: cálculo em centavos inteiros, validação de premissas e etapas explicadas.
- `src/components/DifalCalculator.tsx`: escolha dos modos, entrada de premissas e resultado separado.
- `tests/didacticSimulation.test.mjs`: casos matemáticos conhecidos, rotas apresentadas, campos inválidos/vazios, modalidades fora do escopo e FCP separado.

Validação executada: 56 testes automatizados, TypeScript, ESLint e build Vite.
