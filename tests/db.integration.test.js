// Teste de integração/banco de dados — operacionaliza, de forma automatizada,
// o tipo de teste "Banco de dados / restrições" descrito no Plano de Testes
// (Módulo 2) e o caso real chk_data_nao_passada corrigido no Módulo 3.
//
// Exige uma instância PostgreSQL acessível via DATABASE_URL (fornecida pelo
// serviço postgres do workflow de CI). Localmente, basta exportar a variável
// apontando para um banco de testes antes de rodar `npm run test:db`:
//   export DATABASE_URL=postgres://postgres:postgres@localhost:5432/ecocoleta_test
// Se a variável não estiver definida, os testes são pulados (não quebram
// `npm test` em uma máquina sem Postgres configurado).

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import pg from "pg";

const DATABASE_URL = process.env.DATABASE_URL;
const executar = DATABASE_URL ? describe : describe.skip;

executar("schema.sql — restrições de integridade", () => {
  let client;

  beforeAll(async () => {
    client = new pg.Client({ connectionString: DATABASE_URL });
    await client.connect();
    // cooperativa/material/usuario mínimos para satisfazer as FKs de agendamentos
    await client.query(`INSERT INTO cooperativas (nome) VALUES ('Coop Teste') ON CONFLICT DO NOTHING`);
    await client.query(
      `INSERT INTO usuarios (nome, email, perfil) VALUES ('Usuário Teste', 'teste@ecocoleta.dev', 'morador') ON CONFLICT (email) DO NOTHING`
    );
    await client.query(`INSERT INTO materiais (nome) VALUES ('Papel e papelão') ON CONFLICT DO NOTHING`);
  });

  afterAll(async () => {
    await client.end();
  });

  async function idsBase() {
    const u = await client.query(`SELECT id FROM usuarios WHERE email = 'teste@ecocoleta.dev'`);
    const m = await client.query(`SELECT id FROM materiais WHERE nome = 'Papel e papelão'`);
    return { usuarioId: u.rows[0].id, materialId: m.rows[0].id };
  }

  it("aceita um agendamento 'agendado' com data futura (caso válido)", async () => {
    const { usuarioId, materialId } = await idsBase();
    const amanha = new Date(Date.now() + 86400000).toISOString().split("T")[0];
    const res = await client.query(
      `INSERT INTO agendamentos (usuario_id, material_id, data_coleta, horario, endereco, quantidade_kg, status)
       VALUES ($1, $2, $3, '09:00', 'Rua Teste, 1', 10, 'agendado') RETURNING id`,
      [usuarioId, materialId, amanha]
    );
    expect(res.rows[0].id).toBeDefined();
  });

  it("rejeita um agendamento 'agendado' com data retroativa (chk_data_nao_passada)", async () => {
    const { usuarioId, materialId } = await idsBase();
    await expect(
      client.query(
        `INSERT INTO agendamentos (usuario_id, material_id, data_coleta, horario, endereco, quantidade_kg, status)
         VALUES ($1, $2, '2020-01-01', '09:00', 'Rua Teste, 2', 10, 'agendado')`,
        [usuarioId, materialId]
      )
    ).rejects.toThrow(/chk_data_nao_passada/);
  });

  it("aceita um agendamento já 'coletado' mesmo com data retroativa (regra corrigida)", async () => {
    const { usuarioId, materialId } = await idsBase();
    const res = await client.query(
      `INSERT INTO agendamentos (usuario_id, material_id, data_coleta, horario, endereco, quantidade_kg, status)
       VALUES ($1, $2, '2020-01-01', '09:00', 'Rua Teste, 3', 10, 'coletado') RETURNING id`,
      [usuarioId, materialId]
    );
    expect(res.rows[0].id).toBeDefined();
  });

  it("rejeita quantidade_kg zero ou negativa", async () => {
    const { usuarioId, materialId } = await idsBase();
    const amanha = new Date(Date.now() + 86400000).toISOString().split("T")[0];
    await expect(
      client.query(
        `INSERT INTO agendamentos (usuario_id, material_id, data_coleta, horario, endereco, quantidade_kg, status)
         VALUES ($1, $2, $3, '09:00', 'Rua Teste, 4', 0, 'agendado')`,
        [usuarioId, materialId, amanha]
      )
    ).rejects.toThrow();
  });

  it("rejeita cooperativa_id preenchida para um usuário 'morador' (chk_cooperativa_somente_catador)", async () => {
    await expect(
      client.query(
        `INSERT INTO usuarios (nome, email, perfil, cooperativa_id)
         VALUES ('Morador Invalido', 'morador-invalido@ecocoleta.dev', 'morador', 1)`
      )
    ).rejects.toThrow(/chk_cooperativa_somente_catador/);
  });
});
