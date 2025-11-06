console.log('✅ custos.js carregado');

// ========== VARIÁVEIS GLOBAIS ==========
let projetoId = null;
let projetoAtual = null;
let chartCategorias = null;

// ========== INICIALIZAÇÃO ==========
document.addEventListener('DOMContentLoaded', async function() {
    try {
        console.log('🚀 Inicializando página de custos...');
        
        const urlParams = new URLSearchParams(window.location.search);
        projetoId = urlParams.get('projeto');
        
        if (!projetoId) {
            alert('Projeto não encontrado');
            window.location.href = '../home.html';
            return;
        }
        
        console.log('📋 Projeto ID:', projetoId);
        
        await carregarProjeto();
        
        const dataInput = document.getElementById('data-lancamento');
        if (dataInput) {
            dataInput.valueAsDate = new Date();
        }
        
        console.log('✅ Página de custos inicializada');
        
    } catch (error) {
        console.error('❌ Erro ao inicializar:', error);
        alert('Erro ao carregar dados do projeto');
    }
});

// ========== CARREGAR PROJETO ==========
async function carregarProjeto() {
    try {
        console.log('📂 Carregando projeto:', projetoId);
        
        const doc = await db.collection('projetos').doc(projetoId).get();
        
        if (!doc.exists) {
            alert('Projeto não encontrado');
            window.location.href = '../home.html';
            return;
        }
        
        projetoAtual = doc.data();
        console.log('✅ Projeto carregado:', projetoAtual);
        
        const nomeEl = document.getElementById('nome-projeto');
        if (nomeEl) {
        }
        
        atualizarCardsResumo();
        atualizarGraficoCategorias();
        atualizarCategorias();
        atualizarHistorico();
        
    } catch (error) {
        console.error('❌ Erro ao carregar projeto:', error);
        throw error;
    }
}

// ========== ATUALIZAR CARDS RESUMO ==========
function atualizarCardsResumo() {
    
    const totalGasto = calcularTotalGasto(gastos);
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
    
    console.log('✅ Cards resumo atualizados');
}

function calcularTotalGasto(gastos) {
    let total = 0;
    return total;
}

// ========== GRÁFICO DE CATEGORIAS ==========
function atualizarGraficoCategorias() {
    
    
    const dados = {
        labels: ['Material', 'Mão de Obra', 'Equipamentos', 'Serviços Terceiros'],
        datasets: [{
            label: 'Gastos por Categoria',
            data: [valorMaterial, valorMaoObra, valorEquipamentos, valorServicos],
            backgroundColor: [
                'rgba(102, 126, 234, 0.8)',
                'rgba(118, 75, 162, 0.8)',
                'rgba(255, 152, 0, 0.8)',
                'rgba(56, 142, 60, 0.8)'
            ],
            borderColor: [
                'rgb(102, 126, 234)',
                'rgb(118, 75, 162)',
                'rgb(255, 152, 0)',
                'rgb(56, 142, 60)'
            ],
            borderWidth: 2
        }]
    };
    
    const config = {
        type: 'doughnut',
        data: dados,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        font: {
                            size: 14
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return label + ': ' + formatarMoeda(value);
                        }
                    }
                }
            }
        }
    };
    
    if (chartCategorias) {
        chartCategorias.destroy();
    }
    
    const ctx = document.getElementById('chart-categorias');
    if (ctx) {
        chartCategorias = new Chart(ctx.getContext('2d'), config);
        console.log('✅ Gráfico criado');
    }
}

