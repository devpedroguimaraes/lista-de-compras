# Nossa Lista ❤️ — versão definitiva

Lista de compras compartilhada em tempo real para duas pessoas.

## Firebase configurado

Projeto: `nossa-lista-de-compras-6d467`

A aplicação usa:
- Firebase Authentication com login anônimo;
- Cloud Firestore;
- sincronização em tempo real;
- GitHub Pages compatível, sem build obrigatório.

## Funcionalidades

- Adicionar item;
- quantidade;
- categorias;
- marcar como comprado;
- excluir item;
- limpar comprados;
- contadores de pendentes, total e progresso;
- sincronização automática entre os dispositivos;
- atualização em tempo real;
- PWA/manifest;
- layout responsivo.

## Firestore

Coleção usada:

`shoppingItems`

Cada item possui `name`, `quantity`, `category`, `done`, `createdAt` e `owner`.

As regras em `firestore.rules` exigem usuário autenticado. A autenticação anônima é feita automaticamente pelo aplicativo.

## Publicação no GitHub Pages

Envie todos os arquivos do projeto para o repositório e publique pela branch principal, diretório raiz.

Não remova `firebase.js`: ele contém a configuração do aplicativo Web do Firebase.
