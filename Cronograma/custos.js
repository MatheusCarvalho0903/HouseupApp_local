// ========== VARIÁVEIS GLOBAIS ==========
let projetoId = null;
let projetoAtual = null;
let chartCategorias = null;

// ========== INICIALIZAÇÃO ==========
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Obter ID do projeto da URL
        const urlParams = new URLSearchParams(window.location.search);
        projetoId = urlParams.get('projeto');
        
        if (!projetoId) {
            alert('Projeto não encontrado');
            window.location.href = '../home.html';
            return;
        }
        
        // Carregar dados do projeto
        await carregarProjeto();
        
        // Definir data atual no campo de data
        document.getElementById('data-lancamento').valueAsDate = new Date();
        
    } catch (error) {
        console.error('Erro ao inicializar:', error);
        alert('Erro ao carregar dados do projeto');
    }
});

// ========== CARREGAR PROJETO ==========
async function carregarProjeto() {
    try {
        const doc = await db.collection('projetos').doc(projetoId).get();
        
        if (!doc.exists) {
            alert('Projeto não encontrado');
            window.location.href = '../home.html';
            return;
        }
        
        projetoAtual = doc.data();
        
        // Atualizar nome do projeto
        document.getElementById('nome-projeto').textContent = projetoAtual.info_projeto.nome_obra;
        
        // Atualizar cards resumo
        atualizarCardsResumo();
        
        // Atualizar gráfico
        atualizarGraficoCategorias();
        
        // Atualizar categorias
        atualizarCategorias();
        
        // Atualizar histórico
        atualizarHistorico();
        
    } catch (error) {
        console.error('Erro ao carregar projeto:', error);
        throw error;
    }
}

// ========== ATUALIZAR CARDS RESUMO ==========
function atualizarCardsResumo() {
    
    const totalGasto = calcularTotalGasto(gastos);
    const saldoRestante = orcamento - totalGasto;
    const percentualGasto = orcamento > 0 ? (totalGasto / orcamento) * 100 : 0;
    
    document.getElementById('orcamento-total').textContent = formatarMoeda(orcamento);
    document.getElementById('total-gasto').textContent = formatarMoeda(totalGasto);
    document.getElementById('saldo-restante').textContent = formatarMoeda(saldoRestante);
    document.getElementById('percentual-gasto').textContent = percentualGasto.toFixed(1) + '%';
    
    // Adicionar classe de alerta se ultrapassar orçamento
    const cardSaldo = document.getElementById('saldo-restante');
    if (saldoRestante < 0) {
        cardSaldo.style.color = '#c62828';
    } else {
        cardSaldo.style.color = '#333';
    }
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
            label: 'Gastos por Categoria (R$)',
            data: [
            ],
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
                            if (label) {
                                label += ': ';
                            }
                            label += formatarMoeda(context.parsed);
                            return label;
                        }
                    }
                }
            }
        }
    };
    
    // Destruir gráfico anterior se existir
    if (chartCategorias) {
        chartCategorias.destroy();
    }
    
    const ctx = document.getElementById('chart-categorias').getContext('2d');
    chartCategorias = new Chart(ctx, config);
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
    grid.innerHTML = '';
    
    categorias.forEach(cat => {
        const percentual = cat.previsto > 0 ? (cat.realizado / cat.previsto) * 100 : 0;
        
        const card = document.createElement('div');
        card.className = 'categoria-card';
        card.style.borderLeftColor = cat.color;
        
        card.innerHTML = `
            <div class="categoria-header">
                <span class="categoria-nome">
                    <i class="fas ${cat.icon}"></i>
                    ${cat.nome}
                </span>
                <span class="categoria-badge">${cat.lancamentos} lançamentos</span>
            </div>
            <div class="categoria-valores">
                ${cat.previsto > 0 ? `
                    <div class="valor-row">
                        <span class="valor-label">Previsto:</span>
                        <span class="valor-numero">${formatarMoeda(cat.previsto)}</span>
                    </div>
                ` : ''}
                <div class="valor-row">
                    <span class="valor-label">Realizado:</span>
                    <span class="valor-numero">${formatarMoeda(cat.realizado)}</span>
                </div>
                ${cat.previsto > 0 ? `
                    <div class="valor-row">
                        <span class="valor-label">Saldo:</span>
                        <span class="valor-numero" style="color: ${cat.realizado > cat.previsto ? '#c62828' : '#388e3c'}">
                            ${formatarMoeda(cat.previsto - cat.realizado)}
                        </span>
                    </div>
                ` : ''}
            </div>
            ${cat.previsto > 0 ? `
                <div class="categoria-progress">
                    <div class="progress-label-cat">
                        <span>Execução</span>
                        <span>${percentual.toFixed(1)}%</span>
                    </div>
                    <div class="progress-bar-cat">
                        <div class="progress-fill-cat" style="width: ${Math.min(percentual, 100)}%; background: ${cat.color}"></div>
                    </div>
                </div>
            ` : ''}
        `;
        
        grid.appendChild(card);
    });
}

