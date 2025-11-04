// --- FIREBASE CONFIGURAÇÃO E INICIALIZAÇÃO ---
const firebaseConfig = {
  apiKey: "AIzaSyDq3mr-ryX_q8GAEyfTsQP2mzjpP9wOugE",
  authDomain: "houseup-app.firebaseapp.com",
  projectId: "houseup-app",
  storageBucket: "houseup-app.firebasestorage.app",
  messagingSenderId: "401114152723",
  appId: "1:401114152723:web:f96eaf0a718342c0cf64e6",
  measurementId: "G-S07Q5EFB0T"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const dadosObraRef = db.collection('dados').doc('houseupData');

// Dados iniciais
const initialDadosObra = {
    "nome_obra": "Casa do Matheus - Projeto Veraneio",
    "codigo_obra": "HOUS-001-2024",
    "gastos": {
        "material": 0.00,
        "mao_de_obra": 0.00
    },
    "cronograma": [
        {
            "id": "ATV001", "descricao": "Fundação", "peso_global": 25,
            "sub_atividades": [
                { "id": "SUB001", "descricao": "Fundação - Escavação", "peso_local": 40, "progresso_atividade": 0, "prazo_final": "2025-10-20" },
                { "id": "SUB002", "descricao": "Fundação - Concretagem", "peso_local": 60, "progresso_atividade": 0, "prazo_final": "2025-10-28" }
            ]
        },
        {
            "id": "ATV002", "descricao": "Estrutura", "peso_global": 18,
            "sub_atividades": [
                { "id": "SUB003", "descricao": "Estrutura - Pilares Térreo", "peso_local": 45, "progresso_atividade": 0, "prazo_final": "2025-11-10" },
                { "id": "SUB004", "descricao": "Estrutura - Lajes", "peso_local": 55, "progresso_atividade": 0, "prazo_final": "2025-11-20" }
            ]
        },
        {
            "id": "ATV003", "descricao": "Alvenaria", "peso_global": 12, "progresso_atividade": 0, "prazo_final": "2025-11-25"
        },
        {
            "id": "ATV004", "descricao": "Instalações Elétricas", "peso_global": 10,
            "sub_atividades": [
                { "id": "SUB005", "descricao": "Instalação do Quadro de Distribuição", "peso_local": 30, "progresso_atividade": 0, "prazo_final": "2025-11-10" },
                { "id": "SUB006", "descricao": "Passagem de Eletrodutos", "peso_local": 70, "progresso_atividade": 0, "prazo_final": "2025-11-15" }
            ]
        },
        {
            "id": "ATV005", "descricao": "Acabamentos", "peso_global": 35,
            "sub_atividades": [
                { "id": "SUB007", "descricao": "Assentamento de Pisos", "peso_local": 50, "progresso_atividade": 0, "prazo_final": "2025-12-01" },
                { "id": "SUB008", "descricao": "Pintura Interna", "peso_local": 30, "progresso_atividade": 0, "prazo_final": "2025-12-10" },
                { "id": "SUB009", "descricao": "Instalação de Louças e Metais", "peso_local": 20, "progresso_atividade": 0, "prazo_final": "2025-12-15" }
            ]
        }
    ]
};

let dadosObra;

// Funções utilitárias
function getAutomatedStatus(progressValue) {
    if (progressValue === 0) {
        return "Não Iniciada";
    } else if (progressValue === 100) {
        return "Concluída";
    } else {
        return "Em Andamento";
    }
}

// FUNÇÃO CORRIGIDA: Calcula o progresso efetivo de uma atividade
function getEffectiveActivityProgress(atividade) {
    if (atividade.sub_atividades && atividade.sub_atividades.length > 0) {
        let progressoPonderado = 0;
        let pesoTotalSubAtividades = 0;
        
        atividade.sub_atividades.forEach(sub => {
            const pesoLocal = sub.peso_local || 0;
            const progressoSub = sub.progresso_atividade || 0;
            
            progressoPonderado += (pesoLocal * progressoSub);
            pesoTotalSubAtividades += pesoLocal;
        });
        
        // Se não há peso total, retorna 0
        if (pesoTotalSubAtividades === 0) {
            return 0;
        }
        
        // Calcula o progresso como média ponderada
        const progressoCalculado = progressoPonderado / pesoTotalSubAtividades;
        
        console.log(`Atividade ${atividade.descricao}:`, {
            progressoPonderado,
            pesoTotalSubAtividades,
            progressoCalculado: progressoCalculado.toFixed(2)
        });
        
        return parseFloat(progressoCalculado.toFixed(2));
    } else {
        return atividade.progresso_atividade || 0;
    }
}

// FUNÇÃO CORRIGIDA: Calcula o progresso global da obra
function calcularProgressoGlobal(cronograma) {
    let progressoGlobalPonderado = 0;
    let pesoGlobalTotal = 0;

    cronograma.forEach(atividadePrincipal => {
        const pesoGlobal = atividadePrincipal.peso_global || 0;
        const progressoEfetivo = getEffectiveActivityProgress(atividadePrincipal);
        
        progressoGlobalPonderado += (pesoGlobal * progressoEfetivo);
        pesoGlobalTotal += pesoGlobal;
        
        console.log(`Global - ${atividadePrincipal.descricao}:`, {
            pesoGlobal,
            progressoEfetivo,
            contribuicao: (pesoGlobal * progressoEfetivo).toFixed(2)
        });
    });

    const progressoGlobal = pesoGlobalTotal === 0 ? 0 : progressoGlobalPonderado / pesoGlobalTotal;
    
    console.log('Progresso Global Final:', {
        progressoGlobalPonderado: progressoGlobalPonderado.toFixed(2),
        pesoGlobalTotal,
        progressoGlobal: progressoGlobal.toFixed(2)
    });
    
    return parseFloat(progressoGlobal.toFixed(2));
}

function validarPesoLocalSubAtividades(atividadePrincipalId, novoPesoLocal, subAtividadeId = null) {
    const atividadePrincipal = dadosObra.cronograma.find(a => a.id === atividadePrincipalId);
    if (!atividadePrincipal || !atividadePrincipal.sub_atividades) return true;

    let somaAtual = 0;
    atividadePrincipal.sub_atividades.forEach(sub => {
        if (subAtividadeId && sub.id === subAtividadeId) return;
        somaAtual += sub.peso_local || 0;
    });

    const somaTotal = somaAtual + novoPesoLocal;
    
    if (somaTotal > 100) {
        alert(`❌ Erro: A soma dos pesos locais das sub-atividades (${somaTotal}%) não pode exceder 100%.\n\nPeso atual das outras sub-atividades: ${somaAtual}%\nPeso que você está tentando adicionar: ${novoPesoLocal}%\n\nPor favor, ajuste os valores.`);
        return false;
    }
    
    return true;
}

function formatarMoeda(valor) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

async function salvarDadosObra() {
    updateAllActivityStatuses();

    try {
        await dadosObraRef.set(dadosObra);
        alert('✅ Dados salvos com sucesso no Firestore!');
        carregarAdminView();
    } catch (error) {
        console.error("Erro ao salvar dados no Firestore: ", error);
        alert('❌ Erro ao salvar dados. Verifique o console do navegador (F12) para mais detalhes.');
    }
}

function updateAllActivityStatuses() {
    dadosObra.cronograma.forEach(atividadePrincipal => {
        const principalEffectiveProgress = getEffectiveActivityProgress(atividadePrincipal);
        atividadePrincipal.progresso_atividade = principalEffectiveProgress;
        atividadePrincipal.status = getAutomatedStatus(principalEffectiveProgress);

        if (atividadePrincipal.sub_atividades) {
            atividadePrincipal.sub_atividades.forEach(sub => {
                sub.status = getAutomatedStatus(sub.progresso_atividade);
            });
        }
    });
}

function gerarNovoId(prefixo) {
    return prefixo + Math.random().toString(36).substring(2, 9) + Date.now().toString().substring(9,13);
}

function sumCurrentGlobalWeights() {
    return dadosObra.cronograma.reduce((sum, activity) => sum + (activity.peso_global || 0), 0);
}

function updatePesoGlobalDisplay(total, elementId = 'total-peso-global-display') {
    const displayElement = document.getElementById(elementId);
    if (displayElement) {
        displayElement.textContent = total.toFixed(0);
        if (total > 100) {
            displayElement.style.color = 'red';
            displayElement.style.fontWeight = 'bold';
        } else {
            displayElement.style.color = '';
            displayElement.style.fontWeight = 'normal';
        }
    }
}

function handleNewPesoGlobalInput() {
    const newWeightInput = document.getElementById('nova-atividade-peso-global');
    const newWeight = parseFloat(newWeightInput.value) || 0;
    const currentTotal = sumCurrentGlobalWeights();
    const potentialTotal = currentTotal + newWeight;
    updatePesoGlobalDisplay(potentialTotal);
}

// FUNÇÃO CORRIGIDA: Atualiza progresso e recalcula tudo
function updateProgressBarVisual(inputElement) {
    const progressValue = parseFloat(inputElement.value) || 0;
    const progressBarFill = inputElement.nextElementSibling?.querySelector('.progress-bar-fill');

    if (progressBarFill) {
        progressBarFill.style.width = `${progressValue}%`;
    }

    // Validação para peso local de sub-atividades
    if (inputElement.dataset.type === 'peso-local') {
        const atividadePrincipalId = inputElement.dataset.id;
        const subAtividadeId = inputElement.dataset.subId;
        
        if (!validarPesoLocalSubAtividades(atividadePrincipalId, progressValue, subAtividadeId)) {
            const atividadePrincipal = dadosObra.cronograma.find(a => a.id === atividadePrincipalId);
            const subAtividade = atividadePrincipal?.sub_atividades?.find(s => s.id === subAtividadeId);
            if (subAtividade) {
                inputElement.value = subAtividade.peso_local || 0;
            }
            return;
        }
    }

    const activityId = inputElement.dataset.id;
    const subActivityId = inputElement.dataset.subId;
    let currentActivity;

    if (subActivityId) {
        const principal = dadosObra.cronograma.find(a => a.id === activityId);
        currentActivity = principal?.sub_atividades?.find(s => s.id === subActivityId);
    } else {
        currentActivity = dadosObra.cronograma.find(a => a.id === activityId);
    }

    if (currentActivity) {
        // Atualiza o valor no objeto de dados
        if (inputElement.dataset.type === 'progresso-principal' || inputElement.dataset.type === 'progresso-sub') {
            currentActivity.progresso_atividade = progressValue;
        } else if (inputElement.dataset.type === 'peso-local') {
            currentActivity.peso_local = progressValue;
        }
        
        // Atualiza o status da atividade atual
        if (inputElement.dataset.type === 'progresso-principal' || inputElement.dataset.type === 'progresso-sub') {
            currentActivity.status = getAutomatedStatus(progressValue);
            
            const statusSelect = subActivityId
                ? document.querySelector(`select[data-id="${activityId}"][data-sub-id="${subActivityId}"][data-type="status-sub"]`)
                : document.querySelector(`select[data-id="${activityId}"][data-type="status-principal"]`);

            if (statusSelect) {
                statusSelect.value = currentActivity.status;
            }
        }
        
        // Se mudou uma sub-atividade, recalcula a atividade principal
        if (subActivityId) {
            const principalActivity = dadosObra.cronograma.find(a => a.id === activityId);
            if (principalActivity) {
                const effectivePrincipalProgress = getEffectiveActivityProgress(principalActivity);
                principalActivity.progresso_atividade = effectivePrincipalProgress;
                principalActivity.status = getAutomatedStatus(effectivePrincipalProgress);

                // Atualiza a interface da atividade principal
                const principalProgressInput = document.querySelector(`input[data-id="${activityId}"][data-type="progresso-principal"]`);
                const principalStatusSelect = document.querySelector(`select[data-id="${activityId}"][data-type="status-principal"]`);
                const principalProgressBar = document.querySelector(`input[data-id="${activityId}"][data-type="progresso-principal"]`)?.nextElementSibling?.querySelector('.progress-bar-fill');

                if (principalProgressInput) {
                    principalProgressInput.value = effectivePrincipalProgress.toFixed(0);
                }
                if (principalProgressBar) {
                    principalProgressBar.style.width = `${effectivePrincipalProgress}%`;
                }
                if (principalStatusSelect) {
                    principalStatusSelect.value = principalActivity.status;
                }
                
                // Atualiza o progresso global
                const progressoGlobal = calcularProgressoGlobal(dadosObra.cronograma);
                const progressoGlobalElement = document.getElementById('admin-progresso-global');
                if (progressoGlobalElement) {
                    progressoGlobalElement.textContent = `${progressoGlobal.toFixed(0)}%`;
                }
            }
        }
        // Se mudou uma atividade principal sem sub-atividades, só atualiza o global
        else if (!currentActivity.sub_atividades || currentActivity.sub_atividades.length === 0) {
            const progressoGlobal = calcularProgressoGlobal(dadosObra.cronograma);
            const progressoGlobalElement = document.getElementById('admin-progresso-global');
            if (progressoGlobalElement) {
                progressoGlobalElement.textContent = `${progressoGlobal.toFixed(0)}%`;
            }
        }
    }
}

function carregarAdminView() {
    updateAllActivityStatuses();

    document.getElementById('admin-nome-obra').textContent = dadosObra.nome_obra;
    document.getElementById('admin-codigo-obra').textContent = dadosObra.codigo_obra;
    document.getElementById('admin-progresso-global').textContent = `${calcularProgressoGlobal(dadosObra.cronograma).toFixed(0)}%`;

    const cronogramaBody = document.getElementById('cronograma-body');
    cronogramaBody.innerHTML = '';
    const parentActivitySelect = document.getElementById('parent-activity-select');
    parentActivitySelect.innerHTML = '<option value="">Selecione a Atividade Principal</option>';

    dadosObra.cronograma.forEach((atividadePrincipal, indexPrincipal) => {
        const option = document.createElement('option');
        option.value = atividadePrincipal.id;
        option.textContent = atividadePrincipal.descricao;
        parentActivitySelect.appendChild(option);

        let firstCellContent = '';
        if (atividadePrincipal.sub_atividades && atividadePrincipal.sub_atividades.length > 0) {
            firstCellContent += `<span class="toggle-icon" onclick="toggleSubActivities('${atividadePrincipal.id}')">▶</span>`;
        }
        firstCellContent += `<input type="text" value="${atividadePrincipal.descricao}" data-id="${atividadePrincipal.id}" data-type="descricao-principal" class="activity-description-input">`;

        const isPrincipalProgressDisabled = (atividadePrincipal.sub_atividades && atividadePrincipal.sub_atividades.length > 0) ? 'disabled' : '';
        const principalProgressClass = (atividadePrincipal.sub_atividades && atividadePrincipal.sub_atividades.length > 0) ? 'disabled-input' : '';
        const principalEffectiveProgress = getEffectiveActivityProgress(atividadePrincipal).toFixed(0);

        const isStatusDisabled = 'disabled';
        const statusClass = 'disabled-input';

        const row = cronogramaBody.insertRow();
        row.innerHTML = `
            <td data-label="Atividade / Sub-Atividade">${firstCellContent}</td>
            <td data-label="Tipo">Principal</td>
            <td data-label="Peso (%)"><input type="number" min="0" max="100" value="${atividadePrincipal.peso_global}" data-id="${atividadePrincipal.id}" data-type="peso-global"></td>
            <td data-label="Progresso (%)">
                <div class="progress-cell-content">
                    <input type="number" min="0" max="100" value="${principalEffectiveProgress}" ${isPrincipalProgressDisabled} class="${principalProgressClass} activity-progress-input" data-id="${atividadePrincipal.id}" data-type="progresso-principal">
                    <div class="progress-bar-container">
                        <div class="progress-bar-fill" style="width: ${principalEffectiveProgress}%;"></div>
                    </div>
                </div>
            </td>
            <td data-label="Status">
                <select data-id="${atividadePrincipal.id}" data-type="status-principal" ${isStatusDisabled} class="${statusClass}">
                    <option value="Não Iniciada" ${atividadePrincipal.status === 'Não Iniciada' ? 'selected' : ''}>Não Iniciada</option>
                    <option value="Em Andamento" ${atividadePrincipal.status === 'Em Andamento' ? 'selected' : ''}>Em Andamento</option>
                    <option value="Aguardando material" ${atividadePrincipal.status === 'Aguardando material' ? 'selected' : ''}>Aguardando material</option>
                    <option value="Concluída" ${atividadePrincipal.status === 'Concluída' ? 'selected' : ''}>Concluída</option>
                </select>
            </td>
            <td data-label="Prazo Final">${new Date(atividadePrincipal.prazo_final || '2025-12-31').toLocaleDateString('pt-BR')}</td>
            <td data-label="Ações">
                <div class="action-buttons">
                    <button type="button" onclick="moverAtividade('up', '${atividadePrincipal.id}')" ${indexPrincipal === 0 ? 'disabled' : ''}>⬆️</button>
                    <button type="button" onclick="moverAtividade('down', '${atividadePrincipal.id}')" ${indexPrincipal === dadosObra.cronograma.length - 1 ? 'disabled' : ''}>⬇️</button>
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
                    <td data-label="Peso (%)"><input type="number" min="0" max="100" value="${sub.peso_local}" data-id="${atividadePrincipal.id}" data-sub-id="${sub.id}" data-type="peso-local" class="activity-progress-input"></td>
                    <td data-label="Progresso (%)">
                        <div class="progress-cell-content">
                            <input type="number" min="0" max="100" value="${sub.progresso_atividade}" class="activity-progress-input" data-id="${atividadePrincipal.id}" data-sub-id="${sub.id}" data-type="progresso-sub">
                            <div class="progress-bar-container">
                                <div class="progress-bar-fill" style="width: ${sub.progresso_atividade}%;"></div>
                            </div>
                        </div>
                    </td>
                    <td data-label="Status">
                        <select data-id="${atividadePrincipal.id}" data-sub-id="${sub.id}" data-type="status-sub" ${isStatusDisabled} class="${statusClass}">
                            <option value="Não Iniciada" ${sub.status === 'Não Iniciada' ? 'selected' : ''}>Não Iniciada</option>
                            <option value="Em Andamento" ${sub.status === 'Em Andamento' ? 'selected' : ''}>Em Andamento</option>
                            <option value="Aguardando material" ${sub.status === 'Aguardando material' ? 'selected' : ''}>Aguardando material</option>
                            <option value="Concluída" ${sub.status === 'Concluída' ? 'selected' : ''}>Concluída</option>
                        </select>
                    </td>
                    <td data-label="Prazo Final">${new Date(sub.prazo_final).toLocaleDateString('pt-BR')}</td>
                    <td data-label="Ações">
                        <div class="action-buttons">
                            <button type="button" onclick="moverAtividade('up', '${atividadePrincipal.id}', '${sub.id}')" ${indexSub === 0 ? 'disabled' : ''}>⬆️</button>
                            <button type="button" onclick="moverAtividade('down', '${atividadePrincipal.id}', '${sub.id}')" ${indexSub === atividadePrincipal.sub_atividades.length - 1 ? 'disabled' : ''}>⬇️</button>
                            <button type="button" onclick="removerAtividade('${atividadePrincipal.id}', 'sub', '${sub.id}')">🗑️</button>
                        </div>
                    </td>
                `;
            });
        }
    });

    document.getElementById('total-material-admin').textContent = formatarMoeda(dadosObra.gastos.material);
    document.getElementById('total-mao-de-obra-admin').textContent = formatarMoeda(dadosObra.gastos.mao_de_obra);
    document.getElementById('novo-material').value = 0;
    document.getElementById('nova-mao-de-obra').value = 0;

    updatePesoGlobalDisplay(sumCurrentGlobalWeights());

    const novaAtividadePesoGlobalInput = document.getElementById('nova-atividade-peso-global');
    if (novaAtividadePesoGlobalInput) {
        novaAtividadePesoGlobalInput.removeEventListener('input', handleNewPesoGlobalInput);
        novaAtividadePesoGlobalInput.addEventListener('input', handleNewPesoGlobalInput);
    }

    document.querySelectorAll('.activity-progress-input').forEach(input => {
        input.removeEventListener('input', () => updateProgressBarVisual(input));
        input.addEventListener('input', () => updateProgressBarVisual(input));
        updateProgressBarVisual(input);
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const doc = await dadosObraRef.get();
        if (doc.exists) {
            dadosObra = doc.data();
            console.log("Dados carregados do Firestore:", dadosObra);
        } else {
            dadosObra = initialDadosObra;
            await dadosObraRef.set(initialDadosObra);
            console.log("Documento 'houseupData' criado no Firestore com dados iniciais.");
        }
    } catch (error) {
        console.error("Erro ao carregar dados do Firestore: ", error);
        alert('Erro ao carregar dados do banco. Usando dados iniciais. Verifique o console do navegador (F12) para detalhes.');
        dadosObra = initialDadosObra;
    }

    carregarAdminView();
});

