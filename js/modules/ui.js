import { configTreino, configDesafio } from './state.js';

export const telas = {
    inicial: document.getElementById('tela-inicial'),
    estudo: document.getElementById('tela-estudo'),
    config: document.getElementById('tela-config-treino'),
    configDesafio: document.getElementById('tela-config-desafio'),
    desempenho: document.getElementById('tela-desempenho'), // <--- ADICIONADO AQUI
    jogo: { 
        header: document.getElementById('header-jogo'),
        container: document.getElementById('container-jogo'),
        timer: document.getElementById('timer-display'),
        placar: document.getElementById('placar-display'),
        contadorTexto: document.getElementById('texto-contador'),
        barraFixaContainer: document.getElementById('container-barra-fixa'),
        barraFixaFill: document.getElementById('barra-fina-fill'),
        barraTempoContainer: document.getElementById('container-barra-tempo'),
        barraTempoFill: document.getElementById('barra-fill')
    },
    resultado: document.getElementById('tela-resultado')
};

export function mostrarTela(nomeTela) {
    // Esconde todas as divs filhas diretas do #app
    document.querySelectorAll('#app > div').forEach(el => el.classList.add('oculto'));
    
    // Esconde elementos específicos do jogo
    telas.jogo.header.classList.add('oculto');
    telas.jogo.container.classList.add('oculto');

    let telaAlvo;
    if (typeof nomeTela === 'string') {
        if (nomeTela === 'jogo') {
            telas.jogo.header.classList.remove('oculto');
            telas.jogo.container.classList.remove('oculto');
            return;
        }
        
        // Tenta achar pelo nome direto ou pelo ID
        if (telas[nomeTela]) {
            telaAlvo = telas[nomeTela];
        } else if (nomeTela.startsWith('tela-')) {
            telaAlvo = document.getElementById(nomeTela);
        }
    }

    if (telaAlvo) telaAlvo.classList.remove('oculto');
}

// --- Funções Globais ---
export function escolherModoInput(modo) {
    if(typeof AudioMestre !== 'undefined') AudioMestre.click();
    configTreino.modoInput = modo;
    document.querySelectorAll('#tela-config-treino .card-opcao-treino').forEach(c => c.classList.remove('selecionado'));
    const btn = document.getElementById(`opt-${modo}`);
    if(btn) btn.classList.add('selecionado');
}

export function atualizarValorSlider(val) {
    document.getElementById('valor-slider-display').textContent = val;
    configTreino.qtdQuestoes = parseInt(val);
}

export function escolherQtd(qtd) {
    if(typeof AudioMestre !== 'undefined') AudioMestre.click();
    document.querySelectorAll('.btn-qtd-redondo').forEach(b => b.classList.remove('selecionado'));
    const sliderWrapper = document.getElementById('wrapper-slider');
    
    if (qtd === 'custom') {
        document.getElementById('qtd-custom').classList.add('selecionado');
        sliderWrapper.classList.remove('oculto'); 
        configTreino.qtdQuestoes = parseInt(document.getElementById('slider-qtd').value);
    } else {
        let idBtn = `qtd-${qtd}`;
        if(qtd === Infinity) idBtn = 'qtd-inf';
        const btn = document.getElementById(idBtn);
        if(btn) btn.classList.add('selecionado');
        sliderWrapper.classList.add('oculto'); 
        configTreino.qtdQuestoes = qtd;
    }
}

export function escolherModoDesafio(modo) {
    if(typeof AudioMestre !== 'undefined') AudioMestre.click();
    configDesafio.modo = modo;
    const container = document.getElementById('tela-config-desafio');
    container.querySelectorAll('.card-opcao-treino').forEach(c => c.classList.remove('selecionado'));
    document.getElementById(`opt-desafio-${modo}`).classList.add('selecionado');
}

export function escolherDificuldade(dif) {
    if(typeof AudioMestre !== 'undefined') AudioMestre.click();
    configDesafio.dificuldade = dif;
    const container = document.getElementById('tela-config-desafio');
    container.querySelectorAll('.btn-qtd-redondo').forEach(b => b.classList.remove('selecionado'));
    document.getElementById(`dif-${dif}`).classList.add('selecionado');
}