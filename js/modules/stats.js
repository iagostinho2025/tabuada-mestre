/**
 * MÃ³dulo de EstatÃ­sticas e PersistÃªncia de Dados
 */

import { mostrarAlerta, mostrarConfirmacao } from './ui.js';

const STORAGE_KEY = 'tabuada_historico_v1';

// Salva uma nova partida no histÃ³rico
export function salvarPartida(dadosPartida) {
    // A CORREÃ‡ÃƒO ESTÃ AQUI: O "|| []" garante que se for null, cria um array vazio
    const historico = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    
    // Adiciona data/hora se nÃ£o tiver
    if (!dadosPartida.data) {
        dadosPartida.data = new Date().toISOString();
    }
    
    historico.push(dadosPartida);
    
    // Limite de seguranÃ§a: Guarda apenas as Ãºltimas 100 partidas para nÃ£o pesar
    if (historico.length > 100) {
        historico.shift(); // Remove a mais antiga
    }

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(historico));
    } catch (e) {
        console.error("Erro ao salvar no localStorage (cotas excedidas?):", e);
    }
}

// Recupera todo o histÃ³rico com seguranÃ§a
export function obterHistorico() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch (e) {
        return [];
    }
}

// Gera os dados para o Dashboard (Cards Coloridos)
export function obterDadosDesempenho() {
    const historico = obterHistorico();
    
    let totalJogos = historico.length;
    let totalAcertos = 0;
    let totalErros = 0;

    historico.forEach(partida => {
        totalAcertos += (partida.acertos || 0);
        totalErros += (partida.erros || 0);
    });

    return { totalJogos, totalAcertos, totalErros };
}

// Filtra detalhes para o histÃ³rico de um modo especÃ­fico (Ex: Speedrun)
export function obterDetalhesPorModo(modoAlvo) {
    const historico = obterHistorico();
    
    // Filtra pelo modo (ex: 'speedrun', 'classico')
    // Nota: 'treino' no game.js salva como 'treino', desafio salva pelo submodo
    const filtradas = historico.filter(p => p.modo === modoAlvo).reverse(); // Reverse para mostrar as mais recentes primeiro

    // Acha o recorde desse modo
    let recorde = 0;
    filtradas.forEach(p => {
        if (p.pontos > recorde) recorde = p.pontos;
    });

    // Pega as Ãºltimas 10 para exibir na lista
    const ultimas10 = filtradas.slice(0, 10);

    return {
        recorde: recorde,
        lista: ultimas10
    };
}

// Gera dados para o GrÃ¡fico de Barras
export function gerarDadosGrafico(periodo) {
    const historico = obterHistorico();
    const dadosTabuada = {};
    
    // Inicializa estrutura (tabuadas do 1 ao 10)
    for (let i = 1; i <= 10; i++) {
        dadosTabuada[i] = { acertos: 0, erros: 0 };
    }

    const agora = new Date();

    historico.forEach(partida => {
        const dataPartida = new Date(partida.data);
        let incluir = false;

        // Filtro de Tempo
        if (periodo === 'dia') {
            // Mesmo dia, mÃªs e ano
            incluir = (dataPartida.toDateString() === agora.toDateString());
        } else if (periodo === 'mes') {
            // Mesmo mÃªs e ano
            incluir = (dataPartida.getMonth() === agora.getMonth() && dataPartida.getFullYear() === agora.getFullYear());
        } else {
            // Ano (sempre inclui tudo do histÃ³rico recente, ou filtra por ano se quiser)
            incluir = true;
        }

        if (incluir) {
            // Processa Acertos por NÃºmero (Mapas salvos na partida)
            if (partida.acertosMap) {
                for (const [num, qtd] of Object.entries(partida.acertosMap)) {
                    if (dadosTabuada[num]) dadosTabuada[num].acertos += qtd;
                }
            }
            // Processa Erros por NÃºmero
            if (partida.errosMap) {
                for (const [num, qtd] of Object.entries(partida.errosMap)) {
                    if (dadosTabuada[num]) dadosTabuada[num].erros += qtd;
                }
            }
        }
    });

    // Calcula o mÃ¡ximo para escala do grÃ¡fico
    let maxVolume = 0;
    for (let i = 1; i <= 10; i++) {
        const total = dadosTabuada[i].acertos + dadosTabuada[i].erros;
        if (total > maxVolume) maxVolume = total;
    }

    return {
        dados: dadosTabuada,
        max: maxVolume
    };
}

// Apaga tudo (Reset)
export function limparDados() {
    mostrarConfirmacao({
        titulo: 'Limpar historico',
        mensagem: 'Isso apagara todo seu historico e recordes. Deseja continuar?',
        textoConfirmar: 'Apagar',
        textoCancelar: 'Cancelar'
    }).then((confirmado) => {
        if (!confirmado) return;

        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem('tabuada_recorde');

        mostrarAlerta({
            titulo: 'Concluido',
            mensagem: 'Historico apagado com sucesso.',
            textoConfirmar: 'OK'
        }).then(() => {
            window.location.reload();
        });
    });
}