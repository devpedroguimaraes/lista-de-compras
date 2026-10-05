# Nossa Lista ❤️ — Firebase

Versão definitiva com Firebase Authentication anônimo + Cloud Firestore em tempo real.

## Firebase
Projeto: `nossa-lista-de-compras-6d467`

No Firebase Console, habilite:
1. Authentication → Sign-in method → Anonymous.
2. Firestore Database.

## Regras do Firestore
Para o compartilhamento simples entre os usuários deste aplicativo, use temporariamente as regras abaixo no Firestore Rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /shoppingItems/{itemId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

A configuração Web já está incluída em `firebase-config.js`.

## GitHub Pages
Envie todos os arquivos para o repositório e publique pela branch `main`. O arquivo `firebase-config.js` precisa estar no mesmo nível do `index.html`.
