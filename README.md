# Projeto SENAI-SESI

## Estrutura do projeto

```txt
Projeto_SENAI-SESI/
├── src/
│   ├── components/
│   ├── hooks/
│   ├── pages/
│   ├── App.jsx
│   └── main.jsx
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   └── server.js
├── package.json
└── README.md
```

## Como rodar o projeto

Primeiro, instale as dependências:

```bash
npm install
```

Depois, crie um arquivo `.env` na raiz do projeto:

```env
PORT=3000

DB_USER=seu_usuario
DB_HOST=localhost
DB_NAME=seu_banco
DB_PASSWORD=sua_senha
DB_PORT=5432
```

Rodar o backend:

> Não precisa criar as `tables`, o `database.js` já vai fazer isso.

```bash
npm run backend
```

O backend vai rodar em: `http://localhost:3000`

Rodar o frontend:
Em outro terminal:

```bash
npm run dev
```

Rotas da API:

```
GET /
GET /api

GET /api/questoes
GET /api/questoes/:id

GET /api/questoes?q=texto
GET /api/questoes?id=1

GET /api/questoes?nivel=base
GET /api/questoes?nivel=intermediario
GET /api/questoes?nivel=avancado

GET /api/questoes?ano=2024
GET /api/questoes/anos
GET /api/questoes/ids

GET /api/questoes?q=texto&id=1&nivel=base&ano=2024

GET /api/questoes/primeiroSelect
GET /api/questoes/segundoSelect/:chave
GET /api/questoes/terceiroSelect

GET /api/questoes/topico/:topicoid

POST /api/questoes
PUT /api/questoes/:id
DELETE /api/questoes/:id
```

Observacao: a rota `/api/pesquisa` foi removida. As buscas agora ficam na
propria rota `/api/questoes`.

## Pesquisa com ou sem acento

A pesquisa foi feita para aceitar palavras com acento ou sem acento.

## Aplicativo mobile (Expo / React Native)

O aplicativo multiplataforma fica na pasta `mobile/`. Ele consome as rotas de
produção do backend (`/api/auth/login` e `/api/questoes`) e oferece login,
pesquisa por enunciado, nível e ano, visualização de respostas e ferramentas
de professor.

1. Instale Node.js e Expo Go no celular (ou configure um emulador Android/iOS).
2. Na pasta `mobile/`, copie `.env.example` para `.env` e informe a URL pública
   do backend, sem barra no final:

   ```env
   EXPO_PUBLIC_API_URL=https://endereco-da-api-em-producao
   ```

3. Instale e inicie o aplicativo:

   ```bash
   cd mobile
   npm install
   npm start
   ```

4. Leia o QR code com Expo Go ou pressione `a` para abrir no emulador Android.

O repositório não contém a URL de produção. Configure o domínio real da API
antes de iniciar o app. O backend atual também deixa as rotas de escrita de
questões sem middleware de autenticação; a tela do app só mostra esses controles
para perfis de professor, portanto a API deve ser protegida no servidor antes
de expor cadastro, edição e exclusão a outros clientes.
