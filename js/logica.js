// Funções puras extraídas de app.js para permitir teste unitário com Vitest,
// sem depender do DOM, do Vue ou do localStorage. Nenhuma regra de negócio foi
// alterada em relação à versão anterior: apenas isoladas do componente Vue.

export function calcularTotalReciclado(agendamentos, materiaisExemplo) {
  const registrado = agendamentos.reduce((soma, ag) => soma + Number(ag.quantidade || 0), 0);
  const base = materiaisExemplo.reduce((soma, m) => soma + m.kg, 0);
  return registrado + base;
}

export function ordenarAgendamentos(agendamentos) {
  return [...agendamentos].sort((a, b) => (a.data < b.data ? 1 : -1));
}

export function filtrarAgendamentosDoUsuario(agendamentos, usuarioId) {
  if (!usuarioId) return [];
  return ordenarAgendamentos(agendamentos.filter((ag) => ag.usuarioId === usuarioId));
}

export function calcularVolumePorMaterial(agendamentos) {
  const totais = {};
  agendamentos.forEach((ag) => {
    totais[ag.material] = (totais[ag.material] || 0) + Number(ag.quantidade || 0);
  });
  const maior = Math.max(1, ...Object.values(totais));
  return Object.entries(totais).map(([material, kg]) => ({
    material,
    kg,
    percentual: Math.round((kg / maior) * 100),
  }));
}

export function calcularMaterialPrincipal(volumePorMaterial) {
  if (!volumePorMaterial.length) return "—";
  return volumePorMaterial.reduce((a, b) => (b.kg > a.kg ? b : a)).material;
}

export function formatarData(iso) {
  if (!iso) return "";
  const [ano, mes, dia] = iso.split("-");
  return `${dia}/${mes}/${ano}`;
}
