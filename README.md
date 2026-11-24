# Estuda Matemática — SESI/SENAI

Aplicativo multiplataforma em React Native com Expo. O app consome a API do projeto para login, consulta e filtros de questões, exibição de respostas e explicações e ações de professor.

## Configurar a API

Edite `.env` na raiz e informe o endereço público do backend:

```env
EXPO_PUBLIC_API_URL=https://apihub-roan.vercel.app/
```

A URL de produção não estava cadastrada no repositório. Sem ela, as telas abrem, mas as chamadas da API não funcionam. Não use `localhost` no celular físico; use o domínio público ou o IP de rede do computador.

## Executar

```bash
npm install
npm start
```

Instale o Expo Go no celular e leia o QR code exibido no terminal. Para emulador Android, use `npm run android`; no macOS com Xcode, `npm run ios`.

## Observação sobre permissões

As rotas de escrita de questões na API anterior não tinham autenticação no servidor. A interface mostra essas ações apenas para perfis de professor; o backend deve validar o perfil para proteger essas operações.
