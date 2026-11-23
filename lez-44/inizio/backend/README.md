# Backend dei prodotti

Un piccolo server per esercitarsi con un **CRUD**: Create, Read, Update, Delete.
È fatto con **Express** e **SQLite**, il database è un file (`prodotti.db`) e le foto finiscono nella cartella `img`.

## Requisiti

- **Node.js 24 o più recente** (controlla con `node --version`). Il database usa `node:sqlite`, che è già dentro Node: non serve installare altro.

## Avvio

Apri il terminale nella cartella `backend`:

```bash
npm install     # solo la prima volta
npm start
```

Quando vedi `Backend pronto: http://localhost:3000/api/prodotti` il server è acceso. Si ferma con **Ctrl + C**.

Al primo avvio il database parte con 5 prodotti di esempio, ognuno con la sua foto.

Altri comandi:

| Comando | Che cosa fa |
|---|---|
| `npm run dev` | Come `npm start`, ma riavvia il server quando modifichi un file |
| `npm run reset` | Cancella database e foto caricate: al prossimo avvio si riparte dai prodotti di esempio (prima ferma il server) |

## Il prodotto

```json
{
  "id": 1,
  "nome": "Tazza",
  "descrizione": "Tazza in ceramica da 350 ml, va in lavastoviglie.",
  "prezzo": 12.5,
  "foto": "http://localhost:3000/img/tazza.png"
}
```

- `id` lo decide il server.
- `nome` è obbligatorio.
- `prezzo` è obbligatorio ed è un numero maggiore o uguale a 0, con il punto per i decimali.
- `descrizione` può restare vuota.
- `foto` è l'indirizzo dell'immagine, oppure `null` se il prodotto non ha foto.

## Gli endpoint

Indirizzo di base: `http://localhost:3000/api/prodotti`

| Metodo | Percorso | Che cosa fa | Risposta |
|---|---|---|---|
| GET | `/api/prodotti` | L'elenco di tutti i prodotti | 200 e un array |
| GET | `/api/prodotti/:id` | Un prodotto | 200 e il prodotto |
| POST | `/api/prodotti` | Crea un prodotto | 201 e il prodotto creato |
| PUT | `/api/prodotti/:id` | Modifica un prodotto | 200 e il prodotto modificato |
| DELETE | `/api/prodotti/:id` | Elimina un prodotto (e la sua foto) | 204, senza contenuto |

### Come mandare i dati (POST e PUT)

**Con la foto** si usa `multipart/form-data`, cioè un `FormData` in JavaScript o *form-data* in Postman. I campi sono `nome`, `descrizione`, `prezzo` e `foto` (il file).

```js
const dati = new FormData(form); // i campi del form, file compreso
await fetch("http://localhost:3000/api/prodotti", { method: "POST", body: dati });
```

Con `FormData` non si imposta l'header `Content-Type`: lo scrive il browser.

**Senza foto** si può mandare anche un JSON:

```js
await fetch("http://localhost:3000/api/prodotti", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ nome: "Penna", descrizione: "", prezzo: 2.5 }),
});
```

Con **PUT** si mandano di nuovo tutti i campi (nome, descrizione, prezzo). La foto è facoltativa: se non arriva un file nuovo, il prodotto tiene quella di prima.

La foto deve essere un'immagine (jpg, png, webp…) di **2 MB al massimo**.

## Gli errori

Ogni errore risponde con un JSON del tipo:

```json
{ "errore": "Il nome è obbligatorio." }
```

| Codice | Quando |
|---|---|
| 400 | Dati sbagliati: nome vuoto, prezzo mancante o negativo, id non numerico, file che non è un'immagine o supera i 2 MB, JSON non valido |
| 404 | Il prodotto con quell'id non esiste, o il percorso è sbagliato |
| 500 | Un problema del server (il dettaglio è nel terminale dove gira `npm start`) |

## Postman

In Postman: **Import**, poi scegli `postman/crud-prodotti.postman_collection.json`.
Trovi già pronte le richieste per tutti gli endpoint, più un esempio di errore. Per l'upload, nella scheda **Body**, accanto al campo `foto`, scegli un file con **Select Files**.

## Problemi frequenti

- **`npm error notsup … Required: {"node":">=24"}`**: la tua versione di Node è troppo vecchia. Installa l'ultima LTS da nodejs.org.
- **`La porta 3000 è già occupata`**: c'è un altro server acceso, magari in un altro terminale. Fermalo con Ctrl + C.
- **Il frontend dice che il backend non risponde**: controlla che `npm start` sia ancora acceso e che l'indirizzo sia `http://localhost:3000`.

## I file

```
backend/
  server.js     gli endpoint, l'upload e la gestione degli errori
  db.js         il database SQLite e i prodotti di esempio
  reset.js      npm run reset
  img/          le foto (anche quelle caricate)
  seed/         le foto dei prodotti di esempio
  postman/      la collection da importare in Postman
```
