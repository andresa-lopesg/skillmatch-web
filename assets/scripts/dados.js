// dados.js — DADOS e PERSISTÊNCIA: fetch das vagas + localStorage
import { criarVaga } from "./motor.js";

// O caminho do fetch é relativo à PÁGINA (index.html), não a este arquivo
const URL_VAGAS = "./assets/data/vagas.json";
const CHAVE_PERFIL = "skillmatch:perfil";

// RF13 — fetch + async/await. Quem chama trata os estados (carregando/vazio/erro).
export async function carregarVagas() {
  const resposta = await fetch(URL_VAGAS);
  if (!resposta.ok) {
    throw new Error(`Falha ao carregar vagas (status ${resposta.status})`);
  }
  const lista = await resposta.json();
  // RF06/RF07 — map transforma cada objeto do JSON numa instância de Vaga
  return lista.map(criarVaga);
}

// RF14 — localStorage: só nome, área, habilidades e experiência. Nada sensível.
export function salvarPerfil(perfil) {
  try {
    localStorage.setItem(CHAVE_PERFIL, JSON.stringify(perfil));
  } catch (erro) {
    // Ex.: navegação privada ou armazenamento cheio. A análise funciona igual, só não fica salva.
    console.warn("Não foi possível salvar o perfil.", erro);
  }
}

export function carregarPerfil() {
  const texto = localStorage.getItem(CHAVE_PERFIL);
  if (texto === null) return null; // primeira visita: ainda não tem nada salvo
  let perfil = null;
  try {
    perfil = JSON.parse(texto);
  } catch (erro) {
    console.warn("Perfil salvo inválido, descartado.", erro);
  }
  // Também descarta se o formato não for o esperado (ex.: sem a lista de habilidades)
  if (!perfil || !Array.isArray(perfil.habilidades)) {
    localStorage.removeItem(CHAVE_PERFIL); // dado corrompido: descarta
    return null;
  }
  return perfil;
}

export function limparPerfil() {
  localStorage.removeItem(CHAVE_PERFIL);
}
