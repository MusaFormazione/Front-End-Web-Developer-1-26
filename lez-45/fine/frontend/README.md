# Il gestionale dei prodotti

Un frontend in JavaScript puro che usa tutti gli endpoint del backend: legge l'elenco, crea, modifica ed elimina i prodotti.

## Prima di iniziare

1. Avvia il backend: nella cartella `backend`, `npm install` e poi `npm start`.
2. Apri `index.html` con **Live Server**.

## Che cosa fare

HTML e CSS sono già pronti. Si lavora solo in `script.js`, seguendo i TODO in ordine:

1. **Read**: carica i prodotti e mostrali come card, con un messaggio quando la lista è vuota o il backend è spento.
2. **Create**: al submit del form, `preventDefault`, `new FormData(form)` e una richiesta POST.
3. **Delete**: il bottone Elimina, con una conferma prima di cancellare.
4. **Update**: il bottone Modifica chiede il prodotto al server, riempie il form e al submit manda una PUT.

Gli endpoint e gli errori possibili sono descritti nel README del backend.

## La soluzione

È in `soluzione.js`. Per provarla, in `index.html` cambia `script.js` in `soluzione.js`.
