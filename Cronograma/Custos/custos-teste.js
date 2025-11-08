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
// --- FORMATAR MOEDA ---
function formatarMoeda(valor) {
    return valor.toLocaleString('pt-BR', { 
        style: 'currency', 
        currency: 'BRL' 
    });
}

// --- CALCULAR TOTAIS ---
function calcularTotais() {
    let totalGasto = 0;
    
    // Somar todos os custos
    if (dadosObra.custos) {
        Object.keys(dadosObra.custos).forEach(categoria => {
            detalhes.forEach(custo => {
            });
        });
    }
    
    console.log('💰 Total gasto:', totalGasto);
    return totalGasto;
}

// --- ATUALIZAR CARDS ---
function atualizarCards() {
    console.log('🎨 Atualizando cards...');
    
    const totalGasto = calcularTotais();
    const orcamento = 100000; // Exemplo: R$ 100.000
    const saldo = orcamento - totalGasto;
    const percentual = ((totalGasto / orcamento) * 100).toFixed(1);
    
    console.log('   Orçamento:', formatarMoeda(orcamento));
    console.log('   Gasto:', formatarMoeda(totalGasto));
    console.log('   Saldo:', formatarMoeda(saldo));
    console.log('   Percentual:', percentual + '%');
    
    // Atualizar elementos
    const els = {
        'orcamento-total': formatarMoeda(orcamento),
        'total-gasto': formatarMoeda(totalGasto),
        'saldo-restante': formatarMoeda(saldo),
        'percentual-gasto': percentual + '%'
    };
    
    Object.keys(els).forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.textContent = els[id];
            console.log(`   ✅ ${id} atualizado`);
        }
    });
}

// --- INICIALIZAR ---
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Inicializando...');
    
    inicializarProjeto();
    const ok = await carregarDados();
    
    if (ok && dadosObra) {
        atualizarNomeProjeto();
        atualizarCards();  // 🆕 ADICIONE ESTA LINHA
        console.log('✅ Pronto!');
    }
});