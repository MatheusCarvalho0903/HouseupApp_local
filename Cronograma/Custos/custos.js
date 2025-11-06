console.log('Iniciando custos.js');

// ============================================
// VARIÁVEIS GLOBAIS
// ============================================
let projetoId = null;
let projetoAtual = null;
let chartCategorias = null; // Para a instância do Chart.js

// ============================================
// FUNÇÕES DE MODAL
// ============================================

/**
 * Abre o modal de novo lançamento de gasto.
 */
function abrirModalNovoGasto() {
    console.log('Abrindo modal de novo gasto');
    const modal = document.getElementById('modal-novo-gasto');
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        // Preencher a data atual por padrão
        document.getElementById('data-lancamento').valueAsDate = new Date();
    }
}

/**
 * Fecha o modal de novo lançamento de gasto e limpa o formulário.
 */
function fecharModalNovoGasto() {
    console.log('Fechando modal de novo gasto');
    const modal = document.getElementById('modal-novo-gasto');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        document.getElementById('form-novo-gasto').reset(); // Limpa o formulário
    }
}

// ============================================
// FUNÇÃO DE VALIDAÇÃO
// ============================================

/**
 * Valida os campos do formulário de novo lançamento.
 * @param {string} data - Data do lançamento.
 * @param {string} categoria - Categoria do gasto.
 * @param {string} descricao - Descrição do gasto.
 * @param {number} valor - Valor do gasto.
 * @returns {boolean} - true se válido, false caso contrário.
 */
function validarFormulario(data, categoria, descricao, valor) {
        alert('Preencha todos os campos obrigatórios (Data, Categoria, Descrição, Valor)!');
        return false;
    }

        alert('Valor deve ser um número maior que zero!');
        return false;
    }

    return true;
}

// ============================================
// FUNÇÃO DE SALVAMENTO
// ============================================

/**
 * Salva um novo lançamento de gasto no Firebase.
 * @param {Event} event - Evento de submit do formulário.
 */
async function salvarNovoGasto(event) {
    event.preventDefault();
    console.log('Tentando salvar lançamento...');

    // Pegar valores do formulário
    const data = document.getElementById('data-lancamento').value;
    const categoria = document.getElementById('categoria').value;
    const descricao = document.getElementById('descricao').value;
    const fornecedor = document.getElementById('fornecedor').value;
    const valor = parseFloat(document.getElementById('valor').value);
    const formaPagamento = document.getElementById('forma-pagamento').value;
    const observacoes = document.getElementById('observacoes').value;

    console.log('Dados do formulário:', { data, categoria, descricao, fornecedor, valor, formaPagamento, observacoes });

    // Validar
    if (!validarFormulario(data, categoria, descricao, valor)) {
        return;
    }

    // Validar categoria suportada
    const categoriasValidas = ['material', 'mao_de_obra', 'equipamentos', 'servicos_terceiros'];
    if (!categoriasValidas.includes(categoria)) {
        alert(`Categoria não suportada: ${categoria}. Por favor, selecione uma das opções válidas.`);
        return;
    }

    try {
        // Buscar o projeto atual do Firestore
        const docRef = db.collection('projetos').doc(projetoId);
        const doc = await docRef.get();

        if (!doc.exists) {
            throw new Error('Projeto não encontrado no Firebase.');
        }

        const dadosProjeto = doc.data();

        // Inicializar estrutura de gastos para a categoria se necessário
        if (!gastos[categoria]) {
            gastos[categoria] = { total_realizado: 0, historico: [] };
        }
        if (!gastos[categoria].historico) {
            gastos[categoria].historico = [];
        }

        // Criar objeto do novo lançamento
        const novoLancamento = {
            id: new Date().getTime().toString(), // ID único baseado no timestamp
            data: data,
            descricao: descricao,
            valor: valor,
            forma_pagamento: formaPagamento,
            criado_em: new Date().toISOString()
        };

        // Adicionar novo lançamento ao histórico da categoria
        gastos[categoria].historico.push(novoLancamento);

        // Recalcular total_realizado para a categoria
        gastos[categoria].total_realizado = gastos[categoria].historico.reduce(
            (total, lanc) => total + lanc.valor, 0
        );

        // Atualizar o campo 'gastos' no documento do projeto
        await docRef.update({ gastos: gastos });

        console.log('Lançamento salvo com sucesso!');
        alert('✅ Lançamento salvo com sucesso!');

        fecharModalNovoGasto();
        await carregarDadosProjeto(); // Recarrega os dados para atualizar a UI

    } catch (error) {
        console.error('Erro ao salvar lançamento:', error);
        alert(`❌ Erro ao salvar lançamento: ${error.message}`);
    }
}

