
console.log('🚀 Iniciando cronograma com Drag & Drop...');

// --- CONFIGURAÇÃO FIREBASE ---
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
    console.log('🔥 Firebase inicializado');
} else {
    console.log('🔥 Firebase já estava inicializado');
}

const db = firebase.firestore();

// --- DETECÇÃO DO PROJETO ATUAL ---
function obterProjetoAtual() {
    const urlParams = new URLSearchParams(window.location.search);
    const projetoUrl = urlParams.get('projeto');
    const projetoStorage = localStorage.getItem('projetoAtual');
    return projetoUrl || projetoStorage || 'angela-marco';
}

const PROJETO_ATUAL = obterProjetoAtual();
console.log('🏗️ Projeto atual:', PROJETO_ATUAL);

const dadosObraRef = db.collection('projetos').doc(PROJETO_ATUAL);

// --- VARIÁVEIS GLOBAIS ---
let dadosObra = {
    cronograma: [],
    gastos: {
        material: { total_realizado: 0 },
        mao_de_obra: { total_realizado: 0 }
    },
    info_projeto: {}
};

// Variáveis para controle do drag & drop
let sortableInstances = [];

// --- CRONOGRAMAS PADRÃO ---
const CRONOGRAMAS_PADRAO = {
    'residencial-completo': {
        nome: 'Residencial Completo (17 atividades)',
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
        nome: 'Reforma Simples (7 atividades)',
        atividades: [
            { descricao: 'Demolições', peso: 15, prazo: '2025-01-15' },
            { descricao: 'Instalações elétricas', peso: 20, prazo: '2025-02-10' },
            { descricao: 'Instalações hidráulicas', peso: 20, prazo: '2025-02-10' },
            { descricao: 'Revestimentos', peso: 25, prazo: '2025-03-20' },
            { descricao: 'Pisos', peso: 15, prazo: '2025-04-15' },
            { descricao: 'Pintura', peso: 10, prazo: '2025-05-10' },
            { descricao: 'Acabamentos finais', peso: 5, prazo: '2025-05-30' }
        ]
    }
};

// --- CARREGAR DADOS DO PROJETO ---
async function carregarDadosProjeto() {
    try {
        console.log('📂 Carregando dados do projeto:', PROJETO_ATUAL);
        
        const doc = await dadosObraRef.get();
        if (doc.exists) {
            dadosObra = doc.data();
            console.log('✅ Dados carregados:', dadosObra);
            
            // Garantir estrutura mínima
            if (!dadosObra.cronograma) dadosObra.cronograma = [];
            if (!dadosObra.gastos) {
                dadosObra.gastos = {
                    material: { total_realizado: 0 },
                    mao_de_obra: { total_realizado: 0 }
                };
            }
            
            // LOG DETALHADO DO CRONOGRAMA
            console.log(`📊 Cronograma carregado: ${dadosObra.cronograma.length} atividades`);
            
        } else {
            console.log('⚠️ Projeto não encontrado, criando estrutura básica...');
            dadosObra = {
                cronograma: [],
                gastos: {
                    material: { total_realizado: 0 },
                    mao_de_obra: { total_realizado: 0 }
                },
                info_projeto: {
                    nome_obra: 'Projeto Não Encontrado',
                    codigo_obra: 'N/A'
                }
            };
        }
        
        return dadosObra;
        
    } catch (error) {
        console.error('❌ Erro ao carregar dados do projeto:', error);
        return dadosObra;
    }
}

// --- ATUALIZAR INFO DA OBRA ---
async function atualizarInfoObra() {
    try {
        const info = dadosObra.info_projeto;
        
        const elementos = {
            'admin-nome-obra': info?.nome_obra || 'Carregando...',
            'admin-codigo-obra': info?.codigo_obra || '-',
            'projeto-atual': info?.nome_obra || 'Cronograma'
        };
        
        Object.keys(elementos).forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.textContent = elementos[id];
            }
        });
        
        const clientLink = document.getElementById('client-link');
        if (clientLink) {
            clientLink.href = `https://codepen.io/OneAIAdapta/pen/MWjKLxP?projeto=${PROJETO_ATUAL}`;
        }
        
        console.log('✅ Info da obra atualizada');
        
    } catch (error) {
        console.error('❌ Erro ao atualizar info da obra:', error);
    }
}

// --- FUNÇÕES UTILITÁRIAS ---
function getAutomatedStatus(progressValue) {
    if (progressValue === 0) return "Não Iniciada";
    if (progressValue === 100) return "Concluída";
    return "Em Andamento";
}

function calcularProgressoPrincipalPorSubAtividades(atividade) {
    if (!atividade.sub_atividades || atividade.sub_atividades.length === 0) {
        return parseFloat(atividade.progresso_atividade) || 0;
    }
    
    let progressoPonderado = 0;
    let pesoTotalSubs = 0;
    
    atividade.sub_atividades.forEach(sub => {
        const pesoLocal = parseFloat(sub.peso_local) || 0;
        const progressoSub = parseFloat(sub.progresso_atividade) || 0;
        
        progressoPonderado += (pesoLocal * progressoSub);
        pesoTotalSubs += pesoLocal;
    });
    
    if (pesoTotalSubs === 0) return 0;
    
    const progressoCalculado = progressoPonderado / pesoTotalSubs;
    return parseFloat(progressoCalculado.toFixed(2));
}

