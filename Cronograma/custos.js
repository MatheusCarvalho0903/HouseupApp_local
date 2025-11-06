console.log('✅ TESTE: arquivo carregado');

let projetoId = null;
let projetoAtual = null;

// Inicializar
document.addEventListener('DOMContentLoaded', async function() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        projetoId = urlParams.get('projeto');
        
        if (!projetoId) {
            alert('Projeto não encontrado');
            window.location.href = '../home.html';
            return;
        }
        
        await carregarProjeto();
        
        const dataInput = document.getElementById('data-lancamento');
        if (dataInput) {
            dataInput.valueAsDate = new Date();
        }
        
    } catch (error) {
        console.error('❌ Erro:', error);
    }
});

// Carregar projeto
async function carregarProjeto() {
    try {
        const doc = await db.collection('projetos').doc(projetoId).get();
        
        if (!doc.exists) {
            alert('Projeto não encontrado');
            window.location.href = '../home.html';
            return;
        }
        
        projetoAtual = doc.data();
        
        const nomeEl = document.getElementById('nome-projeto');
        if (nomeEl) {
        }
        
        atualizarCardsResumo();
        atualizarHistorico();
        
    } catch (error) {
        console.error('❌ Erro:', error);
    }
}

// Atualizar cards
function atualizarCardsResumo() {
    
    let totalGasto = 0;
    
    const saldoRestante = orcamento - totalGasto;
    const percentualGasto = orcamento > 0 ? (totalGasto / orcamento) * 100 : 0;
    
    const orcamentoEl = document.getElementById('orcamento-total');
    const gastoEl = document.getElementById('total-gasto');
    const saldoEl = document.getElementById('saldo-restante');
    const percentualEl = document.getElementById('percentual-gasto');
    
    if (orcamentoEl) orcamentoEl.textContent = formatarMoeda(orcamento);
    if (gastoEl) gastoEl.textContent = formatarMoeda(totalGasto);
    if (saldoEl) {
        saldoEl.textContent = formatarMoeda(saldoRestante);
        saldoEl.style.color = saldoRestante < 0 ? '#c62828' : '#333';
    }
    if (percentualEl) percentualEl.textContent = percentualGasto.toFixed(1) + '%';
}

// Atualizar histórico
function atualizarHistorico() {
    const tbody = document.getElementById('historico-tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    let todosLancamentos = [];
    const cats = ['material', 'mao_de_obra', 'equipamentos', 'servicos_terceiros'];
    
    cats.forEach(function(cat) {
        hist.forEach(function(lanc) {
            todosLancamentos.push({
                id: lanc.id,
                data: lanc.data,
                descricao: lanc.descricao,
                fornecedor: lanc.fornecedor,
                valor: lanc.valor,
                categoria: cat
            });
        });
    });
    
    todosLancamentos.sort(function(a, b) {
        return new Date(b.data) - new Date(a.data);
    });
    
    if (todosLancamentos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:20px;">Nenhum lançamento encontrado</td></tr>';
        return;
    }
    
    todosLancamentos.forEach(function(lanc) {
        const tr = document.createElement('tr');
        tr.innerHTML = 
            '<td>' + formatarData(lanc.data) + '</td>' +
            '<td>' + getLabelCategoria(lanc.categoria) + '</td>' +
            '<td>' + lanc.descricao + '</td>' +
            '<td style="text-align:right"><strong>' + formatarMoeda(lanc.valor) + '</strong></td>' +
            '<td><button onclick="excluirLancamento(\'' + lanc.categoria + '\',\'' + lanc.id + '\')">🗑️</button></td>';
        tbody.appendChild(tr);
    });
}

function getLabelCategoria(cat) {
    const labels = {
        'material': 'Material',
        'mao_de_obra': 'Mão de Obra',
        'equipamentos': 'Equipamentos',
        'servicos_terceiros': 'Serviços Terceiros'
    };
}

// Modal
function abrirModalNovoGasto() {
    const modal = document.getElementById('modal-novo-gasto');
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

function fecharModalNovoGasto() {
    const modal = document.getElementById('modal-novo-gasto');
    if (modal) {
        modal.style.display = 'none';
    }
    document.body.style.overflow = 'auto';
}

// Salvar
async function salvarNovoGasto(event) {
    event.preventDefault();
    
    try {
        const formData = new FormData(event.target);
        const dados = Object.fromEntries(formData);
        
        const novoLanc = {
            id: Date.now().toString(36) + Math.random().toString(36).substr(2),
            data: dados['data-lancamento'],
            descricao: dados.descricao,
            valor: parseFloat(dados.valor),
            forma_pagamento: dados['forma-pagamento'],
            criado_em: new Date().toISOString(),
            criado_por: 'Matheus'
        };
        
        const categoria = dados.categoria;
        const projetoRef = db.collection('projetos').doc(projetoId);
        
        await db.runTransaction(async function(transaction) {
            const doc = await transaction.get(projetoRef);
            const projeto = doc.data();
            
            if (!gastos[categoria]) {
                gastos[categoria] = { total_realizado: 0, historico: [] };
            }
            if (!gastos[categoria].historico) {
                gastos[categoria].historico = [];
            }
            
            gastos[categoria].historico.push(novoLanc);
            
            transaction.update(projetoRef, {
                gastos: gastos,
                atualizado_em: new Date().toISOString()
            });
        });
        
        await carregarProjeto();
        fecharModalNovoGasto();
        alert('✅ Lançamento salvo!');
        
    } catch (error) {
        console.error('❌ Erro:', error);
        alert('❌ Erro ao salvar');
    }
}

// Excluir
async function excluirLancamento(categoria, lancId) {
    if (!confirm('Excluir este lançamento?')) return;
    
    try {
        const projetoRef = db.collection('projetos').doc(projetoId);
        
        await db.runTransaction(async function(transaction) {
            const doc = await transaction.get(projetoRef);
            const projeto = doc.data();
            
            const idx = gastos[categoria].historico.findIndex(function(l) {
                return l.id === lancId;
            });
            
            if (idx === -1) throw new Error('Lançamento não encontrado');
            
            const lanc = gastos[categoria].historico[idx];
            gastos[categoria].historico.splice(idx, 1);
            gastos[categoria].total_realizado -= lanc.valor;
            
            transaction.update(projetoRef, {
                gastos: gastos,
                atualizado_em: new Date().toISOString()
            });
        });
        
        await carregarProjeto();
        alert('✅ Excluído!');
        
    } catch (error) {
        console.error('❌ Erro:', error);
        alert('❌ Erro ao excluir');
    }
}

// Utils
function formatarMoeda(valor) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatarData(data) {
    const d = new Date(data + 'T00:00:00');
    return d.toLocaleDateString('pt-BR');
}

// Events
window.addEventListener('click', function(e) {
    if (e.target.id === 'modal-novo-gasto') {
        fecharModalNovoGasto();
    }
});

console.log('✅ TESTE: arquivo completo');