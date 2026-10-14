# SkillMatch

Aplicação web que compara as habilidades de quem está procurando vaga com os requisitos de vagas de desenvolvimento web. Ela mostra o percentual de compatibilidade de cada vaga, o que a pessoa já tem, o que falta e o que vale estudar primeiro.

Projeto Avaliativo do Módulo 01 — Desenvolvedor Front-End [React], Turma 03 (SENAI/SC).

- **Aplicação publicada (GitHub Pages):** https://andresa-lopesg.github.io/skillmatch-web/
- **Quadro Kanban (Trello):** [link do quadro](https://trello.com/b/UaK33teF)
- **Vídeo de apresentação:** [assistir no Google Drive](COLE_AQUI_O_LINK_DO_VIDEO)


## Qual problema ele resolve

No Mini-Projeto da Semana 06 eu escrevi o SkillMatch JS, um motor que rodava só no console e tinha o meu perfil fixo no código. Ele funcionava, mas ninguém do RH abriria o console do navegador para usar.

Nesta versão o mesmo motor ganhou uma tela. Qualquer pessoa abre a página, preenche o próprio perfil e vê as vagas em cards, com a vaga mais compatível em destaque e uma recomendação de estudo. O perfil fica salvo no navegador, então quem volta não precisa preencher tudo de novo.

## Como executar

O projeto usa módulos ES e `fetch`, por isso **não funciona abrindo o `index.html` direto** (endereço `file://`). Precisa de um servidor local:

1. Clone o repositório:
   ```bash
   git clone https://github.com/andresa-lopesg/skillmatch-web.git
   ```
2. Abra a pasta no VS Code.
3. Com a extensão **Live Server** instalada, clique com o botão direito no `index.html` e escolha **Open with Live Server**.
4. A página abre em `http://127.0.0.1:5500`.

Sem o VS Code, dá para usar qualquer servidor local, por exemplo `python -m http.server 5500` dentro da pasta do projeto. Ou abra direto a versão publicada no GitHub Pages (link no topo), que já é servida por https.

## Como usar

1. Preencha nome, área de interesse, habilidades (separadas por vírgula) e anos de experiência.
2. Clique em **Analisar vagas**.
3. Veja a vaga mais compatível e a recomendação de estudo; depois clique em **Ver todas as vagas** para os cards.
4. Use os filtros para ver só uma modalidade ou ordenar por salário ou empresa. Com **Usar minha localização**, dá para ordenar pelas vagas mais perto.
5. Recarregue a página: o perfil volta preenchido. **Limpar perfil salvo** apaga esses dados.

## Estrutura de pastas

```
skillmatch-web/
├── index.html                 # página única (HTML semântico)
├── README.md
├── .gitignore                 # arquivos locais que não vão para o Git
└── assets/
    ├── styles/
    │   └── index.style.css    # estilos, mobile-first
    ├── scripts/
    │   ├── main.js            # ponto de entrada: liga dados, regras e tela
    │   ├── motor.js           # regras: classes Vaga/VagaFrontend e cálculo
    │   ├── ui.js              # tela: formulário, validação, cards (DOM)
    │   └── dados.js           # fetch das vagas e localStorage
    ├── data/
    │   └── vagas.json         # catálogo de vagas
    └── img/
        ├── logo.svg
        └── icone-codigo.svg
```

Separei o JavaScript em três camadas, cada uma num módulo: **dados** (de onde vêm as informações), **regras** (o motor que calcula) e **tela** (o que aparece para a pessoa). O `main.js` só organiza o fluxo entre elas.

## Regra de compatibilidade

A regra é a mesma do mini-projeto: o percentual é a quantidade de requisitos da vaga que a pessoa atende dividida pelo total de requisitos.

```
compatibilidade = (requisitos atendidos / total de requisitos) × 100
```

| Faixa | Classificação |
| --- | --- |
| 80% a 100% | Alta compatibilidade |
| 50% a 79% | Média compatibilidade |
| 0% a 49% | Baixa compatibilidade |

A comparação ignora maiúsculas e minúsculas (`javascript` conta como `JavaScript`), e habilidades repetidas no formulário contam uma vez só. Uma vaga sem requisitos fica com 0%. Quando duas vagas têm o mesmo percentual, aparece primeiro a que tem o nível mais próximo da experiência da pessoa (até 1 ano: Júnior; de 2 a 4: Pleno; 5 ou mais: Sênior).

A recomendação de estudo junta as habilidades que faltam em todas as vagas e mostra as três que mais aparecem.

## Técnicas e tecnologias

Só HTML, CSS e JavaScript puro, sem framework, sem TypeScript e sem build.

**JavaScript**
- Perfil do candidato como objeto; catálogo como array de objetos vindo do `vagas.json`.
- Classe `Vaga` com construtor e métodos que usam `this.requisitos` (`obterFaltantes`, `obterEncontradas`, `atendeTodos`, `calcularCompatibilidade`).
- Classe `VagaFrontend extends Vaga`: acrescenta o atributo `nivel` e sobrescreve `exibirResumo()` para mostrar nível e modalidade. O nível também é usado no desempate.
- Métodos de array: `map` (gera um resultado por vaga e transforma o JSON em instâncias de `Vaga`), `filter` (separa encontradas e faltantes), `reduce` (acha a vaga ideal), `every` (confere se a pessoa atende todos os requisitos de uma vaga) e `find` (acha a primeira vaga em que ela já atende tudo), além de `forEach` e `sort`.
- Laço `for` explícito para contar as habilidades que mais faltam.
- Closure: `criarContador()` guarda quantas análises foram feitas na sessão.
- Callback: `executarAnalise(candidato, vagas, aoTerminar)` recebe a função que desenha o resultado.
- `fetch` com `async/await`, `try/catch` e `response.ok`, tratando os estados **carregando**, **vazio** e **erro**. As vagas já são buscadas ao abrir a página.
- `localStorage` com `JSON.stringify`/`JSON.parse`, tratando o `null` da primeira visita e dados corrompidos (JSON inválido ou sem a lista de habilidades). Guardo só nome, área, habilidades e experiência, nada sensível.
- Módulos ES com `import`/`export` e `<script type="module">`.

**HTML, acessibilidade e SEO**
- Landmarks (`header` no painel lateral, `main`, `section`, `footer` e um `nav` no rodapé com os links do projeto), um único `h1` e hierarquia de títulos.
- `label for` em todos os campos, `lang="pt-BR"`, link "Pular para o conteúdo" e foco visível.
- Erros do formulário ligados ao campo com `aria-describedby` e `aria-invalid`, e anunciados com `aria-live`.
- Mensagens de carregando, vazio e erro numa região viva que fica sempre na página (`role="status"`; no erro vira `role="alert"`), escondida pelo CSS quando está vazia.
- Logo com `alt` informativo e ícone do rodapé com `alt=""` (decorativo).
- `title` e `meta description` no `<head>`.

**CSS**
- Mobile-first: o estilo base é o do celular e as media queries (`40em` e `64em`) ampliam para tablet e desktop.
- Layout todo em Flexbox, em formato de cadastro por etapas: um painel lateral (o `header`) mostra **Seu perfil → Vaga ideal → Todas as vagas**, e a área principal mostra uma etapa por vez, com "Voltar" à esquerda e a ação principal à direita. No celular o painel fica em cima. Os cards usam `flex-wrap` e `gap`.
- As etapas mudam conforme o uso: a atual fica destacada e as anteriores ganham um check.
- Campos com rótulo flutuante: o `label` fica dentro do campo e sobe para a borda quando o campo recebe foco ou valor (seletor `:placeholder-shown`).
- Fonte Lato (Google Fonts), com fontes do sistema como reserva.
- Unidades fluidas (`rem`, `%`) e imagens com `max-width: 100%`. O título do painel e o do resumo do perfil usam `clamp()` para crescer junto com a tela.

**Extras (bônus)**
- Geolocation: o botão **Usar minha localização** calcula a distância até cada vaga e permite ordenar por "Mais perto de mim". Se a permissão for negada, aparece uma mensagem e as vagas continuam na ordem de compatibilidade. A posição não é salva.
- Tema claro/escuro num botão só com ícone (lua/sol, com `aria-label` para leitor de tela). A página sempre abre no tema claro; se a pessoa trocar para o escuro, a escolha fica salva no `localStorage`. O `color-scheme` deixa os campos nativos escuros também.
- Filtro por modalidade e ordenação por compatibilidade, salário, empresa ou distância.

**Conferência**
- Acessibilidade e SEO conferidos no Lighthouse durante o desenvolvimento.
- Testado no modo responsivo do DevTools (celular, tablet e desktop), sem rolagem horizontal.

## Organização e versionamento

As tarefas ficaram no quadro do Trello (link no topo). No Git usei uma branch `develop` para juntar o trabalho e uma feature branch para cada parte, todas mantidas no repositório depois do merge:

| Branch | Objetivo |
| --- | --- |
| `main` | código final, recebe a `develop` quando o trabalho fica pronto |
| `develop` | junta as branches de cada tarefa durante o desenvolvimento |
| `feature/estrutura-html` | página semântica, formulário e SEO |
| `feature/motor-modulos` | motor do mini-projeto convertido em módulo ES |
| `feature/dados-fetch-storage` | catálogo `vagas.json`, fetch e localStorage |
| `feature/interface-dom` | validação do formulário e render dos cards |
| `feature/estilos-responsivos` | CSS mobile-first em Flexbox |
| `feature/motor-geolocalizacao` | métodos `every`/`find` no motor, coordenadas das vagas e localização do navegador |
| `feature/novo-layout` | navegação entre as etapas do painel lateral e botão de tema com ícone |
| `fix/tema-escuro` | correção do tema escuro nos campos e listas nativos (`color-scheme`) |
| `fix/tema-sistema-e-icone` | tema seguindo o sistema na primeira visita, com o ícone trocando junto |
| `fix/tema-claro-padrao` | página sempre abre no tema claro; o escuro só pelo botão |
| `docs/readme` | documentação do projeto |

O código final está mergeado na `main`.

## Uso de IA

Usei IA como apoio em várias partes do projeto:

- gerar o catálogo fictício do `vagas.json`;
- adaptar o motor do mini-projeto para módulos e montar a primeira versão da tela;
- na revisão final, comparar o projeto com as instruções da avaliação e apontar o que faltava;
- corrigir o que foi apontado: cor e anúncio das mensagens de status, foco visível nos campos, perfil salvo com formato inválido, vaga sem requisitos e habilidades repetidas;
- deixar o tema claro como padrão, aplicar `clamp()` nos títulos e atualizar este README.

Revisei e testei cada parte no navegador e no modo responsivo do DevTools. Também conferi se nada saía do escopo do Módulo 01 (sem framework, sem Grid, sem TypeScript) e mantive os nomes e a lógica que eu já tinha escrito no mini.

## O que pode melhorar

- Normalizar sinônimos de habilidades (por exemplo, "JS" e "JavaScript").
- Dar peso diferente para requisitos obrigatórios e desejáveis.
- Buscar as vagas de uma API real em vez de um arquivo local.
- Mostrar as vagas num mapa.
