// dados.js — DADOS e PERSISTÊNCIA: fetch das vagas + localStorage
import { criarVaga } from "./motor.js";

// O caminho do fetch é relativo à PÁGINA (index.html), não a este arquivo
const URL_VAGAS = "./assets/data/vagas.json";
const CHAVE_PERFIL = "skillmatch:perfil";
const CHAVE_TEMA = "skillmatch:tema";

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

// Bônus — tema claro/escuro persistido
export const salvarTema = (tema) => localStorage.setItem(CHAVE_TEMA, tema);
// Primeira visita (null): segue o tema do sistema operacional
export function carregarTema() {
  const tema = localStorage.getItem(CHAVE_TEMA);
  if (tema !== null) return tema;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "escuro" : "claro";
}

// Bônus — Browser API (Geolocation) embrulhada numa Promise.
// Nada é salvo: a posição só é usada para calcular a distância até as vagas.
export function obterLocalizacao() {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) {
      reject(new Error("Seu navegador não oferece localização."));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (posicao) => resolve({ lat: posicao.coords.latitude, lon: posicao.coords.longitude }),
      (erro) => {
        const mensagens = {
          1: "Permissão de localização negada. As vagas continuam na ordem de compatibilidade.",
          2: "Não foi possível descobrir sua localização agora.",
          3: "A localização demorou demais para responder."
        };
        reject(new Error(mensagens[erro.code] || "Erro ao obter a localização."));
      },
      { timeout: 10000 }
    );
  });
}
