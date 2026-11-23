/* reset.js — npm run reset
   Cancella il database e le foto caricate: al prossimo npm start
   si riparte dai prodotti di esempio. */

import { readdirSync, rmSync } from "node:fs";
import path from "node:path";

const CARTELLA = import.meta.dirname;
const CARTELLA_IMG = path.join(CARTELLA, "img");

try {
  rmSync(path.join(CARTELLA, "prodotti.db"), { force: true });
  for (const file of readdirSync(CARTELLA_IMG)) {
    if (file !== ".gitkeep") {
      rmSync(path.join(CARTELLA_IMG, file));
    }
  }
  console.log("Database e foto cancellati. Ora: npm start");
} catch (e) {
  console.error("Reset non riuscito:", e.message);
  console.error("Il server è ancora acceso? Fermalo con Ctrl+C e riprova.");
  process.exitCode = 1;
}
