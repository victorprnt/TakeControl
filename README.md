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

`npm run dev` sobe o Next.js e o JSON Server juntos. O JSON Server escuta em `http://127.0.0.1:3001` e lê `db.json`.

## Persistência

Na máquina local, o banco é o JSON Server. Na Vercel, o mesmo JSON fica numa chave do Upstash Redis (`take-control:state`). A primeira leitura copia o `db.json` publicado para essa chave. As seguintes leem e gravam só no Redis.

A Vercel preenche `UPSTASH_REDIS_REST_URL` e `UPSTASH_REDIS_REST_TOKEN` quando o Upstash Redis está ligado ao projeto. `KV_REST_API_URL` e `KV_REST_API_TOKEN` também servem.

`DATA_PROVIDER` vale quando essas variáveis não existem:

- `json-server` — desenvolvimento local
- `supabase` — contrato preparado; o driver ainda não grava dados

A interface fala com os serviços. Os serviços falam com os repositórios. Só o provedor ativo conhece HTTP.

## Convenções

- Valores financeiros em centavos inteiros. `formatCurrency(545500)` produz `R$ 5.455,00`.
- Datas de calendário usam o fuso `America/Fortaleza`.
- Textos da interface em português brasileiro.
- A interface não acessa JSON Server nem Supabase. Esse acesso fica em `src/services`.
