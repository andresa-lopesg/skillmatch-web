// motor.js — as REGRAS do SkillMatch, reaproveitadas do mini-projeto (skillmatch.js)
// Aqui não tem DOM nem fetch: só lógica (objetos, classes, arrays, condicionais).

// Compara sem diferenciar maiúsculas/minúsculas: "javascript" e "JavaScript" contam igual
const normalizar = (texto) => texto.trim().toLowerCase();

// RF01 — perfil do candidato como objeto (mesmos campos do mini)
// Antes estava fixo no código; agora vem do formulário.
export function criarCandidato({ nome, vagaInteresse, habilidades, experienciaAnos }) {
  const limpas = habilidades.map((h) => h.trim()).filter((h) => h !== "");
  // Tira as repetidas sem diferenciar maiúsculas: "CSS, css" vira só "CSS"
  const unicas = [];
  for (const habilidade of limpas) {
    const jaTem = unicas.map(normalizar).includes(normalizar(habilidade));
    if (!jaTem) unicas.push(habilidade);
  }
  return {
    nome: nome.trim(),
    vagaInteresse,
    habilidades: unicas,
    experienciaAnos: Number(experienciaAnos)
  };
}

// RF07 — classe base
export class Vaga {
  constructor({ id, empresa, cargo, requisitos, salario, modalidade, cidade }) {
    this.id = id;
    this.empresa = empresa;
    this.cargo = cargo;
    this.requisitos = requisitos ?? []; // vaga sem requisitos no JSON vira lista vazia
    this.salario = salario;
    this.modalidade = modalidade;
    this.cidade = cidade;
  }

  exibirResumo() {
    return `${this.cargo} na empresa ${this.empresa}`;
  }

  // No mini, obterFaltantes e calcularCompatibilidade eram funções soltas.
  // Agora são métodos: cada vaga sabe se comparar com o candidato usando this.requisitos.
  obterFaltantes(candidato) {
    const minhas = candidato.habilidades.map(normalizar);
    return this.requisitos.filter((req) => !minhas.includes(normalizar(req)));
  }

  obterEncontradas(candidato) {
    const minhas = candidato.habilidades.map(normalizar);
    return this.requisitos.filter((req) => minhas.includes(normalizar(req)));
  }

  // RF06 — every: o candidato atende TODOS os requisitos desta vaga?
  atendeTodos(candidato) {
    const minhas = candidato.habilidades.map(normalizar);
    return this.requisitos.every((req) => minhas.includes(normalizar(req)));
  }

  calcularCompatibilidade(faltantes) {
    const total = this.requisitos.length;
    if (total === 0) return 0; // sem requisitos não dá para dividir (evita NaN)
    const atendidos = total - faltantes.length;
    return Math.round((atendidos / total) * 100);
  }
}

// RF07 — herança: vaga de front-end tem nível (Júnior/Pleno) e mostra isso no resumo.
// O nível também serve de desempate com a experiência do candidato (ver analisarVagas).
export class VagaFrontend extends Vaga {
  constructor(dados) {
    super(dados);
    this.nivel = dados.nivel;
  }

  exibirResumo() {
    return `${super.exibirResumo()} | Nível ${this.nivel} | ${this.modalidade}`;
  }
}

// O JSON vira objeto do motor: vaga com "nivel" é de front-end, as outras são Vaga comum
export const criarVaga = (dados) => (dados.nivel ? new VagaFrontend(dados) : new Vaga(dados));

// RF04 — classificação (igual ao mini)
export function classificarCompatibilidade(porcentagem) {
  if (porcentagem >= 80) return "Alta compatibilidade";
  if (porcentagem >= 50) return "Média compatibilidade";
  return "Baixa compatibilidade";
}

// RF08 — closure (igual ao mini): "contador" fica guardado dentro da função
export function criarContador() {
  let contador = 0;
  return function () {
    contador++;
    return contador;
  };
}

// Experiência do candidato -> nível esperado. Usado para desempate.
function nivelEsperado(experienciaAnos) {
  if (experienciaAnos < 2) return "Júnior";
  if (experienciaAnos < 5) return "Pleno";
  return "Sênior";
}

// RF03/RF06 — map gera um resultado por vaga; sort ordena do maior % para o menor.
// Empate no %: vem primeiro a vaga cujo nível combina com a experiência (RF01).
export function analisarVagas(candidato, vagas) {
  const resultados = vagas.map((vaga) => {
    const faltantes = vaga.obterFaltantes(candidato);
    const percentual = vaga.calcularCompatibilidade(faltantes);
    return {
      vaga,
      resumo: vaga.exibirResumo(),
      percentual,
      classificacao: classificarCompatibilidade(percentual),
      encontradas: vaga.obterEncontradas(candidato),
      faltantes,
      atendeTodos: vaga.atendeTodos(candidato)
    };
  });

  const esperado = nivelEsperado(candidato.experienciaAnos);
  const pontoNivel = (resultado) => (resultado.vaga.nivel === esperado ? 1 : 0);

  return resultados.sort((a, b) => {
    if (b.percentual !== a.percentual) return b.percentual - a.percentual;
    return pontoNivel(b) - pontoNivel(a);
  });
}

// RF05 — melhor vaga com reduce (igual ao mini)
export function encontrarVagaIdeal(resultados) {
  return resultados.reduce((melhor, atual) => {
    return atual.percentual > melhor.percentual ? atual : melhor;
  }, resultados[0]);
}

// RF06 — find: primeira vaga (na ordem do ranking) em que a pessoa já atende tudo
export function encontrarVagaCompleta(resultados) {
  return resultados.find((resultado) => resultado.atendeTodos);
}

// RF05 — recomendação (igual ao mini): quanto mais vagas exigem a habilidade, mais alto ela fica
export function priorizarEstudos(listaFaltantes) {
  const contagem = {};

  for (let i = 0; i < listaFaltantes.length; i++) {
    const habilidade = listaFaltantes[i];
    if (contagem[habilidade]) {
      contagem[habilidade]++;
    } else {
      contagem[habilidade] = 1;
    }
  }

  const habilidades = Object.keys(contagem);
  habilidades.sort((a, b) => contagem[b] - contagem[a]);

  return habilidades.map((habilidade) => {
    const vezes = contagem[habilidade];
    return `${habilidade} (exigida em ${vezes} ${vezes > 1 ? "vagas" : "vaga"})`;
  });
}

// RF08 — callback: quem chama passa a função que recebe o resultado da análise
export function executarAnalise(candidato, vagas, aoTerminar) {
  const resultados = analisarVagas(candidato, vagas);
  const vagaIdeal = encontrarVagaIdeal(resultados);
  const vagaCompleta = encontrarVagaCompleta(resultados); // undefined se nenhuma
  const todasFaltantes = [];
  resultados.forEach((r) => todasFaltantes.push(...r.faltantes));
  const estudos = priorizarEstudos(todasFaltantes).slice(0, 3);
  aoTerminar({ resultados, vagaIdeal, vagaCompleta, estudos });
}
