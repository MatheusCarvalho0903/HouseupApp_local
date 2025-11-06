console.log('custos.js carregado com sucesso!');

// ============================================
// VARIÁVEIS GLOBAIS
// ============================================
let projetoId = null;
let projetoAtual = null;

// ============================================
// INICIALIZAÇÃO
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ DOM carregado para custos.js');
    
    // Pegar ID do projeto da URL ou localStorage
    const params = new URLSearchParams(window.location.search);
    
    console.log('Projeto ID:', projetoId);
    
    if (projetoId) {
        console.log('✅ Projeto identificado');
    } else {
        console.warn('⚠️ Projeto não encontrado');
    }
});

console.log('custos.js totalmente processado.');