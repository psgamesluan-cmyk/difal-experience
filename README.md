# DIFAL Experience

Apresentação educacional interativa sobre o Diferencial de Alíquotas do ICMS, com nove capítulos, diagramas, três referências tabulares de cálculo, estudo de caso e quiz.

## Executar localmente

Requer Node.js 20.19+ ou 22.12+.

```sh
npm ci
npm run dev
```

## Verificações e build

```sh
npm run typecheck
npm run lint
npm run build
npm run preview
```

O build de produção é gerado em `dist/`.

## Publicação na Vercel

- Framework: Vite.
- Build command: `npm run build`.
- Output directory: `dist`.
- Install command: `npm ci`.

A aplicação usa a rota raiz e não precisa de fallback de SPA. Após a integração do repositório com a Vercel, commits à branch de produção publicam automaticamente; branches e pull requests podem gerar previews.

## Conteúdo

O site não usa backend, banco de dados, login ou coleta de dados do quiz. Os percentuais e cálculos são hipotéticos e didáticos; não servem para apuração fiscal. Consulte a legislação vigente, as normas estaduais e a análise específica da operação.
