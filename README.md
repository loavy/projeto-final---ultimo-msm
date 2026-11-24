# Estuda Matematica - SESI/SENAI

Aplicativo mobile e web desenvolvido com React Native e Expo. O projeto permite login, consulta e filtro de questoes de matematica, exibicao de respostas e explicacoes e gerenciamento para usuarios com perfil de professor.

## Tecnologias

- React 19
- React Native 0.81
- Expo 54
- Expo Secure Store
- React Native Web
- TypeScript
- API REST publicada na Vercel

## Funcionalidades

- Login com e-mail e senha
- Persistencia da sessao no dispositivo
- Logout
- Consulta e filtro de questoes
- Exibicao de alternativas
- Exibicao da resposta correta e da explicacao
- Area exclusiva para professores
- Cadastro, edicao e exclusao de questoes
- Estados de carregamento, lista vazia e erro
- Execucao em Android, iOS e navegador web

## API

URL de producao:

```text
https://apihub-roan.vercel.app
```

Endpoints utilizados:

| Metodo | Rota | Uso |
|---|---|---|
| POST | `/api/auth/login` | Autenticacao |
| GET | `/api/questoes` | Listar questoes |
| GET | `/api/questoes?q=...&nivel=...&ano=...` | Filtrar questoes |
| POST | `/api/questoes` | Criar questao |
| PUT | `/api/questoes/:id` | Editar questao |
| DELETE | `/api/questoes/:id` | Excluir questao |

As operacoes de escrita usam o token recebido no login no cabecalho:

```text
Authorization: Bearer <token>
```

## Configuracao do ambiente

Crie o arquivo `.env` na raiz com base no `.env.example`:

```env
EXPO_PUBLIC_API_URL=https://apihub-roan.vercel.app
```

Nao coloque barra `/` no final da URL. Para celular fisico, use a URL publica da API, nao `localhost`.

## Instalacao

Pre-requisitos:

- Node.js
- npm
- Expo Go ou emulador Android/iOS

Instale as dependencias:

```powershell
npm install
```

## Executar o projeto

Web e Expo:

```powershell
npm start
```

Limpar o cache do Expo:

```powershell
npx expo start --clear
```

Android:

```powershell
npm run android
```

iOS:

```powershell
npm run ios
```

## Estrutura principal

```text
App.js                     Interface, estado, API e estilos
.env                       URL local da API
.env.example               Modelo da configuracao
app.json                   Configuracao Expo
package.json               Dependencias e scripts
package-lock.json          Versoes exatas das dependencias
DOCUMENTAÇÃO_PROJETO.txt   Documentacao detalhada
```

## Integracao com o backend

A requisicao de login envia:

```json
{
  "email": "usuario@exemplo.com",
  "senha": "senha"
}
```

Uma resposta valida deve fornecer:

```json
{
  "usuario": {
    "email": "usuario@exemplo.com",
    "perfil": "professor"
  },
  "token": "token-jwt"
}
```

O backend deve permitir CORS no navegador e aceitar os metodos `GET`, `POST`, `PUT`, `DELETE` e `OPTIONS`, alem dos cabecalhos `Content-Type`, `Authorization` e `Accept`.

Exemplo para Express:

```js
import cors from "cors";

app.use(cors({
  origin: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept"],
}));

app.options("*", cors());
```

## Diagnostico

### CORS Missing Allow Origin

Corrija o CORS no backend e faca um novo deploy na Vercel. O problema nao deve ser corrigido no React Native.

### A aplicacao nao encontra a API

- Verifique `EXPO_PUBLIC_API_URL`.
- Reinicie o Expo apos alterar o `.env`.
- Confirme que a URL nao termina com `/`.
- Teste `https://apihub-roan.vercel.app/api/questoes`.

### Login retorna erro

- Confirme que a rota publicada e `/api/auth/login`.
- Confirme o metodo `POST`.
- Envie `email` e `senha` no corpo JSON.
- Confirme a configuracao CORS no backend.

### Questoes nao aparecem

- Confirme que o usuario fez login.
- Teste `GET /api/questoes`.
- Verifique os filtros informados.
- Confira a resposta no Inspector do navegador.
