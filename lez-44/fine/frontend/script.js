/* =====================================================================
   gestionale dei prodotti

   GET    /api/prodotti        → la lista
   GET    /api/prodotti/:id    → i dati da mettere nel form per la modifica
   POST   /api/prodotti        → nuovo prodotto
   PUT    /api/prodotti/:id    → salva la modifica
   DELETE /api/prodotti/:id    → elimina
   ===================================================================== */

const API = "http://localhost:3000/api/prodotti";

const form = document.querySelector("#form-prodotto");
const titoloForm = document.querySelector("#titolo-form");
const bottoneSalva = document.querySelector("#salva");
const bottoneAnnulla = document.querySelector("#annulla");
const notaFoto = document.querySelector("#nota-foto");
const messaggio = document.querySelector("#messaggio");
const stato = document.querySelector("#stato");
const lista = document.querySelector("#lista");

const euro = new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" });

// null = stiamo creando; un numero = stiamo modificando quel prodotto
let idInModifica = null;

/* ------------------------------------------------ fetch con gestione errori */

// Fa la richiesta e restituisce il JSON. Se il server risponde con un errore,
// lancia un Error con il messaggio scritto dal backend ({ "errore": "…" }).
async function richiesta(url, opzioni) {
  const res = await fetch(url, opzioni);
  if (!res.ok) {
    // in caso di errore, se il server ha restituito un JSON con un campo "errore", lo usiamo come messaggio
    // con il catch gestiamo anche il caso in cui la risposta non sia un JSON valido, ritornando un oggetto vuoto
    const dati = await res.json().catch(() => ({}));
    // se non c'è, usiamo un messaggio generico con lo status code
    throw new Error(dati.errore ?? `Errore ${res.status}`);
  }
  return res.status === 204 ? null : res.json(); // Se lo status è 204 (No Content) ritorna null, altrimenti ritorna il JSON della risposta
}

function mostraMessaggio(testo, eErrore = false) {
  messaggio.textContent = testo;
  messaggio.classList.toggle("errore", eErrore);
}

/* ------------------------------------------------ READ: la lista */

async function caricaProdotti() {
  // uso l'attributo hidden per mostrare lo stato di caricamento
  stato.hidden = false;
  stato.textContent = "Caricamento…";
  try {
    const prodotti = await richiesta(API);
    mostraProdotti(prodotti);
  } catch (errore) {
    // Pulisce la lista dei prodotti visibili
    lista.innerHTML = "";
    // Mostra un messaggio di errore all'utente
    stato.textContent = (errore.name === "TypeError")
      ? "Il backend non risponde: è acceso? (npm start nella cartella backend)"
      : errore.message;
  }
}

function mostraProdotti(prodotti) {
  let cards = prodotti.map(prodotto => creaCard(prodotto));
  lista.innerHTML = "";
  lista.append(...cards);
  // empty state
  stato.textContent = "Nessun prodotto: aggiungine uno con il form.";
  stato.hidden = prodotti.length > 0;
}

function creaCard(prodotto) {
  const li = document.createElement("li");
  li.className = "card";

  if (prodotto.foto) {
    const img = document.createElement("img");
    img.src = prodotto.foto;
    img.alt = prodotto.nome;1
    li.append(img);
  } else {
    const vuota = document.createElement("div");
    vuota.className = "senza-foto";
    vuota.textContent = "Nessuna foto";
    li.append(vuota);
  }

  const info = document.createElement("div");
  info.className = "info";
  const nome = document.createElement("h3");
  nome.textContent = prodotto.nome;
  const descrizione = document.createElement("p");
  descrizione.className = "descrizione";
  descrizione.textContent = prodotto.descrizione;
  const prezzo = document.createElement("p");
  prezzo.className = "prezzo";
  prezzo.textContent = euro.format(prodotto.prezzo);
  info.append(nome, descrizione, prezzo);

  const bottoni = document.createElement("div");
  bottoni.className = "bottoni";
  const modifica = document.createElement("button");
  modifica.textContent = "Modifica";
  modifica.addEventListener("click", () => iniziaModifica(prodotto.id));
  const elimina = document.createElement("button");
  elimina.textContent = "Elimina";
  elimina.className = "secondario";
  elimina.addEventListener("click", () => eliminaProdotto(prodotto));
  bottoni.append(modifica, elimina);

  li.append(info, bottoni);
  return li;
}

/* ------------------------------------------------ DELETE */
async function eliminaProdotto(prodotto) {
  try {
    await richiesta(`${API}/${prodotto.id}`, { method: "DELETE" });
    mostraMessaggio("Prodotto eliminato.");
    await caricaProdotti();
  } catch (errore) {
    mostraMessaggio(errore.message, true);
  }
}

async function iniziaModifica(id) {

}

function esciDallaModifica() {

}

caricaProdotti();
