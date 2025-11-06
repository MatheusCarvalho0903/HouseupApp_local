console.log('🚀 Iniciando custos.js');

// ============================================
// VARIÁVEIS GLOBAIS
// ============================================
var projetoId = null;
var projetoAtual = null;

// ============================================
// FUNÇÕES GLOBAIS
// ============================================

function abrirModalNovoGasto() {
    console.log('📝 Abrindo modal');
    var modal = document.getElementById('modal-novo-gasto');
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        console.log('✅ Modal aberto');
    } else {
        console.error('❌ Modal não encontrado');
    }
}

function fecharModalNovoGasto() {
    console.log('❌ Fechando modal');
    var modal = document.getElementById('modal-novo-gasto');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

function atualizarElemento(id, valor) {
    var elemento = document.getElementById(id);
    if (elemento) {
        elemento.textContent = valor;
        console.log('✅ Elemento atualizado:', id, '=', valor);
    } else {
        console.error('❌ Elemento não encontrado:', id);
    }
}

function salvarNovoGasto(event) {
    event.preventDefault();
    console.log('💾 Salvando novo gasto...');
    alert('Funcionalidade de salvar será implementada!');
    fecharModalNovoGasto();
}

function editarLancamento(index) {
    console.log('✏️ Editando lançamento:', index);
    alert('Funcionalidade de editar será implementada!');
}

function excluirLancamento(index) {
    console.log('🗑️ Excluindo lançamento:', index);
    if (confirm('Tem certeza que deseja excluir este lançamento?')) {
        alert('Funcionalidade de excluir será implementada!');
    }
}

function formatarData(data) {
    if (!data) {
        return 'Data não informada';
    }
    var dataObj = new Date(data);
    if (isNaN(dataObj.getTime())) {
        return 'Data inválida';
    }
    return dataObj.toLocaleDateString('pt-BR');
}

function carregarProjeto() {
    console.log('📂 Buscando projeto:', projetoId);

        console.error('❌ Firebase não inicializado ou projetoId vazio');
        return;
    }

    db.collection('projetos').doc(projetoId).get()
        .then(function(doc) {
            console.log('✅ Firebase respondeu');

            if (!doc.exists) {
                console.error('❌ Projeto não existe');
                alert('Projeto não encontrado no banco de dados!');
                return;
            }

            projetoAtual = doc.data();
            console.log('✅ Projeto carregado:', projetoAtual);

            atualizarInterface();

        })
        .catch(function(erro) {
            console.error('❌ Erro Firebase:', erro);
            alert('Erro ao carregar projeto: ' + erro.message);
        });

function atualizarInterface() {
    console.log('🎨 Atualizando interface');

    atualizarNomeProjeto();
    atualizarCards();
    atualizarHistorico();

    console.log('✅ Interface atualizada');
}

function atualizarNomeProjeto() {
    var nomeEl = document.getElementById('nome-projeto');
    if (nomeEl && projetoAtual && projetoAtual.info_projeto) {
        nomeEl.textContent = projetoAtual.info_projeto.nome_obra;
        console.log('✅ Nome atualizado:', projetoAtual.info_projeto.nome_obra);
    }
}

function atualizarCards() {
    console.log('💰 Atualizando cards');

    if (!projetoAtual) {
        console.error('❌ projetoAtual não definido');
        return;
    }


    var totalMaterial = 0;
    var totalMaoObra = 0;

    if (gastos.material && gastos.material.total_realizado) {
        totalMaterial = gastos.material.total_realizado;
    }

    if (gastos.mao_de_obra && gastos.mao_de_obra.total_realizado) {
        totalMaoObra = gastos.mao_de_obra.total_realizado;
    }

    var totalGasto = totalMaterial + totalMaoObra;
    var saldo = orcamentoTotal - totalGasto;
    var percentual = orcamentoTotal > 0 ? (totalGasto / orcamentoTotal * 100) : 0;

    console.log('💵 Total Material:', totalMaterial);
    console.log('💵 Total Mão de Obra:', totalMaoObra);
    console.log('💵 Total Gasto:', totalGasto);
    console.log('💵 Orçamento:', orcamentoTotal);

    atualizarElemento('orcamento-total', formatarMoeda(orcamentoTotal));
    atualizarElemento('total-gasto', formatarMoeda(totalGasto));
    atualizarElemento('saldo-restante', formatarMoeda(saldo));
    atualizarElemento('percentual-gasto', percentual.toFixed(1) + '%');

    console.log('✅ Cards atualizados');
}

function atualizarHistorico() {
    console.log('📋 Atualizando histórico');

    var tbody = document.getElementById('historico-tbody');
    if (!tbody) {
        console.error('❌ Tabela não encontrada');
        return;
    }

    if (!projetoAtual) {
        console.error('❌ projetoAtual não definido');
        return;
    }

    tbody.innerHTML = '';

    var todosLancamentos = [];

    if (gastos.material && gastos.material.lancamentos) {
        for (var i = 0; i < gastos.material.lancamentos.length; i++) {
            var lancamento = gastos.material.lancamentos[i];
            lancamento.tipo = 'Material';
            todosLancamentos.push(lancamento);
        }
    }

    if (gastos.mao_de_obra && gastos.mao_de_obra.lancamentos) {
        for (var i = 0; i < gastos.mao_de_obra.lancamentos.length; i++) {
            var lancamento = gastos.mao_de_obra.lancamentos[i];
            lancamento.tipo = 'Mão de Obra';
            todosLancamentos.push(lancamento);
        }
    }

    todosLancamentos.sort(function(a, b) {
        return dataB - dataA;
    });

    for (var i = 0; i < todosLancamentos.length; i++) {
        var lancamento = todosLancamentos[i];
        var linha = document.createElement('tr');

        var html = '<td>' + formatarData(lancamento.data) + '</td>' +
                   '<td>' + lancamento.tipo + '</td>' +
                   '<td>' +
                   '<button onclick="editarLancamento(' + i + ')" class="btn-editar">✏️</button>' +
                   '<button onclick="excluirLancamento(' + i + ')" class="btn-excluir">🗑️</button>' +
                   '</td>';

        linha.innerHTML = html;
        tbody.appendChild(linha);
    }

    console.log('✅ Histórico atualizado com', todosLancamentos.length, 'lançamentos');
}

function inicializarPagina() {
    console.log('🔄 Inicializando página de custos');

    var urlParams = new URLSearchParams(window.location.search);

    if (projetoId) {
        console.log('📍 Projeto ID encontrado:', projetoId);
        carregarProjeto();
    } else {
        console.error('❌ Projeto ID não encontrado');
        console.log('💡 Use: localStorage.setItem("projetoAtual", "seu-projeto-id")');
    }
}

document.addEventListener('DOMContentLoaded', inicializarPagina);

console.log('✅ custos.js carregado com sucesso!');