// ============================================
// FUNÇÃO DE CARREGAMENTO
// ============================================

/**
 * Carrega os dados do projeto atual do Firebase e atualiza a interface.
 */
async function carregarDadosProjeto() {
    console.log('Carregando dados do projeto:', projetoId);

    if (!projetoId) {
        console.error('projetoId não definido. Não é possível carregar os dados.');
        // Redireciona para a home se não tiver projetoId
        window.location.href = '../../index.html'; 
        return;
    }

    try {
        const doc = await db.collection('projetos').doc(projetoId).get();

        if (!doc.exists) {
            alert('Projeto não encontrado no Firebase. Redirecionando...');
            window.location.href = '../../index.html';
            return;
        }

        projetoAtual = doc.data();
        console.log('Projeto carregado:', projetoAtual);

        // Atualizar nome do projeto no header
        const nomeProjetoElement = document.getElementById('nome-projeto');
        if (nomeProjetoElement) {
        }

        // Chamar funções para atualizar a UI
        atualizarResumo();
        carregarCategorias();
        carregarHistorico();
        desenharGraficoCategorias();

    } catch (error) {
        console.error('Erro ao carregar dados do projeto:', error);
        alert(`Erro ao carregar projeto: ${error.message}.`);
    }
}

// ============================================
// FUNÇÃO DE ATUALIZAÇÃO (CARDS RESUMO)
// ============================================

/**
 * Atualiza os cards de resumo (Orçamento Total, Total Gasto, Saldo Restante, % Utilizado).
 */
function atualizarResumo() {
    console.log('Atualizando cards de resumo...');
    if (!projetoAtual) return;


    let totalGasto = 0;
    // Soma os total_realizado de todas as categorias de gasto
    for (const categoria in gastos) {
    }

    const saldoRestante = orcamentoTotalPrevisto - totalGasto;
    const percentualGasto = orcamentoTotalPrevisto > 0 ? 
                            ((totalGasto / orcamentoTotalPrevisto) * 100).toFixed(1) : 0;

    // Atualizar elementos na DOM
    document.getElementById('orcamento-total').textContent = formatarMoeda(orcamentoTotalPrevisto);
    document.getElementById('total-gasto').textContent = formatarMoeda(totalGasto);
    document.getElementById('saldo-restante').textContent = formatarMoeda(saldoRestante);
    document.getElementById('percentual-gasto').textContent = `${percentualGasto}%`;

    // Alterar cor do saldo se negativo
    const saldoElement = document.getElementById('saldo-restante');
    if (saldoRestante < 0) {
        saldoElement.classList.add('negative-saldo');
    } else {
        saldoElement.classList.remove('negative-saldo');
    }
}

// ============================================
// FUNÇÃO DE CATEGORIAS (CARDS)
// ============================================

/**
 * Carrega os cards de detalhamento por categoria, mostrando orçado, gasto e saldo.
 */
