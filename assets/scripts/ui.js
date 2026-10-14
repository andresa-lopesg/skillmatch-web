// ui.js — TELA: formulário, mensagens e render dos cards (DOM)
// Este módulo não calcula nada: só recebe dados e desenha.

const formatarSalario = (valor) =>
  valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

// ---------- Formulário ----------

export function lerFormulario(form) {
  return {
    nome: form.nome.value,
    vagaInteresse: form.area.value,
    habilidades: form.habilidades.value.split(","),
    experienciaAnos: form.experiencia.value
  };
}

export function preencherFormulario(form, perfil) {
  form.nome.value = perfil.nome;
  form.area.value = perfil.vagaInteresse;
  form.habilidades.value = perfil.habilidades.join(", ");
  form.experiencia.value = perfil.experienciaAnos;
}

// RF10 — validação: devolve um objeto { campo: "mensagem" } só com os erros
export function validarPerfil(perfil) {
  const erros = {};
  if (perfil.nome.trim().length < 2) erros.nome = "Informe seu nome (pelo menos 2 letras).";
  if (perfil.vagaInteresse === "") erros.area = "Escolha uma área de interesse.";
  const habilidadesValidas = perfil.habilidades.filter((h) => h.trim() !== "");
  if (habilidadesValidas.length === 0) erros.habilidades = "Informe pelo menos uma habilidade.";
  const anos = Number(perfil.experienciaAnos);
  if (perfil.experienciaAnos === "" || Number.isNaN(anos) || anos < 0 || anos > 50) {
    erros.experiencia = "Informe os anos de experiência (0 a 50).";
  }
  return erros;
}

// Erro acessível: texto ligado ao campo por aria-describedby + aria-invalid
export function mostrarErros(form, erros) {
  for (const campo of ["nome", "area", "habilidades", "experiencia"]) {
    const input = form[campo];
    const caixaErro = document.querySelector(`#erro-${campo}`);
    const mensagem = erros[campo] || "";
    caixaErro.textContent = mensagem;
    input.setAttribute("aria-invalid", mensagem ? "true" : "false");
  }
  const primeiroComErro = Object.keys(erros)[0];
  if (primeiroComErro) form[primeiroComErro].focus();
}

// ---------- Estados (carregando / vazio / erro) ----------

// O #status fica sempre na página (região viva). Só o texto muda,
// assim o leitor de tela percebe a troca e anuncia a mensagem.
export function mostrarStatus(elemento, tipo, texto) {
  // Erro é urgente (alert); os outros avisos esperam a vez (status)
  const urgente = tipo === "erro";
  elemento.setAttribute("role", urgente ? "alert" : "status");
  elemento.setAttribute("aria-live", urgente ? "assertive" : "polite");
  elemento.className = `status status--${tipo}`;
  elemento.textContent = texto;
}

// Sem texto, o CSS (.status:empty) esconde a caixa
export function esconderStatus(elemento) {
  elemento.textContent = "";
}

// ---------- Perfil e destaque ----------

export function renderPerfil(elemento, candidato, totalAnalises) {
  elemento.innerHTML = "";
  const titulo = document.createElement("h3");
  titulo.textContent = `Olá, ${candidato.nome}`;
  const info = document.createElement("p");
  const anos = candidato.experienciaAnos === 1 ? "1 ano" : `${candidato.experienciaAnos} anos`;
  info.textContent = `${candidato.vagaInteresse} · ${anos} de experiência · ${candidato.habilidades.length} habilidades · análise nº ${totalAnalises} nesta sessão`;
  elemento.append(titulo, info);
  elemento.hidden = false;
}

