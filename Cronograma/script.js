console.log('🚀 Script iniciado');

// CONFIGURAÇÃO FIREBASE
const firebaseConfig = {
    apiKey: "AIzaSyDq3mr-ryX_q8GAEyfTsQP2mzjpP9wOugE",
    authDomain: "houseup-app.firebaseapp.com",
    projectId: "houseup-app",
    storageBucket: "houseup-app.firebasestorage.app",
    messagingSenderId: "401114152723",
    appId: "1:401114152723:web:f96eaf0a718342c0cf64e6"
};

// Inicializar Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

console.log('🔥 Firebase inicializado');

// DADOS GLOBAIS
let dadosObra = {};
const PROJETO_ATUAL = 'angela-marco';

// CARREGAR DADOS DO FIREBASE
async function carregarDados() {
    console.log('📂 Carregando dados do projeto:', PROJETO_ATUAL);
    
    try {
        const doc = await db.collection('projetos').doc(PROJETO_ATUAL).get();
        
        if (doc.exists) {
            dadosObra = doc.data();
            console.log('✅ Dados carregados:', dadosObra);
            
            // Mostrar dados na tela
            mostrarDados();
            
        } else {
            console.log('❌ Projeto não encontrado');
            criarProjetoBasico();
        }
        
    } catch (error) {
        console.error('❌ Erro ao carregar:', error);
        alert('Erro: ' + error.message);
    }
}

// CRIAR PROJETO BÁSICO SE NÃO EXISTIR
async function criarProjetoBasico() {
    console.log('🆕 Criando projeto básico...');
    
    dadosObra = {
        info_projeto: {
            nome_obra: "Residência Ângela e Marco",
            codigo_obra: "HOUS-001-2024"
        },
        cronograma: [
            {
                id: "ATV001",
                descricao: "Limpeza do terreno",
                peso_global: 5,
                progresso_atividade: 100,
                status: "Concluída",
                prazo_final: "2025-01-15"
            },
            {
                id: "ATV002", 
                descricao: "Fundação",
                peso_global: 15,
                progresso_atividade: 80,
                status: "Em Andamento",
                prazo_final: "2025-02-28"
            }
        ],
        gastos: {
            material: { total_realizado: 25000 },
            mao_de_obra: { total_realizado: 18000 }
        }
    };
    
    try {
        await db.collection('projetos').doc(PROJETO_ATUAL).set(dadosObra);
        console.log('✅ Projeto básico criado');
        mostrarDados();
    } catch (error) {
        console.error('❌ Erro ao criar projeto:', error);
    }
}

// MOSTRAR DADOS NA TELA
function mostrarDados() {
    console.log('🖥️ Atualizando interface...');
    
    // Atualizar nome da obra
    const elementos = {
        'admin-nome-obra': dadosObra.info_projeto?.nome_obra,
        'admin-codigo-obra': dadosObra.info_projeto?.codigo_obra,
        'projeto-atual': dadosObra.info_projeto?.nome_obra
    };
    
    Object.keys(elementos).forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.textContent = elementos[id] || 'N/A';
            console.log(`✅ Atualizado ${id}:`, elementos[id]);
        } else {
            console.log(`⚠️ Elemento ${id} não encontrado`);
        }
    });
    
    // Carregar cronograma
    carregarCronograma();
    
    // Carregar custos  
    carregarCustos();
}

// CARREGAR CRONOGRAMA NA TABELA
function carregarCronograma() {
    console.log('📋 Carregando cronograma...');
    
    const tbody = document.getElementById('cronograma-body');
    if (!tbody) {
        console.log('❌ Tabela cronograma-body não encontrada');
        return;
    }
    
    tbody.innerHTML = '';
    
    const cronograma = dadosObra.cronograma || [];
    console.log(`📊 ${cronograma.length} atividades para carregar`);
    
    if (cronograma.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px;">Nenhuma atividade cadastrada</td></tr>';
        return;
    }
    
    cronograma.forEach((atividade, index) => {
        console.log(`Carregando atividade ${index + 1}:`, atividade.descricao);
        
        const row = tbody.insertRow();
        row.innerHTML = `
            <td><strong>${atividade.descricao}</strong></td>
            <td><span style="background: #007bff; color: white; padding: 2px 8px; border-radius: 3px;">Principal</span></td>
            <td>${atividade.peso_global}%</td>
            <td>
                <input type="number" value="${atividade.progresso_atividade}" 
                       min="0" max="100" style="width: 80px;"
                       onchange="atualizarProgresso('${atividade.id}', this.value)">
            </td>
            <td>
                <select onchange="atualizarStatus('${atividade.id}', this.value)">
                    <option value="Não Iniciada" ${atividade.status === 'Não Iniciada' ? 'selected' : ''}>Não Iniciada</option>
                    <option value="Em Andamento" ${atividade.status === 'Em Andamento' ? 'selected' : ''}>Em Andamento</option>
                    <option value="Concluída" ${atividade.status === 'Concluída' ? 'selected' : ''}>Concluída</option>
                </select>
            </td>
            <td>${atividade.prazo_final}</td>
            <td>
                <button onclick="removerAtividade('${atividade.id}')" 
                        style="background: #dc3545; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer;">
                    🗑️ Remover
                </button>
            </td>
        `;
    });
    
    console.log('✅ Cronograma carregado na tabela');
}

