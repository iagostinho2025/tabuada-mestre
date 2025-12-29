/**
 * Módulo responsável por salvar e analisar o desempenho do aluno.
 */

// Salva o resultado de uma partida no histórico
export function salvarPartida(dados) {
    const historico = JSON.parse(localStorage.getItem('tabuada_historico') || '[]');
    
    // Adiciona a nova partida no início
    historico.unshift({
        ...dados,
        data: new Date().toISOString()
    });

    // Mantém apenas as últimas 50 partidas
    if (historico.length > 50) historico.pop();

    localStorage.setItem('tabuada_historico', JSON.stringify(historico));
    
    // Atualiza estatísticas de erro
    if (dados.errosMap) {
        const statsGeral = JSON.parse(localStorage.getItem('tabuada_stats_erros') || '{}');
        for (const [numero, qtd] of Object.entries(dados.errosMap)) {
            if (!statsGeral[numero]) statsGeral[numero] = 0;
            statsGeral[numero] += qtd;
        }
        localStorage.setItem('tabuada_stats_erros', JSON.stringify(statsGeral));
    }
}

// Retorna dados para a tela de desempenho (Visão Geral)
export function obterDadosDesempenho() {
    const historico = JSON.parse(localStorage.getItem('tabuada_historico') || '[]');
    const statsErros = JSON.parse(localStorage.getItem('tabuada_stats_erros') || '{}');
    
    // Calcula totais
    let totalJogos = historico.length;
    let totalAcertos = 0;
    
    historico.forEach(h => totalAcertos += h.acertos);

    // Identifica a pior tabuada
    let piorTabuada = null;
    let maxErros = 0;
    
    for (const [num, qtd] of Object.entries(statsErros)) {
        if (qtd > maxErros) {
            maxErros = qtd;
            piorTabuada = num;
        }
    }

    return {
        totalJogos,
        totalAcertos,
        piorTabuada, 
        historicoRecente: historico.slice(0, 5) // Mantido para compatibilidade, mas o foco agora são os botões
    };
}

export function limparDados() {
    if(confirm("Tem certeza? Isso apagará seu recorde e histórico.")) {
        localStorage.removeItem('tabuada_historico');
        localStorage.removeItem('tabuada_stats_erros');
        localStorage.removeItem('tabuada_recorde');
        alert('Histórico apagado!');
        location.reload();
    }
}

// Gera dados para o Gráfico de Barras (1 a 10)
export function gerarDadosGrafico(periodo) {
    const historico = JSON.parse(localStorage.getItem('tabuada_historico') || '[]');
    const dadosTabuada = {}; // Vai guardar { 1: 15, 2: 8 ... }

    // Inicializa do 1 ao 10 com zero
    for (let i = 1; i <= 10; i++) dadosTabuada[i] = 0;

    const agora = new Date();

    historico.forEach(partida => {
        if (!partida.acertosMap) return; // Ignora partidas antigas sem esse dado

        const dataPartida = new Date(partida.data);
        let incluir = false;

        // Filtro de Data
        if (periodo === 'dia') {
            incluir = dataPartida.getDate() === agora.getDate() && 
                      dataPartida.getMonth() === agora.getMonth() &&
                      dataPartida.getFullYear() === agora.getFullYear();
        } else if (periodo === 'mes') {
            incluir = dataPartida.getMonth() === agora.getMonth() && 
                      dataPartida.getFullYear() === agora.getFullYear();
        } else {
            incluir = true; 
        }

        if (incluir) {
            // Soma os acertos de cada número
            for (const [num, qtd] of Object.entries(partida.acertosMap)) {
                if (dadosTabuada[num] !== undefined) {
                    dadosTabuada[num] += qtd;
                }
            }
        }
    });

    // Descobre o valor máximo para calcular a altura das barras (escala)
    let maxValor = 0;
    for (let i = 1; i <= 10; i++) {
        if (dadosTabuada[i] > maxValor) maxValor = dadosTabuada[i];
    }

    return { dados: dadosTabuada, max: maxValor };
}

// --- NOVO: Função para o Painel de Detalhes ---
// Filtra o histórico pelo modo clicado (ex: 'classico', 'speedrun')
export function obterDetalhesPorModo(modoAlvo) {
    const historico = JSON.parse(localStorage.getItem('tabuada_historico') || '[]');
    
    // 1. Filtra apenas as partidas do modo selecionado
    const partidasDoModo = historico.filter(h => h.modo === modoAlvo);
    
    // 2. Encontra o recorde (Maior pontuação) neste modo específico
    let recorde = 0;
    partidasDoModo.forEach(p => {
        if (p.pontos > recorde) recorde = p.pontos;
    });

    // 3. Pega as últimas 10 partidas desse modo para a lista
    const ultimas10 = partidasDoModo.slice(0, 10);

    return {
        recorde: recorde,
        lista: ultimas10,
        totalJogadas: partidasDoModo.length
    };
}