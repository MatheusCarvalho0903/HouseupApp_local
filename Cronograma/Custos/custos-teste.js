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
            
            // Buscar histórico de gastos do cronograma
            const gastosDoc = await db.collection('projetos').doc(PROJETO_ATUAL).collection('gastos').doc('historico').get();
            
            if (gastosDoc.exists) {
                const historico = gastosDoc.data();
                console.log('📊 Histórico de gastos encontrado:', historico);
                
                // Armazenar no dadosObra para usar depois
                dadosObra.gastos_historico = historico;
            } else {
                console.log('⚠️ Sem histórico de gastos');
                dadosObra.gastos_historico = { historico: [] };
            }
            
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
    
    // Somar gastos do histórico do cronograma
    if (dadosObra.gastos_historico?.historico) {
        dadosObra.gastos_historico.historico.forEach(gasto => {
        });
        console.log('💰 Gastos do cronograma:', totalGasto);
    }
    
    // Pegar orçamento do Firebase
    
    console.log('💵 Orçamento:', orcamento);
    
    return { totalGasto, orcamento };
}
    
    // Pegar orçamento do Firebase
    
    console.log('💰 Total gasto:', totalGasto);
    console.log('💵 Orçamento:', orcamento);
    
    return { totalGasto, orcamento };
}

// --- ATUALIZAR CARDS ---
function atualizarCards() {
    console.log('🎨 Atualizando cards...');
    
    const { totalGasto, orcamento } = calcularTotais();
    const saldo = orcamento - totalGasto;
    const percentual = orcamento > 0 ? ((totalGasto / orcamento) * 100).toFixed(1) : 0;
    
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