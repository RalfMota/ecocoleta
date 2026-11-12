# EcoColeta Solidária

Plataforma web para gestão de coleta seletiva e inclusão socioambiental em Campo Grande - MS.

**Projeto de Extensão:** Programa de Extensão UFMS Digital (95DX7.200525)
**Disciplina:** Projeto Integrador II
**Autor:** Ralf Diego de Oliveira Mota
**Módulos cobertos por este repositório:** 2 (Desenvolvimento Web), 3 (Banco de Dados e Controle de Versão) e 4 (Integração e Entrega Contínua)

## Nota sobre a arquitetura (importante para o Plano de CI/CD)

O Plano de Integração e Entrega Contínua (Módulo 4) descreve a arquitetura do projeto como
"front-end em Vue.js, API em Node.js e banco de dados relacional PostgreSQL". **A API em
Node.js ainda não existe neste repositório.** O que existe de fato é:

- um front-end 100% client-side (Vue.js via CDN, persistência em `localStorage`);
- um modelo de dados PostgreSQL já modelado e versionado em `database/` (Módulo 3), mas
  que ainda não está conectado ao front-end por nenhuma API.

Isso não invalida o pipeline de CI/CD: os testes unitários cobrem a lógica do front-end
(`js/logica.js`) e o teste de integração roda de verdade contra um PostgreSQL (seção
abaixo), e o pipeline de CD empacota o site estático atual em uma imagem Docker. Quando
uma API Node.js for implementada, os workflows abaixo (`ci.yml`/`cd.yml`) são o lugar
natural para adicionar os jobs equivalentes de build/teste/deploy da API.

## Sobre a entrega (Módulo 2 — frontend)

Esta versão implementa, em HTML5, CSS3 e Vue.js, os requisitos funcionais e não
funcionais definidos no relatório do Módulo 1:

| Requisito | Descrição                                                       | Onde está                                                    |
| --------- | --------------------------------------------------------------- | ------------------------------------------------------------ |
| RF01      | Cadastro/login com perfis distintos (Morador e Catador)         | tela "Entrar ou criar conta"                                 |
| RF02      | Agendamento de recolhimento (data, horário, endereço, material) | tela "Agendar coleta"                                        |
| RF03      | Painel com volume total reciclado e histórico de coletas        | tela "Painel"                                                |
| RNF01     | Interface 100% responsiva (mobile-first)                        | `css/style.css`, breakpoints em 640px/768px/960px            |
| RNF02     | Tempo de resposta abaixo de 2s                                  | aplicação 100% client-side, sem chamadas de rede bloqueantes |

## Como executar localmente

Não há build nem dependências para instalar: é um site estático.

1. Baixe ou clone o repositório.
2. Abra `index.html` diretamente no navegador, **ou**, para evitar restrições de
   módulos locais, sirva a pasta com um servidor simples:
   ```bash
   npx serve .
   # ou
   python3 -m http.server 8080
   ```
3. Acesse `http://localhost:8080`.

## Decisões técnicas (frontend)

**Framework escolhido — Vue.js 3 via CDN.**
O Módulo 1 previa React ou Vue.js no frontend. Optou-se por Vue.js porque a
leitura obrigatória do Módulo 2 (Capítulo 3 — _Entendendo o funcionamento do
Vue_) cobre exatamente esse framework, e porque a API de Options do Vue permite
montar uma aplicação reativa em um único arquivo `app.js`, sem etapa de build.

**Persistência — `localStorage` no protótipo do Módulo 2, PostgreSQL a partir do Módulo 3.**
O frontend ainda lê e grava em `localStorage` para manter o protótipo 100%
client-side e fácil de demonstrar; o modelo relacional completo já está
especificado em `database/` (ver seção abaixo) e é o próximo passo de
integração via API.

**Estrutura HTML semântica e acessível.**
`header`, `nav`, `main`, `section`, `footer` e `table` são usados pelo papel
que exercem. Todo campo de formulário tem `label` associado, o seletor de
material usa `role="radiogroup"`/`role="radio"` para leitores de tela, e o
foco de teclado tem contorno visível (`:focus-visible`).

**CSS responsivo mobile-first.**
`css/style.css` define primeiro o layout de uma coluna (celular) e usa
`@media (min-width: ...)` para introduzir grid de 2–5 colunas e o menu
horizontal a partir de 768px.

**Refinamento de layout (design).**
Depois da primeira versão, o layout passou por uma revisão guiada pelos
princípios do skill de design **Impeccable** (`github.com/pbakaus/impeccable`).
Esse projeto é um plugin para o Claude Code — CLI própria, hooks de detecção e
navegador ao vivo — que não roda dentro de um chat comum; por isso o binário
não foi "instalado" de fato. O que foi feito foi ler o material de referência
do skill (regras de layout, tipografia, cor, estados de interface e a lista de
anti-padrões de "craft floor") e aplicar manualmente essas diretrizes:

- Removido o "eyebrow" decorativo acima do título da home.
- Seção "Como a coleta acontece" como lista numerada em prosa (a numeração é
  uma sequência real — cadastro → agendamento → coleta), com um selo circular
  de ícone por etapa, não cards idênticos com borda e sombra.
- Faixa de impacto em verde-mata cheio de tela, com o total reciclado embutido
  numa frase, em vez de um card de métrica isolado.
- Nas telas de tarefa (Conta, Agendamento, Painel) — modo "Operate" no
  vocabulário do skill — título com tamanho fixo em vez de fluido, escala
  tipográfica mais apertada, e sobretudo: todo campo e botão ganhou estados
  completos (hover, foco, desabilitado, carregando via "Entrando..." /
  "Agendando..."), não só o estado padrão.
- Ilustração decorativa (blob orgânico em SVG) atrás do card de materiais no
  hero, ícones desenhados à mão (não um pacote genérico) nos três passos do
  processo, nos cards do painel e no seletor de material — que virou um
  grupo de chips clicáveis com ícone, em vez de um `<select>` simples — com
  estados de hover/seleção e leve elevação ao passar o mouse.
- Cor de seleção de texto (`::selection`) e anel de foco usam a paleta do
  projeto em vez do padrão do navegador.

## Estrutura de pastas

```
ecocoleta/
├── index.html         # marcação semântica e views da aplicação
├── css/
│   └── style.css      # tokens de design + CSS responsivo mobile-first
├── js/
│   └── app.js          # estado, persistência e lógica da aplicação (Vue 3)
├── database/            # Módulo 3 — modelagem e manipulação de dados
│   ├── schema.sql        # CREATE TABLE, chaves e restrições (DDL)
│   ├── seed.sql           # dados de exemplo para testar o esquema
│   ├── consultas.sql       # INSERT/UPDATE/DELETE/SELECT de manipulação
│   ├── reset.sql            # limpa e zera os IDs, útil antes de rodar seed.sql de novo
│   └── er-diagram.png       # diagrama entidade-relacionamento
└── README.md
```

## Módulo 3 — Banco de dados e controle de versão

### Modelo de dados

O protótipo do Módulo 2 guardava usuário, agendamento e material como objetos
soltos no `localStorage`. O Módulo 3 normaliza isso em quatro entidades
relacionais (ver `database/er-diagram.png` e `database/schema.sql`):

- **usuarios** — moradores e catadores na mesma tabela, diferenciados pela
  coluna `perfil` (ENUM). Só catadores têm `cooperativa_id` preenchido — regra
  garantida por uma `CHECK constraint`.
- **cooperativas** — entidade de apoio para os catadores.
- **materiais** — tabela de apoio (lookup) para o tipo de material, em vez de
  texto livre repetido em cada agendamento.
- **agendamentos** — entidade principal, com chaves estrangeiras para
  `usuarios` e `materiais`, `status` controlado por ENUM e `CHECK` para
  impedir quantidade zero/negativa e data retroativa.

Banco de dados alvo: **PostgreSQL**, conforme já definido no relatório do
Módulo 1.

### Como rodar o esquema

```bash
createdb ecocoleta
psql -d ecocoleta -f database/schema.sql
psql -d ecocoleta -f database/seed.sql
psql -d ecocoleta -f database/consultas.sql
```

Para repopular do zero depois de testar `consultas.sql` (ou depois de qualquer inserção que tenha falhado no meio), rode `database/reset.sql` antes de rodar `seed.sql` de novo — ele zera também os contadores de ID (`SERIAL`), evitando erros de chave estrangeira por IDs fora de ordem.

### Controle de versão

Este repositório já nasce com histórico real de commits, organizados em uma
branch de funcionalidade (`feature/database-model`) integrada à `main` por
merge — reproduzindo o fluxo pedido na atividade (branches, commits com
mensagens explicativas, merge). Rode `git log --oneline --graph --all` depois
de clonar para ver o histórico completo.

**Antes do primeiro `git push`**, ajuste a autoria dos commits para o seu
usuário do GitHub (eles foram criados localmente com um e-mail placeholder):

```bash
git checkout main
git filter-branch -f --env-filter '
export GIT_AUTHOR_NAME="Seu Nome"
export GIT_AUTHOR_EMAIL="seu-email-do-github@exemplo.com"
export GIT_COMMITTER_NAME="Seu Nome"
export GIT_COMMITTER_EMAIL="seu-email-do-github@exemplo.com"
' -- --all
```