document.getElementById('cronograma-form').addEventListener('submit', function(event) {
    event.preventDefault();

    let tempCronograma = JSON.parse(JSON.stringify(dadosObra.cronograma));

    document.querySelectorAll('[data-type="peso-global"]').forEach(input => {
        const atividade = tempCronograma.find(a => a.id === input.dataset.id);
        if (atividade) atividade.peso_global = parseFloat(input.value);
    });

    const newTotalPesoGlobal = tempCronograma.reduce((sum, activity) => sum + (activity.peso_global || 0), 0);
    if (newTotalPesoGlobal > 100) {
        alert(`❌ Erro: O peso global total das atividades principais não pode exceder 100%. Com esta atividade, o total seria ${newTotalPesoGlobal}%. Por favor, ajuste os pesos na tabela.`);
        return;
    }

    let validacaoSubAtividades = true;
    tempCronograma.forEach(atividade => {
        if (atividade.sub_atividades && atividade.sub_atividades.length > 0) {
            let somaPesoLocal = 0;
            atividade.sub_atividades.forEach(sub => {
                somaPesoLocal += sub.peso_local || 0;
            });
            if (somaPesoLocal > 100) {
                alert(`❌ Erro na atividade "${atividade.descricao}": A soma dos pesos locais das sub-atividades (${somaPesoLocal}%) não pode exceder 100%.`);
                validacaoSubAtividades = false;
            }
        }
    });

    if (!validacaoSubAtividades) {
        return;
    }

    document.querySelectorAll('input[data-type="descricao-principal"]').forEach(input => {
        const atividade = dadosObra.cronograma.find(a => a.id === input.dataset.id);
        if (atividade) atividade.descricao = input.value;
    });

    document.querySelectorAll('input[data-type="descricao-sub"]').forEach(input => {
        const atividadePrincipal = dadosObra.cronograma.find(a => a.id === input.dataset.id);
        const subAtividade = atividadePrincipal?.sub_atividades?.find(s => s.id === input.dataset.subId);
        if (subAtividade) subAtividade.descricao = input.value;
    });

    document.querySelectorAll('[data-type="peso-global"]').forEach(input => {
        const atividade = dadosObra.cronograma.find(a => a.id === input.dataset.id);
        if (atividade) atividade.peso_global = parseFloat(input.value);
    });

    document.querySelectorAll('input[data-type="progresso-principal"]').forEach(input => {
        const atividade = dadosObra.cronograma.find(a => a.id === input.dataset.id);
        if (atividade && (!atividade.sub_atividades || atividade.sub_atividades.length === 0)) {
            atividade.progresso_atividade = parseFloat(input.value);
        }
    });

    document.querySelectorAll('[data-type="peso-local"]').forEach(input => {
        const atividadePrincipal = dadosObra.cronograma.find(a => a.id === input.dataset.id);
        const subAtividade = atividadePrincipal?.sub_atividades?.find(s => s.id === input.dataset.subId);
        if (subAtividade) subAtividade.peso_local = parseFloat(input.value);
    });
    
    document.querySelectorAll('input[data-type="progresso-sub"]').forEach(input => {
        const atividadePrincipal = dadosObra.cronograma.find(a => a.id === input.dataset.id);
        const subAtividade = atividadePrincipal?.sub_atividades?.find(s => s.id === input.dataset.subId);
        if (subAtividade) subAtividade.progresso_atividade = parseFloat(input.value);
    });

    salvarDadosObra();
});

