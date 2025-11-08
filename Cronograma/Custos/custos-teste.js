console.log('🚀 Script de Custos Carregado');

// --- VARIÁVEIS GLOBAIS ---
let PROJETO_ATUAL = 'angela-marco';
let dadosObra = null;

// --- INICIALIZAR PROJETO ---
function inicializarProjeto() {
    const urlParams = new URLSearchParams(window.location.search);
    const projetoUrl = urlParams.get('projeto');
    
    
    console.log('🏗️ Projeto:', PROJETO_ATUAL);
}

// --- CARREGAR DADOS ---
async function carregarDados() {
    try {
        console.log('📂 Carregando dados...');
        
        const doc = await db.collection('projetos').doc(PROJETO_ATUAL).get();
        
        if (doc.exists) {
            dadosObra = doc.data();
            console.log('✅ Dados carregados');
            console.log('   Nome:', dadosObra.info_projeto.nome_obra);
            return true;
        }
    } catch (erro) {
        console.error('❌ Erro:', erro);
    }
    return false;
}

// --- ATUALIZAR NOME ---
function atualizarNomeProjeto() {
    console.log('📝 Atualizando nome...');
    
    const el = document.getElementById('nome-projeto');
    const txt = dadosObra.info_projeto.nome_obra;
    
    console.log('   Elemento:', el);
    console.log('   Texto:', txt);
    
    if (el) {
        el.textContent = txt;
        console.log('✅ Nome atualizado');
    }
}

// --- INICIALIZAR ---
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Inicializando...');
    
    inicializarProjeto();
    const ok = await carregarDados();
    
    if (ok && dadosObra) {
        atualizarNomeProjeto();
        console.log('✅ Pronto!');
    }
});