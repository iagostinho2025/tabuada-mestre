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
    
    // Atualiza estatísticas de erro (Mapa de Calor)
    if (dados.errosMap) {
        const statsGeral = JSON.parse(localStorage.getItem('tabuada_stats_erros') || '{}');
        for (const [numero, qtd] of Object.entries(dados.errosMap)) {
            if (!statsGeral[numero]) statsGeral[numero] = 0;
            statsGeral[numero] += qtd;
        }
        localStorage.setItem('tabuada_stats_erros', JSON.stringify(statsGeral));
    }
}

// Retorna dados gerais para a tela de desempenho
export function obterDadosDesempenho() {
    const historico = JSON.parse(localStorage.getItem('tabuada_historico') || '[]');
    
    let totalJogos = historico.length;
    let totalAcertos = 0;
    let totalErros = 0; // Novo contador
    
    historico.forEach(h => {
        totalAcertos += h.acertos;
        totalErros += h.erros;
    });

    return {
        totalJogos,
        totalAcertos,
        totalErros, // Retorna o total de erros agora
        historicoRecente: historico.slice(0, 5)
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

// Gera dados para o Gráfico de Barras (Agora com Acertos E Erros para %)
export function gerarDadosGrafico(periodo) {
    const historico = JSON.parse(localStorage.getItem('tabuada_historico') || '[]');
    
    // Estrutura: { 1: {acertos: 0, erros: 0}, ... }
    const dadosTabuada = {}; 

    // Inicializa do 1 ao 10
    for (let i = 1; i <= 10; i++) {
        dadosTabuada[i] = { acertos: 0, erros: 0 };
    }

    const agora = new Date();

    historico.forEach(partida => {
        if (!partida.acertosMap && !partida.errosMap) return;

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
            // Soma ACERTOS
            if (partida.acertosMap) {
                for (const [num, qtd] of Object.entries(partida.acertosMap)) {
                    if (dadosTabuada[num]) dadosTabuada[num].acertos += qtd;
                }
            }
            // Soma ERROS (para o cálculo de %)
            if (partida.errosMap) {
                for (const [num, qtd] of Object.entries(partida.errosMap)) {
                    if (dadosTabuada[num]) dadosTabuada[num].erros += qtd;
                }
            }
        }
    });

    // Descobre o valor máximo de ACERTOS para a escala da barra
    let maxValor = 0;
    for (let i = 1; i <= 10; i++) {
        if (dadosTabuada[i].acertos > maxValor) maxValor = dadosTabuada[i].acertos;
    }

    return { dados: dadosTabuada, max: maxValor };
}

// Filtra histórico para um modo específico e retorna Recorde + Lista
export function obterDetalhesPorModo(modoAlvo) {
    const historico = JSON.parse(localStorage.getItem('tabuada_historico') || '[]');
    const partidasDoModo = historico.filter(h => h.modo === modoAlvo);
    
    let recorde = 0;
    partidasDoModo.forEach(p => {
        if (p.pontos > recorde) recorde = p.pontos;
    });

    const ultimas10 = partidasDoModo.slice(0, 10);

    return {
        recorde: recorde,
        lista: ultimas10,
        totalJogadas: partidasDoModo.length
    };
}