function carregarCategorias() {
    console.log('Carregando categorias...');
    const grid = document.getElementById('categorias-grid');
    if (!grid) return;

    grid.innerHTML = ''; // Limpa o grid antes de adicionar novos cards

        grid.innerHTML = '<p>Nenhum dado de orçamento ou gasto disponível.</p>';
        return;
    }

    const orcamentoGeral = projetoAtual.orcamento;
    const gastosGerais = projetoAtual.gastos;

    const categoriasParaExibir = [
        { id: 'material', nome: 'Material', orcado_campo: 'valor_material_previsto' },
        { id: 'mao_de_obra', nome: 'Mão de Obra', orcado_campo: 'valor_mao_obra_previsto' },
        { id: 'equipamentos', nome: 'Equipamentos', orcado_campo: 'valor_equipamentos_previsto' }, // Assumindo que você terá este campo
        { id: 'servicos_terceiros', nome: 'Serviços Terceiros', orcado_campo: 'valor_servicos_terceiros_previsto' } // Assumindo que você terá este campo
    ];

    categoriasParaExibir.forEach(({ id, nome, orcado_campo }) => {
        const saldo = orcado - gasto;
        const percentual = orcado > 0 ? ((gasto / orcado) * 100).toFixed(1) : 0;

        const card = document.createElement('div');
        card.className = 'categoria-card';
        card.innerHTML = `
            <div class="categoria-header">
                <h3>${nome}</h3>
                <span class="categoria-percentual ${percentual > 100 ? 'over-budget' : ''}">${percentual}%</span>
            </div>
            <div class="categoria-body">
                <div class="categoria-info">
                    <span>Orçado:</span>
                    <span>${formatarMoeda(orcado)}</span>
                </div>
                <div class="categoria-info">
                    <span>Gasto:</span>
                    <span>${formatarMoeda(gasto)}</span>
                </div>
                <div class="categoria-info">
                    <span>Saldo:</span>
                    <span class="${saldo < 0 ? 'negative-saldo' : ''}">${formatarMoeda(saldo)}</span>
                </div>
            </div>
            <div class="progress-bar">
                <div class="progress" style="width: ${Math.min(percentual, 100)}%"></div>
            </div>
        `;
        grid.appendChild(card);
    });
}

// ============================================
// FUNÇÃO DE HISTÓRICO (TABELA)
// ============================================

/**
 * Carrega e exibe o histórico de lançamentos, com filtros opcionais.
 */
