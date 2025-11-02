<!DO// --- FIREBASE CONFIGURAÇÃO E INICIALIZAÇÃO ---
// ATENÇÃO, MATHEUS!
// VOCÊ PRECISA SUBSTITUIR OS VALORES ABAIXO PELOS VALORES REAIS DO SEU PROJETO FIREBASE.
// VOCÊ OS COPIOU NA ETAPA "Adicione um Aplicativo Web ao Seu Projeto Firebase" NO CONSOLE.
const firebaseConfig = {
  apiKey: "AIzaSyDq3mr-ryX_q8GAEyfTsQP2mzjpP9wOugE",
  authDomain: "houseup-app.firebaseapp.com",
  projectId: "houseup-app",
  storageBucket: "houseup-app.firebasestorage.app",
  messagingSenderId: "401114152723",
  appId: "1:401114152723:web:f96eaf0a718342c0cf64e6",
  measurementId: "G-S07Q5EFB0T"
};
// Inicializa o Firebase
firebase.initializeApp(firebaseConfig);

// Obtém uma referência para o Firestore
const db = firebase.firestore();

// Referência ao documento onde vamos armazenar os dados da obra
// Usaremos um único documento chamado 'houseupData' dentro de uma coleção 'dados'
const dadosObraRef = db.collection('dados').doc('houseupData');
// --- FIM DA CONFIGURAÇÃO FIREBASE ---


