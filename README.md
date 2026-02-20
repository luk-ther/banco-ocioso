# Banco Ocioso

Aplicacao web com autenticacao, cofres por usuario e banco SQLite local.

## Como iniciar localmente

1. Instale dependencias:
   npm install

2. (Opcional) defina variaveis de ambiente:
   - Copie `.env.example` para `.env`
   - Ajuste `JWT_SECRET`

3. Rode o servidor:
   npm start

4. Abra:
   http://localhost:3000

## Deploy no Render

O projeto ja esta preparado com `render.yaml` (backend Node + SQLite persistente).

1. Suba este projeto para um repositorio no GitHub.
2. No Render, clique em **New +** > **Blueprint**.
3. Conecte seu repositorio e confirme o deploy.
4. O Render vai criar:
   - Web Service Node
   - Disco persistente em `/var/data` para o banco SQLite
   - `JWT_SECRET` gerado automaticamente

Apos publicar, acesse a URL gerada pelo Render.

## Stack

- Front-end: HTML/CSS/JS
- Back-end: Node.js + Express
- Banco: SQLite (`data/banco-ocioso.db` local ou `/var/data` em producao)
- Auth: JWT + senha com bcrypt