function carregarHistorico() {
    console.log('Carregando histórico de lançamentos...');
    const tbody = document.getElementById('historico-tbody');
    if (!tbody) return;

    tbody.innerHTML = ''; // Limpa a tabela antes de recarregar

        tbody.innerHTML = '<tr><td colspan="6">Nenhum lançamento de gasto encontrado.</td></tr>';
        return;
    }

    let todosLancamentos = [];

    // Coletar todos os lançamentos de todas as categorias
    for (const categoriaId in projetoAtual.gastos) {
        const categoriaGastos = projetoAtual.gastos[categoriaId];
        if (categoriaGastos && Array.isArray(categoriaGastos.historico)) {
            categoriaGastos.historico.forEach((lancamento) => {
                todosLancamentos.push({
                    ...lancamento,
                    categoria: categoriaId // Adiciona a categoria ao objeto do lançamento
                });
            });
        }
    }

    // Aplicar filtros
    const filtroCategoria = document.getElementById('filtro-categoria')?.value;
    const filtroPeriodo = document.getElementById('filtro-periodo')?.value;

    let lancamentosFiltrados = todosLancamentos.filter(lancamento => {
        // Filtrar por categoria
        if (filtroCategoria && filtroCategoria !== '' && lancamento.categoria !== filtroCategoria) {
            return false;
        }

        // Filtrar por período
        if (filtroPeriodo && filtroPeriodo !== 'todos') {
            const dataLancamento = new Date(lancamento.data + 'T00:00:00'); // Garante fuso horário
            const hoje = new Date();
            let inicioPeriodo;

            switch (filtroPeriodo) {
                case 'mes-atual':
                    inicioPeriodo = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
                    if (dataLancamento < inicioPeriodo) return false;
                    break;
                case 'mes-anterior':
                    inicioPeriodo = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1);
                    const fimPeriodo = new Date(hoje.getFullYear(), hoje.getMonth(), 0, 23, 59, 59);
                    break;
                case 'ultimos-3-meses':
                    inicioPeriodo = new Date(hoje.getFullYear(), hoje.getMonth() - 2, 1); // 3 meses incluindo o atual
                    if (dataLancamento < inicioPeriodo) return false;
                    break;
            }
        }
        return true;
    });

    // Ordenar por data (mais recentes primeiro)
    lancamentosFiltrados.sort((a, b) => new Date(b.data) - new Date(a.data));

    if (lancamentosFiltrados.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6">Nenhum lançamento encontrado com os filtros aplicados.</td></tr>';
        return;
    }

    // Renderizar linhas da tabela
    lancamentosFiltrados.forEach((lancamento) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${formatarData(lancamento.data)}</td>
            <td><span class="badge badge-${lancamento.categoria}">${obterNomeCategoria(lancamento.categoria)}</span></td>
            <td>${lancamento.descricao}</td>
            <td>${lancamento.fornecedor}</td>
            <td class="text-right">${formatarMoeda(lancamento.valor)}</td>
            <td>
                <button class="btn-acao btn-editar" onclick="editarLancamento('${lancamento.id}', '${lancamento.categoria}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-acao btn-deletar" onclick="deletarLancamento('${lancamento.id}', '${lancamento.categoria}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

/**
 * Chama carregarHistorico para aplicar os filtros selecionados.
 */
function filtrarHistorico() {
    console.log('Filtrando histórico...');
    carregarHistorico();
}

// ============================================
// FUNÇÃO PARA GRÁFICO (Chart.js)
// ============================================

/**
 * Desenha o gráfico de gastos por categoria usando Chart.js.
 */
function desenharGraficoCategorias() {
    console.log('Desenhando gráfico de categorias...');

    const ctx = document.getElementById('chart-categorias');
    if (!ctx) {
        console.warn('Elemento canvas para o gráfico não encontrado.');
        return;
    }

    const gastosGerais = projetoAtual.gastos;
    const labels = [];
    const data = [];
    const backgroundColors = [
        'rgba(255, 99, 132, 0.7)', // Material
        'rgba(54, 162, 235, 0.7)', // Mão de Obra
        'rgba(255, 206, 86, 0.7)', // Equipamentos
        'rgba(75, 192, 192, 0.7)', // Serviços Terceiros
        'rgba(153, 102, 255, 0.7)', // Outros
    ];
    const borderColors = [
        'rgba(255, 99, 132, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(153, 102, 255, 1)',
    ];

    let i = 0;
    for (const categoriaId in gastosGerais) {
        if (gastosGerais[categoriaId]?.total_realizado > 0) {
            labels.push(obterNomeCategoria(categoriaId));
            data.push(gastosGerais[categoriaId].total_realizado);
            i++;
        }
    }

    if (chartCategorias) {
        chartCategorias.destroy(); // Destroi a instância anterior do gráfico se existir
    }

    chartCategorias = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: backgroundColors,
                borderColor: borderColors,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                },
                title: {
                    display: true,
                    text: 'Gastos por Categoria'
                }
            }
        }
    });
}


// ============================================
// FUNÇÕES AUXILIARES
// ============================================

/**
 * Formata um valor numérico para o formato de moeda brasileira.
 * @param {number} valor - O valor a ser formatado.
 * @returns {string} - O valor formatado como moeda.
 */
function formatarMoeda(valor) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(valor);
}

/**
 * Formata uma data para o formato local (dd/mm/aaaa).
 * @param {string} dataString - A string de data (ex: "2024-01-01").
 * @returns {string} - A data formatada.
 */
function formatarData(dataString) {
    if (!dataString) return '';
    // Adiciona T00:00:00 para evitar problemas de fuso horário em algumas datas
    const date = new Date(dataString + 'T00:00:00'); 
    return date.toLocaleDateString('pt-BR');
}