function calcularProgressoGlobal() {
    if (!dadosObra.cronograma || dadosObra.cronograma.length === 0) return 0;
    
    let progressoGlobalPonderado = 0;
    let pesoGlobalTotal = 0;
    
    dadosObra.cronograma.forEach(atividade => {
        const pesoGlobal = parseFloat(atividade.peso_global) || 0;
        const progressoEfetivo = calcularProgressoPrincipalPorSubAtividades(atividade);
        
        progressoGlobalPonderado += (pesoGlobal * progressoEfetivo);
        pesoGlobalTotal += pesoGlobal;
    });
    
    if (pesoGlobalTotal === 0) return 0;
    
    const progressoGlobal = progressoGlobalPonderado / pesoGlobalTotal;
    return parseFloat(progressoGlobal.toFixed(2));
}

function validarProgresso(valor) {
    const num = parseFloat(valor);
    if (isNaN(num)) return 0;
    if (num < 0) return 0;
    if (num > 100) return 100;
    return parseFloat(num.toFixed(2));
}

function validarPesoGlobalTotal() {
    let pesoTotal = 0;
    dadosObra.cronograma.forEach(atividade => {
        pesoTotal += parseFloat(atividade.peso_global) || 0;
    });
    
    return {
        total: parseFloat(pesoTotal.toFixed(2)),
        excede: pesoTotal > 100
    };
}

function validarPesoLocalSubAtividades(atividade) {
    if (!atividade.sub_atividades || atividade.sub_atividades.length === 0) {
        return { total: 0, excede: false };
    }
    
    let pesoTotalSubs = 0;
    atividade.sub_atividades.forEach(sub => {
        pesoTotalSubs += parseFloat(sub.peso_local) || 0;
    });
    
    const pesoGlobalAtividade = parseFloat(atividade.peso_global) || 0;
    
    return {
        total: parseFloat(pesoTotalSubs.toFixed(2)),
        excede: pesoTotalSubs > pesoGlobalAtividade,
        limite: pesoGlobalAtividade
    };
}

function formatarMoeda(valor) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function gerarNovoId(prefixo) {
    return prefixo + Math.random().toString(36).substring(2, 9) + Date.now().toString().substring(9,13);
}

// --- SALVAR DADOS NO FIREBASE ---
async function salvarDados() {
    try {
        console.log('💾 Salvando dados...');
        
        await dadosObraRef.update({
            cronograma: dadosObra.cronograma,
            gastos: dadosObra.gastos,
            progresso_geral: calcularProgressoGlobal(),
            ultima_atualizacao: new Date().toISOString()
        });
        
        console.log('✅ Dados salvos com sucesso');
        return true;
        
    } catch (error) {
        console.error('❌ Erro ao salvar dados:', error);
        return false;
    }
}

// --- CARREGAR CUSTOS ---
// --- ESTRUTURA DE DADOS DE CUSTOS MELHORADA ---
const CATEGORIAS_CUSTO = {
    'Material': { cor: '#ff9800', icone: 'fas fa-boxes' },
    'Mão de Obra': { cor: '#2196f3', icone: 'fas fa-hard-hat' },
    'Equipamento': { cor: '#9c27b0', icone: 'fas fa-tools' },
    'Serviços': { cor: '#4caf50', icone: 'fas fa-handshake' },
    'Despesas Gerais': { cor: '#607d8b', icone: 'fas fa-file-invoice' }
};

// --- CARREGAR CUSTOS MELHORADO ---
function carregarCustos() {
    const gastos = dadosObra.gastos || {};
    
    // Garantir estrutura de categorias
    const categorias = {
        'Material': 0,
        'Mão de Obra': 0,
        'Equipamento': 0,
        'Serviços': 0,
        'Despesas Gerais': 0
    };
    
    // Se existir histórico detalhado, calcular por categoria
    if (gastos.historico && Array.isArray(gastos.historico)) {
        gastos.historico.forEach(lancamento => {
            const categoria = lancamento.categoria || 'Despesas Gerais';
            categorias[categoria] = (categorias[categoria] || 0) + (parseFloat(lancamento.valor) || 0);
        });
    } else {
        // Compatibilidade com estrutura antiga
        categorias['Material'] = gastos.material?.total_realizado || 0;
        categorias['Mão de Obra'] = gastos.mao_de_obra?.total_realizado || 0;
    }
    
    // Atualizar elementos na tela
    const elementos = {
        'total-material-admin': categorias['Material'],
        'total-mao-de-obra-admin': categorias['Mão de Obra'],
        'total-equipamento-admin': categorias['Equipamento'],
        'total-servicos-admin': categorias['Serviços']
    };
    
    Object.keys(elementos).forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.textContent = formatarMoeda(elementos[id]);
        }
    });
    
    // Calcular e mostrar total geral
    const totalGeral = Object.values(categorias).reduce((sum, valor) => sum + valor, 0);
    const totalEl = document.getElementById('total-geral-admin');
    if (totalEl) {
        totalEl.textContent = formatarMoeda(totalGeral);
    }
    
    // Carregar últimos lançamentos
    carregarUltimosLancamentos();
}

// --- CARREGAR ÚLTIMOS LANÇAMENTOS ---
function carregarUltimosLancamentos() {
    const container = document.getElementById('ultimos-custos-lista');
    if (!container) return;
    
    const historico = dadosObra.gastos?.historico || [];
    const ultimos = historico.slice(-5).reverse(); // Últimos 5, mais recente primeiro
    
    if (ultimos.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">Nenhum lançamento ainda.</p>';
        return;
    }
    
    container.innerHTML = ultimos.map(lancamento => `
        <div class="lancamento-item">
            <div class="lancamento-info">
                <span class="lancamento-categoria" style="background: ${CATEGORIAS_CUSTO[lancamento.categoria]?.cor || '#666'}">
                    ${lancamento.categoria}
                </span>
                <div class="lancamento-descricao">${lancamento.descricao}</div>
                <div class="lancamento-fornecedor">${lancamento.fornecedor || 'Não informado'}</div>
            </div>
            <div class="lancamento-valor">${formatarMoeda(lancamento.valor)}</div>
        </div>
    `).join('');
}

