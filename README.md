# Banco Ocioso

Aplicação web com visual motivacional, autenticação e cofres sincronizados com Supabase.

## Configuração do Supabase (grátis)

1. Crie um projeto em https://supabase.com
2. No painel do projeto, abra `Project Settings` > `API`
3. Copie:
   - `Project URL`
   - `anon public key`
4. Abra o arquivo `supabase-config.js` e preencha:

```js
window.SUPABASE_URL = "https://SEU-PROJETO.supabase.co";
window.SUPABASE_ANON_KEY = "SUA_ANON_KEY";
```

5. No Supabase, abra `SQL Editor` e execute o arquivo `supabase-schema.sql`
6. Em `Authentication` > `Providers` > `Email`:
   - Ative Email/Password
   - Se quiser login imediato sem confirmar e-mail, desative confirmação obrigatória

## Publicação gratuita (GitHub Pages)

1. No GitHub, abra o repositorio `luk-ther/banco-ocioso`
2. Clique em `Settings` > `Pages`
3. Em `Build and deployment`:
   - `Source`: `Deploy from a branch`
   - `Branch`: `main`
   - `Folder`: `/ (root)`
4. Clique em `Save`

## Como funciona agora

- Login e cadastro: Supabase Auth
- Cofres: tabela `public.vaults` com RLS por usuário
- Planos: tabela `public.user_plans` com limite por conta
  - Grátis: até 3 cofres
  - Básico `R$ 9,90/mês`: cofres ilimitados
  - Anual `R$ 89,90/ano`: cofres ilimitados
  - Avulso `R$ 2,99`: +1 cofre por compra
- Dados sincronizados entre navegadores/dispositivos da mesma conta

## Arquivos importantes

- `supabase-config.js`: credenciais do projeto
- `supabase-schema.sql`: estrutura das tabelas e políticas de segurança
- `script.js`: integração Auth + Banco

