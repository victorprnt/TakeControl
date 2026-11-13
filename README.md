# STREAM

Controle financeiro pessoal por envelopes.

## Scripts

```bash
npm run dev
npm run dev:web
npm run dev:data
npm run lint
npm run typecheck
npm run build
```

`npm run dev` sobe o Next.js e o JSON Server juntos. O JSON Server escuta em `http://127.0.0.1:3001` e lê `db.json`. Esse arquivo é só para desenvolvimento local. Não use o JSON Server como banco na Vercel.

## Persistência

`DATA_PROVIDER` escolhe a implementação:

- `json-server` — desenvolvimento local
- `supabase` — contrato preparado; o driver ainda não grava dados

A interface fala com os serviços. Os serviços falam com os repositórios. Só o provedor ativo conhece HTTP.

## Convenções

- Valores financeiros em centavos inteiros. `formatCurrency(545500)` produz `R$ 5.455,00`.
- Datas de calendário usam o fuso `America/Fortaleza`.
- Textos da interface em português brasileiro.
- A interface não acessa JSON Server nem Supabase. Esse acesso fica em `src/services`.
