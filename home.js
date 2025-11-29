// --- DADOS INICIAIS DOS PROJETOS ---
const projetosIniciais = {
    "angela-marco": {
        "info_projeto": {
            "nome_obra": "Residência Angela e Marco",
            "codigo_obra": "HOUS-001-2024",
            "tipo_construcao": "terrea",
            "area_total": 245,
            "clientes": ["Angela", "Marco"],
            "endereco": "Araguari - MG",
            "data_inicio": "2024-10-15",
            "prazo_meses": 18,
            "status": "em_andamento",
            "orcamento_total": 450000.00,
            "observacoes": "Casa térrea para casal idoso, com foco em acessibilidade"
        },
        "progresso_geral": 15.5,
        "orcamento": {
            "valor_total_previsto": 450000.00,
            "valor_material_previsto": 270000.00,
            "valor_mao_obra_previsto": 180000.00,
            "data_criacao": "2024-10-15",
            "margem_contingencia": 10.0
        },
        "gastos": {
            "historico": { "valor": 45000.00, "historico": [] },

        }
    },
    
    "marco-jr-tuane": {
        "info_projeto": {
            "nome_obra": "Residência Marco Jr e Tuane",
            "codigo_obra": "HOUS-002-2024",
            "tipo_construcao": "sobrado",
            "area_total": 356,
            "clientes": ["Marco Jr", "Tuane"],
            "endereco": "Araguari - MG",
            "data_inicio": "2024-11-01",
            "prazo_meses": 18,
            "status": "em_andamento",
            "orcamento_total": 650000.00,
            "observacoes": "Sobrado de alto padrão com elevador e piscina"
        },
        "progresso_geral": 8.2,
        "orcamento": {
            "valor_total_previsto": 650000.00,
            "valor_material_previsto": 390000.00,
            "valor_mao_obra_previsto": 260000.00,
            "data_criacao": "2024-11-01",
            "margem_contingencia": 10.0
        },
        "gastos": {
            "material": { "total_realizado": 28000.00, "historico": [] },
            "mao_de_obra": { "total_realizado": 15000.00, "historico": [] },
            "equipamentos": { "total_realizado": 5000.00, "historico": [] },
            "servicos_terceiros": { "total_realizado": 8000.00, "historico": [] }
        }
    }
};

// --- FUNÇÕES PRINCIPAIS ---
async function inicializarPagina() {
    try {
        await verificarECriarProjetosIniciais();
        await carregarProjetos();
    } catch (error) {
        console.error("Erro ao inicializar página:", error);
        mostrarErro("Erro ao carregar projetos. Tente recarregar a página.");
    }
}

async function verificarECriarProjetosIniciais() {
    try {
        const projetosRef = db.collection('projetos');
        const snapshot = await projetosRef.get();
        
        if (snapshot.empty) {
            console.log("Criando projetos iniciais...");
            
            for (const [id, dados] of Object.entries(projetosIniciais)) {
                await projetosRef.doc(id).set(dados);
                console.log(`Projeto ${id} criado com sucesso`);
            }
            
            console.log("Projetos iniciais criados com sucesso!");
        } else {
            console.log("Projetos já existem no banco");
        }
    } catch (error) {
        console.error("Erro ao verificar/criar projetos iniciais:", error);
        throw error;
    }
}

async function carregarProjetos() {
    try {
        const projetosRef = db.collection('projetos');
        const snapshot = await projetosRef.get();
        
        const projectsGrid = document.getElementById('projects-grid');
        const emptyState = document.getElementById('empty-state');
        
        if (snapshot.empty) {
            projectsGrid.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }
        
        projectsGrid.innerHTML = '';
        emptyState.style.display = 'none';
        projectsGrid.style.display = 'grid';
        
        snapshot.forEach(doc => {
            const projeto = doc.data();
            const projetoId = doc.id;
            const card = criarCardProjeto(projetoId, projeto);
            projectsGrid.appendChild(card);
        });
        
    } catch (error) {
        console.error("Erro ao carregar projetos:", error);
        mostrarErro("Erro ao carregar projetos");
    }
}

function criarCardProjeto(id, projeto) {
    const info = projeto.info_projeto;
    const progresso = projeto.progresso_geral || 0;
    const gastoTotal = calcularGastoTotal(projeto.gastos);
    const orcamento = projeto.orcamento?.valor_total_previsto || 0;
    
    const card = document.createElement('div');
    card.className = 'project-card';
    card.onclick = () => abrirProjeto(id);
    
    card.innerHTML = `
        <div class="project-header">
            <div class="project-title">
                <h3>${info.nome_obra}</h3>
                <div class="project-code">${info.codigo_obra}</div>
            </div>
            <div class="project-status status-${info.status}">
                ${getStatusLabel(info.status)}
            </div>
        </div>
        
        <div class="project-info">
            <div class="info-row">
                <span class="info-label">Tipo:</span>
                <span class="info-value">${getTipoLabel(info.tipo_construcao)}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Área:</span>
                <span class="info-value">${info.area_total}m²</span>
            </div>
            <div class="info-row">
                <span class="info-label">Clientes:</span>
                <span class="info-value">${info.clientes.join(', ')}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Orçamento:</span>
                <span class="info-value">${formatarMoeda(orcamento)}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Gasto:</span>
                <span class="info-value">${formatarMoeda(gastoTotal)}</span>
            </div>
        </div>
        
        <div class="project-progress">
            <div class="progress-label">
                <span>Progresso da Obra</span>
                <span>${progresso.toFixed(1)}%</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${progresso}%"></div>
            </div>
        </div>
        
        <div class="project-actions">
            <button class="btn btn-primary btn-small" onclick="event.stopPropagation(); abrirProjeto('${id}')">
                <i class="fas fa-eye"></i> Abrir
            </button>
            <button class="btn btn-outline btn-small" onclick="event.stopPropagation(); editarProjeto('${id}')">
                <i class="fas fa-edit"></i> Editar
            </button>
        </div>
    `;
    
    return card;
}