// --- FUNÇÃO PARA LANÇAR CUSTO RÁPIDO ---
async function lancarCustoRapido(event) {
    event.preventDefault();
    
    const categoria = document.getElementById('custo-categoria')?.value;
    const descricao = document.getElementById('custo-descricao')?.value?.trim();
    const valor = parseFloat(document.getElementById('custo-valor')?.value);
    const fornecedor = document.getElementById('custo-fornecedor')?.value?.trim();
    
    if (!categoria || !descricao || isNaN(valor) || valor <= 0) {
        alert('❌ Por favor, preencha todos os campos obrigatórios.');
        return;
    }
    
    // Garantir estrutura de gastos
    if (!dadosObra.gastos) {
        dadosObra.gastos = {
            material: { total_realizado: 0 },
            mao_de_obra: { total_realizado: 0 },
            historico: []
        };
    }
    
    if (!dadosObra.gastos.historico) {
        dadosObra.gastos.historico = [];
    }
    
    // Criar novo lançamento
    const novoLancamento = {
        id: gerarNovoId('CST'),
        data: new Date().toISOString().split('T')[0], // YYYY-MM-DD
        categoria: categoria,
        descricao: descricao,
        fornecedor: fornecedor || 'Não informado',
        valor: valor,
        data_lancamento: new Date().toISOString(),
        status_pagamento: 'Pago' // Padrão para lançamento rápido
    };
    
    // Adicionar ao histórico
    dadosObra.gastos.historico.push(novoLancamento);
    
    // Atualizar totais por categoria (compatibilidade)
    if (categoria === 'Material') {
        dadosObra.gastos.material.total_realizado = (dadosObra.gastos.material.total_realizado || 0) + valor;
    } else if (categoria === 'Mão de Obra') {
        dadosObra.gastos.mao_de_obra.total_realizado = (dadosObra.gastos.mao_de_obra.total_realizado || 0) + valor;
    }
    
    try {
        await salvarDados();
        carregarAdminView();
        limparFormularioCusto();
        alert('✅ Custo lançado com sucesso!');
        
    } catch (error) {
        console.error('❌ Erro ao lançar custo:', error);
        alert('❌ Erro ao salvar custo. Tente novamente.');
    }
}

// --- LIMPAR FORMULÁRIO DE CUSTO ---
function limparFormularioCusto() {
    document.getElementById('custo-categoria').value = '';
    document.getElementById('custo-descricao').value = '';
    document.getElementById('custo-valor').value = '';
    document.getElementById('custo-fornecedor').value = '';
}

// --- CARREGAR DROPDOWN DE ATIVIDADES ---
function carregarDropdownAtividades() {
    const parentActivitySelect = document.getElementById('parent-activity-select');
    if (!parentActivitySelect) return;
    
    parentActivitySelect.innerHTML = '<option value="">Selecione a Atividade Principal</option>';

    dadosObra.cronograma.forEach(atividade => {
        const option = document.createElement('option');
        option.value = atividade.id;
        option.textContent = atividade.descricao;
        parentActivitySelect.appendChild(option);
    });
    
    console.log(`✅ Dropdown atualizado com ${dadosObra.cronograma.length} atividades principais`);
}

// --- ATUALIZAR DISPLAY DE PESO GLOBAL TOTAL ---
function atualizarDisplayPesoGlobal() {
    const validacao = validarPesoGlobalTotal();
    const displayEl = document.getElementById('total-peso-global-display');
    
    if (displayEl) {
        displayEl.textContent = validacao.total;
        displayEl.style.color = validacao.excede ? '#dc3545' : '#28a745';
        
        if (validacao.excede) {
            displayEl.parentElement.style.background = '#fff3cd';
            displayEl.parentElement.style.border = '1px solid #ffeaa7';
            displayEl.parentElement.style.borderRadius = '5px';
            displayEl.parentElement.style.padding = '5px';
        } else {
            displayEl.parentElement.style.background = '';
            displayEl.parentElement.style.border = '';
            displayEl.parentElement.style.padding = '';
        }
    }
}

// --- DESTRUIR INSTÂNCIAS SORTABLE ANTERIORES ---
function destruirSortableInstances() {
    sortableInstances.forEach(instance => {
        if (instance && typeof instance.destroy === 'function') {
            instance.destroy();
        }
    });
    sortableInstances = [];
}

