/* =====================================================================
   BACKEND DEI PRODOTTI — Express + SQLite

   GET    /api/prodotti        l'elenco
   GET    /api/prodotti/:id    un prodotto
   POST   /api/prodotti        crea   (form-data o JSON)
   PUT    /api/prodotti/:id    modifica
   DELETE /api/prodotti/:id    elimina

   Avvio: npm install, poi npm start
   ===================================================================== */

import express from "express";
import multer from "multer";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { rmSync } from "node:fs";
import { db, CARTELLA_IMG } from "./db.js";

const PORTA = 3000;
const MAX_FOTO = 2 * 1024 * 1024; // 2 MB

const app = express();

/* ------------------------------------------------ middleware */

// CORS: il frontend gira su un'altra porta (Live Server, 5500) o da file.
app.use((req, res, next) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.set("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});

app.use(express.json()); // corpo in JSON
app.use("/img", express.static(CARTELLA_IMG)); // le foto: /img/nome-file.png

// L'upload: la foto arriva nel campo "foto" e finisce nella cartella img.
const upload = multer({
  storage: multer.diskStorage({
    destination: CARTELLA_IMG,
    filename: (req, file, cb) => {
      cb(null, randomUUID() + path.extname(file.originalname).toLowerCase());
    },
  }),
  limits: { fileSize: MAX_FOTO },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(errore(400, "La foto deve essere un'immagine (jpg, png, webp…)."));
    }
  },
});

/* ------------------------------------------------ funzioni di supporto */

// Un errore con il suo codice HTTP: lo gestisce il middleware in fondo.
function errore(stato, messaggio) {
  const e = new Error(messaggio);
  e.stato = stato;
  return e;
}

// Nel database c'è solo il nome del file: al client si manda l'indirizzo completo.
function conUrl(req, prodotto) {
  const base = `${req.protocol}://${req.get("host")}`;
  return { ...prodotto, foto: prodotto.foto ? `${base}/img/${prodotto.foto}` : null };
}

function trovaProdotto(id) {
  const numero = Number(id);
  if (!Number.isInteger(numero) || numero < 1) {
    throw errore(400, `id non valido: ${id}`);
  }
  const prodotto = db.prepare("SELECT * FROM prodotti WHERE id = ?").get(numero);
  if (!prodotto) {
    throw errore(404, `Prodotto ${numero} non trovato.`);
  }
  return prodotto;
}

// Controlla i campi del corpo e li restituisce puliti.
function leggiDati(body = {}) {
  const nome = String(body.nome ?? "").trim();
  const descrizione = String(body.descrizione ?? "").trim();
  const prezzo = Number(body.prezzo);

  if (nome === "") {
    throw errore(400, "Il nome è obbligatorio.");
  }
  if (body.prezzo === undefined || body.prezzo === "" || Number.isNaN(prezzo) || prezzo < 0) {
    throw errore(400, "Il prezzo deve essere un numero maggiore o uguale a 0.");
  }
  return { nome, descrizione, prezzo };
}

// La foto appena caricata, se c'è. Un file vuoto (campo lasciato vuoto) non conta.
function nuovaFoto(req) {
  if (!req.file) {
    return null;
  }
  if (req.file.size === 0) {
    cancellaFoto(req.file.filename);
    return null;
  }
  return req.file.filename;
}

function cancellaFoto(nomeFile) {
  if (!nomeFile) {
    return;
  }
  try {
    rmSync(path.join(CARTELLA_IMG, nomeFile), { force: true });
  } catch (e) {
    console.error(`Foto ${nomeFile} non cancellata:`, e.message);
  }
}

/* ------------------------------------------------ endpoint */

app.get("/", (req, res) => {
  res.json({ messaggio: "Il backend dei prodotti è attivo.", endpoint: "/api/prodotti" });
});

// Elenco
app.get("/api/prodotti", (req, res, next) => {
  try {
    const prodotti = db.prepare("SELECT * FROM prodotti ORDER BY id").all();
    res.json(prodotti.map((p) => conUrl(req, p)));
  } catch (e) {
    next(e);
  }
});

// Un prodotto
app.get("/api/prodotti/:id", (req, res, next) => {
  try {
    res.json(conUrl(req, trovaProdotto(req.params.id)));
  } catch (e) {
    next(e);
  }
});

// Crea
app.post("/api/prodotti", upload.single("foto"), (req, res, next) => {
  try {
    const { nome, descrizione, prezzo } = leggiDati(req.body);
    const foto = nuovaFoto(req);
    const risultato = db
      .prepare("INSERT INTO prodotti (nome, descrizione, prezzo, foto) VALUES (?, ?, ?, ?)")
      .run(nome, descrizione, prezzo, foto);
    const creato = trovaProdotto(risultato.lastInsertRowid);
    res.status(201).json(conUrl(req, creato));
  } catch (e) {
    cancellaFoto(req.file?.filename); // la foto di una richiesta sbagliata non serve
    next(e);
  }
});

// Modifica: se non arriva una foto nuova, resta quella di prima.
app.put("/api/prodotti/:id", upload.single("foto"), (req, res, next) => {
  try {
    const vecchio = trovaProdotto(req.params.id);
    const { nome, descrizione, prezzo } = leggiDati(req.body);
    const foto = nuovaFoto(req) ?? vecchio.foto;

    db.prepare("UPDATE prodotti SET nome = ?, descrizione = ?, prezzo = ?, foto = ? WHERE id = ?")
      .run(nome, descrizione, prezzo, foto, vecchio.id);

    if (foto !== vecchio.foto) {
      cancellaFoto(vecchio.foto);
    }
    res.json(conUrl(req, trovaProdotto(vecchio.id)));
  } catch (e) {
    cancellaFoto(req.file?.filename);
    next(e);
  }
});

// Elimina
app.delete("/api/prodotti/:id", (req, res, next) => {
  try {
    const prodotto = trovaProdotto(req.params.id);
    db.prepare("DELETE FROM prodotti WHERE id = ?").run(prodotto.id);
    cancellaFoto(prodotto.foto);
    res.sendStatus(204); // fatto, nessun contenuto da restituire
  } catch (e) {
    next(e);
  }
});

/* ------------------------------------------------ errori */

// Nessun endpoint corrisponde alla richiesta.
app.use((req, res) => {
  res.status(404).json({ errore: `Percorso non trovato: ${req.method} ${req.originalUrl}` });
});

// Tutti gli errori arrivano qui, con un messaggio in JSON.
app.use((err, req, res, next) => {
  let stato = err.stato ?? 500;
  let messaggio = err.message;

  if (err instanceof multer.MulterError) {
    stato = 400;
    messaggio = err.code === "LIMIT_FILE_SIZE"
      ? "La foto supera i 2 MB."
      : `Problema con il file: usa un solo file, nel campo "foto".`;
  } else if (err.type === "entity.parse.failed") {
    stato = 400;
    messaggio = "Il JSON inviato non è valido.";
  }

  if (stato === 500) {
    console.error(err);
    messaggio = "Errore interno del server.";
  }
  res.status(stato).json({ errore: messaggio });
});

/* ------------------------------------------------ avvio */

app.listen(PORTA, (err) => {
  if (err) {
    console.error(err.code === "EADDRINUSE"
      ? `La porta ${PORTA} è già occupata: c'è un altro server acceso?`
      : err);
    process.exit(1);
  }
  console.log(`Backend pronto: http://localhost:${PORTA}/api/prodotti`);
});
