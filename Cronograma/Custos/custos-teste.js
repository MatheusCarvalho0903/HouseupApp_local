console.log('custos.js carregado com sucesso!');

// ============================================
// VARIÁVEIS GLOBAIS
// ============================================
let projetoId = null;
let projetoAtual = null;

// DEBUG: Mostrar URL Completa
console.log('URL Completa:', window.location.href);
console.log('Search String:', window.location.search);

// ============================================
// INICIALIZAÇÃO
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ DOM carregado para custos.js');
    
    // Método 1: Pegar da URL
    const params = new URLSearchParams(window.location.search);
    projetoId = params.get('projeto');
    console.log('Projeto da URL:', projetoId);
    
    // Método 2: Se não encontrou, tentar localStorage
    if (!projetoId) {
        projetoId = localStorage.getItem('projetoAtual');
        console.log('Projeto do localStorage:', projetoId);
    }
    
    // Método 3: Se ainda não encontrou, redirecionar
    if (projetoId) {
        localStorage.setItem('projetoAtual', projetoId);
        console.log('✅ Projeto identificado:', projetoId);
    } else {
        console.error('❌ Nenhum projeto encontrado!');
        alert('Erro: Projeto não identificado');
        window.location.href = '../../index.html';
    }
});

// ============================================
// FUNÇÃO: Abrir Modal
// ============================================
function abrirModalNovoGasto() {
    console.log('🚀 abrirModalNovoGasto chamada!');
    console.log('Projeto:', projetoId);
    
    const modal = document.getElementById('modal-novo-gasto');
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        console.log('✅ Modal aberto');
    } else {
        console.error('❌ Modal não encontrado');
    }
}

// ============================================
// FUNÇÃO: Fechar Modal
// ============================================
function fecharModalNovoGasto() {
    console.log('🚪 fecharModalNovoGasto chamada!');
    const modal = document.getElementById('modal-novo-gasto');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        console.log('✅ Modal fechado');
    }
}
// ============================================
// FUNÇÃO: Salvar Novo Gasto
// ============================================
function salvarNovoGasto(event) {
    event.preventDefault();
    console.log('💾 salvarNovoGasto chamada!');
    
    // Pegar valores do formulário
    const data = document.getElementById('data-lancamento').value;
    const categoria = document.getElementById('categoria').value;
    const descricao = document.getElementById('descricao').value;
    const fornecedor = document.getElementById('fornecedor').value;
    const valor = parseFloat(document.getElementById('valor').value);
    const formaPagamento = document.getElementById('forma-pagamento').value;
    const observacoes = document.getElementById('observacoes').value;
    
    console.log('Dados do Formulário:', { data, categoria, descricao, valor });
    
    // Validar campos obrigatórios
        alert('❌ Preencha todos os campos obrigatórios!');
        return;
    }
    
    // Validar valor
        alert('❌ Valor deve ser um número maior que zero!');
        return;
    
    
    console.log('✅ Validação passou!');
    
    // Criar objeto do lançamento
    const novoLancamento = {
        data: data,
        categoria: categoria,
        descricao: descricao,
        fornecedor: fornecedor,
        valor: valor,
        forma_pagamento: formaPagamento,
        observacoes: observacoes,
        criado_em: new Date().toISOString()
    };
    
    console.log('Novo Lançamento:', novoLancamento);
    
    // Salvar no Firebase
    console.log('Salvando no Firebase...');
    
    db.collection('projetos')
        .doc(projetoId)
        .get()
        .then((doc) => {
            if (!doc.exists) {
                throw new Error('Projeto não encontrado');
            }
            
            console.log('✅ Projeto encontrado no Firebase');
            
            const dados = doc.data();
            
            // Inicializar estrutura se não existir
            if (!gastos[categoria]) {
                gastos[categoria] = {
                    total_realizado: 0,
                    historico: []
                };
            }
            
            if (!gastos[categoria].historico) {
                gastos[categoria].historico = [];
            }
            
            // Adicionar novo lançamento
            gastos[categoria].historico.push(novoLancamento);
            
            // Atualizar total
            gastos[categoria].total_realizado = gastos[categoria].historico.reduce(
                (total, lancamento) => total + lancamento.valor,
                0
            );
            
            console.log('Gastos atualizados:', gastos);
            
            // Salvar no Firebase
            return db.collection('projetos').doc(projetoId).update({
                gastos: gastos
            });
        })
        .then(() => {
            console.log('✅ Lançamento salvo com sucesso!');
            alert('✅ Lançamento salvo com sucesso!');
            
            // Limpar formulário
            document.getElementById('form-novo-gasto').reset();
            
            // Fechar modal
            fecharModalNovoGasto();
            
            // Recarregar dados (quando existir a função)
            console.log('Dados salvos. Recarregue a página para ver as atualizações.');
        })
        .catch((erro) => {
            console.error('❌ Erro ao salvar:', erro);
            alert(`❌ Erro ao salvar: ${erro.message}`);
        });

console.log('custos.js totalmente processado.');