// --- CONFIGURAR DRAG & DROP ---
function configurarDragAndDrop() {
    console.log('🎯 Configurando Drag & Drop...');
    
    // Destruir instâncias anteriores
    destruirSortableInstances();
    
    const cronogramaBody = document.getElementById('cronograma-body');
    if (!cronogramaBody) return;
    
    // Configurar drag & drop para atividades principais
    const sortableMain = Sortable.create(cronogramaBody, {
        group: 'cronograma',
        animation: 150,
        ghostClass: 'sortable-ghost',
        chosenClass: 'sortable-chosen',
        dragClass: 'sortable-drag',
        handle: '.drag-handle-main',
        filter: '.sub-activity-row',
        onEnd: function(evt) {
            console.log('🔄 Reordenando atividades principais...');
            
            const oldIndex = evt.oldIndex;
            const newIndex = evt.newIndex;
            
            // Reordenar no array de dados
            const movedItem = dadosObra.cronograma.splice(oldIndex, 1)[0];
            dadosObra.cronograma.splice(newIndex, 0, movedItem);
            
            // Salvar e recarregar
            salvarDados().then(() => {
                console.log('✅ Ordem das atividades principais salva');
                carregarAdminView();
            });
        }
    });
    
    sortableInstances.push(sortableMain);
    
    // Configurar drag & drop para sub-atividades de cada atividade principal
    dadosObra.cronograma.forEach((atividade, atividadeIndex) => {
        if (atividade.sub_atividades && atividade.sub_atividades.length > 0) {
            const subRows = document.querySelectorAll(`[data-parent-id="${atividade.id}"]`);
            
            if (subRows.length > 0) {
                // Criar um container virtual para as sub-atividades
                const subContainer = document.createElement('div');
                subRows.forEach(row => subContainer.appendChild(row.cloneNode(true)));
                
                const sortableSub = Sortable.create(subContainer, {
                    group: `sub-${atividade.id}`,
                    animation: 150,
                    ghostClass: 'sortable-ghost',
                    chosenClass: 'sortable-chosen',
                    dragClass: 'sortable-drag',
                    handle: '.drag-handle-sub',
                    onEnd: function(evt) {
                        console.log(`🔄 Reordenando sub-atividades da atividade ${atividadeIndex}...`);
                        
                        const oldIndex = evt.oldIndex;
                        const newIndex = evt.newIndex;
                        
                        // Reordenar no array de sub-atividades
                        const movedSubItem = atividade.sub_atividades.splice(oldIndex, 1)[0];
                        atividade.sub_atividades.splice(newIndex, 0, movedSubItem);
                        
                        // Salvar e recarregar
                        salvarDados().then(() => {
                            console.log('✅ Ordem das sub-atividades salva');
                            carregarAdminView();
                        });
                    }
                });
                
                sortableInstances.push(sortableSub);
            }
        }
    });
    
    console.log(`✅ Drag & Drop configurado para ${sortableInstances.length} containers`);
}

// --- CARREGAR CRONOGRAMA COM DRAG & DROP ---
function carregarCronograma() {
    const cronogramaBody = document.getElementById('cronograma-body');
    if (!cronogramaBody) {
        console.error('❌ Elemento cronograma-body não encontrado');
        return;
    }
    
    cronogramaBody.innerHTML = '';

    // Adicionar seção de cronogramas padrão se não existir
    adicionarSecaoCronogramasPadrao();

    if (!dadosObra.cronograma || dadosObra.cronograma.length === 0) {
        cronogramaBody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px; color: #666;">📋 Nenhuma atividade cadastrada. Use os cronogramas padrão acima para começar!</td></tr>';
        return;
    }

    // CARREGAR ATIVIDADES PRINCIPAIS E SUB-ATIVIDADES
    dadosObra.cronograma.forEach((atividade, index) => {
        // CALCULAR PROGRESSO EFETIVO DA PRINCIPAL
        const progressoEfetivo = calcularProgressoPrincipalPorSubAtividades(atividade);
        const temSubAtividades = atividade.sub_atividades && atividade.sub_atividades.length > 0;
        
        // LINHA DA ATIVIDADE PRINCIPAL
        const row = cronogramaBody.insertRow();
        row.className = 'main-activity-row';
        row.innerHTML = `
            <td data-label="Atividade">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <span class="drag-handle-main" style="cursor: grab; color: #007bff; font-size: 18px;" title="Arrastar para reordenar">⋮⋮</span>
                    <div>
                        <strong>${atividade.descricao}</strong>
                        ${temSubAtividades ? 
                            `<span style="color: #007bff; margin-left: 10px;">(${atividade.sub_atividades.length} sub-atividades)</span>` : 
                            ''
                        }
                    </div>
                </div>
            </td>
            <td data-label="Tipo"><span style="background: #007bff; color: white; padding: 2px 8px; border-radius: 3px; font-size: 12px;">Principal</span></td>
            <td data-label="Peso (%)">
                <input type="number" min="0" max="100" step="0.1" value="${atividade.peso_global}" 
                       onchange="atualizarPesoAtividade(${index}, this.value)" style="width: 80px;">
            </td>
            <td data-label="Progresso (%)">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <input type="range" min="0" max="100" step="0.1" value="${progressoEfetivo}" 
                           onchange="atualizarProgressoAtividade(${index}, this.value)" 
                           style="flex: 1;" ${temSubAtividades ? 'disabled' : ''}>
                    <input type="number" min="0" max="100" step="0.1" value="${progressoEfetivo}" 
                           onchange="atualizarProgressoAtividade(${index}, this.value)" 
                           style="width: 70px;" ${temSubAtividades ? 'disabled' : ''}>
                    <span style="font-weight: bold; color: ${temSubAtividades ? '#007bff' : '#333'};">%</span>
                </div>
                ${temSubAtividades ? '<small style="color: #666;">Calculado pelas sub-atividades</small>' : ''}
            </td>
            <td data-label="Status">
                <select onchange="atualizarStatusAtividade(${index}, this.value)" style="width: 100%;">
                    <option value="Não Iniciada" ${atividade.status === 'Não Iniciada' ? 'selected' : ''}>Não Iniciada</option>
                    <option value="Em Andamento" ${atividade.status === 'Em Andamento' ? 'selected' : ''}>Em Andamento</option>
                    <option value="Concluída" ${atividade.status === 'Concluída' ? 'selected' : ''}>Concluída</option>
                </select>
            </td>
            <td data-label="Prazo">${atividade.prazo_final || 'N/A'}</td>
            <td data-label="Ações">
                <button onclick="removerAtividade(${index})" class="btn btn-danger btn-sm" style="padding: 5px 10px;">
                    🗑️
                </button>
            </td>
        `;
        
        // LINHAS DAS SUB-ATIVIDADES (SE EXISTIREM)
        if (atividade.sub_atividades && atividade.sub_atividades.length > 0) {
            atividade.sub_atividades.forEach((subAtividade, subIndex) => {
                const subRow = cronogramaBody.insertRow();
                subRow.className = 'sub-activity-row';
                subRow.setAttribute('data-parent-id', atividade.id);
                subRow.style.backgroundColor = '#f8f9fa';
                subRow.innerHTML = `
                    <td data-label="Atividade" style="padding-left: 30px;">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <span class="drag-handle-sub" style="cursor: grab; color: #6c757d; font-size: 14px;" title="Arrastar para reordenar">⋮⋮</span>
                            <span>↳ ${subAtividade.descricao}</span>
                        </div>
                    </td>
                    <td data-label="Tipo"><span style="background: #6c757d; color: white; padding: 2px 8px; border-radius: 3px; font-size: 12px;">Sub</span></td>
                    <td data-label="Peso (%)">
                        <input type="number" min="0" max="${atividade.peso_global}" step="0.01" value="${subAtividade.peso_local || 0}" 
                               onchange="atualizarPesoSubAtividade(${index}, ${subIndex}, this.value)" style="width: 80px;">
                    </td>
                    <td data-label="Progresso (%)">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <input type="range" min="0" max="100" step="0.1" value="${subAtividade.progresso_atividade || 0}" 
                                   onchange="atualizarProgressoSubAtividade(${index}, ${subIndex}, this.value)" style="flex: 1;">
                            <input type="number" min="0" max="100" step="0.1" value="${subAtividade.progresso_atividade || 0}" 
                                   onchange="atualizarProgressoSubAtividade(${index}, ${subIndex}, this.value)" style="width: 70px;">
                            <span style="font-weight: bold;">%</span>
                        </div>
                    </td>
                    <td data-label="Status">
                        <select onchange="atualizarStatusSubAtividade(${index}, ${subIndex}, this.value)" style="width: 100%;">
                            <option value="Não Iniciada" ${subAtividade.status === 'Não Iniciada' ? 'selected' : ''}>Não Iniciada</option>
                            <option value="Em Andamento" ${subAtividade.status === 'Em Andamento' ? 'selected' : ''}>Em Andamento</option>
                            <option value="Concluída" ${subAtividade.status === 'Concluída' ? 'selected' : ''}>Concluída</option>
                        </select>
                    </td>
                    <td data-label="Prazo">${subAtividade.prazo_final || 'N/A'}</td>
                    <td data-label="Ações">
                        <button onclick="removerSubAtividade(${index}, ${subIndex})" class="btn btn-danger btn-sm" style="padding: 5px 10px;">
                            🗑️
                        </button>
                    </td>
                `;
            });
        }
    });
    
    // Configurar drag & drop após carregar o cronograma
    setTimeout(() => {
        configurarDragAndDrop();
    }, 100);
    
    console.log(`✅ Cronograma renderizado: ${dadosObra.cronograma.length} atividades principais`);
}

