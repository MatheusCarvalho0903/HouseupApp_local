console.log('🚀 Script de Custos Carregado');

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
            console.log('   Estrutura completa:', dadosObra);
            return true;
        }
    } catch (erro) {
        console.error('❌ Erro:', erro);
    }
    return false;
}

// --- INICIALIZAR ---
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Inicializando...');
    
    inicializarProjeto();
    await carregarDados();
});