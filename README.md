# SkillMatch

Aplicação web que compara as habilidades de quem está procurando vaga com os requisitos de vagas de desenvolvimento web. Ela mostra o percentual de compatibilidade de cada vaga, o que a pessoa já tem, o que falta e o que vale estudar primeiro.

Projeto Avaliativo do Módulo 01 — Desenvolvedor Front-End [React], Turma 03 (SENAI/SC).

- **Aplicação publicada (GitHub Pages):** https://andresa-lopesg.github.io/skillmatch-web/
<!-- PENDENTE (Andresa): trocar COLE_AQUI_O_LINK_DO_TRELLO e COLE_AQUI_O_LINK_DO_VIDEO pelos links reais antes da entrega -->
- **Quadro Kanban (Trello):** [link do quadro](COLE_AQUI_O_LINK_DO_TRELLO)
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