// --- ADICIONAR CSS PARA DRAG & DROP ---
function adicionarEstilosDragDrop() {
    const style = document.createElement('style');
    style.textContent = `
        .sortable-ghost {
            opacity: 0.4;
            background: #e3f2fd !important;
        }
        
        .sortable-chosen {
            background: #bbdefb !important;
        }
        
        .sortable-drag {
            background: #2196f3 !important;
            color: white !important;
        }
        
        .drag-handle-main:hover,
        .drag-handle-sub:hover {
            color: #0056b3 !important;
            transform: scale(1.1);
        }
        
        .drag-handle-main:active,
        .drag-handle-sub:active {
            cursor: grabbing !important;
        }
        
        .main-activity-row {
            transition: all 0.2s ease;
        }
        
        .sub-activity-row {
            transition: all 0.2s ease;
        }
        
        .main-activity-row:hover,
        .sub-activity-row:hover {
            background: #f0f8ff !important;
        }
    `;
    document.head.appendChild(style);
}

// --- ADICIONAR SEÇÃO DE CRONOGRAMAS PADRÃO ---
function adicionarSecaoCronogramasPadrao() {
    if (document.getElementById('cronogramas-padrao-section')) return;
    
    const tableContainer = document.querySelector('.table-container');
    if (!tableContainer) return;
    
    const secaoPadrao = document.createElement('div');
    secaoPadrao.id = 'cronogramas-padrao-section';
    secaoPadrao.style.cssText = `
        background: linear-gradient(135deg, #f8f9fa, #e9ecef);
        border: 2px solid #007bff;
        border-radius: 10px;
        padding: 25px;
        margin-bottom: 25px;
    `;
    
    secaoPadrao.innerHTML = `
        <h3 style="color: #007bff; margin-bottom: 15px;">
            <i class="fas fa-templates"></i> Cronogramas Padrão
        </h3>
        <p style="margin-bottom: 20px; color: #666;">Selecione um cronograma padrão para começar rapidamente:</p>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-bottom: 25px;">
            ${Object.keys(CRONOGRAMAS_PADRAO).map(key => {
                const padrao = CRONOGRAMAS_PADRAO[key];
                return `
                    <div style="background: white; padding: 20px; border-radius: 10px; border: 1px solid #ddd; text-align: center;">
                        <h4 style="color: #007bff; margin-bottom: 10px;">${padrao.nome}</h4>
                        <p style="color: #666; margin-bottom: 15px;">${padrao.atividades.length} atividades</p>
                        <button onclick="aplicarCronogramaPadrao('${key}')" class="btn btn-success" style="width: 100%;">
                            <i class="fas fa-check"></i> Aplicar Este Cronograma
                        </button>
                    </div>
                `;
            }).join('')}
        </div>
        
        <div style="display: flex; gap: 15px; flex-wrap: wrap;">
            <button onclick="limparCronograma()" class="btn btn-danger">
                <i class="fas fa-trash-alt"></i> Limpar Cronograma
            </button>
            <button onclick="adicionarAtividadeManual()" class="btn btn-primary">
                <i class="fas fa-plus"></i> Adicionar Atividade Manual
            </button>
        </div>
    `;
    
    tableContainer.parentNode.insertBefore(secaoPadrao, tableContainer);
}

