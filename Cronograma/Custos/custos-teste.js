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

console.log('custos.js totalmente processado.');