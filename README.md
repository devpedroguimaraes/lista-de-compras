# Nossa Lista ❤️ — versão definitiva Firebase

Aplicação de lista de compras compartilhada em tempo real usando Firebase Authentication (anônimo) + Cloud Firestore.

## Projeto Firebase

Projeto: `nossa-lista-de-compras-6d467`

A configuração já está em `firebase.js`.

## Antes de publicar

No Firebase Console:

1. Abra **Authentication > Sign-in method**.
2. Ative **Anonymous (Anônimo)**.
3. Abra **Firestore Database** e crie o banco.
4. Em **Rules**, publique o conteúdo de `firestore.rules`.

As regras permitem leitura e gravação somente para usuários autenticados. A aplicação autentica cada visitante anonimamente antes de abrir a lista.

## Publicação no GitHub Pages

Envie todos os arquivos mantendo a estrutura:

- `index.html`
- `firebase.js`
- `js/app.js`
- `css/style.css`
- `manifest.json`
- `firestore.rules`

Não é necessário executar servidor local.

## Importante

A lista é compartilhada: os itens ficam na coleção `shoppingItems` e qualquer usuário autenticado anonimamente verá as alterações em tempo real.
