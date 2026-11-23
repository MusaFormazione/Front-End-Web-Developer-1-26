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

let idInModifica = null;

async function richiesta(url, opzioni) {
  const res = await fetch(url, opzioni);
  if (!res.ok) {
    const dati = await res.json().catch(() => ({}));
    throw new Error(dati.errore ?? `Errore ${res.status}`);
  }
  return res.status === 204 ? null : res.json(); // Se lo status è 204 (No Content) ritorna null, altrimenti ritorna il JSON della risposta
}

function mostraMessaggio(testo, eErrore = false) {
  messaggio.textContent = testo;
  messaggio.classList.toggle("errore", eErrore);
}

async function caricaProdotti() {

}

function mostraProdotti(prodotti) {

}

function creaCard(prodotto) {

}

async function eliminaProdotto(prodotto) {

}

async function iniziaModifica(id) {

}

function esciDallaModifica() {

}

caricaProdotti();