/**
 * Retorna um nome legível para uma categoria de gasto.
 * @param {string} categoriaId - O ID da categoria (ex: 'mao_de_obra').
 * @returns {string} - O nome legível da categoria.
 */
function obterNomeCategoria(categoriaId) {
    const nomes = {
        'material': 'Material',
        'mao_de_obra': 'Mão de Obra',
        'equipamentos': 'Equipamentos',
        'servicos_terceiros': 'Serviços Terceiros'
    };
}

/**
 * Função placeholder para edição de lançamento.
 * @param {string} lancamentoId - ID do lançamento a ser editado.
 * @param {string} categoriaId - Categoria do lançamento.
 */
function editarLancamento(lancamentoId, categoriaId) {
    console.log(`Editar lançamento: ${lancamentoId} da categoria ${categoriaId}`);
    alert('Funcionalidade de edição será implementada em breve!');
    // TODO: Implementar lógica para carregar o lançamento no modal e permitir edição
}

/**
 * Deleta um lançamento específico do Firebase.
 * @param {string} lancamentoId - ID do lançamento a ser deletado.
 * @param {string} categoriaId - Categoria do lançamento.
 */
async function deletarLancamento(lancamentoId, categoriaId) {
    console.log(`Tentando deletar lançamento: ${lancamentoId} da categoria ${categoriaId}`);
    if (!confirm('Tem certeza que deseja deletar este lançamento?')) {
        return;
    }

        alert('Dados insuficientes para deletar o lançamento.');
        return;
    }

    try {
        const docRef = db.collection('projetos').doc(projetoId);
        const doc = await docRef.get();

        if (!doc.exists) {
            throw new Error('Projeto não encontrado no Firebase.');
        }

        const dadosProjeto = doc.data();

            throw new Error('Categoria ou histórico de gastos não encontrado.');
        }

        // Filtra o histórico para remover o lançamento
        const novoHistorico = gastos[categoriaId].historico.filter(lanc => lanc.id !== lancamentoId);
        
        // Recalcula o total_realizado para a categoria
        gastos[categoriaId].historico = novoHistorico;
        gastos[categoriaId].total_realizado = novoHistorico.reduce(
            (total, lanc) => total + lanc.valor, 0
        );

        // Atualiza o Firebase
        await docRef.update({ gastos: gastos });

        console.log('Lançamento deletado com sucesso!');
        alert('✅ Lançamento deletado com sucesso!');

        await carregarDadosProjeto(); // Recarrega os dados para atualizar a UI

    } catch (error) {
        console.error('Erro ao deletar lançamento:', error);
        alert(`❌ Erro ao deletar lançamento: ${error.message}`);
    }
}


// ============================================
// EVENT LISTENERS
// ============================================

// Inicializa a página quando o DOM estiver completamente carregado
document.addEventListener('DOMContentLoaded', async function() {
    console.log('DOM completamente carregado para custos.js');

    // Tentar obter o ID do projeto da URL
    const urlParams = new URLSearchParams(window.location.search);
    projetoId = urlParams.get('projeto');

    // Se não estiver na URL, tentar do localStorage
    if (!projetoId) {
        projetoId = localStorage.getItem('projetoAtual');
    }

    if (projetoId) {
        console.log('Projeto ID obtido:', projetoId);
        await carregarDadosProjeto();
    } else {
        console.warn('Nenhum projeto ID encontrado na URL ou localStorage.');
        alert('Nenhum projeto selecionado. Redirecionando para a página inicial.');
        window.location.href = '../../index.html'; // Ajuste o caminho se necessário
    }
});

// Fechar modal ao clicar fora
document.getElementById('modal-novo-gasto')?.addEventListener('click', function(e) {
    if (e.target === this) {
        fecharModalNovoGasto();
    }
});

// Fechar modal com a tecla ESC
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && document.getElementById('modal-novo-gasto')?.style.display === 'block') {
        fecharModalNovoGasto();
    }
});
