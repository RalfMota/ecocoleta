-- ============================================================================
-- EcoColeta Solidária — Modelagem do banco de dados (PostgreSQL)
-- Módulo 3: Banco de Dados e Controle de Versão
--
-- Entidades: usuarios, cooperativas, materiais, agendamentos
-- Este esquema normaliza o que, no protótipo do Módulo 2, era guardado em
-- localStorage como objetos soltos: perfil de usuário, tipo de material e
-- agendamento passam a ser tabelas relacionadas por chave estrangeira.
-- ============================================================================

CREATE TYPE perfil_usuario AS ENUM ('morador', 'catador');
CREATE TYPE status_agendamento AS ENUM ('agendado', 'coletado', 'cancelado');

-- ----------------------------------------------------------------------------
-- Cooperativas: só se aplica a usuários do perfil "catador".
-- ----------------------------------------------------------------------------
CREATE TABLE cooperativas (
    id          SERIAL PRIMARY KEY,
    nome        VARCHAR(120) NOT NULL UNIQUE,
    bairro_sede VARCHAR(80)
);

-- ----------------------------------------------------------------------------
-- Usuarios: moradores e catadores compartilham a mesma tabela (mesmo fluxo de
-- login), diferenciados pela coluna perfil. cooperativa_id só é preenchida
-- para catadores — por isso é opcional (NULL permitido).
-- ----------------------------------------------------------------------------
CREATE TABLE usuarios (
    id             SERIAL PRIMARY KEY,
    nome           VARCHAR(150) NOT NULL,
    email          VARCHAR(150) NOT NULL UNIQUE,
    perfil         perfil_usuario NOT NULL,
    bairro         VARCHAR(80),
    cooperativa_id INTEGER REFERENCES cooperativas(id) ON DELETE SET NULL,
    criado_em      TIMESTAMP NOT NULL DEFAULT now(),

    -- Regra de negócio: só catador pode estar ligado a uma cooperativa.
    CONSTRAINT chk_cooperativa_somente_catador
        CHECK (perfil = 'catador' OR cooperativa_id IS NULL)
);

-- ----------------------------------------------------------------------------
-- Materiais: tabela de apoio (lookup), evita repetir o nome do material como
-- texto livre em cada agendamento — essa é a principal diferença para o
-- protótipo do Módulo 2, que guardava o material como string solta.
-- ----------------------------------------------------------------------------
CREATE TABLE materiais (
    id   SERIAL PRIMARY KEY,
    nome VARCHAR(60) NOT NULL UNIQUE
);

-- ----------------------------------------------------------------------------
-- Agendamentos: entidade principal do sistema (RF02 do relatório do Módulo 1).
-- ----------------------------------------------------------------------------
CREATE TABLE agendamentos (
    id             SERIAL PRIMARY KEY,
    usuario_id     INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    material_id    INTEGER NOT NULL REFERENCES materiais(id) ON DELETE RESTRICT,
    data_coleta    DATE NOT NULL,
    horario        TIME NOT NULL,
    endereco       VARCHAR(200) NOT NULL,
    quantidade_kg  NUMERIC(6,1) NOT NULL CHECK (quantidade_kg > 0),
    status         status_agendamento NOT NULL DEFAULT 'agendado',
    criado_em      TIMESTAMP NOT NULL DEFAULT now(),

    CONSTRAINT chk_data_nao_passada CHECK (data_coleta >= CURRENT_DATE)
);

-- Índices de apoio às consultas mais comuns do painel (RF03).
CREATE INDEX idx_agendamentos_usuario  ON agendamentos(usuario_id);
CREATE INDEX idx_agendamentos_material ON agendamentos(material_id);
CREATE INDEX idx_agendamentos_data     ON agendamentos(data_coleta);
