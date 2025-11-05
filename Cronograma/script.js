// --- CONFIGURAÇÃO FIREBASE ---
const firebaseConfig = {
    apiKey: "AIzaSyDq3mr-ryX_q8GAEyfTsQP2mzjpP9wOugE",
    authDomain: "houseup-app.firebaseapp.com",
    projectId: "houseup-app",
    storageBucket: "houseup-app.firebasestorage.app",
    messagingSenderId: "401114152723",
    appId: "1:401114152723:web:f96eaf0a718342c0cf64e6"
};

// Inicializar Firebase se ainda não foi
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
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

// Atualizar referência do Firebase para o projeto específico
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

// --- ATUALIZAR INFO DA OBRA ---
async function atualizarInfoObra() {
    try {
        const doc = await dadosObraRef.get();
        if (doc.exists) {
            const projeto = doc.data();
            const info = projeto.info_projeto;
            
            // Atualizar elementos se existirem
            const elementos = {
                'admin-nome-obra': info?.nome_obra,
                'admin-codigo-obra': info?.codigo_obra,
                'projeto-atual': info?.nome_obra
            };
            
            Object.keys(elementos).forEach(id => {
                const el = document.getElementById(id);
                if (el && elementos[id]) {
                    el.textContent = elementos[id];
                }
            });
            
            // Atualizar link do cliente se existir
            const clientLink = document.getElementById('client-link');
            if (clientLink) {
                clientLink.href = `https://codepen.io/OneAIAdapta/pen/MWjKLxP?projeto=${PROJETO_ATUAL}`;
            }
            
            console.log('✅ Info da obra atualizada:', info?.nome_obra);
        }
    } catch (error) {
        console.error('❌ Erro ao carregar info da obra:', error);
    }
}

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
            
            // Converter estrutura antiga de gastos se necessário
            if (typeof dadosObra.gastos.material === 'number') {
                dadosObra.gastos = {
                    material: { total_realizado: dadosObra.gastos.material || 0 },
                    mao_de_obra: { total_realizado: dadosObra.gastos.mao_de_obra || 0 }
                };
            }
            
            console.log(`📊 Cronograma carregado: ${dadosObra.cronograma.length} atividades`);
            
        } else {
            console.log('⚠️ Projeto não encontrado, criando estrutura básica...');
            dadosObra = {
                cronograma: [],
                gastos: {
                    material: { total_realizado: 0, historico: [] },
                    mao_de_obra: { total_realizado: 0, historico: [] }
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
        dadosObra = {
            cronograma: [],
            gastos: {
                material: { total_realizado: 0 },
                mao_de_obra: { total_realizado: 0 }
            }
        };
        return dadosObra;
    }
}

// --- FUNÇÕES UTILITÁRIAS ---
function getAutomatedStatus(progressValue) {
    if (progressValue === 0) return "Não Iniciada";
    if (progressValue === 100) return "Concluída";
    return "Em Andamento";
}

function getEffectiveActivityProgress(atividade) {
    if (atividade.sub_atividades && atividade.sub_atividades.length > 0) {
        let progressoPonderado = 0;
        let pesoTotalSubAtividades = 0;
        
        atividade.sub_atividades.forEach(sub => {
            const pesoLocal = parseFloat(sub.peso_local) || 0;
            const progressoSub = parseFloat(sub.progresso_atividade) || 0;
            
            progressoPonderado += (pesoLocal * progressoSub);
            pesoTotalSubAtividades += pesoLocal;
        });
        
        if (pesoTotalSubAtividades === 0) return 0;
        
        const progressoCalculado = progressoPonderado / pesoTotalSubAtividades;
        return parseFloat(progressoCalculado.toFixed(2));
    } else {
        return parseFloat(atividade.progresso_atividade) || 0;
    }
}

function calcularProgressoGlobal(cronograma = dadosObra.cronograma) {
    if (!cronograma || cronograma.length === 0) return 0;
    
    let progressoGlobalPonderado = 0;
    let pesoGlobalTotal = 0;

    cronograma.forEach(atividadePrincipal => {
        const pesoGlobal = parseFloat(atividadePrincipal.peso_global) || 0;
        const progressoEfetivo = getEffectiveActivityProgress(atividadePrincipal);
        
        progressoGlobalPonderado += (pesoGlobal * progressoEfetivo);
        pesoGlobalTotal += pesoGlobal;
    });

    const progressoGlobal = pesoGlobalTotal === 0 ? 0 : progressoGlobalPonderado / pesoGlobalTotal;
    return parseFloat(progressoGlobal.toFixed(2));
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

async function salvarDadosObra() {
    try {
        await salvarDados();
        alert('✅ Dados salvos com sucesso!');
        carregarAdminView();
    } catch (error) {
        console.error("Erro ao salvar dados no Firestore: ", error);
        alert('❌ Erro ao salvar dados. Verifique o console do navegador (F12) para mais detalhes.');
    }
}

// --- CARREGAR CUSTOS ---
function carregarCustos() {
    const totalMaterial = dadosObra.gastos?.material?.total_realizado || 0;
    const totalMaoObra = dadosObra.gastos?.mao_de_obra?.total_realizado || 0;
    
    const materialEl = document.getElementById('total-material-admin');
    const maoObraEl = document.getElementById('total-mao-de-obra-admin');
    
    if (materialEl) materialEl.textContent = formatarMoeda(totalMaterial);
    if (maoObraEl) maoObraEl.textContent = formatarMoeda(totalMaoObra);
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
}

// --- CARREGAR INTERFACE ADMIN ---
function carregarAdminView() {
    // Atualizar progresso global
    const progressoGlobal = calcularProgressoGlobal();
    const progressoEl = document.getElementById('admin-progresso-global');
    if (progressoEl) {
        progressoEl.textContent = `${progressoGlobal.toFixed(1)}%`;
    }

    const cronogramaBody = document.getElementById('cronograma-body');
    if (!cronogramaBody) {
        console.error('❌ Elemento cronograma-body não encontrado');
        return;
    }
    
    cronogramaBody.innerHTML = '';

    // Carregar dropdown de atividades principais
    carregarDropdownAtividades();

    // Adicionar seção de cronogramas padrão se não existir
    adicionarSecaoCronogramasPadrao();

    if (!dadosObra.cronograma || dadosObra.cronograma.length === 0) {
        cronogramaBody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px; color: #666;">📋 Nenhuma atividade cadastrada. Use os cronogramas padrão acima para começar!</td></tr>';
        carregarCustos();
        return;
    }

    dadosObra.cronograma.forEach((atividadePrincipal, indexPrincipal) => {
        let firstCellContent = '';
        if (atividadePrincipal.sub_atividades && atividadePrincipal.sub_atividades.length > 0) {
            firstCellContent += `<span class="toggle-icon" onclick="toggleSubActivities('${atividadePrincipal.id}')">▶</span>`;
        }
        firstCellContent += `<input type="text" value="${atividadePrincipal.descricao}" data-id="${atividadePrincipal.id}" data-type="descricao-principal" class="activity-description-input">`;

        const isPrincipalProgressDisabled = (atividadePrincipal.sub_atividades && atividadePrincipal.sub_atividades.length > 0) ? 'disabled' : '';
        const principalProgressClass = (atividadePrincipal.sub_atividades && atividadePrincipal.sub_atividades.length > 0) ? 'disabled-input' : '';
        const principalEffectiveProgress = getEffectiveActivityProgress(atividadePrincipal).toFixed(1);

        const row = cronogramaBody.insertRow();
        row.innerHTML = `
            <td data-label="Atividade / Sub-Atividade">${firstCellContent}</td>
            <td data-label="Tipo">Principal</td>
            <td data-label="Peso (%)"><input type="number" min="0" max="100" step="0.1" value="${atividadePrincipal.peso_global}" data-id="${atividadePrincipal.id}" data-type="peso-global" class="activity-progress-input"></td>
            <td data-label="Progresso (%)">
                <div class="progress-cell-content">
                    <input type="number" min="0" max="100" step="0.1" value="${principalEffectiveProgress}" ${isPrincipalProgressDisabled} class="${principalProgressClass} activity-progress-input" data-id="${atividadePrincipal.id}" data-type="progresso-principal">
                    <div class="progress-bar-container">
                        <div class="progress-bar-fill" style="width: ${principalEffectiveProgress}%;"></div>
                    </div>
                </div>
            </td>
            <td data-label="Status">
                <select data-id="${atividadePrincipal.id}" data-type="status-principal">
                    <option value="Não Iniciada" ${atividadePrincipal.status === 'Não Iniciada' ? 'selected' : ''}>Não Iniciada</option>
                    <option value="Em Andamento" ${atividadePrincipal.status === 'Em Andamento' ? 'selected' : ''}>Em Andamento</option>
                    <option value="Aguardando material" ${atividadePrincipal.status === 'Aguardando material' ? 'selected' : ''}>Aguardando material</option>
                    <option value="Concluída" ${atividadePrincipal.status === 'Concluída' ? 'selected' : ''}>Concluída</option>
                </select>
            </td>
            <td data-label="Prazo Final">${new Date(atividadePrincipal.prazo_final || '2025-12-31').toLocaleDateString('pt-BR')}</td>
            <td data-label="Ações">
                <div class="action-buttons">
                    <button type="button" onclick="removerAtividade('${atividadePrincipal.id}', 'principal')">🗑️</button>
                </div>
            </td>
        `;

        if (atividadePrincipal.sub_atividades) {
            atividadePrincipal.sub_atividades.forEach((sub, indexSub) => {
                const subRow = cronogramaBody.insertRow();
                subRow.classList.add('sub-activity-row', `sub-of-${atividadePrincipal.id}`, 'sub-activity-hidden');
                subRow.innerHTML = `
                    <td data-label="Atividade / Sub-Atividade"><span class="sub-indent-char">- </span><input type="text" value="${sub.descricao}" data-id="${atividadePrincipal.id}" data-sub-id="${sub.id}" data-type="descricao-sub" class="activity-description-input"></td>
                    <td data-label="Tipo">Sub</td>
                    <td data-label="Peso (%)"><input type="number" min="0" max="${atividadePrincipal.peso_global}" step="0.01" value="${sub.peso_local}" data-id="${atividadePrincipal.id}" data-sub-id="${sub.id}" data-type="peso-local" class="activity-progress-input"></td>
                    <td data-label="Progresso (%)">
                        <div class="progress-cell-content">
                            <input type="number" min="0" max="100" step="0.1" value="${sub.progresso_atividade}" class="activity-progress-input" data-id="${atividadePrincipal.id}" data-sub-id="${sub.id}" data-type="progresso-sub">
                            <div class="progress-bar-container">
                                <div class="progress-bar-fill" style="width: ${sub.progresso_atividade}%;"></div>
                            </div>
                        </div>
                    </td>
                    <td data-label="Status">
                        <select data-id="${atividadePrincipal.id}" data-sub-id="${sub.id}" data-type="status-sub">
                            <option value="Não Iniciada" ${sub.status === 'Não Iniciada' ? 'selected' : ''}>Não Iniciada</option>
                            <option value="Em Andamento" ${sub.status === 'Em Andamento' ? 'selected' : ''}>Em Andamento</option>
                            <option value="Aguardando material" ${sub.status === 'Aguardando material' ? 'selected' : ''}>Aguardando material</option>
                            <option value="Concluída" ${sub.status === 'Concluída' ? 'selected' : ''}>Concluída</option>
                        </select>
                    </td>
                    <td data-label="Prazo Final">${new Date(sub.prazo_final).toLocaleDateString('pt-BR')}</td>
                    <td data-label="Ações">
                        <div class="action-buttons">
                            <button type="button" onclick="removerAtividade('${atividadePrincipal.id}', 'sub', '${sub.id}')">🗑️</button>
                        </div>
                    </td>
                `;
            });
        }
    });

    // Carregar custos
    carregarCustos();

    // Adicionar event listeners para inputs
    document.querySelectorAll('.activity-progress-input').forEach(input => {
        input.addEventListener('input', () => updateProgressBarVisual(input));
        updateProgressBarVisual(input);
    });
    
    console.log('✅ Admin view carregada com dados:', dadosObra);
}

// --- ADICIONAR SEÇÃO DE CRONOGRAMAS PADRÃO ---
function adicionarSecaoCronogramasPadrao() {
    // Verificar se já existe
    if (document.getElementById('cronogramas-padrao-section')) return;
    
    // Encontrar onde inserir (antes da tabela)
    const tableSection = document.querySelector('.chronogram-section');
    if (!tableSection) return;
    
    // Criar seção
    const secaoPadrao = document.createElement('section');
    secaoPadrao.id = 'cronogramas-padrao-section';
    secaoPadrao.className = 'chronogram-section';
    secaoPadrao.style.cssText = 'background: linear-gradient(135deg, #f8f9fa, #e9ecef); border: 2px solid #007bff;';
    
    secaoPadrao.innerHTML = `
        <h2><i class="fas fa-templates"></i> Cronogramas Padrão</h2>
        <p style="margin-bottom: 20px; color: #666;">Selecione um cronograma padrão para começar rapidamente:</p>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-bottom: 25px;">
            ${Object.keys(CRONOGRAMAS_PADRAO).map(key => {
                const padrao = CRONOGRAMAS_PADRAO[key];
                return `
                    <div style="background: white; padding: 20px; border-radius: 10px; border: 1px solid #ddd; text-align: center;">
                        <h3 style="color: #007bff; margin-bottom: 10px;">${padrao.nome}</h3>
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
    
    // Inserir antes da tabela
    tableSection.parentNode.insertBefore(secaoPadrao, tableSection);
}

// --- APLICAR CRONOGRAMA PADRÃO ---
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
        carregarAdminView();
        alert(`✅ Cronograma "${padrao.nome}" aplicado com sucesso!\n\n${padrao.atividades.length} atividades criadas.`);
    } catch (error) {
        console.error('❌ Erro ao aplicar padrão:', error);
        alert('❌ Erro ao aplicar cronograma padrão');
    }
}