export function renderDestaque(elemento, melhor, vagaCompleta, estudos) {
  elemento.innerHTML = "";
  const titulo = document.createElement("h3");
  titulo.textContent = "Vaga mais compatível";

  const vaga = document.createElement("p");
  vaga.className = "destaque__vaga";
  // exibirResumo() vem da classe: VagaFrontend acrescenta nível e modalidade
  vaga.textContent = `${melhor.resumo} · ${melhor.percentual}%`;

  // find: vaga em que a pessoa já atende todos os requisitos (pode não existir)
  const completa = document.createElement("p");
  completa.className = "destaque__extra";
  completa.textContent = vagaCompleta
    ? `Você já atende todos os requisitos de ${vagaCompleta.vaga.cargo} na ${vagaCompleta.vaga.empresa}.`
    : "Nenhuma vaga ainda tem todos os requisitos cobertos por você.";

  const tituloEstudo = document.createElement("h3");
  tituloEstudo.className = "destaque__estudo";
  tituloEstudo.textContent = "O que estudar primeiro";
  const texto = document.createElement("p");

  if (estudos.length === 0) {
    texto.textContent = "Você já cobre todos os requisitos das vagas. Hora de se candidatar!";
    elemento.append(titulo, vaga, completa, tituloEstudo, texto);
  } else {
    texto.textContent = "As habilidades que mais aparecem nas vagas e que você ainda não tem:";
    const lista = document.createElement("ol");
    estudos.forEach((estudo) => {
      const item = document.createElement("li");
      item.textContent = estudo;
      lista.append(item);
    });
    elemento.append(titulo, vaga, completa, tituloEstudo, texto, lista);
  }
  elemento.hidden = false;
}

// ---------- Cards (RF11) ----------

function criarListaHabilidades(titulo, habilidades, modificador) {
  const bloco = document.createElement("div");
  const subtitulo = document.createElement("h4");
  subtitulo.textContent = `${titulo} (${habilidades.length})`;
  const lista = document.createElement("ul");
  lista.className = "tags";
  if (habilidades.length === 0) {
    const vazio = document.createElement("li");
    vazio.textContent = "nenhuma";
    vazio.className = "tag tag--neutra";
    lista.append(vazio);
  }
  habilidades.forEach((habilidade) => {
    const item = document.createElement("li");
    item.textContent = habilidade;
    item.classList.add("tag", `tag--${modificador}`);
    lista.append(item);
  });
  bloco.append(subtitulo, lista);
  return bloco;
}

function criarCard(resultado, idMelhor) {
  const { vaga, percentual, classificacao, encontradas, faltantes, distanciaKm } = resultado;
  // "Média compatibilidade" -> classe CSS "card--media"
  const nivel = classificacao.split(" ")[0].toLowerCase().replace("é", "e");
  const card = document.createElement("article");
  card.classList.add("card", `card--${nivel}`);
  if (vaga.id === idMelhor) card.classList.add("card--melhor");

  // Topo: cargo e empresa à esquerda, percentual à direita
  const topo = document.createElement("div");
  topo.className = "card__topo";
  const titulos = document.createElement("div");
  const cargo = document.createElement("h3");
  cargo.textContent = vaga.cargo;
  const empresa = document.createElement("p");
  empresa.className = "card__empresa";
  // VagaFrontend tem nível; Vaga comum não
  empresa.textContent = vaga.nivel ? `${vaga.empresa} · ${vaga.nivel}` : vaga.empresa;
  titulos.append(cargo, empresa);
  const numero = document.createElement("p");
  numero.className = "card__numero";
  numero.textContent = `${percentual}%`;
  topo.append(titulos, numero);

  const classe = document.createElement("p");
  classe.className = "card__classe";
  classe.textContent = vaga.id === idMelhor ? `${classificacao} · mais compatível` : classificacao;

  const barra = document.createElement("div");
  barra.className = "barra";
  barra.setAttribute("role", "img");
  barra.setAttribute("aria-label", `Compatibilidade de ${percentual}%`);
  const preenchimento = document.createElement("span");
  preenchimento.style.width = `${percentual}%`;
  barra.append(preenchimento);

  const detalhes = document.createElement("p");
  detalhes.className = "card__detalhes";
  const distancia = distanciaKm === undefined ? "" : ` · a ${distanciaKm} km`;
  detalhes.textContent = `${vaga.modalidade} · ${vaga.cidade}${distancia} · ${formatarSalario(vaga.salario)}`;

  card.append(
    topo,
    classe,
    barra,
    detalhes,
    criarListaHabilidades("Você tem", encontradas, "ok"),
    criarListaHabilidades("Falta", faltantes, "falta")
  );
  return card;
}

export function renderCards(container, resultados, idMelhor) {
  container.innerHTML = "";
  resultados.forEach((resultado) => container.append(criarCard(resultado, idMelhor)));
}
