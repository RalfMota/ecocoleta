-- ============================================================================
-- EcoColeta Solidária — Manipulação de dados (DML)
-- Exemplos de INSERT, UPDATE, DELETE e SELECT usados para validar o modelo
-- e alimentar as telas do Módulo 2 (Agendamento e Painel).
-- ============================================================================

-- ---------------------------------------------------------------------------
-- INSERT — novo agendamento feito por um morador já cadastrado (RF02)
-- ---------------------------------------------------------------------------
INSERT INTO agendamentos (usuario_id, material_id, data_coleta, horario, endereco, quantidade_kg)
VALUES (
    (SELECT id FROM usuarios WHERE email = 'ralf.morador@exemplo.com'),
    (SELECT id FROM materiais WHERE nome = 'Vidro'),
    CURRENT_DATE + 3, '15:00', 'Rua das Palmeiras, 120 - Amambaí', 6.0
);

-- ---------------------------------------------------------------------------
-- UPDATE — cooperativa marca uma coleta como realizada
-- ---------------------------------------------------------------------------
UPDATE agendamentos
SET status = 'coletado'
WHERE id = 1;

-- UPDATE — morador corrige o endereço do próprio agendamento
UPDATE agendamentos
SET endereco = 'Rua das Palmeiras, 128 - Amambaí'
WHERE id = 2 AND usuario_id = 1;

-- ---------------------------------------------------------------------------
-- DELETE — cancelamento de um agendamento (regra de negócio real cancelaria
-- via status='cancelado'; o DELETE abaixo é o exemplo pedido pela atividade)
-- ---------------------------------------------------------------------------
DELETE FROM agendamentos
WHERE id = 3 AND status = 'agendado';

-- ---------------------------------------------------------------------------
-- SELECT — consultas que alimentam o Painel (RF03)
-- ---------------------------------------------------------------------------

-- Volume total reciclado (card "Volume total reciclado")
SELECT COALESCE(SUM(quantidade_kg), 0) AS total_reciclado_kg
FROM agendamentos
WHERE status = 'coletado';

-- Volume por material (gráfico de barras do painel)
SELECT m.nome AS material, SUM(a.quantidade_kg) AS total_kg
FROM agendamentos a
JOIN materiais m ON m.id = a.material_id
WHERE a.status = 'coletado'
GROUP BY m.nome
ORDER BY total_kg DESC;

-- Histórico de coletas com nome do morador e material (tabela do painel)
SELECT
    a.data_coleta,
    u.nome        AS morador,
    m.nome        AS material,
    a.quantidade_kg,
    a.endereco,
    a.status
FROM agendamentos a
JOIN usuarios u  ON u.id = a.usuario_id
JOIN materiais m ON m.id = a.material_id
ORDER BY a.data_coleta DESC;

-- Próximas coletas de um catador específico, por cooperativa
SELECT a.data_coleta, a.horario, a.endereco, m.nome AS material, a.quantidade_kg
FROM agendamentos a
JOIN materiais m ON m.id = a.material_id
JOIN usuarios morador ON morador.id = a.usuario_id
WHERE a.status = 'agendado'
  AND morador.bairro IN (
      SELECT bairro_sede FROM cooperativas
      WHERE id = (SELECT cooperativa_id FROM usuarios WHERE email = 'joao.catador@exemplo.com')
  )
ORDER BY a.data_coleta, a.horario;
