# STREAM

Controle financeiro pessoal por envelopes.

## Scripts

```bash
npm run dev
npm run lint
npm run typecheck
npm run build
```

## Convenções

- Valores financeiros em centavos inteiros. `formatCurrency(545500)` produz `R$ 5.455,00`.
- Datas de calendário usam o fuso `America/Fortaleza`.
- Textos da interface em português brasileiro.
- A interface não acessa JSON Server nem Supabase. Esse acesso fica em `src/services`.
