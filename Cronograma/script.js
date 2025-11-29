// admin/script.js - FUNÇÃO LANCAR CUSTO RÁPIDO CORRIGIDA

async function lancarCustoRapido(event) {
    event.preventDefault();
    
    console.log('🚀 Iniciando lançamento de custo rápido...');
    
    // --- VALIDAÇÃO DO FORMULÁRIO ---
    const categoriaElement = document.getElementById('custo-categoria');
    const descricaoElement = document.getElementById('custo-descricao');
    const valorElement = document.getElementById('custo-valor');
    const fornecedorElement = document.getElementById('custo-fornecedor');

    // Verificar se elementos existem
    if (!categoriaElement || !descricaoElement || !valorElement) {
        console.error('❌ Elementos do formulário não encontrados');
        alert('❌ Erro: Formulário não carregado corretamente. Recarregue a página.');
        return;
    }

    const categoria = categoriaElement.value?.trim();
    const descricao = descricaoElement.value?.trim();
    const valorStr = valorElement.value?.trim();
    const fornecedor = fornecedorElement?.value?.trim() || '';

    console.log('📝 Dados do formulário:', { categoria, descricao, valorStr, fornecedor });

    // --- VALIDAÇÕES ---
    if (!categoria) {
        alert('❌ Selecione uma categoria');
        categoriaElement.focus();
        return;
    }

    if (!descricao) {
        alert('❌ Preencha a descrição do custo');
        descricaoElement.focus();
        return;
    }

    if (!valorStr || valorStr === '') {
        alert('❌ Preencha o valor do custo');
        valorElement.focus();
        return;
    }

    const valor = parseFloat(valorStr);

    if (isNaN(valor)) {
        alert('❌ Valor inválido. Use apenas números');
        valorElement.focus();
        return;
    }

    if (valor <= 0) {
        alert('❌ O valor deve ser maior que zero');
        valorElement.focus();
        return;
    }

    console.log('✅ Validação passou:', { categoria, descricao, valor, fornecedor });

    // --- GARANTIR ESTRUTURA DE DADOS - VERSÃO CORRIGIDA ---
    console.log('🔧 Verificando estrutura de dados...');
    console.log('dadosObra antes:', JSON.stringify(dadosObra, null, 2));

    // Garantir que gastos existe
    if (!dadosObra.gastos) {
        console.log('📝 Criando objeto gastos...');
        dadosObra.gastos = {
            material: { total_realizado: 0 },
            mao_de_obra: { total_realizado: 0 },
            historico: []
        };
    }

    // Garantir que gastos.material existe
    if (!dadosObra.gastos.material) {
        console.log('📝 Criando objeto gastos.material...');
        dadosObra.gastos.material = { total_realizado: 0 };
    }

    // Garantir que gastos.material.total_realizado existe
    if (typeof dadosObra.gastos.material.total_realizado !== 'number') {
        console.log('📝 Inicializando gastos.material.total_realizado...');
        dadosObra.gastos.material.total_realizado = 0;
    }

    // Garantir que gastos.mao_de_obra existe
    if (!dadosObra.gastos.mao_de_obra) {
        console.log('📝 Criando objeto gastos.mao_de_obra...');
        dadosObra.gastos.mao_de_obra = { total_realizado: 0 };
    }

    // Garantir que gastos.mao_de_obra.total_realizado existe
    if (typeof dadosObra.gastos.mao_de_obra.total_realizado !== 'number') {
        console.log('📝 Inicializando gastos.mao_de_obra.total_realizado...');
        dadosObra.gastos.mao_de_obra.total_realizado = 0;
    }

    // Garantir que historico existe
    if (!dadosObra.gastos.historico) {
        console.log('📝 Criando array de histórico...');
        dadosObra.gastos.historico = [];
    }

    if (!Array.isArray(dadosObra.gastos.historico)) {
        console.log('⚠️ Histórico não é um array, convertendo...');
        dadosObra.gastos.historico = [];
    }

    console.log('✅ Estrutura de dados validada');
    console.log('dadosObra depois:', JSON.stringify(dadosObra.gastos, null, 2));

    // --- CRIAR NOVO LANÇAMENTO ---
    const novoLancamento = {
        id: gerarNovoId('CST'),
        data: new Date().toISOString().split('T')[0],
        categoria: categoria,
        descricao: descricao,
        fornecedor: fornecedor || 'Não informado',
        valor: valor,
        data_lancamento: new Date().toISOString(),
        status_pagamento: 'Pago'
    };

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
    console.log('✅ Estilos de Drag & Drop adicionados');
}

    console.log('📝 Novo lançamento criado:', novoLancamento);

    // --- ADICIONAR AO HISTÓRICO ---
    dadosObra.gastos.historico.push(novoLancamento);
    console.log(`✅ Lançamento adicionado ao histórico. Total: ${dadosObra.gastos.historico.length}`);

    // --- ATUALIZAR TOTAIS POR CATEGORIA ---
    if (categoria === 'Material') {
        const totalAnterior = dadosObra.gastos.material.total_realizado || 0;
        dadosObra.gastos.material.total_realizado = totalAnterior + valor;
        console.log(`📊 Total Material: ${totalAnterior} → ${dadosObra.gastos.material.total_realizado}`);
    } else if (categoria === 'Mão de Obra') {
        const totalAnterior = dadosObra.gastos.mao_de_obra.total_realizado || 0;
        dadosObra.gastos.mao_de_obra.total_realizado = totalAnterior + valor;
        console.log(`📊 Total Mão de Obra: ${totalAnterior} → ${dadosObra.gastos.mao_de_obra.total_realizado}`);
    }

    // --- SALVAR NO FIREBASE ---
    try {
        console.log('💾 Salvando dados no Firebase...');
        
        const resultado = await salvarDados();
        
        if (!resultado) {
            throw new Error('Falha ao salvar dados');
        }

        console.log('✅ Dados salvos com sucesso');

        // --- ATUALIZAR INTERFACE ---
        console.log('🔄 Atualizando interface...');
        carregarAdminView();

        // --- LIMPAR FORMULÁRIO ---
        categoriaElement.value = '';
        descricaoElement.value = '';
        valorElement.value = '';
        if (fornecedorElement) fornecedorElement.value = '';

        console.log('🧹 Formulário limpo');

        // --- FEEDBACK AO USUÁRIO ---
        alert('✅ Custo lançado com sucesso!\n\nCategoria: ' + categoria + '\nValor: ' + formatarMoeda(valor));
        
        console.log('🎉 Lançamento completo');
        
    } catch (error) {
        console.error('❌ Erro ao salvar custo:', error);
        console.error('Stack:', error.stack);
        alert('❌ Erro ao salvar custo:\n\n' + error.message + '\n\nTente novamente.');
    }
}

