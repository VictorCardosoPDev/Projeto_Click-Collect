// NO SEU ARQUIVO: login.js

function fazerLogin() {
    const tipo = document.getElementById("tipoUsuario").value;
    const user = document.getElementById("user").value; // E-mail ou Usuário Admin
    const pass = document.getElementById("pass").value; // Senha

    if (user === "" || pass === "") {
        alert("Preencha todos os campos.");
        return;
    }

    // ===================================
    // 1. TENTATIVA DE LOGIN FUNCIONÁRIO (Admin)
    // ===================================
    if (tipo === "funcionario") {
        // Credenciais fixas: admin/123
        if (user === "admin" && pass === "123") {
            localStorage.setItem("tipoUsuario", "funcionario");
            // CORREÇÃO DE CAMINHO: Da pasta /login para /login/funcionario
            window.location.href = "funcionario/funcionario.html"; 
        } else {
            alert("Usuário ou senha de funcionário incorretos.");
        }
        return; // Termina a função após tentar logar como funcionário
    }

    // ===================================
    // 2. TENTATIVA DE LOGIN CLIENTE (Aprovado)
    // ===================================
    if (tipo === "cliente") {
        const clientesRaw = localStorage.getItem("clientes");
        const clientes = clientesRaw ? JSON.parse(clientesRaw) : [];

        // Verifica se o cliente já foi aprovado pelo funcionário (busca por email e senha)
        const encontrado = clientes.find(c => {
            return c.email === user && c.senha === pass;
        });

        if (!encontrado) {
            alert("Acesso negado. Por favor, solicite o acesso ou verifique a senha.");
            return;
        }
        
        // Se encontrou, loga
        localStorage.setItem("tipoUsuario", "cliente");
        localStorage.setItem("clienteLogado", encontrado.email);

        // CORREÇÃO DE CAMINHO: Da pasta /login para /loja
        window.location.href = "../loja/loja.html"; 
    }
}

// ===================================
// FUNÇÃO: CLIENTE SOLICITA ACESSO (Novo)
// ===================================
function solicitarAcesso() {
    const nome = document.getElementById("cadastroNome").value;
    const email = document.getElementById("cadastroEmail").value;
    
    if (!nome || !email) {
        alert("Preencha Nome e E-mail para solicitar o acesso.");
        return;
    }

    // Carrega solicitações pendentes
    const pendentesRaw = localStorage.getItem("cc_acessos_pendentes");
    let pendentes = pendentesRaw ? JSON.parse(pendentesRaw) : [];

    // Carrega clientes já aprovados
    const clientesAprovadosRaw = localStorage.getItem("clientes");
    let clientesAprovados = clientesAprovadosRaw ? JSON.parse(clientesAprovadosRaw) : [];

    // Verifica se o e-mail já existe
    const emailExiste = pendentes.some(c => c.email === email) || 
                        clientesAprovados.some(c => c.email === email);
    
    if (emailExiste) {
        alert("Este e-mail já tem uma solicitação pendente ou já está cadastrado.");
        return;
    }

    // Adiciona nova solicitação pendente
    pendentes.push({ nome, email, data: new Date().toLocaleString() });
    localStorage.setItem("cc_acessos_pendentes", JSON.stringify(pendentes));

    alert("Solicitação de acesso enviada com sucesso! Aguarde a aprovação do funcionário.");

    // Limpa os campos
    document.getElementById("cadastroNome").value = "";
    document.getElementById("cadastroEmail").value = "";
}