document.getElementById('custos-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const novoMaterial = parseFloat(document.getElementById('novo-material').value) || 0;
    const novaMaoDeObra = parseFloat(document.getElementById('nova-mao-de-obra').value) || 0;

    dadosObra.gastos.material = (dadosObra.gastos.material || 0) + novoMaterial;
    dadosObra.gastos.mao_de_obra = (dadosObra.gastos.mao_de_obra || 0) + novaMaoDeObra;

    salvarDadosObra();
});

function adicionarAtividadePrincipal() {
    const descricao = document.getElementById('nova-atividade-descricao').value;
    const pesoGlobal = parseFloat(document.getElementById('nova-atividade-peso-global').value);
    const prazo = document.getElementById('nova-atividade-prazo').value;

    if (!descricao || isNaN(pesoGlobal) || pesoGlobal <= 0 || !prazo) {
        alert('❌ Por favor, preencha todos os campos da atividade principal: descrição, peso global e prazo.');
        return;
    }

    const currentTotal = sumCurrentGlobalWeights();
    const potentialTotal = currentTotal + pesoGlobal;

    if (potentialTotal > 100) {
        alert(`❌ Erro: O peso global total das atividades principais não pode exceder 100%. Com esta atividade, o total seria ${potentialTotal}%. Por favor, ajuste os pesos.`);
        return;
    }

    const novaAtividade = {
        "id": gerarNovoId("ATV"),
        "descricao": descricao,
        "peso_global": pesoGlobal,
        "progresso_atividade": 0,
        "status": getAutomatedStatus(0),
        "prazo_final": prazo
    };
    dadosObra.cronograma.push(novaAtividade);
    salvarDadosObra();
    document.getElementById('nova-atividade-descricao').value = '';
    document.getElementById('nova-atividade-peso-global').value = '';
    document.getElementById('nova-atividade-prazo').value = '';
}