// CARREGAR CUSTOS
function carregarCustos() {
    console.log('💰 Carregando custos...');
    
    const material = dadosObra.gastos?.material?.total_realizado || 0;
    const maoObra = dadosObra.gastos?.mao_de_obra?.total_realizado || 0;
    
    const elementos = {
        'total-material-admin': `R$ ${material.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`,
        'total-mao-de-obra-admin': `R$ ${maoObra.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`
    };
    
    Object.keys(elementos).forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.textContent = elementos[id];
            console.log(`✅ Custo atualizado ${id}:`, elementos[id]);
        } else {
            console.log(`⚠️ Elemento ${id} não encontrado`);
        }
    });
}

// ATUALIZAR PROGRESSO
async function atualizarProgresso(id, novoProgresso) {
    console.log(`🔄 Atualizando progresso da atividade ${id} para ${novoProgresso}%`);
    
    const atividade = dadosObra.cronograma.find(a => a.id === id);
    if (atividade) {
        atividade.progresso_atividade = parseInt(novoProgresso);
        
        // Atualizar status automaticamente
        if (novoProgresso == 0) atividade.status = "Não Iniciada";
        else if (novoProgresso == 100) atividade.status = "Concluída";
        else atividade.status = "Em Andamento";
        
        await salvarDados();
        carregarCronograma(); // Recarregar para mostrar mudanças
    }
}

// ATUALIZAR STATUS
async function atualizarStatus(id, novoStatus) {
    console.log(`🔄 Atualizando status da atividade ${id} para ${novoStatus}`);
    
    const atividade = dadosObra.cronograma.find(a => a.id === id);
    if (atividade) {
        atividade.status = novoStatus;
        await salvarDados();
    }
}

// ADICIONAR NOVA ATIVIDADE
async function adicionarAtividade() {
    console.log('➕ Adicionando nova atividade...');
    
    const descricao = document.getElementById('nova-atividade-descricao')?.value?.trim();
    const peso = document.getElementById('nova-atividade-peso-global')?.value;
    const prazo = document.getElementById('nova-atividade-prazo')?.value;
    
    if (!descricao || !peso) {
        alert('❌ Preencha descrição e peso da atividade');
        return;
    }
    
    const novaAtividade = {
        id: `ATV${Date.now()}`,
        descricao: descricao,
        peso_global: parseInt(peso),
        progresso_atividade: 0,
        status: "Não Iniciada",
        prazo_final: prazo || "2025-12-31"
    };
    
    dadosObra.cronograma.push(novaAtividade);
    
    try {
        await salvarDados();
        carregarCronograma();
        
        // Limpar formulário
        document.getElementById('nova-atividade-descricao').value = '';
        document.getElementById('nova-atividade-peso-global').value = '';
        document.getElementById('nova-atividade-prazo').value = '';
        
        alert('✅ Atividade adicionada com sucesso!');
        
    } catch (error) {
        console.error('❌ Erro ao adicionar:', error);
        alert('❌ Erro ao adicionar atividade');
    }
}

// REMOVER ATIVIDADE
async function removerAtividade(id) {
    if (!confirm('Tem certeza que deseja remover esta atividade?')) return;
    
    console.log(`🗑️ Removendo atividade ${id}`);
    
    dadosObra.cronograma = dadosObra.cronograma.filter(a => a.id !== id);
    
    try {
        await salvarDados();
        carregarCronograma();
        alert('✅ Atividade removida!');
    } catch (error) {
        console.error('❌ Erro ao remover:', error);
        alert('❌ Erro ao remover atividade');
    }
}

// SALVAR DADOS NO FIREBASE
async function salvarDados() {
    console.log('💾 Salvando dados...');
    
    try {
        await db.collection('projetos').doc(PROJETO_ATUAL).set(dadosObra);
        console.log('✅ Dados salvos com sucesso');
    } catch (error) {
        console.error('❌ Erro ao salvar:', error);
        throw error;
    }
}

// INICIALIZAR QUANDO CARREGAR
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM carregado, iniciando aplicação...');
    carregarDados();
});

// ADICIONAR EVENT LISTENERS PARA BOTÕES
document.addEventListener('click', (e) => {
    if (e.target.id === 'add-principal-activity-btn') {
        e.preventDefault();
        adicionarAtividade();
    }
});

console.log('✅ Script carregado completamente');