Isso é opcional para a nota (as mensagens de commit já mostram o histórico
esperado), mas faz os commits aparecerem vinculados ao seu perfil no GitHub.

## Publicação no GitHub

Repositório: **`<< cole aqui o link do seu repositório após publicar >>`**

Como este projeto já tem um repositório Git local (com o histórico do Módulo 2
e do Módulo 3), a publicação é só conectar o remoto e enviar:

```bash
cd ecocoleta
git remote add origin https://github.com/SEU-USUARIO/ecocoleta-solidaria.git
git push -u origin main
```

Para novas funcionalidades a partir daqui, seguir o mesmo fluxo de branches:

```bash
git checkout -b feature/nome-da-funcionalidade
# ... alterações ...
git add .
git commit -m "feat: descreve a mudança"
git push -u origin feature/nome-da-funcionalidade
# abrir Pull Request para main no GitHub
```

## Módulo 4 — Integração e Entrega Contínua (CI/CD)

### Como rodar os testes localmente

```bash
npm install
npm run lint          # ESLint
npm run format        # Prettier (--check)
npm test              # testes unitários (Vitest) — js/logica.js
```

O teste de integração/banco de dados precisa de um PostgreSQL acessível. Localmente:

```bash
createdb ecocoleta_test
psql -d ecocoleta_test -f database/schema.sql
export DATABASE_URL=postgres://SEU_USUARIO@localhost:5432/ecocoleta_test
npm run test:db
```

Sem `DATABASE_URL` definida, `npm run test:db` pula os testes (não quebra a execução).

### O que o pipeline de CI (`.github/workflows/ci.yml`) faz a cada push/PR

| Job | O que valida |
|---|---|
| `lint-e-testes-unitarios` | ESLint, Prettier e os 12 testes unitários de `js/logica.js` |
| `teste-integracao-banco` | Sobe um PostgreSQL real (service container), aplica `schema.sql` e roda os 5 testes de integração contra as constraints reais (`chk_data_nao_passada`, `chk_cooperativa_somente_catador`, `quantidade_kg > 0`) |
| `varredura-de-segredos` | Gitleaks — bloqueia merge se alguma credencial for commitada |
| `analise-estatica-codeql` | CodeQL (gratuito em repositório público) — vulnerabilidades de JavaScript |

### O que o pipeline de CD (`.github/workflows/cd.yml`) faz a cada push em `main`

1. Builda **uma única imagem Docker** do site (`Dockerfile`, Nginx servindo os arquivos estáticos) e publica no Docker Hub.
2. "Deploya" essa mesma imagem no ambiente **staging**, com health check HTTP pós-deploy.
3. Só então libera o job de **production**, que fica bloqueado aguardando aprovação manual (GitHub Environment com *required reviewers*) e também roda health check + rollback automático em caso de falha.

Os passos de deploy em si estão marcados como `TODO` porque dependem de onde o site será hospedado de fato (ex.: um VPS via SSH, Render, Fly.io) — o pipeline já está pronto para receber esse passo assim que a hospedagem for escolhida.

### Configuração necessária no GitHub (fazer uma vez, manualmente)

1. **Settings → Secrets and variables → Actions → Secrets**: `DOCKERHUB_USERNAME`, `DOCKERHUB_TOKEN` (um access token do Docker Hub, não a senha).
2. **Settings → Secrets and variables → Actions → Variables**: `STAGING_URL`, `PRODUCTION_URL` (URLs reais assim que a hospedagem existir).
3. **Settings → Environments**: criar `staging` e `production`; em `production`, marcar **Required reviewers** com você (ou outro mantenedor) — é isso que implementa o "gate" de aprovação manual descrito no plano.
4. **Settings → Branches → Branch protection rules** para `main`: marcar "Require status checks to pass before merging" e selecionar os 4 checks do `ci.yml` — isso implementa a regra de proteção de branch do plano.
5. **Settings → Code security and analysis**: habilitar "CodeQL analysis" (ou deixar como está, já que o workflow já faz isso) e habilitar "Dependabot alerts" — é a forma gratuita e nativa do GitHub de cobrir a "Auditoria de Dependências" do plano, sem precisar de uma ferramenta paga à parte.
6. **(Opcional) SonarCloud**: criar conta gratuita em sonarcloud.io para o repositório público, gerar um token e adicioná-lo como secret `SONAR_TOKEN`; depois descomentar o job `analise-sonarcloud` em `ci.yml`.
7. **(Opcional) CodeRabbit AI**: instalar o GitHub App em [coderabbit.ai](https://coderabbit.ai) (gratuito para repositórios públicos) — não precisa de workflow próprio, ele comenta direto nos Pull Requests.