function adicionarSubAtividade() {
    const parentId = document.getElementById('parent-activity-select').value;
    const descricao = document.getElementById('nova-sub-atividade-descricao').value;
    const pesoLocal = parseFloat(document.getElementById('nova-sub-atividade-peso-local').value);
    const prazo = document.getElementById('nova-sub-atividade-prazo').value;

    if (!parentId || !descricao || isNaN(pesoLocal) || pesoLocal <= 0 || !prazo) {
        alert('❌ Por favor, selecione a atividade principal e preencha todos os campos da sub-atividade: descrição, peso local e prazo.');
        return;
    }

    const atividadePrincipal = dadosObra.cronograma.find(a => a.id === parentId);
    if (!atividadePrincipal) {
        alert('❌ Atividade principal não encontrada.');
        return;
    }

    if (!validarPesoLocalSubAtividades(parentId, pesoLocal)) {
        return;
    }

    if (!atividadePrincipal.sub_atividades) {
        atividadePrincipal.sub_atividades = [];
    }
    if (atividadePrincipal.sub_atividades.length === 0) {
        atividadePrincipal.progresso_atividade = 0;
        atividadePrincipal.status = getAutomatedStatus(0);
    }

    const novaSubAtividade = {
        "id": gerarNovoId("SUB"),
        "descricao": descricao,
        "peso_local": pesoLocal,
        "progresso_atividade": 0,
        "status": getAutomatedStatus(0),
        "prazo_final": prazo
    };
    atividadePrincipal.sub_atividades.push(novaSubAtividade);
    salvarDadosObra();
    document.getElementById('nova-sub-atividade-descricao').value = '';
    document.getElementById('nova-sub-atividade-peso-local').value = '';
    document.getElementById('nova-sub-atividade-prazo').value = '';
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
                atividadePrincipal.progresso_atividade = 0;
                atividadePrincipal.status = getAutomatedStatus(0);
                delete atividadePrincipal.sub_atividades;
            }
        }
    }
    salvarDadosObra();
}

