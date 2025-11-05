console.log('🚀 Iniciando sistema de cronograma padrão');

// CONFIGURAÇÃO FIREBASE
const firebaseConfig = {
    apiKey: "AIzaSyDq3mr-ryX_q8GAEyfTsQP2mzjpP9wOugE",
    authDomain: "houseup-app.firebaseapp.com",
    projectId: "houseup-app",
    storageBucket: "houseup-app.firebasestorage.app",
    messagingSenderId: "401114152723",
    appId: "1:401114152723:web:f96eaf0a718342c0cf64e6"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

// DADOS GLOBAIS
let dadosObra = {};
const PROJETO_ATUAL = 'angela-marco';

// CRONOGRAMAS PADRÃO
const CRONOGRAMAS_PADRAO = {
    'residencial-completo': {
        nome: 'Residencial Completo (18 meses)',
        atividades: [
            { descricao: 'Limpeza e terraplanagem', peso: 3, prazo: '2025-01-15' },
            { descricao: 'Fundação profunda', peso: 5, prazo: '2025-01-30' },
            { descricao: 'Fundação rasa', peso: 8, prazo: '2025-02-15' },
            { descricao: 'Estrutura - Pilares', peso: 10, prazo: '2025-03-15' },
            { descricao: 'Estrutura - Vigas', peso: 8, prazo: '2025-04-10' },
            { descricao: 'Estrutura - Lajes', peso: 12, prazo: '2025-05-20' },
            { descricao: 'Alvenaria', peso: 10, prazo: '2025-06-30' },
            { descricao: 'Cobertura', peso: 6, prazo: '2025-07-20' },
            { descricao: 'Instalações elétricas', peso: 8, prazo: '2025-08-15' },
            { descricao: 'Instalações hidráulicas', peso: 8, prazo: '2025-08-15' },
            { descricao: 'Revestimentos', peso: 10, prazo: '2025-09-30' },
            { descricao: 'Pisos', peso: 6, prazo: '2025-10-20' },
            { descricao: 'Pintura', peso: 4, prazo: '2025-11-10' },
            { descricao: 'Esquadrias', peso: 2, prazo: '2025-11-20' },
            { descricao: 'Louças e metais', peso: 2, prazo: '2025-12-05' },
            { descricao: 'Limpeza final', peso: 1, prazo: '2025-12-15' },
            { descricao: 'Entrega da obra', peso: 1, prazo: '2025-12-20' }
        ]
    },
    'reforma-simples': {
        nome: 'Reforma Simples (6 meses)',
        atividades: [
            { descricao: 'Demolições', peso: 10, prazo: '2025-01-15' },
            { descricao: 'Instalações elétricas', peso: 15, prazo: '2025-02-10' },
            { descricao: 'Instalações hidráulicas', peso: 15, prazo: '2025-02-10' },
            { descricao: 'Revestimentos', peso: 25, prazo: '2025-03-20' },
            { descricao: 'Pisos', peso: 20, prazo: '2025-04-15' },
            { descricao: 'Pintura', peso: 10, prazo: '2025-05-10' },
            { descricao: 'Acabamentos finais', peso: 5, prazo: '2025-05-30' }
        ]
    },
    'estrutural-apenas': {
        nome: 'Apenas Estrutural (8 meses)',
        atividades: [
            { descricao: 'Limpeza do terreno', peso: 5, prazo: '2025-01-10' },
            { descricao: 'Fundação', peso: 25, prazo: '2025-02-28' },
            { descricao: 'Pilares térreo', peso: 15, prazo: '2025-03-30' },
            { descricao: 'Vigas térreo', peso: 10, prazo: '2025-04-15' },
            { descricao: 'Laje térreo', peso: 15, prazo: '2025-05-10' },
            { descricao: 'Pilares superior', peso: 10, prazo: '2025-06-05' },
            { descricao: 'Vigas superior', peso: 8, prazo: '2025-06-25' },
            { descricao: 'Laje superior', peso: 12, prazo: '2025-07-20' }
        ]
    }
};

// CARREGAR DADOS ATUAIS
async function carregarDados() {
    console.log('📂 Carregando dados...');
    
    try {
        const doc = await db.collection('projetos').doc(PROJETO_ATUAL).get();
        
        if (doc.exists) {
            dadosObra = doc.data();
            console.log('✅ Dados carregados');
        } else {
            console.log('⚠️ Criando projeto básico');
            dadosObra = {
                info_projeto: {
                    nome_obra: "Residência Ângela e Marco",
                    codigo_obra: "HOUS-001-2024"
                },
                cronograma: [],
                gastos: {
                    material: { total_realizado: 0 },
                    mao_de_obra: { total_realizado: 0 }
                }
            };
        }
        
        atualizarInterface();
        
    } catch (error) {
        console.error('❌ Erro:', error);
        alert('Erro ao carregar: ' + error.message);
    }
}

// ATUALIZAR INTERFACE
function atualizarInterface() {
    // Nome da obra
    const nomeEl = document.getElementById('admin-nome-obra');
    if (nomeEl) nomeEl.textContent = dadosObra.info_projeto?.nome_obra || 'Sem nome';
    
    // Código da obra
    const codigoEl = document.getElementById('admin-codigo-obra');
    if (codigoEl) codigoEl.textContent = dadosObra.info_projeto?.codigo_obra || 'Sem código';
    
    // Carregar cronograma
    carregarCronograma();
    
    // Carregar seletor de padrões
    carregarSeletorPadrao();
}

// CARREGAR CRONOGRAMA
function carregarCronograma() {
    const tbody = document.getElementById('cronograma-body');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    const cronograma = dadosObra.cronograma || [];
    
    if (cronograma.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 30px;">
                    <h3>📋 Nenhuma atividade cadastrada</h3>
                    <p>Selecione um cronograma padrão abaixo para começar!</p>
                </td>
            </tr>
        `;
        return;
    }
    
    cronograma.forEach((atividade, index) => {
        const row = tbody.insertRow();
        row.innerHTML = `
            <td><strong>${atividade.descricao}</strong></td>
            <td><span style="background: #007bff; color: white; padding: 3px 8px; border-radius: 4px; font-size: 12px;">Principal</span></td>
            <td>${atividade.peso_global}%</td>
            <td>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <input type="range" min="0" max="100" value="${atividade.progresso_atividade || 0}" 
                           style="flex: 1;" onchange="atualizarProgresso('${atividade.id}', this.value)">
                    <span style="min-width: 40px; font-weight: bold;">${atividade.progresso_atividade || 0}%</span>
                </div>
            </td>
            <td>
                <select onchange="atualizarStatus('${atividade.id}', this.value)" style="width: 100%; padding: 5px;">
                    <option value="Não Iniciada" ${atividade.status === 'Não Iniciada' ? 'selected' : ''}>Não Iniciada</option>
                    <option value="Em Andamento" ${atividade.status === 'Em Andamento' ? 'selected' : ''}>Em Andamento</option>
                    <option value="Concluída" ${atividade.status === 'Concluída' ? 'selected' : ''}>Concluída</option>
                </select>
            </td>
            <td>${atividade.prazo_final || 'N/A'}</td>
            <td>
                <button onclick="removerAtividade(${index})" 
                        style="background: #dc3545; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer;">
                    🗑️
                </button>
            </td>
        `;
    });
    
    console.log(`✅ ${cronograma.length} atividades carregadas`);
}

// CARREGAR SELETOR DE PADRÃO
function carregarSeletorPadrao() {
    const container = document.getElementById('cronograma-padrao-container');
    if (!container) {
        // Criar container se não existir
        const novoContainer = document.createElement('div');
        novoContainer.id = 'cronograma-padrao-container';
        novoContainer.style.cssText = `
            background: linear-gradient(135deg, #f8f9fa, #e9ecef);
            padding: 25px;
            margin: 20px 0;
            border-radius: 10px;
            border: 2px solid #007bff;
        `;
        
        // Inserir antes da tabela
        const tabela = document.querySelector('.table-responsive');
        if (tabela) {
            tabela.parentNode.insertBefore(novoContainer, tabela);
        }
    }
    
    const containerFinal = document.getElementById('cronograma-padrao-container');
    containerFinal.innerHTML = `
        <h3 style="color: #007bff; margin-bottom: 20px;">
            🏗️ Cronogramas Padrão
        </h3>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 15px; margin-bottom: 20px;">
            ${Object.keys(CRONOGRAMAS_PADRAO).map(key => {
                const padrao = CRONOGRAMAS_PADRAO[key];
                return `
                    <div style="background: white; padding: 15px; border-radius: 8px; border: 1px solid #ddd;">
                        <h4 style="margin: 0 0 10px 0; color: #333;">${padrao.nome}</h4>
                        <p style="margin: 0 0 15px 0; color: #666; font-size: 14px;">
                            ${padrao.atividades.length} atividades
                        </p>
                        <button onclick="aplicarCronogramaPadrao('${key}')" 
                                style="background: #28a745; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; width: 100%;">
                            ✅ Aplicar Este Cronograma
                        </button>
                    </div>
                `;
            }).join('')}
        </div>
        
        <div style="display: flex; gap: 15px; flex-wrap: wrap;">
            <button onclick="limparCronograma()" 
                    style="background: #dc3545; color: white; border: none; padding: 12px 25px; border-radius: 5px; cursor: pointer;">
                🗑️ Limpar Cronograma Atual
            </button>
            
            <button onclick="adicionarAtividadeManual()" 
                    style="background: #007bff; color: white; border: none; padding: 12px 25px; border-radius: 5px; cursor: pointer;">
                ➕ Adicionar Atividade Manual
            </button>
        </div>
    `;
}

// APLICAR CRONOGRAMA PADRÃO
async function aplicarCronogramaPadrao(tipoPadrao) {
    const padrao = CRONOGRAMAS_PADRAO[tipoPadrao];
    if (!padrao) return;
    
    const confirmar = confirm(`Aplicar o cronograma "${padrao.nome}"?\n\nIsso substituirá todas as atividades atuais.`);
    if (!confirmar) return;
    
    console.log(`🏗️ Aplicando cronograma padrão: ${padrao.nome}`);
    
    // Criar atividades do padrão
    dadosObra.cronograma = padrao.atividades.map((atividade, index) => ({
        id: `ATV${String(index + 1).padStart(3, '0')}`,
        descricao: atividade.descricao,
        peso_global: atividade.peso,
        progresso_atividade: 0,
        status: "Não Iniciada",
        prazo_final: atividade.prazo,
        sub_atividades: []
    }));
    
    try {
        await salvarDados();
        carregarCronograma();
        alert(`✅ Cronograma "${padrao.nome}" aplicado com sucesso!\n\n${padrao.atividades.length} atividades criadas.`);
    } catch (error) {
        console.error('❌ Erro ao aplicar padrão:', error);
        alert('❌ Erro ao aplicar cronograma padrão');
    }
}

// LIMPAR CRONOGRAMA
async function limparCronograma() {
    const confirmar = confirm('🗑️ Tem certeza que deseja LIMPAR TODO O CRONOGRAMA?\n\nEsta ação é irreversível!');
    if (!confirmar) return;
    
    dadosObra.cronograma = [];
    
    try {
        await salvarDados();
        carregarCronograma();
        alert('✅ Cronograma limpo com sucesso!');
    } catch (error) {
        console.error('❌ Erro ao limpar:', error);
        alert('❌ Erro ao limpar cronograma');
    }
}

// ADICIONAR ATIVIDADE MANUAL
function adicionarAtividadeManual() {
    const descricao = prompt('📝 Descrição da atividade:');
    if (!descricao) return;
    
    const peso = prompt('⚖️ Peso da atividade (1-100):');
    if (!peso || isNaN(peso)) return;
    
    const prazo = prompt('📅 Prazo final (YYYY-MM-DD):') || '2025-12-31';
    
    const novaAtividade = {
        id: `MANUAL${Date.now()}`,
        descricao: descricao,
        peso_global: parseInt(peso),
        progresso_atividade: 0,
        status: "Não Iniciada",
        prazo_final: prazo,
        sub_atividades: []
    };
    
    dadosObra.cronograma.push(novaAtividade);
    
    salvarDados().then(() => {
        carregarCronograma();
        alert('✅ Atividade adicionada!');
    }).catch(error => {
        console.error('❌ Erro:', error);
        alert('❌ Erro ao adicionar atividade');
    });
}

// ATUALIZAR PROGRESSO
async function atualizarProgresso(id, novoProgresso) {
    const atividade = dadosObra.cronograma.find(a => a.id === id);
    if (!atividade) return;
    
    atividade.progresso_atividade = parseInt(novoProgresso);
    
    // Atualizar status automaticamente
    if (novoProgresso == 0) atividade.status = "Não Iniciada";
    else if (novoProgresso == 100) atividade.status = "Concluída";
    else atividade.status = "Em Andamento";
    
    await salvarDados();
    carregarCronograma();
}

// ATUALIZAR STATUS
async function atualizarStatus(id, novoStatus) {
    const atividade = dadosObra.cronograma.find(a => a.id === id);
    if (!atividade) return;
    
    atividade.status = novoStatus;
    await salvarDados();
}

// REMOVER ATIVIDADE
async function removerAtividade(index) {
    if (!confirm('Remover esta atividade?')) return;
    
    dadosObra.cronograma.splice(index, 1);
    
    try {
        await salvarDados();
        carregarCronograma();
        alert('✅ Atividade removida!');
    } catch (error) {
        console.error('❌ Erro:', error);
        alert('❌ Erro ao remover');
    }
}

// SALVAR DADOS
async function salvarDados() {
    try {
        await db.collection('projetos').doc(PROJETO_ATUAL).set(dadosObra);
        console.log('✅ Dados salvos');
    } catch (error) {
        console.error('❌ Erro ao salvar:', error);
        throw error;
    }
}

// INICIALIZAR
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 Iniciando aplicação...');
    carregarDados();
});

console.log('✅ Sistema de cronograma padrão carregado');