// --- APLICAR CRONOGRAMA PADRÃO ---
async function aplicarCronogramaPadrao(tipoPadrao) {
    const padrao = CRONOGRAMAS_PADRAO[tipoPadrao];
    if (!padrao) return;
    
    const confirmar = confirm(`Aplicar o cronograma "${padrao.nome}"?\n\nIsso substituirá todas as atividades atuais.`);
    if (!confirmar) return;
    
    console.log(`🏗️ Aplicando cronograma padrão: ${padrao.nome}`);
    
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
        carregarAdminView();
        alert(`✅ Cronograma "${padrao.nome}" aplicado com sucesso!\n\n${padrao.atividades.length} atividades criadas.`);
    } catch (error) {
        console.error('❌ Erro ao aplicar padrão:', error);
        alert('❌ Erro ao aplicar cronograma padrão');
    }
}

// --- FUNÇÕES DE ATUALIZAÇÃO (mantidas iguais) ---
async function atualizarProgressoAtividade(index, novoProgresso) {
    const atividade = dadosObra.cronograma[index];
    if (!atividade) return;
    
    const progressoValidado = validarProgresso(novoProgresso);
    
    if (atividade.sub_atividades && atividade.sub_atividades.length > 0) {
        alert('⚠️ Esta atividade possui sub-atividades. O progresso é calculado automaticamente.');
        carregarAdminView();
        return;
    }
    
    atividade.progresso_atividade = progressoValidado;
    atividade.status = getAutomatedStatus(progressoValidado);
    
    await salvarDados();
    carregarAdminView();
}

async function atualizarStatusAtividade(index, novoStatus) {
    const atividade = dadosObra.cronograma[index];
    if (!atividade) return;
    
    atividade.status = novoStatus;
    await salvarDados();
}

async function atualizarPesoAtividade(index, novoPeso) {
    const atividade = dadosObra.cronograma[index];
    if (!atividade) return;
    
    const pesoValidado = validarProgresso(novoPeso);
    atividade.peso_global = pesoValidado;
    
    const validacao = validarPesoGlobalTotal();
    if (validacao.excede) {
        alert(`⚠️ ATENÇÃO: O peso global total (${validacao.total}%) excede 100%!\n\nAjuste os pesos das atividades.`);
    }
    
    await salvarDados();
    carregarAdminView();
}

async function atualizarProgressoSubAtividade(atividadeIndex, subIndex, novoProgresso) {
    const atividade = dadosObra.cronograma[atividadeIndex];
    if (!atividade || !atividade.sub_atividades || !atividade.sub_atividades[subIndex]) return;
    
    const progressoValidado = validarProgresso(novoProgresso);
    
    atividade.sub_atividades[subIndex].progresso_atividade = progressoValidado;
    atividade.sub_atividades[subIndex].status = getAutomatedStatus(progressoValidado);
    
    const novoProgressoPrincipal = calcularProgressoPrincipalPorSubAtividades(atividade);
    atividade.progresso_atividade = novoProgressoPrincipal;
    atividade.status = getAutomatedStatus(novoProgressoPrincipal);
    
    await salvarDados();
    carregarAdminView();
}

async function atualizarStatusSubAtividade(atividadeIndex, subIndex, novoStatus) {
    const atividade = dadosObra.cronograma[atividadeIndex];
    if (!atividade || !atividade.sub_atividades || !atividade.sub_atividades[subIndex]) return;
    
    atividade.sub_atividades[subIndex].status = novoStatus;
    await salvarDados();
}

async function atualizarPesoSubAtividade(atividadeIndex, subIndex, novoPeso) {
    const atividade = dadosObra.cronograma[atividadeIndex];
    if (!atividade || !atividade.sub_atividades || !atividade.sub_atividades[subIndex]) return;
    
    const pesoValidado = validarProgresso(novoPeso);
    atividade.sub_atividades[subIndex].peso_local = pesoValidado;
    
    const validacao = validarPesoLocalSubAtividades(atividade);
    if (validacao.excede) {
        alert(`⚠️ ATENÇÃO: O peso total das sub-atividades (${validacao.total}%) excede o peso da atividade principal (${validacao.limite}%)!\n\nAjuste os pesos das sub-atividades.`);
    }
    
    await salvarDados();
    carregarAdminView();
}