function moverAtividade(direction, activityId, subActivityId = null) {
    if (!subActivityId) {
        const index = dadosObra.cronograma.findIndex(atv => atv.id === activityId);
        if (index === -1) return;

        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= dadosObra.cronograma.length) return;

        [dadosObra.cronograma[index], dadosObra.cronograma[newIndex]] = [dadosObra.cronograma[newIndex], dadosObra.cronograma[index]];

    } else {
        const atividadePrincipal = dadosObra.cronograma.find(atv => atv.id === activityId);
        if (!atividadePrincipal || !atividadePrincipal.sub_atividades) return;

        const subIndex = atividadePrincipal.sub_atividades.findIndex(sub => sub.id === subActivityId);
        if (subIndex === -1) return;

        const newSubIndex = direction === 'up' ? subIndex - 1 : subIndex + 1;
        if (newSubIndex < 0 || newSubIndex >= atividadePrincipal.sub_atividades.length) return;

        [atividadePrincipal.sub_atividades[subIndex], atividadePrincipal.sub_atividades[newSubIndex]] = [atividadePrincipal.sub_atividades[newSubIndex], atividadePrincipal.sub_atividades[subIndex]];
    }

    salvarDadosObra();
}

function limparCronograma() {
    if (confirm('❓ Tem certeza que deseja LIMPAR TODO O CRONOGRAMA? Esta ação é irreversível e removerá todas as atividades!')) {
        dadosObra.cronograma = [];
        dadosObra.gastos.material = 0;
        dadosObra.gastos.mao_de_obra = 0;
        salvarDadosObra();
        alert('✅ Cronograma limpo com sucesso! Agora você pode criar seu cronograma padrão.');
    }
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