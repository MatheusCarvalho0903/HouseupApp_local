console.log('🚀 Script de Custos Carregado');

// --- VARIÁVEIS GLOBAIS ---
let PROJETO_ATUAL;
let dadosObra = null;

// --- INICIALIZAR PROJETO ---
function inicializarProjeto() {
    // 1. Tentar pegar da URL
    const urlParams = new URLSearchParams(window.location.search);
    const projetoUrl = urlParams.get('projeto');
    
    // 2. Se não tiver na URL, pegar do localStorage
    
    if (!PROJETO_ATUAL) {
        console.error('❌ Projeto não encontrado');
        PROJETO_ATUAL = 'angela-marco'; // fallback
    }
    
    console.log('🏗️ Projeto:', PROJETO_ATUAL);
    localStorage.setItem('projetoAtual', PROJETO_ATUAL); // Salvar para próximas vezes
}

// --- CARREGAR DADOS DO FIREBASE ---
async function carregarDados() {
    try {
        console.log('📂 Carregando dados...');
        
        const doc = await db.collection('projetos').doc(PROJETO_ATUAL).get();
        
        if (doc.exists) {
            dadosObra = doc.data();
            console.log('✅ Dados carregados');
            console.log('   Nome:', dadosObra.info_projeto?.nome_obra);
            return true;
        } else {
            console.log('⚠️ Documento não encontrado');
            return false;
        }
    } catch (erro) {
        console.error('❌ Erro:', erro);
        return false;
    }
}

// --- ATUALIZAR NOME ---
function atualizarNomeProjeto() {
    if (!dadosObra) {
        console.log('⚠️ dadosObra é null');
        return;
    }
    
    console.log('📝 Nome do projeto:', nomeProjeto);
    
    const el = document.getElementById('nome-projeto');
    if (el) {
        el.textContent = nomeProjeto;
        console.log('✅ Nome atualizado:', nomeProjeto);
    } else {
        console.log('⚠️ Elemento #nome-projeto não encontrado');
    }
}

// --- INICIALIZAR ---
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Inicializando...');
    
    inicializarProjeto();
    
    const ok = await carregarDados();
    
    if (ok) {
        atualizarNomeProjeto();
        console.log('✅ Pronto!');
    }
});