async function removerSubAtividade(atividadeIndex, subIndex) {
    if (!confirm('❓ Tem certeza que deseja remover esta sub-atividade?')) return;

    const atividade = dadosObra.cronograma[atividadeIndex];
    if (!atividade || !atividade.sub_atividades) return;
    
    atividade.sub_atividades.splice(subIndex, 1);
    
    if (atividade.sub_atividades.length === 0) {
        delete atividade.sub_atividades;
        atividade.progresso_atividade = 0;
        atividade.status = "Não Iniciada";
    } else {
        const novoProgressoPrincipal = calcularProgressoPrincipalPorSubAtividades(atividade);
        atividade.progresso_atividade = novoProgressoPrincipal;
        atividade.status = getAutomatedStatus(novoProgressoPrincipal);
    }
    
    try {
        await salvarDados();
        carregarAdminView();
        alert('✅ Sub-atividade removida!');
    } catch (error) {
        console.error('❌ Erro:', error);
        alert('❌ Erro ao remover sub-atividade');
    }
}

// --- FUNÇÕES DE AÇÃO (mantidas iguais) ---
function adicionarAtividadeManual() {
    const descricao = prompt('📝 Descrição da atividade:');
    if (!descricao) return;
    
    const peso = prompt('⚖️ Peso da atividade (0.1-100):');
    if (!peso || isNaN(peso)) return;
    
    const pesoValidado = validarProgresso(peso);
    const prazo = prompt('📅 Prazo final (YYYY-MM-DD):') || '2025-12-31';
    
    const novaAtividade = {
        id: gerarNovoId("ATV"),
        descricao: descricao,
        peso_global: pesoValidado,
        progresso_atividade: 0,
        status: "Não Iniciada",
        prazo_final: prazo,
        sub_atividades: []
    };
    
    dadosObra.cronograma.push(novaAtividade);
    
    const validacao = validarPesoGlobalTotal();
    if (validacao.excede) {
        alert(`⚠️ ATENÇÃO: O peso global total agora é ${validacao.total}% (excede 100%)!`);
    }
    
    salvarDados().then(() => {
        carregarAdminView();
        alert('✅ Atividade adicionada!');
    }).catch(error => {
        console.error('❌ Erro:', error);
        alert('❌ Erro ao adicionar atividade');
    });
}

async function adicionarAtividadePrincipal() {
    const descricao = document.getElementById('nova-atividade-descricao')?.value?.trim();
    const pesoGlobal = parseFloat(document.getElementById('nova-atividade-peso-global')?.value);
    const prazo = document.getElementById('nova-atividade-prazo')?.value;

    if (!descricao || isNaN(pesoGlobal) || pesoGlobal <= 0) {
        alert('❌ Por favor, preencha todos os campos da atividade principal.');
        return;
    }

    const pesoValidado = validarProgresso(pesoGlobal);

    const novaAtividade = {
        id: gerarNovoId("ATV"),
        descricao: descricao,
        peso_global: pesoValidado,
        progresso_atividade: 0,
        status: "Não Iniciada",
        prazo_final: prazo || "2025-12-31",
        sub_atividades: []
    };

    dadosObra.cronograma.push(novaAtividade);
    
    const validacao = validarPesoGlobalTotal();
    if (validacao.excede) {
        alert(`⚠️ ATENÇÃO: O peso global total agora é ${validacao.total}% (excede 100%)!`);
    }
    
    try {
        await salvarDados();
        carregarAdminView();
        
        document.getElementById('nova-atividade-descricao').value = '';
        document.getElementById('nova-atividade-peso-global').value = '';
        document.getElementById('nova-atividade-prazo').value = '';
        
        alert('✅ Atividade adicionada com sucesso!');
        
    } catch (error) {
        console.error('❌ Erro ao adicionar atividade:', error);
        alert('❌ Erro ao salvar atividade. Tente novamente.');
    }
}

async function adicionarSubAtividade() {
    console.log('➕ Tentando adicionar sub-atividade...');
    
    const parentId = document.getElementById('parent-activity-select')?.value;
    const descricao = document.getElementById('nova-sub-atividade-descricao')?.value?.trim();
    const pesoLocal = parseFloat(document.getElementById('nova-sub-atividade-peso-local')?.value);
    const prazo = document.getElementById('nova-sub-atividade-prazo')?.value;

    if (!parentId || !descricao || isNaN(pesoLocal) || pesoLocal <= 0) {
        alert('❌ Por favor, preencha todos os campos da sub-atividade.');
        return;
    }

    const atividadePrincipal = dadosObra.cronograma.find(a => a.id === parentId);
    if (!atividadePrincipal) {
        alert('❌ Atividade principal não encontrada.');
        return;
    }

    const pesoValidado = validarProgresso(pesoLocal);

    if (!atividadePrincipal.sub_atividades) {
        atividadePrincipal.sub_atividades = [];
    }

    const novaSubAtividade = {
        id: gerarNovoId("SUB"),
        descricao: descricao,
        peso_local: pesoValidado,
        progresso_atividade: 0,
        status: "Não Iniciada",
        prazo_final: prazo || "2025-12-31"
    };

    atividadePrincipal.sub_atividades.push(novaSubAtividade);
    
    const validacao = validarPesoLocalSubAtividades(atividadePrincipal);
    if (validacao.excede) {
        alert(`⚠️ ATENÇÃO: O peso total das sub-atividades (${validacao.total}%) excede o peso da atividade principal (${validacao.limite}%)!`);
    }
    
    try {
        await salvarDados();
        carregarAdminView();
        
        document.getElementById('parent-activity-select').value = '';
        document.getElementById('nova-sub-atividade-descricao').value = '';
        document.getElementById('nova-sub-atividade-peso-local').value = '';
        document.getElementById('nova-sub-atividade-prazo').value = '';
        
        alert('✅ Sub-atividade adicionada com sucesso!');
        
    } catch (error) {
        console.error('❌ Erro ao adicionar sub-atividade:', error);
        alert('❌ Erro ao salvar sub-atividade. Tente novamente.');
    }
}

