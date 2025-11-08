console.log('🚀 Script de Custos Carregado');

// --- VARIÁVEIS GLOBAIS ---
let PROJETO_ATUAL;
let dadosObra = null;

// --- INICIALIZAR PROJETO ---
function inicializarProjeto() {
    PROJETO_ATUAL = localStorage.getItem('projetoAtual');
    
    if (!PROJETO_ATUAL) {
        console.error('❌ Projeto não encontrado no localStorage');
        PROJETO_ATUAL = 'angela-marco'; // fallback
    }
    
    console.log('🏗️ Projeto:', PROJETO_ATUAL);
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
    const el = document.getElementById('nome-projeto');
    if (el) {
        el.textContent = nome;
        console.log('✅ Nome:', nome);
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