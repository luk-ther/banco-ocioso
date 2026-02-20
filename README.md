# Banco Ocioso

Aplicacao web com visual motivacional, modo desafio e modo bloqueado.

## Publicacao 100% gratuita (GitHub Pages)

Este projeto foi ajustado para funcionar como site estatico, sem servidor pago.

### Como publicar gratis

1. No GitHub, abra o repositorio `luk-ther/banco-ocioso`.
2. Clique em `Settings`.
3. No menu lateral, clique em `Pages`.
4. Em `Build and deployment`:
   - `Source`: `Deploy from a branch`
   - `Branch`: `main`
   - `Folder`: `/ (root)`
5. Clique em `Save`.
6. Aguarde 1 a 3 minutos e abra a URL gerada pelo GitHub Pages.

## Importante sobre os dados

- Login e cofres ficam salvos no `localStorage` do navegador.
- Cada usuario e separado dentro do mesmo navegador/dispositivo.
- Se limpar dados do navegador, os dados locais serao apagados.
- Para ter persistencia global (multi-dispositivo), sera necessario backend/banco externo.

## Rodar localmente (opcional)

Basta abrir o `index.html` no navegador.

## Stack

- Front-end: HTML/CSS/JS
- Persistencia gratuita: localStorage do navegador
