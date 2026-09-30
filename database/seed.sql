-- ============================================================================
-- EcoColeta Solidária — Dados de exemplo (seed)
-- Popula o esquema para permitir testar as consultas de consultas.sql
-- ============================================================================

INSERT INTO cooperativas (nome, bairro_sede) VALUES
    ('Cooperativa Recicla CG', 'Amambaí'),
    ('Associação Verde Vida',  'Tiradentes');

INSERT INTO materiais (nome) VALUES
    ('Papel e papelão'),
    ('Plástico'),
    ('Vidro'),
    ('Metal'),
    ('Misto');

INSERT INTO usuarios (nome, email, perfil, bairro, cooperativa_id) VALUES
    ('Ralf Diego de Oliveira Mota', 'ralf.morador@exemplo.com', 'morador', 'Amambaí', NULL),
    ('Mariana Souza',               'mariana@exemplo.com',      'morador', 'Tiradentes', NULL),
    ('João Batista',                'joao.catador@exemplo.com', 'catador', NULL, 1),
    ('Fátima Nunes',                'fatima.catador@exemplo.com','catador', NULL, 2);

INSERT INTO agendamentos (usuario_id, material_id, data_coleta, horario, endereco, quantidade_kg, status) VALUES
    (1, 2, CURRENT_DATE + 2, '14:00', 'Rua das Palmeiras, 120 - Amambaí',      12.0, 'agendado'),
    (1, 1, CURRENT_DATE + 5, '09:30', 'Rua das Palmeiras, 120 - Amambaí',       8.0, 'agendado'),
    (2, 3, CURRENT_DATE + 1, '16:00', 'Av. Afonso Pena, 3400 - Tiradentes',     5.5, 'agendado'),
    (2, 2, CURRENT_DATE - 3, '10:00', 'Av. Afonso Pena, 3400 - Tiradentes',     9.0, 'coletado'),
    (1, 4, CURRENT_DATE - 7, '11:00', 'Rua das Palmeiras, 120 - Amambaí',       3.2, 'coletado');