// Dados iniciais (usados se não houver nada no Firestore)
// Este é o cronograma padrão que será carregado na primeira vez ou após "Limpar Cronograma".
const initialDadosObra = {
    "nome_obra": "Casa do Matheus - Projeto Veraneio",
    "codigo_obra": "HOUS-001-2024",
    "gastos": {
        "material": 0.00,
        "mao_de_obra": 0.00
    },
    "cronograma": [
        // Exemplo inicial de cronograma. Você pode limpá-lo ao carregar a página
        // para construir o seu cronograma padrão do zero usando a validação de 100%.
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

// --- VARIÁVEL GLOBAL PARA OS DADOS DA OBRA ---
// Essa variável será preenchida com os dados do Firestore ou os dados iniciais.
let dadosObra;


// Funções utilitárias

/**
 * Retorna o status da atividade com base no seu progresso.
 * @param {number} progressValue - O valor do progresso (0 a 100).
 * @returns {string} O status correspondente.
 */
function getAutomatedStatus(progressValue) {
    if (progressValue === 0) {
        return "Não Iniciada";
    } else if (progressValue === 100) {
        return "Concluída";
    } else {
        return "Em Andamento";
    }
}

/**
 * Calcula o progresso efetivo de uma atividade.
 * Se a atividade tiver sub-atividades, calcula a média ponderada do progresso delas.
 * Caso contrário, retorna o progresso próprio da atividade.
 * @param {object} atividade - O objeto da atividade (principal ou sub-atividade).
 * @returns {number} O progresso efetivo da atividade.
 */
function getEffectiveActivityProgress(atividade) {
    if (atividade.sub_atividades && atividade.sub_atividades.length > 0) {
        let subProgressPonderado = 0;
        let subPesoTotal = 0;
        atividade.sub_atividades.forEach(sub => {
            subProgressPonderado += (sub.peso_local / 100) * sub.progresso_atividade;
            subPesoTotal += sub.peso_local;
        });
        const calculatedProgress = subPesoTotal === 0 ? 0 : (subProgressPonderado / subPesoTotal) * 100;
        // Arredonda para evitar problemas de ponto flutuante
        return parseFloat(calculatedProgress.toFixed(2));
    } else {
        return atividade.progresso_atividade; // É uma atividade folha
    }
}

/**
 * Calcula o progresso global da obra com base no cronograma e pesos globais das atividades principais.
 * @param {Array<object>} cronograma - O array de atividades principais do cronograma.
 * @returns {number} O progresso global da obra em porcentagem.
 */
function calcularProgressoGlobal(cronograma) {
    let globalProgressPonderado = 0;
    let globalPesoTotal = 0;

    cronograma.forEach(atividadePrincipal => {
        const effectiveProgress = getEffectiveActivityProgress(atividadePrincipal);
        globalProgressPonderado += (atividadePrincipal.peso_global / 100) * effectiveProgress;
        globalPesoTotal += atividadePrincipal.peso_global;
    });

    const calculatedProgress = globalPesoTotal === 0 ? 0 : (globalProgressPonderado / globalPesoTotal) * 100;
    return parseFloat(calculatedProgress.toFixed(2));
}

/**
 * Formata um valor numérico para o formato de moeda brasileira (R$).
 * @param {number} valor - O valor a ser formatado.
 * @returns {string} O valor formatado como moeda.
 */
function formatarMoeda(valor) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}


// --- FUNÇÃO SALVAR DADOS DA OBRA (MODIFICADA PARA FIREBASE) ---
/**
 * Salva o objeto 'dadosObra' atual no Firestore e recarrega a interface administrativa.
 */
async function salvarDadosObra() {
    updateAllActivityStatuses(); // Atualiza todos os status antes de salvar

    try {
        // Usa set para sobrescrever o documento com os novos dados
        // await indica que o JavaScript "espera" a operação do Firestore terminar
        await dadosObraRef.set(dadosObra);
        alert('Dados salvos com sucesso no Firestore!');
        carregarAdminView(); // Recarrega a view para mostrar os dados atualizados e recalcular progresso
    } catch (error) {
        console.error("Erro ao salvar dados no Firestore: ", error);
        alert('Erro ao salvar dados. Verifique o console do navegador (F12) para mais detalhes.');
    }
}
// --- FIM DA MODIFICAÇÃO SALVAR DADOS ---


/**
 * Atualiza o status de todas as atividades e sub-atividades no objeto dadosObra
 * com base na lógica de progresso automatizado.
 */
function updateAllActivityStatuses() {
    dadosObra.cronograma.forEach(atividadePrincipal => {
        const principalEffectiveProgress = getEffectiveActivityProgress(atividadePrincipal);
        atividadePrincipal.progresso_atividade = principalEffectiveProgress; // Garante que o progresso da principal está atualizado
        atividadePrincipal.status = getAutomatedStatus(principalEffectiveProgress);

        if (atividadePrincipal.sub_atividades) {
            atividadePrincipal.sub_atividades.forEach(sub => {
                sub.status = getAutomatedStatus(sub.progresso_atividade);
            });
        }
    });
}

/**
 * Gera um ID único para novas atividades ou sub-atividades.
 * @param {string} prefixo - O prefixo para o ID (ex: "ATV", "SUB").
 * @returns {string} Um ID único.
 */
function gerarNovoId(prefixo) {
    // Usa Math.random e Date.now para criar uma string razoavelmente única
    return prefixo + Math.random().toString(36).substring(2, 9) + Date.now().toString().substring(9,13);
}

/**
 * Soma os pesos globais de todas as atividades principais existentes.
 * @returns {number} A soma total dos pesos globais.
 */
function sumCurrentGlobalWeights() {
    return dadosObra.cronograma.reduce((sum, activity) => sum + (activity.peso_global || 0), 0);
}

/**
 * Atualiza o contador de peso global na interface.
 * @param {number} total - O total de peso global a ser exibido.
 * @param {string} elementId - O ID do elemento HTML onde o total será exibido.
 */
function updatePesoGlobalDisplay(total, elementId = 'total-peso-global-display') {
    const displayElement = document.getElementById(elementId);
    if (displayElement) {
        displayElement.textContent = total.toFixed(0);
        if (total > 100) {
            displayElement.style.color = 'red';
            displayElement.style.fontWeight = 'bold';
        } else {
            displayElement.style.color = ''; // Reseta para a cor padrão
            displayElement.style.fontWeight = 'normal';
        }
    }
}

/**
 * Lida com a atualização em tempo real do contador quando o usuário digita um novo peso global.
 */
function handleNewPesoGlobalInput() {
    const newWeightInput = document.getElementById('nova-atividade-peso-global');
    const newWeight = parseFloat(newWeightInput.value) || 0;
    const currentTotal = sumCurrentGlobalWeights();
    const potentialTotal = currentTotal + newWeight;
    updatePesoGlobalDisplay(potentialTotal);
}

/**
 * Atualiza visualmente a barra de progresso para um input de porcentagem.
 * @param {HTMLElement} inputElement - O elemento input de progresso.
 */
function updateProgressBarVisual(inputElement) {
    const progressValue = parseFloat(inputElement.value) || 0;
    const progressBarFill = inputElement.nextElementSibling.querySelector('.progress-bar-fill');

    if (progressBarFill) {
        progressBarFill.style.width = `${progressValue}%`;
    }

    // Também atualiza o status automaticamente
    const activityId = inputElement.dataset.id;
    const subActivityId = inputElement.dataset.subId; // Pode ser undefined
    let currentActivity;

    if (subActivityId) {
        // É uma sub-atividade
        const principal = dadosObra.cronograma.find(a => a.id === activityId);
        currentActivity = principal?.sub_atividades?.find(s => s.id === subActivityId);
    } else {
        // É uma atividade principal sem sub-atividades
        currentActivity = dadosObra.cronograma.find(a => a.id === activityId);
    }

    if (currentActivity) {
        currentActivity.progresso_atividade = progressValue; // Atualiza o progresso no objeto de dados
        currentActivity.status = getAutomatedStatus(progressValue); // Define o status
        
        // Agora, encontre o select de status correspondente e atualize-o
        const statusSelect = subActivityId
            ? document.querySelector(`select[data-id="${activityId}"][data-sub-id="${subActivityId}"][data-type="status-sub"]`)
            : document.querySelector(`select[data-id="${activityId}"][data-type="status-principal"]`);

        if (statusSelect) {
            statusSelect.value = currentActivity.status;
        }
        // Se a atividade for principal e tiver sub-atividades, seu progresso/status precisa ser recalculado
        if (!subActivityId && currentActivity.sub_atividades && currentActivity.sub_atividades.length > 0) {
             // Chamamos salvarDadosObra para forçar o recálculo do progresso da principal
             // Isso pode ser custoso se feito a cada input, talvez otimizar para ser só no blur ou no save.
             // ATENÇÃO: salvando a cada mudança no input pode gerar muitas escritas no Firestore.
             // Para evitar custos, considere chamar salvarDadosObra() apenas no "Salvar Cronograma"
             // ou quando o input perde o foco (evento 'change' ou 'blur').
             // Por enquanto, mantenho como estava para garantir a lógica de atualização.
             // salvarDadosObra(); // Removi esta chamada para evitar múltiplas escritas no Firestore a cada digitação.
                                // A atualização completa ocorrerá ao submeter o formulário principal.
        } else if (subActivityId) {
            // Se uma sub-atividade mudou, a atividade principal a ela associada pode ter seu progresso afetado
            // Encontrar a atividade principal e atualizar seu status e barra
            const principalActivity = dadosObra.cronograma.find(a => a.id === activityId);
            if (principalActivity) {
                const effectivePrincipalProgress = getEffectiveActivityProgress(principalActivity);
                principalActivity.progresso_atividade = effectivePrincipalProgress;
                principalActivity.status = getAutomatedStatus(effectivePrincipalProgress);

                const principalProgressInput = document.querySelector(`input[data-id="${activityId}"][data-type="progresso-principal"]`);
                const principalStatusSelect = document.querySelector(`select[data-id="${activityId}"][data-type="status-principal"]`);

                if (principalProgressInput) {
                    principalProgressInput.value = effectivePrincipalProgress.toFixed(0);
                    updateProgressBarVisual(principalProgressInput); // Atualiza visualmente a barra da principal
                }
                if (principalStatusSelect) {
                    principalStatusSelect.value = principalActivity.status;
                }
            }
        }
    }
}


/**
 * Carrega e renderiza todas as informações na interface administrativa.
 * Isso inclui detalhes da obra, cronograma com atividades/sub-atividades e custos.
 */
function carregarAdminView() {
    // Primeiramente, atualiza todos os status no objeto de dados para refletir o progresso atual
    updateAllActivityStatuses();

    // Info da Obra
    document.getElementById('admin-nome-obra').textContent = dadosObra.nome_obra;
    document.getElementById('admin-codigo-obra').textContent = dadosObra.codigo_obra;
    document.getElementById('admin-progresso-global').textContent = `${calcularProgressoGlobal(dadosObra.cronograma).toFixed(0)}%`;

    // Cronograma
    const cronogramaBody = document.getElementById('cronograma-body');
    cronogramaBody.innerHTML = ''; // Limpa a tabela antes de preencher
    const parentActivitySelect = document.getElementById('parent-activity-select');
    parentActivitySelect.innerHTML = '<option value="">Selecione a Atividade Principal</option>'; // Limpa e adiciona opção padrão para o select de pai

    dadosObra.cronograma.forEach((atividadePrincipal, indexPrincipal) => {
        // Adiciona atividade principal ao select de pai para sub-atividades
        const option = document.createElement('option');
        option.value = atividadePrincipal.id;
        option.textContent = atividadePrincipal.descricao;
        parentActivitySelect.appendChild(option);

        // Constrói o conteúdo da primeira célula (Descrição + Toggle + Input de Edição)
        let firstCellContent = '';
        if (atividadePrincipal.sub_atividades && atividadePrincipal.sub_atividades.length > 0) {
            firstCellContent += `<span class="toggle-icon" onclick="toggleSubActivities('${atividadePrincipal.id}')">▶</span>`;
        }
        firstCellContent += `<input type="text" value="${atividadePrincipal.descricao}" data-id="${atividadePrincipal.id}" data-type="descricao-principal" class="activity-description-input">`;

        // Prepara os atributos para o input de progresso da atividade principal
        // O progresso de uma principal com sub-atividades é sempre DESABILITADO (derivado)
        const isPrincipalProgressDisabled = (atividadePrincipal.sub_atividades && atividadePrincipal.sub_atividades.length > 0) ? 'disabled' : '';
        const principalProgressClass = (atividadePrincipal.sub_atividades && atividadePrincipal.sub_atividades.length > 0) ? 'disabled-input' : '';
        const principalEffectiveProgress = getEffectiveActivityProgress(atividadePrincipal).toFixed(0);

        // O select de status SEMPRE será desabilitado pois agora é automatizado
        const isStatusDisabled = 'disabled';
        const statusClass = 'disabled-input';

        // Cria a linha para a atividade principal na tabela
        const row = cronogramaBody.insertRow();
        row.innerHTML = `
            <td>${firstCellContent}</td>
            <td>Principal</td>
            <td><input type="number" min="0" max="100" value="${atividadePrincipal.peso_global}" data-id="${atividadePrincipal.id}" data-type="peso-global"></td>
            <td>
                <div class="progress-cell-content">
                    <input type="number" min="0" max="100" value="${principalEffectiveProgress}" ${isPrincipalProgressDisabled} class="${principalProgressClass} activity-progress-input" data-id="${atividadePrincipal.id}" data-type="progresso-principal">
                    <div class="progress-bar-container">
                        <div class="progress-bar-fill" style="width: ${principalEffectiveProgress}%;"></div>
                    </div>
                </div>
            </td>
            <td>
                <select data-id="${atividadePrincipal.id}" data-type="status-principal" ${isStatusDisabled} class="${statusClass}">
                    <option value="Não Iniciada" ${atividadePrincipal.status === 'Não Iniciada' ? 'selected' : ''}>Não Iniciada</option>
                    <option value="Em Andamento" ${atividadePrincipal.status === 'Em Andamento' ? 'selected' : ''}>Em Andamento</option>
                    <option value="Aguardando material" ${atividadePrincipal.status === 'Aguardando material' ? 'selected' : ''}>Aguardando material</option>
                    <option value="Concluída" ${atividadePrincipal.status === 'Concluída' ? 'selected' : ''}>Concluída</option>
                </select>
            </td>
            <td>${new Date(atividadePrincipal.prazo_final || '2025-12-31').toLocaleDateString('pt-BR')}</td>
            <td>
                <div class="action-buttons">
                    <button type="button" onclick="moverAtividade('up', '${atividadePrincipal.id}')" ${indexPrincipal === 0 ? 'disabled' : ''}>⬆️</button>
                    <button type="button" onclick="moverAtividade('down', '${atividadePrincipal.id}')" ${indexPrincipal === dadosObra.cronograma.length - 1 ? 'disabled' : ''}>⬇️</button>
                    <button type="button" onclick="removerAtividade('${atividadePrincipal.id}', 'principal')">🗑️</button>
                </div>
            </td>
        `;

        // Renderiza sub-atividades, se existirem
        if (atividadePrincipal.sub_atividades) {
            atividadePrincipal.sub_atividades.forEach((sub, indexSub) => {
                const subRow = cronogramaBody.insertRow();
                subRow.classList.add('sub-activity-row', `sub-of-${atividadePrincipal.id}`, 'sub-activity-hidden');
                subRow.innerHTML = `
                    <td><span class="sub-indent-char">- </span><input type="text" value="${sub.descricao}" data-id="${atividadePrincipal.id}" data-sub-id="${sub.id}" data-type="descricao-sub" class="activity-description-input"></td>
                    <td>Sub</td>
                    <td><input type="number" min="0" max="100" value="${sub.peso_local}" data-id="${atividadePrincipal.id}" data-sub-id="${sub.id}" data-type="peso-local"></td>
                    <td>
                        <div class="progress-cell-content">
                            <input type="number" min="0" max="100" value="${sub.progresso_atividade}" class="activity-progress-input" data-id="${atividadePrincipal.id}" data-sub-id="${sub.id}" data-type="progresso-sub">
                            <div class="progress-bar-container">
                                <div class="progress-bar-fill" style="width: ${sub.progresso_atividade}%;"></div>
                            </div>
                        </div>
                    </td>
                    <td>
                        <select data-id="${atividadePrincipal.id}" data-sub-id="${sub.id}" data-type="status-sub" ${isStatusDisabled} class="${statusClass}">
                            <option value="Não Iniciada" ${sub.status === 'Não Iniciada' ? 'selected' : ''}>Não Iniciada</option>
                            <option value="Em Andamento" ${sub.status === 'Em Andamento' ? 'selected' : ''}>Em Andamento</option>
                            <option value="Aguardando material" ${sub.status === 'Aguardando material' ? 'selected' : ''}>Aguardando material</option>
                            <option value="Concluída" ${sub.status === 'Concluída' ? 'selected' : ''}>Concluída</option>
                        </select>
                    </td>
                    <td>${new Date(sub.prazo_final).toLocaleDateString('pt-BR')}</td>
                    <td>
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

    // Custos
    document.getElementById('total-material-admin').textContent = formatarMoeda(dadosObra.gastos.material);
    document.getElementById('total-mao-de-obra-admin').textContent = formatarMoeda(dadosObra.gastos.mao_de_obra);
    document.getElementById('novo-material').value = 0; // Limpa o campo
    document.getElementById('nova-mao-de-obra').value = 0; // Limpa o campo

    // Atualiza o contador de peso global no carregamento da view
    updatePesoGlobalDisplay(sumCurrentGlobalWeights());

    // Adiciona listener para atualização em tempo real do input de "novo peso global"
    const novaAtividadePesoGlobalInput = document.getElementById('nova-atividade-peso-global');
    if (novaAtividadePesoGlobalInput) {
        novaAtividadePesoGlobalInput.removeEventListener('input', handleNewPesoGlobalInput); // Remove para evitar duplicidade
        novaAtividadePesoGlobalInput.addEventListener('input', handleNewPesoGlobalInput);
    }

    // Adiciona event listeners para os inputs de progresso para atualizar a barra visualmente E O STATUS
    document.querySelectorAll('.activity-progress-input').forEach(input => {
        // Remove listeners antigos para evitar duplicidade ao recarregar a view
        input.removeEventListener('input', () => updateProgressBarVisual(input));
        // Adiciona o novo listener
        input.addEventListener('input', () => updateProgressBarVisual(input));
        // Garante que a barra visual e o status estejam corretos no carregamento inicial
        updateProgressBarVisual(input);
    });
}


// Event Listeners (acionam funções quando a página é carregada ou um formulário é enviado)

// --- LIDA COM O CARREGAMENTO INICIAL DO DOM (MODIFICADO PARA FIREBASE) ---
// Garante que a view é carregada assim que o DOM está pronto, após carregar os dados do Firebase.
document.addEventListener('DOMContentLoaded', async () => { // Adicione 'async' aqui!
    try {
        const doc = await dadosObraRef.get(); // Tenta buscar o documento 'houseupData' no Firestore
        if (doc.exists) {
            dadosObra = doc.data(); // Se o documento existe, usa os dados do Firestore
            console.log("Dados carregados do Firestore:", dadosObra);
        } else {
            // Se o documento não existe (primeira vez), usa os dados iniciais do script
            dadosObra = initialDadosObra;
            // E já tenta salvar esses dados iniciais no Firestore para que eles existam a partir de agora
            await dadosObraRef.set(initialDadosObra);
            console.log("Documento 'houseupData' criado no Firestore com dados iniciais.");
        }
    } catch (error) {
        console.error("Erro ao carregar dados do Firestore: ", error);
        alert('Erro ao carregar dados do banco. Usando dados iniciais. Verifique o console do navegador (F12) para detalhes.');
        dadosObra = initialDadosObra; // Fallback para dados iniciais em caso de erro
    }

    carregarAdminView(); // Carrega a view APENAS DEPOIS que os dados estiverem prontos
});
// --- FIM DA MODIFICAÇÃO CARREGAMENTO DO DOM ---


// Lida com o envio do formulário de cronograma (botão "Salvar Cronograma")
document.getElementById('cronograma-form').addEventListener('submit', function(event) {
    event.preventDefault(); // Impede o recarregamento da página

    // Cria uma cópia profunda para validar o estado POTENCIAL após as edições do formulário
    let tempCronograma = JSON.parse(JSON.stringify(dadosObra.cronograma));

    // Atualiza apenas os pesos globais na estrutura temporária para validação
    document.querySelectorAll('[data-type="peso-global"]').forEach(input => {
        const atividade = tempCronograma.find(a => a.id === input.dataset.id);
        if (atividade) atividade.peso_global = parseFloat(input.value);
    });

    // Valida o total peso_global ANTES de aplicar as mudanças ao dadosObra real
    const newTotalPesoGlobal = tempCronograma.reduce((sum, activity) => sum + (activity.peso_global || 0), 0);
    if (newTotalPesoGlobal > 100) {
        alert(`Erro: O peso global total das atividades principais não pode exceder 100%. O total atual é ${newTotalPesoGlobal}%. Por favor, ajuste os pesos na tabela.`);
        return; // Impede o salvamento se a validação falhar
    }

    // Se a validação passou, procede para aplicar todas as mudanças ao objeto dadosObra real

    // Update main activity descriptions
    document.querySelectorAll('input[data-type="descricao-principal"]').forEach(input => {
        const atividade = dadosObra.cronograma.find(a => a.id === input.dataset.id);
        if (atividade) atividade.descricao = input.value;
    });

    // Update sub-activity descriptions
    document.querySelectorAll('input[data-type="descricao-sub"]').forEach(input => {
        const atividadePrincipal = dadosObra.cronograma.find(a => a.id === input.dataset.id);
        const subAtividade = atividadePrincipal?.sub_atividades?.find(s => s.id === input.dataset.subId);
        if (subAtividade) subAtividade.descricao = input.value;
    });

    // Main activities weights
    document.querySelectorAll('[data-type="peso-global"]').forEach(input => {
        const atividade = dadosObra.cronograma.find(a => a.id === input.dataset.id);
        if (atividade) atividade.peso_global = parseFloat(input.value);
    });

    // Main activities progress (only if no sub-activities)
    document.querySelectorAll('input[data-type="progresso-principal"]').forEach(input => {
        const atividade = dadosObra.cronograma.find(a => a.id === input.dataset.id);
        if (atividade && (!atividade.sub_atividades || atividade.sub_atividades.length === 0)) {
            atividade.progresso_atividade = parseFloat(input.value);
        }
    });

    // Sub-activities weights and progress
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
    
    // O status e o progresso da atividade principal (com sub-atividades) são recalculados por `updateAllActivityStatuses()`
    // e `getEffectiveActivityProgress` antes de salvar.
    // Removidas as lógicas manuais de status e progresso de principal/sub-atividade que conflitavam.

    salvarDadosObra(); // Salva o objeto dadosObra atualizado, que inclui o recalculo de todos os status.
});

// Lida com o envio do formulário de custos (botão "Lançar Custos")
document.getElementById('custos-form').addEventListener('submit', function(event) {
    event.preventDefault(); // Impede o recarregamento da página
    const novoMaterial = parseFloat(document.getElementById('novo-material').value) || 0;
    const novaMaoDeObra = parseFloat(document.getElementById('nova-mao-de-obra').value) || 0;

    dadosObra.gastos.material = (dadosObra.gastos.material || 0) + novoMaterial;
    dadosObra.gastos.mao_de_obra = (dadosObra.gastos.mao_de_obra || 0) + novaMaoDeObra;

    salvarDadosObra(); // Salva as alterações
});


// Funções de Ação (adicionar, remover, mover, limpar)

/**
 * Adiciona uma nova atividade principal ao cronograma.
 */
function adicionarAtividadePrincipal() {
    const descricao = document.getElementById('nova-atividade-descricao').value;
    const pesoGlobal = parseFloat(document.getElementById('nova-atividade-peso-global').value);
    const prazo = document.getElementById('nova-atividade-prazo').value;

    if (!descricao || isNaN(pesoGlobal) || pesoGlobal <= 0 || !prazo) {
        alert('Por favor, preencha todos os campos da atividade principal: descrição, peso global e prazo.');
        return;
    }

    const currentTotal = sumCurrentGlobalWeights();
    const potentialTotal = currentTotal + pesoGlobal;

    if (potentialTotal > 100) {
        alert(`Erro: O peso global total das atividades principais não pode exceder 100%. Com esta atividade, o total seria ${potentialTotal}%. Por favor, ajuste os pesos.`);
        return; // Impede a adição
    }

    const novaAtividade = {
        "id": gerarNovoId("ATV"),
        "descricao": descricao,
        "peso_global": pesoGlobal,
        "progresso_atividade": 0, // Inicia em 0%
        "status": getAutomatedStatus(0), // Status inicial automatizado
        "prazo_final": prazo
    };
    dadosObra.cronograma.push(novaAtividade); // Adiciona ao final da lista
    salvarDadosObra(); // Salva e recarrega a view
    // Limpa os campos do formulário
    document.getElementById('nova-atividade-descricao').value = '';
    document.getElementById('nova-atividade-peso-global').value = '';
    document.getElementById('nova-atividade-prazo').value = '';
}

/**
 * Adiciona uma nova sub-atividade a uma atividade principal existente.
 */
function adicionarSubAtividade() {
    const parentId = document.getElementById('parent-activity-select').value;
    const descricao = document.getElementById('nova-sub-atividade-descricao').value;
    const pesoLocal = parseFloat(document.getElementById('nova-sub-atividade-peso-local').value);
    const prazo = document.getElementById('nova-sub-atividade-prazo').value;

    if (!parentId || !descricao || isNaN(pesoLocal) || pesoLocal <= 0 || !prazo) {
        alert('Por favor, selecione a atividade principal e preencha todos os campos da sub-atividade: descrição, peso local e prazo.');
        return;
    }

    const atividadePrincipal = dadosObra.cronograma.find(a => a.id === parentId);
    if (!atividadePrincipal) {
        alert('Atividade principal não encontrada.');
        return;
    }

    // Se a atividade principal ainda não tem sub_atividades, inicializa o array
    if (!atividadePrincipal.sub_atividades) {
        atividadePrincipal.sub_atividades = [];
    }
    // Ao adicionar a primeira sub-atividade, a atividade principal deixa de ter progresso/status direto
    // Estes serão agora calculados a partir das sub-atividades.
    if (atividadePrincipal.sub_atividades.length === 0) {
        // Garantir que a atividade principal tem as propriedades certas para ser um 'container' de sub-atividades
        // e que seu status/progresso será derivado.
        atividadePrincipal.progresso_atividade = 0; // Será recalculado
        atividadePrincipal.status = getAutomatedStatus(0); // Será recalculado
    }


    const novaSubAtividade = {
        "id": gerarNovoId("SUB"),
        "descricao": descricao,
        "peso_local": pesoLocal,
        "progresso_atividade": 0, // Inicia em 0%
        "status": getAutomatedStatus(0), // Status inicial automatizado
        "prazo_final": prazo
    };
    atividadePrincipal.sub_atividades.push(novaSubAtividade); // Adiciona ao final da lista de sub-atividades
    salvarDadosObra(); // Salva e recarrega a view
    // Limpa os campos do formulário
    document.getElementById('nova-sub-atividade-descricao').value = '';
    document.getElementById('nova-sub-atividade-peso-local').value = '';
    document.getElementById('nova-sub-atividade-prazo').value = '';
}

/**
 * Remove uma atividade principal ou sub-atividade do cronograma.
 * @param {string} id - O ID da atividade principal.
 * @param {string} tipo - O tipo da atividade a ser removida ("principal" ou "sub").
 * @param {string} [subId=null] - O ID da sub-atividade, se o tipo for "sub".
 */
function removerAtividade(id, tipo, subId = null) {
    if (!confirm('Tem certeza que deseja remover esta atividade?')) return;

    if (tipo === 'principal') {
        dadosObra.cronograma = dadosObra.cronograma.filter(atv => atv.id !== id);
    } else if (tipo === 'sub' && subId) {
        const atividadePrincipal = dadosObra.cronograma.find(a => a.id === id);
        if (atividadePrincipal && atividadePrincipal.sub_atividades) {
            atividadePrincipal.sub_atividades = atividadePrincipal.sub_atividades.filter(sub => sub.id !== subId);
            // Se a atividade principal ficar sem sub-atividades, remove o array sub_atividades
            // e define status/progresso direto para ela novamente.
            if (atividadePrincipal.sub_atividades.length === 0) {
                // A atividade principal volta a ser uma atividade "folha"
                // Define seu próprio progresso e status.
                atividadePrincipal.progresso_atividade = 0; // Reseta ou define um padrão
                atividadePrincipal.status = getAutomatedStatus(0);
                delete atividadePrincipal.sub_atividades; // Remove a propriedade sub_atividades
            }
        }
    }
    salvarDadosObra(); // Salva e recarrega a view
}

/**
 * Move uma atividade principal ou sub-atividade para cima ou para baixo na lista.
 * @param {string} direction - A direção do movimento ("up" ou "down").
 * @param {string} activityId - O ID da atividade principal.
 * @param {string} [subActivityId=null] - O ID da sub-atividade, se aplicável.
 */
function moverAtividade(direction, activityId, subActivityId = null) {
    if (!subActivityId) { // Movendo atividade principal
        const index = dadosObra.cronograma.findIndex(atv => atv.id === activityId);
        if (index === -1) return;

        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= dadosObra.cronograma.length) return;

        // Troca as posições no array usando desestruturação
        [dadosObra.cronograma[index], dadosObra.cronograma[newIndex]] = [dadosObra.cronograma[newIndex], dadosObra.cronograma[index]];

    } else { // Movendo sub-atividade
        const atividadePrincipal = dadosObra.cronograma.find(atv => atv.id === activityId);
        if (!atividadePrincipal || !atividadePrincipal.sub_atividades) return;

        const subIndex = atividadePrincipal.sub_atividades.findIndex(sub => sub.id === subActivityId);
        if (subIndex === -1) return;

        const newSubIndex = direction === 'up' ? subIndex - 1 : subIndex + 1;
        if (newSubIndex < 0 || newSubIndex >= atividadePrincipal.sub_atividades.length) return;

        // Troca as posições no array de sub-atividades usando desestruturação
        [atividadePrincipal.sub_atividades[subIndex], atividadePrincipal.sub_atividades[newSubIndex]] = [atividadePrincipal.sub_atividades[newSubIndex], atividadePrincipal.sub_atividades[subIndex]];
    }

    salvarDadosObra(); // Salva e recarrega a view para refletir a nova ordem
}

/**
 * Limpa todo o cronograma da obra, redefinindo-o para um estado vazio.
 */
function limparCronograma() {
    if (confirm('Tem certeza que deseja LIMPAR TODO O CRONOGRAMA? Esta ação é irreversível e removerá todas as atividades!')) {
        // Redefine o cronograma para um array vazio
        dadosObra.cronograma = [];
        dadosObra.gastos.material = 0; // Opcional: resetar gastos também ao limpar cronograma
        dadosObra.gastos.mao_de_obra = 0; // Opcional: resetar gastos também ao limpar cronograma
        // Salva e recarrega a view
        salvarDadosObra();
        alert('Cronograma limpo com sucesso! Agora você pode criar seu cronograma padrão.');
    }
}

/**
 * Alterna a visibilidade das sub-atividades de uma atividade principal.
 * @param {string} parentActivityId - O ID da atividade principal cujas sub-atividades serão alternadas.
 */
function toggleSubActivities(parentActivityId) {
    const subActivityRows = document.querySelectorAll(`.sub-of-${parentActivityId}`);
    const toggleIcon = document.querySelector(`.toggle-icon[onclick="toggleSubActivities('${parentActivityId}')"]`);

    subActivityRows.forEach(row => {
        row.classList.toggle('sub-activity-hidden');
    });

    if (toggleIcon) {
        toggleIcon.classList.toggle('expanded'); // Adiciona/remove a classe 'expanded' para girar o ícone
    }
}