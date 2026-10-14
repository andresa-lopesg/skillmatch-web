// main.js — o FLUXO: liga dados (dados.js) + regras (motor.js) + tela (ui.js)
import { criarCandidato, criarContador, executarAnalise, calcularDistanciaKm } from "./motor.js";
import {
  carregarVagas,
  salvarPerfil,
  carregarPerfil,
  limparPerfil,
  obterLocalizacao
} from "./dados.js";
import * as ui from "./ui.js";

const form = document.querySelector("#form-perfil");
const status = document.querySelector("#status");
const areaCards = document.querySelector("#lista-vagas");
const perfilBox = document.querySelector("#resumo-perfil");
const destaque = document.querySelector("#destaque");
const filtroModalidade = document.querySelector("#filtro-modalidade");
const ordenacao = document.querySelector("#ordenacao");
const botaoLimpar = document.querySelector("#botao-limpar");
const botaoLocalizacao = document.querySelector("#botao-localizacao");

const proximoIdAnalise = criarContador(); // closure, igual ao mini
let vagas = []; // guardadas depois do primeiro fetch
let minhaPosicao = null; // preenchida só se a pessoa permitir a localização

// RF13 — os 3 estados: carregando, vazio, erro
async function obterVagas() {
  if (vagas.length > 0) return vagas;
  ui.mostrarStatus(status, "carregando", "Carregando vagas…");
  try {
    vagas = await carregarVagas();
    ui.esconderStatus(status);
    return vagas;
  } catch (erro) {
    console.error(erro);
    ui.mostrarStatus(status, "erro", "Não foi possível carregar as vagas. Verifique se a página está aberta pelo Live Server e tente de novo.");
    return null;
  }
}

function aplicarFiltroEOrdem(resultados) {
  const modalidade = filtroModalidade.value;
  const filtrados = modalidade === "todas" ? resultados : resultados.filter((r) => r.vaga.modalidade === modalidade);
  const copia = [...filtrados];
  switch (ordenacao.value) {
    case "salario":
      copia.sort((a, b) => b.vaga.salario - a.vaga.salario);
      break;
    case "empresa":
      copia.sort((a, b) => a.vaga.empresa.localeCompare(b.vaga.empresa));
      break;
    case "distancia":
      copia.sort((a, b) => a.distanciaKm - b.distanciaKm);
      break;
    default:
      break; // "compatibilidade": o motor já entrega nessa ordem
  }
  return copia;
}

// Mostra uma etapa por vez, como num cadastro em passos
function mostrarPasso(numero) {
  for (let i = 1; i <= 3; i++) {
    document.querySelector(`#passo-${i}`).hidden = i !== numero;
  }
  ui.marcarEtapa(numero);
  if (numero === 1) {
    form.nome.focus();
  } else {
    document.querySelector(`#titulo-passo-${numero}`).focus();
  }
}

async function analisar(candidato) {
  const lista = await obterVagas();
  if (lista === null) return; // erro já foi mostrado

  if (lista.length === 0) {
    areaCards.innerHTML = "";
    ui.mostrarStatus(status, "vazio", "Nada encontrado: o catálogo de vagas está vazio.");
    return;
  }

  // RF08 — callback: a função passada roda quando a análise termina
  executarAnalise(candidato, lista, ({ resultados, vagaIdeal, vagaCompleta, estudos }) => {
    ui.renderPerfil(perfilBox, candidato, proximoIdAnalise());
    ui.renderDestaque(destaque, vagaIdeal, vagaCompleta, estudos);
    desenharCards(resultados, vagaIdeal.vaga.id);
    mostrarPasso(2);
  });
}

let ultimoResultado = { resultados: [], idMelhor: null };

// Se a pessoa liberou a localização, cada resultado ganha a distância até a vaga
function comDistancia(resultados) {
  if (minhaPosicao === null) return resultados;
  return resultados.map((r) => ({ ...r, distanciaKm: calcularDistanciaKm(minhaPosicao, r.vaga.coordenadas) }));
}

function desenharCards(resultados, idMelhor) {
  resultados = comDistancia(resultados);
  ultimoResultado = { resultados, idMelhor };
  const visiveis = aplicarFiltroEOrdem(resultados);
  if (visiveis.length === 0) {
    areaCards.innerHTML = "";
    ui.mostrarStatus(status, "vazio", "Nada encontrado para esse filtro.");
    return;
  }
  ui.esconderStatus(status);
  ui.renderCards(areaCards, visiveis, idMelhor);
}

// RF10 — formulário: addEventListener + preventDefault + validação
form.addEventListener("submit", (evento) => {
  evento.preventDefault();
  const dados = ui.lerFormulario(form);
  const erros = ui.validarPerfil(dados);
  ui.mostrarErros(form, erros);
  if (Object.keys(erros).length > 0) return;

  const candidato = criarCandidato(dados);
  salvarPerfil(candidato); // RF14
  analisar(candidato);
});

// Ao corrigir um campo, a mensagem de erro dele some
form.addEventListener("input", (evento) => {
  const campo = evento.target;
  const caixaErro = document.querySelector(`#erro-${campo.id}`);
  if (caixaErro && campo.getAttribute("aria-invalid") === "true") {
    caixaErro.textContent = "";
    campo.setAttribute("aria-invalid", "false");
  }
});

filtroModalidade.addEventListener("change", () => desenharCards(ultimoResultado.resultados, ultimoResultado.idMelhor));
ordenacao.addEventListener("change", () => desenharCards(ultimoResultado.resultados, ultimoResultado.idMelhor));

botaoLimpar.addEventListener("click", () => {
  limparPerfil();
  form.reset();
  ui.mostrarErros(form, {});
  areaCards.innerHTML = "";
  ui.esconderStatus(status);
  mostrarPasso(1);
});

// Botões "Voltar", "Ver todas as vagas" e "Editar perfil" levam à etapa indicada em data-ir-para
document.querySelectorAll("[data-ir-para]").forEach((botao) => {
  botao.addEventListener("click", () => mostrarPasso(Number(botao.dataset.irPara)));
});

// Bônus — Geolocation, tratando permissão negada
botaoLocalizacao.addEventListener("click", async () => {
  ui.mostrarStatus(status, "carregando", "Buscando sua localização…");
  try {
    minhaPosicao = await obterLocalizacao();
    ordenacao.querySelector('option[value="distancia"]').disabled = false;
    ordenacao.value = "distancia";
    desenharCards(ultimoResultado.resultados, ultimoResultado.idMelhor);
  } catch (erro) {
    ui.mostrarStatus(status, "erro", erro.message);
  }
});

// Ao abrir a página: já busca as vagas e recupera o perfil salvo
async function iniciar() {
  document.querySelector("#aviso-js").hidden = true; // se este código rodou, os módulos carregaram
  const perfilSalvo = carregarPerfil(); // null na primeira visita
  if (perfilSalvo !== null) {
    ui.preencherFormulario(form, perfilSalvo); // o perfil volta preenchido
  }
  const lista = await obterVagas(); // mostra "Carregando vagas…" enquanto busca
  if (lista !== null && lista.length === 0) {
    ui.mostrarStatus(status, "vazio", "Nada encontrado: o catálogo de vagas está vazio.");
  }
}

iniciar();