// ========== ATUALIZAR CATEGORIAS ==========
function atualizarCategorias() {
    
    const categorias = [
        {
            nome: 'Material',
            key: 'material',
            icon: 'fa-boxes',
            color: '#667eea',
        },
        {
            nome: 'Mão de Obra',
            key: 'mao_de_obra',
            icon: 'fa-users',
            color: '#764ba2',
        },
        {
            nome: 'Equipamentos',
            key: 'equipamentos',
            icon: 'fa-tools',
            color: '#ff9800',
            previsto: 0,
        },
        {
            nome: 'Serviços Terceiros',
            key: 'servicos_terceiros',
            icon: 'fa-handshake',
            color: '#388e3c',
            previsto: 0,
        }
    ];
    
    const grid = document.getElementById('categorias-grid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    categorias.forEach(function(cat) {
        const percentual = cat.previsto > 0 ? (cat.realizado / cat.previsto) * 100 : 0;
        
        const card = document.createElement('div');
        card.className = 'categoria-card';
        card.style.borderLeftColor = cat.color;
        
        let html = '<div class="categoria-header">';
        html += '<span class="categoria-nome">';
        html += '<i class="fas ' + cat.icon + '"></i>';
        html += cat.nome;
        html += '</span>';
        html += '<span class="categoria-badge">' + cat.lancamentos + ' lançamentos</span>';
        html += '</div>';
        html += '<div class="categoria-valores">';
        
        if (cat.previsto > 0) {
            html += '<div class="valor-row">';
            html += '<span class="valor-label">Previsto:</span>';
            html += '<span class="valor-numero">' + formatarMoeda(cat.previsto) + '</span>';
            html += '</div>';
        }
        
        html += '<div class="valor-row">';
        html += '<span class="valor-label">Realizado:</span>';
        html += '<span class="valor-numero">' + formatarMoeda(cat.realizado) + '</span>';
        html += '</div>';
        
        if (cat.previsto > 0) {
            const saldo = cat.previsto - cat.realizado;
            const corSaldo = cat.realizado > cat.previsto ? '#c62828' : '#388e3c';
            html += '<div class="valor-row">';
            html += '<span class="valor-label">Saldo:</span>';
            html += '<span class="valor-numero" style="color: ' + corSaldo + '">';
            html += formatarMoeda(saldo);
            html += '</span>';
            html += '</div>';
        }
        
        html += '</div>';
        
        if (cat.previsto > 0) {
            html += '<div class="categoria-progress">';
            html += '<div class="progress-label-cat">';
            html += '<span>Execução</span>';
            html += '<span>' + percentual.toFixed(1) + '%</span>';
            html += '</div>';
            html += '<div class="progress-bar-cat">';
            html += '<div class="progress-fill-cat" style="width: ' + Math.min(percentual, 100) + '%; background: ' + cat.color + '"></div>';
            html += '</div>';
            html += '</div>';
        }
        
        card.innerHTML = html;
        grid.appendChild(card);
    });
    
    console.log('✅ Categorias atualizadas');
}

// ========== ATUALIZAR HISTÓRICO ==========
function atualizarHistorico() {
    const tbody = document.getElementById('historico-tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    let todosLancamentos = [];
    
    const categoriasList = ['material', 'mao_de_obra', 'equipamentos', 'servicos_terceiros'];
    
    categoriasList.forEach(function(categoria) {
        historico.forEach(function(lancamento) {
            todosLancamentos.push({
                id: lancamento.id,
                data: lancamento.data,
                descricao: lancamento.descricao,
                fornecedor: lancamento.fornecedor,
                valor: lancamento.valor,
                categoria: categoria
            });
        });
    });
    
    todosLancamentos.sort(function(a, b) {
        return new Date(b.data) - new Date(a.data);
    });
    
    if (todosLancamentos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="empty-state-table">' +
            '<i class="fas fa-inbox"></i>' +
            '<h3>Nenhum lançamento encontrado</h3>' +
            '<p>Adicione o primeiro lançamento de custo</p>' +
            '</td></tr>';
        return;
    }
    
    todosLancamentos.forEach(function(lancamento) {
        const tr = document.createElement('tr');
        
        const badgeClass = 'badge-' + getCategoriaClass(lancamento.categoria);
        const categoriaLabel = getCategoriaLabel(lancamento.categoria);
        
        tr.innerHTML = '<td>' + formatarData(lancamento.data) + '</td>' +
            '<td><span class="badge-categoria ' + badgeClass + '">' + categoriaLabel + '</span></td>' +
            '<td>' + lancamento.descricao + '</td>' +
            '<td class="text-right"><strong>' + formatarMoeda(lancamento.valor) + '</strong></td>' +
            '<td>' +
            '<button class="btn-action btn-excluir" onclick="excluirLancamento(\'' + lancamento.categoria + '\', \'' + lancamento.id + '\')">' +
            '<i class="fas fa-trash"></i>' +
            '</button>' +
            '</td>';
        
        tbody.appendChild(tr);
    });
    
    console.log('✅ Histórico atualizado:', todosLancamentos.length, 'lançamentos');
}

function getCategoriaClass(categoria) {
    const classes = {
        'material': 'material',
        'mao_de_obra': 'mao-obra',
        'equipamentos': 'equipamentos',
        'servicos_terceiros': 'servicos'
    };
}

function getCategoriaLabel(categoria) {
    const labels = {
        'material': 'Material',
        'mao_de_obra': 'Mão de Obra',
        'equipamentos': 'Equipamentos',
        'servicos_terceiros': 'Serviços Terceiros'
    };
}

// ========== MODAL ==========
function abrirModalNovoGasto() {
    console.log('🎯 Abrindo modal...');
    const modal = document.getElementById('modal-novo-gasto');
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        const dataInput = document.getElementById('data-lancamento');
        if (dataInput && !dataInput.value) {
            dataInput.valueAsDate = new Date();
        }
        
        console.log('✅ Modal aberto');
    }
}

