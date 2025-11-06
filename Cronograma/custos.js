console.log('Iniciando custos.js');

var projetoId = null;
var projetoAtual = null;

// Quando carregar a página
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM carregado');
    
    var urlParams = new URLSearchParams(window.location.search);
    projetoId = urlParams.get('projeto');
    
    console.log('Projeto ID:', projetoId);
    
    if (!projetoId) {
        alert('Projeto não encontrado na URL');
        return;
    }
    
    carregarProjeto();
});

// Carregar projeto
function carregarProjeto() {
    console.log('Carregando projeto...');
    
    db.collection('projetos').doc(projetoId).get().then(function(doc) {
        if (!doc.exists) {
            alert('Projeto não existe');
            return;
        }
        
        projetoAtual = doc.data();
        console.log('Projeto carregado:', projetoAtual);
        
        var nome = projetoAtual.info_projeto.nome_obra;
        document.getElementById('nome-projeto').textContent = nome;
        
        atualizarCards();
        atualizarHistorico();
        
    }).catch(function(erro) {
        console.error('Erro:', erro);
        alert('Erro ao carregar projeto');
    });
}

// Atualizar cards
function atualizarCards() {
    console.log('Atualizando cards...');
    
    if (!projetoAtual) {
        console.error('projetoAtual não está definido');
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
    
    console.log('Total Material:', totalMaterial);
    console.log('Total Mão de Obra:', totalMaoObra);
    console.log('Total Gasto:', totalGasto);
    
    var elemOrcamento = document.getElementById('orcamento-total');
    var elemGasto = document.getElementById('total-gasto');
    var elemSaldo = document.getElementById('saldo-restante');
    
    if (elemOrcamento) {
        elemOrcamento.textContent = formatarMoeda(orcamentoTotal);
    }
    
    if (elemGasto) {
        elemGasto.textContent = formatarMoeda(totalGasto);
    }
    
    if (elemSaldo) {
        elemSaldo.textContent = formatarMoeda(saldo);
    }
    
    console.log('Cards atualizados com sucesso');
}

// Atualizar histórico
function atualizarHistorico() {
    console.log('Atualizando histórico...');
    
    var tbody = document.getElementById('historico-tbody');
    
    if (!tbody) {
        console.log('Tabela não encontrada');
        return;
    }
    
    if (!projetoAtual) {
        console.error('projetoAtual não está definido');
        return;
    }
    
    tbody.innerHTML = '';
    
    var todosLancamentos = [];
    
    // Material
    if (gastos.material && gastos.material.historico) {
        var histMaterial = gastos.material.historico;
        for (var i = 0; i < histMaterial.length; i++) {
            todosLancamentos.push({
                data: histMaterial[i].data,
                categoria: 'Material',
                descricao: histMaterial[i].descricao,
                valor: histMaterial[i].valor
            });
        }
    }
    
    // Mão de obra
    if (gastos.mao_de_obra && gastos.mao_de_obra.historico) {
        var histMaoObra = gastos.mao_de_obra.historico;
        for (var i = 0; i < histMaoObra.length; i++) {
            todosLancamentos.push({
                data: histMaoObra[i].data,
                categoria: 'Mão de Obra',
                descricao: histMaoObra[i].descricao,
                valor: histMaoObra[i].valor
            });
        }
    }
    
    console.log('Total de lançamentos:', todosLancamentos.length);
    
    if (todosLancamentos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:40px;">Nenhum lançamento encontrado</td></tr>';
        return;
    }
    
    for (var i = 0; i < todosLancamentos.length; i++) {
        var lanc = todosLancamentos[i];
        
        var tr = document.createElement('tr');
        
        var html = '';
        html += '<td>' + lanc.data + '</td>';
        html += '<td>' + lanc.categoria + '</td>';
        html += '<td>' + lanc.descricao + '</td>';
        html += '<td>' + lanc.fornecedor + '</td>';
        html += '<td style="text-align:right">' + formatarMoeda(lanc.valor) + '</td>';
        html += '<td>-</td>';
        
        tr.innerHTML = html;
        tbody.appendChild(tr);
    }
    
    console.log('Histórico atualizado com sucesso');
}

// Abrir modal
function abrirModalNovoGasto() {
    console.log('Abrindo modal');
    var modal = document.getElementById('modal-novo-gasto');
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

// Fechar modal
function fecharModalNovoGasto() {
    console.log('Fechando modal');
    var modal = document.getElementById('modal-novo-gasto');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Formatar moeda
function formatarMoeda(valor) {
        valor = 0;
    }
    return 'R$ ' + valor.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

// Fechar modal ao clicar fora
window.addEventListener('click', function(e) {
    var modal = document.getElementById('modal-novo-gasto');
    if (e.target === modal) {
        fecharModalNovoGasto();
    }
});

console.log('custos.js carregado');