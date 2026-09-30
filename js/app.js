const { createApp } = Vue;

const CHAVE_USUARIOS = "ecocoleta_usuarios";
const CHAVE_SESSAO = "ecocoleta_sessao";
const CHAVE_AGENDAMENTOS = "ecocoleta_agendamentos";

function carregar(chave, padrao) {
  try {
    const bruto = localStorage.getItem(chave);
    return bruto ? JSON.parse(bruto) : padrao;
  } catch (erro) {
    console.error("Falha ao ler", chave, erro);
    return padrao;
  }
}

function salvar(chave, valor) {
  localStorage.setItem(chave, JSON.stringify(valor));
}

createApp({
  data() {
    return {
      view: "home",
      menuAberto: false,

      usuarios: carregar(CHAVE_USUARIOS, []),
      usuarioAtual: carregar(CHAVE_SESSAO, null),
      agendamentos: carregar(CHAVE_AGENDAMENTOS, []),

      perfilForm: "morador",
      formConta: { nome: "", email: "", cooperativa: "", bairro: "" },
      mensagemConta: "",
      enviandoConta: false,

      formAgenda: { data: "", horario: "", endereco: "", material: "", quantidade: null },
      mensagemAgenda: "",
      enviandoAgenda: false,

      materiaisExemplo: [
        { nome: "Papel e papelão", kg: 128, cor: "#C97D2E", icone: '<path d="M6 3.5h9l3 3V20a.5.5 0 0 1-.5.5h-11A.5.5 0 0 1 6 20V4a.5.5 0 0 1 .5-.5Z"></path><path d="M15 3.5V7h3"></path><path d="M9 12h6M9 15.5h6"></path>' },
        { nome: "Plástico", kg: 96, cor: "#4E7D64", icone: '<path d="M10 2.5h4v3.2l1.3 1.6c.5.6.7 1.3.7 2V19a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2V9.3c0-.7.2-1.4.7-2L10 5.7V2.5Z"></path><path d="M8.7 13h6.6"></path>' },
        { nome: "Vidro", kg: 54, cor: "#16302B", icone: '<path d="M9 2.5h6l.8 5.5c.3 2 .2 4-1.2 5.4-.8.8-1.1 1.4-1.1 2.6v3.5a1.5 1.5 0 0 1-1.5 1.5h0A1.5 1.5 0 0 1 10.5 19.5V16c0-1.2-.3-1.8-1.1-2.6-1.4-1.4-1.5-3.4-1.2-5.4L9 2.5Z"></path>' },
      ],
      tiposMaterial: [
        { nome: "Papel e papelão", icone: '<path d="M6 3.5h9l3 3V20a.5.5 0 0 1-.5.5h-11A.5.5 0 0 1 6 20V4a.5.5 0 0 1 .5-.5Z"></path><path d="M15 3.5V7h3"></path><path d="M9 12h6M9 15.5h6"></path>' },
        { nome: "Plástico", icone: '<path d="M10 2.5h4v3.2l1.3 1.6c.5.6.7 1.3.7 2V19a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2V9.3c0-.7.2-1.4.7-2L10 5.7V2.5Z"></path><path d="M8.7 13h6.6"></path>' },
        { nome: "Vidro", icone: '<path d="M9 2.5h6l.8 5.5c.3 2 .2 4-1.2 5.4-.8.8-1.1 1.4-1.1 2.6v3.5a1.5 1.5 0 0 1-1.5 1.5h0A1.5 1.5 0 0 1 10.5 19.5V16c0-1.2-.3-1.8-1.1-2.6-1.4-1.4-1.5-3.4-1.2-5.4L9 2.5Z"></path>' },
        { nome: "Metal", icone: '<ellipse cx="12" cy="6" rx="6" ry="2.4"></ellipse><path d="M6 6v12c0 1.3 2.7 2.4 6 2.4s6-1.1 6-2.4V6"></path><path d="M6 12c0 1.3 2.7 2.4 6 2.4s6-1.1 6-2.4"></path>' },
        { nome: "Misto", icone: '<rect x="3.5" y="3.5" width="7.5" height="7.5" rx="1.4"></rect><rect x="13" y="3.5" width="7.5" height="7.5" rx="1.4"></rect><rect x="3.5" y="13" width="7.5" height="7.5" rx="1.4"></rect><rect x="13" y="13" width="7.5" height="7.5" rx="1.4"></rect>' },
      ],
    };
  },

  computed: {
    hoje() {
      return new Date().toISOString().split("T")[0];
    },

    totalReciclado() {
      const registrado = this.agendamentos.reduce((soma, ag) => soma + Number(ag.quantidade || 0), 0);
      const base = this.materiaisExemplo.reduce((soma, m) => soma + m.kg, 0);
      return registrado + base;
    },

    agendamentosDoUsuario() {
      if (!this.usuarioAtual) return [];
      return this.agendamentos
        .filter((ag) => ag.usuarioId === this.usuarioAtual.id)
        .sort((a, b) => (a.data < b.data ? 1 : -1));
    },

    agendamentosOrdenados() {
      return [...this.agendamentos].sort((a, b) => (a.data < b.data ? 1 : -1));
    },

    volumePorMaterial() {
      const totais = {};
      this.agendamentos.forEach((ag) => {
        totais[ag.material] = (totais[ag.material] || 0) + Number(ag.quantidade || 0);
      });
      const maior = Math.max(1, ...Object.values(totais));
      return Object.entries(totais).map(([material, kg]) => ({
        material,
        kg,
        percentual: Math.round((kg / maior) * 100),
      }));
    },

    materialPrincipal() {
      const lista = this.volumePorMaterial;
      if (!lista.length) return "—";
      return lista.reduce((a, b) => (b.kg > a.kg ? b : a)).material;
    },
  },

  methods: {
    irPara(destino) {
      this.view = destino;
      this.menuAberto = false;
      this.mensagemConta = "";
      this.mensagemAgenda = "";
      window.scrollTo({ top: 0, behavior: "smooth" });
    },

    formatarData(iso) {
      if (!iso) return "";
      const [ano, mes, dia] = iso.split("-");
      return `${dia}/${mes}/${ano}`;
    },

    cadastrarOuEntrar() {
      this.enviandoConta = true;
      const email = this.formConta.email.toLowerCase();
      let usuario = this.usuarios.find((u) => u.email === email);

      if (!usuario) {
        usuario = {
          id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
          nome: this.formConta.nome,
          email,
          perfil: this.perfilForm,
          cooperativa: this.formConta.cooperativa,
          bairro: this.formConta.bairro,
        };
        this.usuarios.push(usuario);
        salvar(CHAVE_USUARIOS, this.usuarios);
        this.mensagemConta = "Conta criada com sucesso.";
      } else {
        this.mensagemConta = "Login realizado.";
      }

      this.usuarioAtual = usuario;
      salvar(CHAVE_SESSAO, usuario);
      this.formConta = { nome: "", email: "", cooperativa: "", bairro: "" };

      setTimeout(() => {
        this.enviandoConta = false;
        this.irPara("agendamento");
      }, 500);
    },

    sair() {
      this.usuarioAtual = null;
      localStorage.removeItem(CHAVE_SESSAO);
      this.irPara("home");
    },

    agendarColeta() {
      this.enviandoAgenda = true;
      const novoAgendamento = {
        id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
        usuarioId: this.usuarioAtual.id,
        nomeUsuario: this.usuarioAtual.nome,
        ...this.formAgenda,
      };

      setTimeout(() => {
        this.agendamentos.push(novoAgendamento);
        salvar(CHAVE_AGENDAMENTOS, this.agendamentos);

        this.mensagemAgenda = "Coleta agendada! Você pode acompanhar no painel.";
        this.formAgenda = { data: "", horario: "", endereco: "", material: "", quantidade: null };
        this.enviandoAgenda = false;
      }, 350);
    },
  },
}).mount("#app");