function calcularGastoTotal(gastos) {
    let total = 0;
    if (gastos) {
        total += gastos.historico?.valor || 0;
        total += gastos.mao_de_obra?.total_realizado || 0;
        total += gastos.equipamentos?.total_realizado || 0;
        total += gastos.servicos_terceiros?.total_realizado || 0;
    }
    return total;
}

function getStatusLabel(status) {
    const labels = {
        'planejamento': 'Planejamento',
        'em_andamento': 'Em Andamento',
        'pausado': 'Pausado',
        'concluido': 'Concluído'
    };
    return labels[status] || status;
}

function getTipoLabel(tipo) {
    const labels = {
        'terrea': 'Casa Térrea',
        'sobrado': 'Sobrado',
        'apartamento': 'Apartamento',
        'comercial': 'Comercial',
        'reforma': 'Reforma'
    };
    return labels[tipo] || tipo;
}

function formatarMoeda(valor) {
    return valor.toLocaleString('pt-BR', { 
        style: 'currency', 
        currency: 'BRL' 
    });
}

// --- MODAL NOVO PROJETO ---
function abrirModalNovoProjeto() {
    document.getElementById('modal-novo-projeto').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function fecharModalNovoProjeto() {
    document.getElementById('modal-novo-projeto').style.display = 'none';
    document.body.style.overflow = 'auto';
    document.getElementById('form-novo-projeto').reset();
}

async function criarNovoProjeto(event) {
    event.preventDefault();
    
    try {
        const formData = new FormData(event.target);
        const dados = Object.fromEntries(formData);
        
        // Gerar ID único para o projeto
        const projetoId = gerarIdProjeto(dados['codigo-obra']);
        
        // Processar dados do formulário
        const clientesArray = dados.clientes.split(',').map(c => c.trim());
        
        const novoProjeto = {
            info_projeto: {
                nome_obra: dados['nome-obra'],
                codigo_obra: dados['codigo-obra'],
                tipo_construcao: dados['tipo-construcao'],
                area_total: parseInt(dados['area-total']),
                clientes: clientesArray,
                endereco: dados.endereco || '',
                data_inicio: dados['data-inicio'] || new Date().toISOString().split('T')[0],
                prazo_meses: parseInt(dados['prazo-meses']) || 12,
                status: 'planejamento',
                orcamento_total: parseFloat(dados['orcamento-total']) || 0,
                observacoes: dados.observacoes || ''
            },
            progresso_geral: 0,
            orcamento: {
                valor_total_previsto: parseFloat(dados['orcamento-total']) || 0,
                valor_material_previsto: 0,
                valor_mao_obra_previsto: 0,
                data_criacao: new Date().toISOString().split('T')[0],
                margem_contingencia: 10.0
            },
            gastos: {
                material: { total_realizado: 0, historico: [] },
                mao_de_obra: { total_realizado: 0, historico: [] },
                equipamentos: { total_realizado: 0, historico: [] },
                servicos_terceiros: { total_realizado: 0, historico: [] }
            },
            cronograma: [],
            criado_em: new Date().toISOString(),
            criado_por: 'Matheus'
        };
        
        // Salvar no Firebase
        await db.collection('projetos').doc(projetoId).set(novoProjeto);
        
        // Fechar modal e recarregar projetos
        fecharModalNovoProjeto();
        await carregarProjetos();
        
        mostrarSucesso('Projeto criado com sucesso!');
        
    } catch (error) {
        console.error('Erro ao criar projeto:', error);
        mostrarErro('Erro ao criar projeto. Tente novamente.');
    }
}

function gerarIdProjeto(codigoObra) {
    // Remove caracteres especiais e converte para lowercase
    const base = codigoObra.toLowerCase().replace(/[^a-z0-9]/g, '-');
    return base;
}

// --- NAVEGAÇÃO ---
function abrirProjeto(projetoId) {
    // Salvar projeto selecionado no localStorage
    localStorage.setItem('projetoAtual', projetoId);
    
    // Redirecionar para cronograma (temporário)
    window.location.href = `Cronograma/cronograma.html?projeto=${projetoId}`;
}

function editarProjeto(projetoId) {
    // TODO: Implementar edição de projeto
    console.log('Editar projeto:', projetoId);
    mostrarInfo('Funcionalidade de edição será implementada em breve');
}

// --- UTILITÁRIOS ---
function mostrarSucesso(mensagem) {
    alert('✅ ' + mensagem);
}

function mostrarErro(mensagem) {
    alert('❌ ' + mensagem);
}

function mostrarInfo(mensagem) {
    alert('ℹ️ ' + mensagem);
}

// --- EVENT LISTENERS ---
document.addEventListener('DOMContentLoaded', inicializarPagina);

// Fechar modal ao clicar fora
document.getElementById('modal-novo-projeto').addEventListener('click', function(e) {
    if (e.target === this) {
        fecharModalNovoProjeto();
    }
});

// Fechar modal com ESC
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        fecharModalNovoProjeto();
    }
});