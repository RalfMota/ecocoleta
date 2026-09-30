# EcoColeta Solidária

Plataforma web para gestão de coleta seletiva e inclusão socioambiental em Campo Grande - MS.


## Sobre a entrega (frontend)


| Requisito | Descrição | Onde está |
|---|---|---|
| RF01 | Cadastro/login com perfis distintos (Morador e Catador) | tela "Entrar ou criar conta" |
| RF02 | Agendamento de recolhimento (data, horário, endereço, material) | tela "Agendar coleta" |
| RF03 | Painel com volume total reciclado e histórico de coletas | tela "Painel" |
| RNF01 | Interface 100% responsiva (mobile-first) | `css/style.css`, breakpoints em 640px/768px/960px |
| RNF02 | Tempo de resposta abaixo de 2s | aplicação 100% client-side, sem chamadas de rede bloqueantes |

## Como executar localmente

Não há build nem dependências para instalar: é um site estático.

1. Baixe ou clone o repositório.
2. Abra `index.html` diretamente no navegador, ou, para evitar restrições de
   módulos locais, sirva a pasta com um servidor simples:
   ```bash
   npx serve .
    ou
   python3 -m http.server 8080
   ```
3. Acesse http://localhost:8080.

## Decisões técnicas (frontend)

Framework escolhido — Vue.js 3 via CDN.
Optou-se por Vue.js pois a API de Options do Vue permite
montar uma aplicação reativa em um único arquivo `app.js`, sem etapa de build.

Persistência — localStorage no protótipo, PostgreSQL
O frontend ainda lê e grava em `localStorage` para manter o protótipo 100%
client-side e fácil de demonstrar; o modelo relacional completo já está
especificado em `database/` (ver seção abaixo) e é o próximo passo de
integração via API.

Estrutura HTML semântica e acessível.
`header`, `nav`, `main`, `section`, `footer` e `table` são usados pelo papel
que exercem. Todo campo de formulário tem `label` associado, o seletor de
material usa `role="radiogroup"`/`role="radio"` para leitores de tela, e o
foco de teclado tem contorno visível (`:focus-visible`).

CSS responsivo mobile-first.
`css/style.css` define primeiro o layout de uma coluna (celular) e usa
`@media (min-width: ...)` para introduzir grid de 2–5 colunas e o menu
horizontal a partir de 768px.

Refinamento de layout (design).

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

Estrutura de pastas

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
│   └── er-diagram.png       # diagrama entidade-relacionamento
└── README.md
```

Módulo 3 — Banco de dados e controle de versão

### Modelo de dados

O protótipo guardava usuário, agendamento e material como objetos
soltos no `localStorage`. Isso foi normalizado em quatro entidades
relacionais (ver `database/er-diagram.png` e `database/schema.sql`):

- usuarios — moradores e catadores na mesma tabela, diferenciados pela
  coluna `perfil` (ENUM). Só catadores têm `cooperativa_id` preenchido — regra
  garantida por uma `CHECK constraint`.
- cooperativas — entidade de apoio para os catadores.
- materiais— tabela de apoio (lookup) para o tipo de material, em vez de
  texto livre repetido em cada agendamento.
- agendamentos — entidade principal, com chaves estrangeiras para
  `usuarios` e `materiais`, `status` controlado por ENUM e `CHECK` para
  impedir quantidade zero/negativa e data retroativa.

Banco de dados alvo: PostgreSQL

### Como rodar o esquema

```bash
createdb ecocoleta
psql -d ecocoleta -f database/schema.sql
psql -d ecocoleta -f database/seed.sql
psql -d ecocoleta -f database/consultas.sql
```

### Controle de versão

Este repositório possui branch de funcionalidade (`feature/database-model`) integrada à `main` por
merge — reproduzindo o fluxo (branches, commits com
mensagens explicativas, merge). Rode `git log --oneline --graph --all` depois
de clonar para ver o histórico completo.


```bash
git checkout main
git filter-branch -f --env-filter '
export GIT_AUTHOR_NAME="Seu Nome"
export GIT_AUTHOR_EMAIL="seu-email-do-github@exemplo.com"
export GIT_COMMITTER_NAME="Seu Nome"
export GIT_COMMITTER_EMAIL="seu-email-do-github@exemplo.com"
' -- --all
```