async function limparCronograma() {
    if (!confirm('❓ Tem certeza que deseja LIMPAR TODO O CRONOGRAMA? Esta ação é irreversível!')) return;

    dadosObra.cronograma = [];
    
    try {
        await salvarDados();
        carregarAdminView();
        alert('✅ Cronograma limpo com sucesso!');
    } catch (error) {
        console.error('❌ Erro ao limpar cronograma:', error);
        alert('❌ Erro ao limpar cronograma. Tente novamente.');
    }
}

async function removerAtividade(index) {
    if (!confirm('❓ Tem certeza que deseja remover esta atividade?')) return;

    dadosObra.cronograma.splice(index, 1);
    
    try {
        await salvarDados();
        carregarAdminView();
        alert('✅ Atividade removida!');
    } catch (error) {
        console.error('❌ Erro:', error);
        alert('❌ Erro ao remover atividade');
    }
}

// --- CARREGAR INTERFACE ADMIN ---
function carregarAdminView() {
    // Atualizar progresso global
    const progressoGlobal = calcularProgressoGlobal();
    const progressoEl = document.getElementById('admin-progresso-global');
    if (progressoEl) {
        progressoEl.textContent = `${progressoGlobal.toFixed(1)}%`;
    }

    // Carregar cronograma
    carregarCronograma();
    
    // Carregar custos
    carregarCustos();
    
    // Carregar dropdown de atividades
    carregarDropdownAtividades();
    
    // Atualizar display de peso global
    atualizarDisplayPesoGlobal();
    
    console.log('✅ Admin view carregada');
}

// --- EVENT LISTENERS ---
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Inicializando aplicação com Drag & Drop...');
    
    // Adicionar estilos CSS para drag & drop
    adicionarEstilosDragDrop();
    
    try {
        await carregarDadosProjeto();
        await atualizarInfoObra();
        carregarAdminView();
        
        console.log('✅ Aplicação inicializada com sucesso');
        
    } catch (error) {
        console.error('❌ Erro na inicialização:', error);
        alert('Erro ao carregar dados. Verifique a conexão e recarregue a página.');
    }
});

// Event listener para o formulário de cronograma
document.getElementById('cronograma-form')?.addEventListener('submit', async function(event) {
    event.preventDefault();
    console.log('💾 Salvando cronograma...');

    try {
        await salvarDados();
        alert('✅ Cronograma salvo com sucesso!');
    } catch (error) {
        console.error('❌ Erro ao salvar:', error);
        alert('❌ Erro ao salvar cronograma');
    }
});

// Event listener para o formulário de custos
// Event listener para o formulário de custos rápido
document.getElementById('custos-form-rapido')?.addEventListener('submit', lancarCustoRapido);

// Manter compatibilidade com formulário antigo (se existir)
document.getElementById('custos-form')?.addEventListener('submit', async function(event) {
    event.preventDefault();
    const novoMaterial = parseFloat(document.getElementById('novo-material')?.value) || 0;
    const novaMaoDeObra = parseFloat(document.getElementById('nova-mao-de-obra')?.value) || 0;

    if (novoMaterial === 0 && novaMaoDeObra === 0) {
        alert('Por favor, informe pelo menos um valor para material ou mão de obra.');
        return;
    }

    // Garantir estrutura de gastos
    if (!dadosObra.gastos) {
        dadosObra.gastos = {
            material: { total_realizado: 0 },
            mao_de_obra: { total_realizado: 0 },
            historico: []
        };
    }

    if (!dadosObra.gastos.historico) {
        dadosObra.gastos.historico = [];
    }

    // Adicionar ao histórico detalhado
    if (novoMaterial > 0) {
        dadosObra.gastos.historico.push({
            id: gerarNovoId('CST'),
            data: new Date().toISOString().split('T')[0],
            categoria: 'Material',
            descricao: 'Lançamento via formulário antigo',
            fornecedor: 'Não informado',
            valor: novoMaterial,
            data_lancamento: new Date().toISOString(),
            status_pagamento: 'Pago'
        });
    }

    if (novaMaoDeObra > 0) {
        dadosObra.gastos.historico.push({
            id: gerarNovoId('CST'),
            data: new Date().toISOString().split('T')[0],
            categoria: 'Mão de Obra',
            descricao: 'Lançamento via formulário antigo',
            fornecedor: 'Não informado',
            valor: novaMaoDeObra,
            data_lancamento: new Date().toISOString(),
            status_pagamento: 'Pago'
        });
    }

    dadosObra.gastos.material.total_realizado = (dadosObra.gastos.material.total_realizado || 0) + novoMaterial;
    dadosObra.gastos.mao_de_obra.total_realizado = (dadosObra.gastos.mao_de_obra.total_realizado || 0) + novaMaoDeObra;

    try {
        await salvarDados();
        carregarAdminView();
        
        if (document.getElementById('novo-material')) document.getElementById('novo-material').value = 0;
        if (document.getElementById('nova-mao-de-obra')) document.getElementById('nova-mao-de-obra').value = 0;
        
        alert('✅ Custos lançados com sucesso!');
    } catch (error) {
        console.error('❌ Erro ao lançar custos:', error);
        alert('❌ Erro ao lançar custos');
    }
});

console.log('✅ Script com Drag & Drop carregado completamente');