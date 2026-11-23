/* db.js — il database SQLite, integrato in Node.js (modulo node:sqlite).
   Il file prodotti.db nasce da solo al primo avvio. */

import { DatabaseSync } from "node:sqlite";
import { copyFileSync } from "node:fs";
import path from "node:path";

const CARTELLA = import.meta.dirname;
export const CARTELLA_IMG = path.join(CARTELLA, "img");

export const db = new DatabaseSync(path.join(CARTELLA, "prodotti.db"));

db.exec(`
  CREATE TABLE IF NOT EXISTS prodotti (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    nome        TEXT NOT NULL,
    descrizione TEXT NOT NULL DEFAULT '',
    prezzo      REAL NOT NULL,
    foto        TEXT
  )
`);

// Al primo avvio la tabella è vuota: si riempie con qualche prodotto di esempio.
const ESEMPI = [
  ["Tazza", "Tazza in ceramica da 350 ml, va in lavastoviglie.", 12.5, "tazza.png"],
  ["Maglietta", "T-shirt in cotone biologico, taglie dalla S alla XL.", 19.9, "maglietta.png"],
  ["Cappellino", "Cappellino con visiera e chiusura regolabile.", 15, "cappellino.png"],
  ["Quaderno", "Quaderno A5 a puntini, 120 pagine.", 7.9, "quaderno.png"],
  ["Borraccia", "Borraccia in acciaio da 500 ml, tiene il freddo per 12 ore.", 22, "borraccia.png"],
];

const { totale } = db.prepare("SELECT COUNT(*) AS totale FROM prodotti").get();

if (totale === 0) {
  const inserisci = db.prepare(
    "INSERT INTO prodotti (nome, descrizione, prezzo, foto) VALUES (?, ?, ?, ?)"
  );
  for (const [nome, descrizione, prezzo, foto] of ESEMPI) {
    try {
      // le foto di esempio stanno in seed/: si copiano in img/
      copyFileSync(path.join(CARTELLA, "seed", foto), path.join(CARTELLA_IMG, foto));
      inserisci.run(nome, descrizione, prezzo, foto);
    } catch (errore) {
      console.error(`Prodotto di esempio "${nome}" non creato:`, errore.message);
    }
  }
  console.log("Database creato con i prodotti di esempio.");
}