// --- SALVAR DADOS NO FIREBASE - VERSÃO CORRIGIDA ---
async function salvarDados() {
    try {
        console.log('💾 Salvando dados...');
        
        // Garantir estrutura antes de salvar
        if (!dadosObra.gastos) {
            dadosObra.gastos = {
                material: { total_realizado: 0 },
                mao_de_obra: { total_realizado: 0 },
                historico: []
            };
        }

        const updateData = {
            cronograma: dadosObra.cronograma || [],
            gastos: dadosObra.gastos,
            progresso_geral: calcularProgressoGlobal(),
            ultima_atualizacao: new Date().toISOString()
        };

        console.log('📤 Enviando para Firebase:', JSON.stringify(updateData, null, 2));

        await dadosObraRef.update(updateData);
        
        console.log('✅ Dados salvos com sucesso');

        // 🆕 SINCRONIZAR CUSTOS GLOBAIS
        console.log('📊 Sincronizando custos globais...');
        await sincronizarCustosGlobais();
        
        return true;
        
    } catch (error) {
        console.error('❌ Erro ao salvar dados:', error);
        console.error('Código do erro:', error.code);
        console.error('Mensagem:', error.message);
        return false;
    }
}

// --- SINCRONIZAR CUSTOS GLOBAIS - VERSÃO CORRIGIDA ---
async function sincronizarCustosGlobais() {
    try {
        console.log('🔄 Sincronizando custos globais...');
        
        const historico = dadosObra.gastos?.historico || [];
        console.log(`📋 Histórico com ${historico.length} lançamentos`);
        
        const totaisPorCategoria = {
            'Material': 0,
            'Mão de Obra': 0,
            'Equipamento': 0,
            'Serviços': 0,
            'Despesas Gerais': 0
        };
        
        historico.forEach((lancamento, index) => {
            const categoria = lancamento.categoria || 'Despesas Gerais';
            const valor = parseFloat(lancamento.valor) || 0;
            
            console.log(`  ${index + 1}. ${categoria}: ${formatarMoeda(valor)}`);
            
            if (totaisPorCategoria.hasOwnProperty(categoria)) {
                totaisPorCategoria[categoria] += valor;
            }
        });
        
        const totalGeral = Object.values(totaisPorCategoria).reduce((a, b) => a + b, 0);
        
        console.log('📊 Totais calculados:', totaisPorCategoria);
        console.log('💰 Total Geral:', formatarMoeda(totalGeral));
        
        const resumo = {
            'Material': totaisPorCategoria['Material'],
            'Mão de Obra': totaisPorCategoria['Mão de Obra'],
            'Equipamento': totaisPorCategoria['Equipamento'],
            'Serviços': totaisPorCategoria['Serviços'],
            'Despesas Gerais': totaisPorCategoria['Despesas Gerais'],
            'Total': totalGeral,
            'ultima_atualizacao': new Date().toISOString()
        };

        console.log('📤 Atualizando custos_resumo...');
        
        await dadosObraRef.update({
            'custos_resumo': resumo
        });
        
        console.log('✅ Custos globais sincronizados com sucesso');
        
    } catch (error) {
        console.error('⚠️ Erro ao sincronizar custos globais:', error);
        console.error('Mas continuando mesmo assim...');
        // Não falhar se não conseguir sincronizar
    }
}

// --- EVENT LISTENER CORRIGIDO ---
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Inicializando aplicação...');

    adicionarEstilosDragDrop();

    try {
        await carregarDadosProjeto();
        await atualizarInfoObra();
        carregarAdminView();
        
        // 🆕 ADICIONAR EVENT LISTENER PARA FORMULÁRIO DE CUSTOS
        const formCustosRapido = document.getElementById('custos-form-rapido');
        if (formCustosRapido) {
            formCustosRapido.removeEventListener('submit', lancarCustoRapido); // Remove anterior
            formCustosRapido.addEventListener('submit', lancarCustoRapido); // Adiciona novo
            console.log('✅ Event listener de custos adicionado');
        } else {
            console.warn('⚠️ Formulário custos-form-rapido não encontrado');
        }
        
        console.log('✅ Aplicação inicializada com sucesso');
        
    } catch (error) {
        console.error('❌ Erro na inicialização:', error);
        alert('Erro ao carregar dados. Verifique a conexão e recarregue a página.');
    }
});