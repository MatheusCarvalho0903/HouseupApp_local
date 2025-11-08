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
    
    if (el) {
        el.textContent = txt;
        console.log('✅ Nome atualizado:', txt);
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
    
    // Somar gastos do histórico
    if (dadosObra.gastos && dadosObra.gastos.historico && Array.isArray(dadosObra.gastos.historico)) {
        dadosObra.gastos.historico.forEach(gasto => {
        });
        console.log('💰 Total do histórico:', totalGasto);
    }
    
    // Pegar orçamento
    let orcamento = 0;
    if (dadosObra.orcamento && dadosObra.orcamento.valor_total_previsto) {
        orcamento = dadosObra.orcamento.valor_total_previsto;
    }
    console.log('💵 Orçamento:', orcamento);
    
    return {
        totalGasto: totalGasto,
        orcamento: orcamento
    };
}

// --- ATUALIZAR CARDS ---
function atualizarCards() {
    console.log('🎨 Atualizando cards...');
    
    const totais = calcularTotais();
    const totalGasto = totais.totalGasto;
    const orcamento = totais.orcamento;
    const saldo = orcamento - totalGasto;
    const percentual = orcamento > 0 ? ((totalGasto / orcamento) * 100).toFixed(1) : 0;
    
    console.log('   Orçamento:', formatarMoeda(orcamento));
    console.log('   Gasto:', formatarMoeda(totalGasto));
    console.log('   Saldo:', formatarMoeda(saldo));
    console.log('   Percentual:', percentual + '%');
    
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
// --- CRIAR GRÁFICO ---
function criarGrafico() {
    console.log('📊 Criando gráfico...');
    
    const ctx = document.getElementById('chart-categorias');
    if (!ctx) {
        console.log('⚠️ Elemento chart-categorias não encontrado');
        return;
    }
    
    let material = 0;
    let maoObra = 0;
    let equipamentos = 0;
    let servicos = 0;
    
    if (dadosObra.gastos && dadosObra.gastos.historico && Array.isArray(dadosObra.gastos.historico)) {
        dadosObra.gastos.historico.forEach(gasto => {
            const categoria = gasto.categoria ? gasto.categoria.toString().toLowerCase() : '';
            
            console.log('   Gasto:', gasto.descricao, '-', valor, '-', categoria);
            
            if (categoria.includes('material')) {
                material += valor;
                maoObra += valor;
            } else if (categoria.includes('equipament')) {
                equipamentos += valor;
                servicos += valor;
            }
        });
    }
    
    console.log('   Material:', formatarMoeda(material));
    console.log('   Mão de Obra:', formatarMoeda(maoObra));
    console.log('   Equipamentos:', formatarMoeda(equipamentos));
    console.log('   Serviços:', formatarMoeda(servicos));
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Material', 'Mão de Obra', 'Equipamentos', 'Serviços Terceiros'],
            datasets: [{
                data: [material, maoObra, equipamentos, servicos],
                backgroundColor: [
                    '#667eea',
                    '#764ba2',
                    '#f093fb',
                    '#f5576c'
                ],
                borderColor: '#fff',
                borderWidth: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        font: { size: 12 }
                    }
                }
            }
        }
    });
    
    console.log('✅ Gráfico criado');
}

// --- INICIALIZAR ---
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Inicializando...');
    
    inicializarProjeto();
    const ok = await carregarDados();
    
    if (ok && dadosObra) {
        atualizarNomeProjeto();
        atualizarCards();
        criarGrafico();
        console.log('✅ Pronto!');
    }
});