// --- FUNÇÕES DE AÇÃO ---
function adicionarAtividadeManual() {
    const descricao = prompt('📝 Descrição da atividade:');
    if (!descricao) return;
    
    const peso = prompt('⚖️ Peso da atividade (1-100):');
    if (!peso || isNaN(peso)) return;
    
    const prazo = prompt('📅 Prazo final (YYYY-MM-DD):') || '2025-12-31';
    
    const novaAtividade = {
        id: gerarNovoId("ATV"),
        descricao: descricao,
        peso_global: parseInt(peso),
        progresso_atividade: 0,
        status: "Não Iniciada",
        prazo_final: prazo,
        sub_atividades: []
    };
    
    dadosObra.cronograma.push(novaAtividade);
    
    salvarDados().then(() => {
        carregarAdminView();
        alert('✅ Atividade adicionada!');
    }).catch(error => {
        console.error('❌ Erro:', error);
        alert('❌ Erro ao adicionar atividade');
    });
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

function updateProgressBarVisual(inputElement) {
    const progressValue = parseFloat(inputElement.value) || 0;
    const progressBarFill = inputElement.nextElementSibling?.querySelector('.progress-bar-fill');

    if (progressBarFill) {
        progressBarFill.style.width = `${progressValue}%`;
    }

    const activityId = inputElement.dataset.id;
    const subActivityId = inputElement.dataset.subId;

    if (subActivityId) {
        const principal = dadosObra.cronograma.find(a => a.id === activityId);
        const currentActivity = principal?.sub_atividades?.find(s => s.id === subActivityId);
        
        if (currentActivity && inputElement.dataset.type === 'progresso-sub') {
            currentActivity.progresso_atividade = progressValue;
            currentActivity.status = getAutomatedStatus(progressValue);
        }
    } else {
        const currentActivity = dadosObra.cronograma.find(a => a.id === activityId);
        
        if (currentActivity && inputElement.dataset.type === 'progresso-principal') {
            if (!currentActivity.sub_atividades || currentActivity.sub_atividades.length === 0) {
                currentActivity.progresso_atividade = progressValue;
                currentActivity.status = getAutomatedStatus(progressValue);
            }
        }
    }
    
    const progressoGlobal = calcularProgressoGlobal(dadosObra.cronograma);
    const progressoGlobalElement = document.getElementById('admin-progresso-global');
    if (progressoGlobalElement) {
        progressoGlobalElement.textContent = `${progressoGlobal.toFixed(1)}%`;
    }
}

function removerAtividade(id, tipo, subId = null) {
    if (!confirm('❓ Tem certeza que deseja remover esta atividade?')) return;

    if (tipo === 'principal') {
        dadosObra.cronograma = dadosObra.cronograma.filter(atv => atv.id !== id);
    } else if (tipo === 'sub' && subId) {
        const atividadePrincipal = dadosObra.cronograma.find(a => a.id === id);
        if (atividadePrincipal && atividadePrincipal.sub_atividades) {
            atividadePrincipal.sub_atividades = atividadePrincipal.sub_atividades.filter(sub => sub.id !== subId);
            if (atividadePrincipal.sub_atividades.length === 0) {
                delete atividadePrincipal.sub_atividades;
            }
        }
    }
    
    salvarDados().then(() => {
        carregarAdminView();
        alert('✅ Atividade removida!');
    }).catch(error => {
        console.error('❌ Erro:', error);
        alert('❌ Erro ao remover atividade');
    });
}

function toggleSubActivities(parentActivityId) {
    const subActivityRows = document.querySelectorAll(`.sub-of-${parentActivityId}`);
    const toggleIcon = document.querySelector(`.toggle-icon[onclick="toggleSubActivities('${parentActivityId}')"]`);

    subActivityRows.forEach(row => {
        row.classList.toggle('sub-activity-hidden');
    });

    if (toggleIcon) {
        toggleIcon.classList.toggle('expanded');
    }
}

// --- INICIALIZAÇÃO ---
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Inicializando aplicação...');
    
    try {
        // 1. Atualizar info da obra
        await atualizarInfoObra();
        
        // 2. Carregar dados do projeto
        await carregarDadosProjeto();
        
        // 3. Carregar interface
        carregarAdminView();
        
        console.log('✅ Aplicação inicializada com sucesso');
        
    } catch (error) {
        console.error('❌ Erro na inicialização:', error);
        alert('Erro ao carregar dados. Verifique a conexão e recarregue a página.');
    }
});

console.log('✅ Script carregado completamente');