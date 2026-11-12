-- ============================================================================
-- EcoColeta Solidária — Reset dos dados
-- Limpa as 4 tabelas e zera os contadores de ID (sequences), devolvendo o
-- banco ao estado "recém-criado". Útil antes de rodar seed.sql de novo,
-- especialmente depois de testar os UPDATE/DELETE de consultas.sql ou
-- depois de uma inserção que falhou no meio (o Postgres não recua o
-- contador de ID automaticamente quando uma transação é desfeita).
-- ============================================================================

TRUNCATE TABLE agendamentos, usuarios, materiais, cooperativas RESTART IDENTITY CASCADE;