// ========== ATUALIZAR HISTÓRICO ==========
function atualizarHistorico() {
    const tbody = document.getElementById('historico-tbody');
    tbody.innerHTML = '';
    
    // Coletar todos os lançamentos
    let todosLancamentos = [];
    
    Object.keys(gastos).forEach(categoria => {
        historico.forEach(lancamento => {
            todosLancamentos.push({
                ...lancamento,
                categoria: categoria
            });
        });
    });
    
    // Ordenar por data (mais recente primeiro)
    todosLancamentos.sort((a, b) => new Date(b.data) - new Date(a.data));
    
    if (todosLancamentos.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-state-table">
                    <i class="fas fa-inbox"></i>
                    <h3>Nenhum lançamento encontrado</h3>
                    <p>Adicione o primeiro lançamento de custo</p>
                </td>
            </tr>
        `;
        return;
    }
    
    todosLancamentos.forEach(lancamento => {
        const tr = document.createElement('tr');
        
        tr.innerHTML = `
            <td>${formatarData(lancamento.data)}</td>
            <td><span class="badge-categoria badge-${getCategoriaClass(lancamento.categoria)}">${getCategoriaLabel(lancamento.categoria)}</span></td>
            <td>${lancamento.descricao}</td>
            <td class="text-right"><strong>${formatarMoeda(lancamento.valor)}</strong></td>
            <td>
                <button class="btn-action btn-editar" onclick="editarLancamento('${lancamento.categoria}', '${lancamento.id}')">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="btn-action btn-excluir" onclick="excluirLancamento('${lancamento.categoria}', '${lancamento.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        tbody.appendChild(tr);
    });
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

// ========== MODAL NOVO GASTO ==========
function abrirModalNovoGasto() {
    console.log('Tentando abrir modal...'); // ← ADICIONE ESTA LINHA
    const modal = document.getElementById('modal-novo-gasto');
    console.log('Modal encontrado:', modal); // ← ADICIONE ESTA LINHA
    
    if (!modal) {
        console.error('Modal não encontrado!');
        return;
    }
    
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}
function fecharModalNovoGasto() {
    document.getElementById('modal-novo-gasto').style.display = 'none';
    document.body.style.overflow = 'auto';
    document.getElementById('form-novo-gasto').reset();
    document.getElementById('data-lancamento').valueAsDate = new Date();
}

// ========== SALVAR NOVO GASTO ==========
async function salvarNovoGasto(event) {
    event.preventDefault();
    
    try {
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
        
        // Atualizar Firebase
        const projetoRef = db.collection('projetos').doc(projetoId);
        
        await db.runTransaction(async (transaction) => {
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
            
            // Adicionar lançamento ao histórico
            gastos[categoria].historico.push(novoLancamento);
            
            // Atualizar total realizado
            
            // Atualizar documento
            transaction.update(projetoRef, {
                gastos: gastos,
                atualizado_em: new Date().toISOString()
            });
        });
        
        // Recarregar projeto
        await carregarProjeto();
        
        // Fechar modal
        fecharModalNovoGasto();
        
        alert('✅ Lançamento salvo com sucesso!');
        
    } catch (error) {
        console.error('Erro ao salvar lançamento:', error);
        alert('❌ Erro ao salvar lançamento. Tente novamente.');
    }
}

// ========== EXCLUIR LANÇAMENTO ==========
async function excluirLancamento(categoria, lancamentoId) {
    if (!confirm('Tem certeza que deseja excluir este lançamento?')) {
        return;
    }
    
    try {
        const projetoRef = db.collection('projetos').doc(projetoId);
        
        await db.runTransaction(async (transaction) => {
            const doc = await transaction.get(projetoRef);
            
            if (!doc.exists) {
                throw new Error('Projeto não encontrado');
            }
            
            const projeto = doc.data();
            
                throw new Error('Categoria não encontrada');
            }
            
            // Encontrar lançamento
            const index = gastos[categoria].historico.findIndex(l => l.id === lancamentoId);
            
            if (index === -1) {
                throw new Error('Lançamento não encontrado');
            }
            
            const lancamento = gastos[categoria].historico[index];
            
            // Remover do histórico
            gastos[categoria].historico.splice(index, 1);
            
            // Atualizar total realizado
            gastos[categoria].total_realizado -= lancamento.valor;
            
            // Atualizar documento
            transaction.update(projetoRef, {
                gastos: gastos,
                atualizado_em: new Date().toISOString()
            });
        });
        
        // Recarregar projeto
        await carregarProjeto();
        
        alert('✅ Lançamento excluído com sucesso!');
        
    } catch (error) {
        console.error('Erro ao excluir lançamento:', error);
        alert('❌ Erro ao excluir lançamento. Tente novamente.');
    }
}

// ========== FILTRAR HISTÓRICO ==========
function filtrarHistorico() {
    const categoriaFiltro = document.getElementById('filtro-categoria').value;
    const periodoFiltro = document.getElementById('filtro-periodo').value;
    
    // TODO: Implementar filtros
    console.log('Filtrar:', categoriaFiltro, periodoFiltro);
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

// Fechar modal ao clicar fora
document.getElementById('modal-novo-gasto')?.addEventListener('click', function(e) {
    if (e.target === this) {
        fecharModalNovoGasto();
    }
});

// Fechar modal com ESC
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        fecharModalNovoGasto();
    }
});