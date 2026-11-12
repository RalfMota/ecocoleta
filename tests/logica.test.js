import { describe, it, expect } from "vitest";
import {
  calcularTotalReciclado,
  ordenarAgendamentos,
  filtrarAgendamentosDoUsuario,
  calcularVolumePorMaterial,
  calcularMaterialPrincipal,
  formatarData,
} from "../js/logica.js";

const materiaisExemplo = [
  { nome: "Papel e papelão", kg: 128 },
  { nome: "Plástico", kg: 96 },
  { nome: "Vidro", kg: 54 },
];

describe("calcularTotalReciclado", () => {
  it("soma o volume base dos materiais de exemplo com os agendamentos registrados", () => {
    const agendamentos = [{ quantidade: 12 }, { quantidade: 8.5 }, { quantidade: 5 }];
    // base = 128 + 96 + 54 = 278; registrado = 25.5
    expect(calcularTotalReciclado(agendamentos, materiaisExemplo)).toBe(303.5);
  });

  it("ignora quantidade ausente/undefined sem lançar erro", () => {
    const agendamentos = [{ quantidade: 10 }, {}];
    expect(calcularTotalReciclado(agendamentos, materiaisExemplo)).toBe(288);
  });

  it("retorna apenas a base quando não há agendamentos", () => {
    expect(calcularTotalReciclado([], materiaisExemplo)).toBe(278);
  });
});

describe("ordenarAgendamentos", () => {
  it("ordena do mais recente para o mais antigo por data", () => {
    const agendamentos = [
      { id: "a", data: "2026-11-01" },
      { id: "b", data: "2026-11-10" },
      { id: "c", data: "2026-11-05" },
    ];
    const ordenado = ordenarAgendamentos(agendamentos);
    expect(ordenado.map((a) => a.id)).toEqual(["b", "c", "a"]);
  });

  it("não modifica o array original (imutabilidade)", () => {
    const agendamentos = [
      { id: "a", data: "2026-11-01" },
      { id: "b", data: "2026-11-10" },
    ];
    const copiaAntes = [...agendamentos];
    ordenarAgendamentos(agendamentos);
    expect(agendamentos).toEqual(copiaAntes);
  });
});

describe("filtrarAgendamentosDoUsuario", () => {
  const agendamentos = [
    { id: "1", usuarioId: "u1", data: "2026-11-01" },
    { id: "2", usuarioId: "u2", data: "2026-11-02" },
    { id: "3", usuarioId: "u1", data: "2026-11-05" },
  ];

  it("retorna somente os agendamentos do usuário informado, ordenados", () => {
    const resultado = filtrarAgendamentosDoUsuario(agendamentos, "u1");
    expect(resultado.map((a) => a.id)).toEqual(["3", "1"]);
  });

  it("retorna lista vazia quando não há usuário logado", () => {
    expect(filtrarAgendamentosDoUsuario(agendamentos, null)).toEqual([]);
    expect(filtrarAgendamentosDoUsuario(agendamentos, undefined)).toEqual([]);
  });
});

describe("calcularVolumePorMaterial / calcularMaterialPrincipal", () => {
  it("agrupa por material e calcula o percentual relativo ao maior volume", () => {
    const agendamentos = [
      { material: "Papel e papelão", quantidade: 20 },
      { material: "Plástico", quantidade: 10 },
      { material: "Papel e papelão", quantidade: 5 },
    ];
    const volumes = calcularVolumePorMaterial(agendamentos);
    const papel = volumes.find((v) => v.material === "Papel e papelão");
    const plastico = volumes.find((v) => v.material === "Plástico");

    expect(papel.kg).toBe(25);
    expect(papel.percentual).toBe(100);
    expect(plastico.kg).toBe(10);
    expect(plastico.percentual).toBe(40);
  });

  it("identifica o material com maior volume como principal", () => {
    const volumes = calcularVolumePorMaterial([
      { material: "Vidro", quantidade: 3 },
      { material: "Metal", quantidade: 30 },
    ]);
    expect(calcularMaterialPrincipal(volumes)).toBe("Metal");
  });

  it("retorna travessão quando não há nenhum agendamento", () => {
    expect(calcularMaterialPrincipal(calcularVolumePorMaterial([]))).toBe("—");
  });
});

describe("formatarData", () => {
  it("converte ISO (AAAA-MM-DD) para formato brasileiro (DD/MM/AAAA)", () => {
    expect(formatarData("2026-11-10")).toBe("10/11/2026");
  });

  it("retorna string vazia quando a data não é informada", () => {
    expect(formatarData("")).toBe("");
    expect(formatarData(null)).toBe("");
  });
});