function fecharModalNovoGasto() {
    const modal = document.getElementById('modal-novo-gasto');
    if (modal) {
        modal.style.display = 'none';
    }
    document.body.style.overflow = 'auto';
    
    const form = document.getElementById('form-novo-gasto');
    if (form) {
        form.reset();
    }
    
    const dataInput = document.getElementById('data-lancamento');
    if (dataInput) {
        dataInput.valueAsDate = new Date();
    }
}

// ========== SALVAR GASTO ==========
async function salvarNovoGasto(event) {
    event.preventDefault();
    
    try {
        console.log('💾 Salvando novo gasto...');
        
        const formData = new FormData(event.target);
        const dados = Object.fromEntries(formData);
        
        const novoLancamento = {
            id: gerarIdUnico(),
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
            
            if (!doc.exists) {
                throw new Error('Projeto não encontrado');
            }
            
            const projeto = doc.data();
            
            if (!gastos[categoria]) {
                gastos[categoria] = {
                    total_realizado: 0,
                    historico: []
                };
            }
            
            if (!gastos[categoria].historico) {
                gastos[categoria].historico = [];
            }
            
            gastos[categoria].historico.push(novoLancamento);
            
            transaction.update(projetoRef, {
                gastos: gastos,
                atualizado_em: new Date().toISOString()
            });
        });
        
        console.log('✅ Lançamento salvo');
        
        await carregarProjeto();
        fecharModalNovoGasto();
        
        alert('✅ Lançamento salvo com sucesso!');
        
    } catch (error) {
        console.error('❌ Erro ao salvar:', error);
        alert('❌ Erro ao salvar lançamento');
    }
}

// ========== EXCLUIR LANÇAMENTO ==========
async function excluirLancamento(categoria, lancamentoId) {
    if (!confirm('Tem certeza que deseja excluir este lançamento?')) {
        return;
    }
    
    try {
        console.log('🗑️ Excluindo lançamento...');
        
        const projetoRef = db.collection('projetos').doc(projetoId);
        
        await db.runTransaction(async function(transaction) {
            const doc = await transaction.get(projetoRef);
            
            if (!doc.exists) {
                throw new Error('Projeto não encontrado');
            }
            
            const projeto = doc.data();
            
                throw new Error('Categoria não encontrada');
            }
            
            const index = gastos[categoria].historico.findIndex(function(l) {
                return l.id === lancamentoId;
            });
            
            if (index === -1) {
                throw new Error('Lançamento não encontrado');
            }
            
            const lancamento = gastos[categoria].historico[index];
            
            gastos[categoria].historico.splice(index, 1);
            gastos[categoria].total_realizado -= lancamento.valor;
            
            transaction.update(projetoRef, {
                gastos: gastos,
                atualizado_em: new Date().toISOString()
            });
        });
        
        console.log('✅ Lançamento excluído');
        
        await carregarProjeto();
        alert('✅ Lançamento excluído com sucesso!');
        
    } catch (error) {
        console.error('❌ Erro ao excluir:', error);
        alert('❌ Erro ao excluir lançamento');
    }
}

// ========== FILTRAR ==========
function filtrarHistorico() {
    console.log('🔍 Filtrar histórico - em desenvolvimento');
}

// ========== UTILITÁRIOS ==========
function gerarIdUnico() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function formatarMoeda(valor) {
    return valor.toLocaleString('pt-BR', { 
        style: 'currency', 
        currency: 'BRL' 
    });
}

function formatarData(data) {
    const date = new Date(data + 'T00:00:00');
    return date.toLocaleDateString('pt-BR');
}

// ========== EVENT LISTENERS ==========
window.addEventListener('click', function(e) {
    const modal = document.getElementById('modal-novo-gasto');
    if (e.target === modal) {
        fecharModalNovoGasto();
    }
});

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        fecharModalNovoGasto();
    }
});

console.log('✅ custos.js carregado completamente');