/**
 * APP.JS - VERSÃO FINAL: DESAFIOS E JOGABILIDADE COMPLETA
 */

// --- 1. ESTADO GLOBAL ---
let estado = {
    modo: null,         // 'treino', 'desafio', 'visualizacao', 'estudo-lousa'
    subModo: null,      // Para os tipos de desafio ('classico', 'morte', 'recarga', 'speedrun')
    pontos: 0,
    acertos: 0, 
    erros: 0,   
    totalQuestoes: 0, 
    
    // Timer
    tempo: 0,
    timerInterval: null,
    
    // Controle
    emAndamento: false,
    questaoAtual: {},
    
    // Configurações herdadas
    maxQuestoes: Infinity, 
    modoInput: 'botoes'
};

// Configuração do Treino (Praticar Agora)
let configTreino = {
    modoInput: 'botoes',
    qtdQuestoes: 10
};

// Configuração do Desafio (Novo!)
let configDesafio = {
    modo: 'classico',   // classico, morte, recarga, speedrun
    dificuldade: 'medio'
};

// Variáveis da Lousa
let tabuadaSelecionadaId = 1;
let quizLousa = { numero: 1, fila: [], atual: null, acertos: 0, erros: 0 };

// --- 2. MAPEAMENTO DOM ---
const telas = {
    inicial: document.getElementById('tela-inicial'),
    estudo: document.getElementById('tela-estudo'),
    config: document.getElementById('tela-config-treino'),
    configDesafio: document.getElementById('tela-config-desafio'),
    jogo: { 
        header: document.getElementById('header-jogo'),
        container: document.getElementById('container-jogo'),
        timer: document.getElementById('timer-display'),
        placar: document.getElementById('placar-display'),
        
        // Elementos de progresso
        contadorTexto: document.getElementById('texto-contador'),
        barraFixaContainer: document.getElementById('container-barra-fixa'),
        barraFixaFill: document.getElementById('barra-fina-fill'),
        barraTempoContainer: document.getElementById('container-barra-tempo'),
        barraTempoFill: document.getElementById('barra-fill')
    },
    resultado: document.getElementById('tela-resultado')
};

const elOpcoes = document.getElementById('opcoes-resposta');

// --- 3. INICIALIZAÇÃO ---
document.addEventListener('DOMContentLoaded', () => {
    carregarRecorde();
    setupEventos();
});

function setupEventos() {
    // --- NAVEGAÇÃO PRINCIPAL ---
    
    // 1. Estudar
    document.getElementById('btn-estudar').onclick = () => { 
        if(typeof AudioMestre !== 'undefined') AudioMestre.click();
        iniciarModoLousa(); 
        mostrarTela('estudo'); 
    };
    
    // 2. Praticar (Vai para config de treino)
    document.getElementById('btn-treino').onclick = () => {
        if(typeof AudioMestre !== 'undefined') AudioMestre.click();
        mostrarTela('config'); 
    };

    // 3. Desafio (Vai para config de desafio)
    document.getElementById('btn-desafio').onclick = () => {
        if(typeof AudioMestre !== 'undefined') AudioMestre.click();
        mostrarTela('configDesafio'); 
    };
    
    // --- BOTÕES DE INÍCIO (AÇÃO) ---
    
    // Iniciar TREINO
    const btnStartTreino = document.getElementById('btn-iniciar-treino-custom');
    if(btnStartTreino) {
        btnStartTreino.onclick = () => {
            if(typeof AudioMestre !== 'undefined') AudioMestre.click();
            iniciarJogoTelaCheia('treino');
        };
    }

    // Iniciar DESAFIO
    const btnStartDesafio = document.getElementById('btn-iniciar-desafio-custom');
    if(btnStartDesafio) {
        btnStartDesafio.onclick = () => {
            if(typeof AudioMestre !== 'undefined') AudioMestre.click();
            iniciarJogoTelaCheia('desafio'); 
        };
    }

    // --- NAVEGAÇÃO GERAL ---
    document.querySelectorAll('.btn-voltar').forEach(btn => {
        btn.onclick = null; 
        btn.addEventListener('click', (e) => {
            e.preventDefault(); 
            if(typeof AudioMestre !== 'undefined') AudioMestre.click();
            pararJogoTelaCheia(); 
            
            // Retornos inteligentes
            if(estado.modo === 'estudo-lousa') iniciarModoLousa(); 
            
            const destino = btn.getAttribute('data-destino');
            if (destino) mostrarTela(destino);
        });
    });

    // Botão Sair dentro do Jogo
    const btnSair = document.getElementById('btn-sair-jogo');
    if(btnSair) {
        btnSair.onclick = () => { if(confirm("Sair do jogo?")) { pararJogoTelaCheia(); mostrarTela('inicial'); } };
    }

    // Botão Reiniciar (Resultado)
    document.getElementById('btn-reiniciar').onclick = () => {
        if(typeof AudioMestre !== 'undefined') AudioMestre.click();
        if (estado.modo === 'estudo-lousa') { iniciarDesafioLousa(); mostrarTela('estudo'); } 
        else { iniciarJogoTelaCheia(estado.modo); }
    };
    
    document.getElementById('btn-home-resultado').onclick = () => mostrarTela('inicial');
}

// --- FUNÇÕES DE CONFIGURAÇÃO (TREINO) ---
window.escolherModoInput = function(modo) {
    if(typeof AudioMestre !== 'undefined') AudioMestre.click();
    configTreino.modoInput = modo;
    document.querySelectorAll('#tela-config-treino .card-opcao-treino').forEach(c => c.classList.remove('selecionado'));
    document.getElementById(`opt-${modo}`).classList.add('selecionado');
}

window.atualizarValorSlider = function(val) {
    document.getElementById('valor-slider-display').textContent = val;
    configTreino.qtdQuestoes = parseInt(val);
}

window.escolherQtd = function(qtd) {
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

// --- FUNÇÕES DE CONFIGURAÇÃO (DESAFIO) ---
window.escolherModoDesafio = function(modo) {
    if(typeof AudioMestre !== 'undefined') AudioMestre.click();
    configDesafio.modo = modo;
    const container = document.getElementById('tela-config-desafio');
    container.querySelectorAll('.card-opcao-treino').forEach(c => c.classList.remove('selecionado'));
    document.getElementById(`opt-desafio-${modo}`).classList.add('selecionado');
}

window.escolherDificuldade = function(dif) {
    if(typeof AudioMestre !== 'undefined') AudioMestre.click();
    configDesafio.dificuldade = dif;
    const container = document.getElementById('tela-config-desafio');
    container.querySelectorAll('.btn-qtd-redondo').forEach(b => b.classList.remove('selecionado'));
    document.getElementById(`dif-${dif}`).classList.add('selecionado');
}

// --- CONTROLE DE TELAS ---
function mostrarTela(nomeTela) {
    // Esconde tudo
    document.querySelectorAll('#app > div').forEach(el => el.classList.add('oculto'));
    telas.jogo.header.classList.add('oculto');
    telas.jogo.container.classList.add('oculto');

    if (nomeTela === 'jogo') {
        telas.jogo.header.classList.remove('oculto');
        telas.jogo.container.classList.remove('oculto');
    } else {
        // Resolve nome da tela
        let telaAlvo = telas[nomeTela];
        if (!telaAlvo && typeof nomeTela === 'string') {
            if (nomeTela.startsWith('tela-')) telaAlvo = document.getElementById(nomeTela);
            else telaAlvo = telas[nomeTela];
        }
        if (telaAlvo) telaAlvo.classList.remove('oculto');
    }
}

// --- MODO ESTUDO: LOUSA INTERATIVA ---
function iniciarModoLousa() {
    estado.modo = 'visualizacao';
    document.querySelector('.area-seletores-container').classList.remove('oculto');
    document.querySelector('.area-acao-fixa').classList.remove('oculto');
    document.getElementById('painel-quiz-lousa').classList.add('oculto');
    gerarBotoesSeletores();
    atualizarLousa(tabuadaSelecionadaId); 
}

function gerarBotoesSeletores() {
    const container = document.getElementById('lista-botoes-selecao');
    container.innerHTML = ''; 
    for (let i = 1; i <= 10; i++) {
        const btn = document.createElement('button');
        btn.className = 'btn-seletor-redondo';
        if(i === tabuadaSelecionadaId) btn.classList.add('ativo');
        btn.textContent = i;
        btn.onclick = () => {
            if(typeof AudioMestre !== 'undefined') AudioMestre.click();
            document.querySelectorAll('.btn-seletor-redondo').forEach(b => b.classList.remove('ativo'));
            btn.classList.add('ativo');
            atualizarLousa(i);
        };
        container.appendChild(btn);
    }
}

function atualizarLousa(numero) {
    tabuadaSelecionadaId = numero;
    document.getElementById('titulo-pagina-estudo').textContent = `Tabuada do ${numero}`;
    const btnPraticar = document.getElementById('btn-acao-praticar-dinamico');
    btnPraticar.innerHTML = `🎮 Praticar Tabuada do ${numero}`;
    btnPraticar.onclick = () => {
        if(typeof AudioMestre !== 'undefined') AudioMestre.click();
        iniciarDesafioLousa(); 
    };
    const containerLousa = document.getElementById('lousa-conteudo');
    containerLousa.innerHTML = '';
    containerLousa.style.opacity = '0';
    setTimeout(() => containerLousa.style.opacity = '1', 50);
    for (let i = 1; i <= 10; i++) {
        const div = document.createElement('div');
        div.className = 'item-lousa';
        div.innerHTML = `<span>${numero} x ${i}</span><span class="destaque-resultado">= ${numero * i}</span>`;
        containerLousa.appendChild(div);
    }
}

function iniciarDesafioLousa() {
    if(typeof AudioMestre !== 'undefined' && AudioMestre.ctx.state === 'suspended') AudioMestre.ctx.resume();
    estado.modo = 'estudo-lousa';
    document.querySelector('.area-seletores-container').classList.add('oculto');
    document.querySelector('.area-acao-fixa').classList.add('oculto');
    document.getElementById('painel-quiz-lousa').classList.remove('oculto');
    quizLousa.numero = tabuadaSelecionadaId;
    quizLousa.acertos = 0; quizLousa.erros = 0;
    quizLousa.fila = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].sort(() => Math.random() - 0.5);
    
    // Limpa a lousa visualmente
    const container = document.getElementById('lousa-conteudo');
    container.querySelectorAll('.item-lousa').forEach((div, index) => {
        const multiplicador = index + 1;
        div.id = `linha-quiz-${multiplicador}`; 
        div.innerHTML = `<span>${quizLousa.numero} x ${multiplicador}</span><span class="destaque-resultado" id="res-quiz-${multiplicador}"> = ?</span>`;
        div.classList.remove('ativa-no-quiz'); div.style.opacity = '0.4';
    });
    proximaPerguntaLousa();
}

function proximaPerguntaLousa() {
    if (quizLousa.fila.length === 0) {
        processarResultadoFinal(quizLousa.acertos, quizLousa.erros, 10, `Tabuada do ${quizLousa.numero}`);
        return;
    }
    quizLousa.atual = quizLousa.fila.pop();
    const fator = quizLousa.atual;
    const respostaCerta = quizLousa.numero * fator;
    
    document.querySelectorAll('.item-lousa').forEach(l => l.classList.remove('ativa-no-quiz'));
    const linhaDaVez = document.getElementById(`linha-quiz-${fator}`);
    if(linhaDaVez) {
        linhaDaVez.classList.add('ativa-no-quiz'); linhaDaVez.style.opacity = '1'; 
        linhaDaVez.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    document.getElementById('texto-pergunta-quiz').textContent = `${quizLousa.numero} x ${fator} = ?`;
    document.getElementById('feedback-quiz').textContent = '';
    
    const containerBotoes = document.getElementById('opcoes-quiz-lousa');
    containerBotoes.innerHTML = '';
    let opcoes = new Set([respostaCerta]);
    while (opcoes.size < 4) {
        let erro = respostaCerta + (Math.floor(Math.random() * 10) - 5);
        if (erro > 0 && erro !== respostaCerta) opcoes.add(erro);
        else opcoes.add(Math.floor(Math.random() * (quizLousa.numero * 12)) + 1);
    }
    Array.from(opcoes).sort(() => Math.random() - 0.5).forEach(val => {
        const btn = document.createElement('button');
        btn.className = 'btn-lateral'; btn.textContent = val;
        btn.onclick = (e) => confirmarRespostaLousa(val, respostaCerta, e.target);
        containerBotoes.appendChild(btn);
    });
}

function confirmarRespostaLousa(escolha, correta, btn) {
    document.querySelectorAll('#opcoes-quiz-lousa button').forEach(b => b.disabled = true);
    const spanRes = document.getElementById(`res-quiz-${quizLousa.atual}`);
    const feedbackEl = document.getElementById('feedback-quiz'); 
    
    if (escolha === correta) {
        if(typeof AudioMestre !== 'undefined') AudioMestre.acerto();
        btn.classList.add('animacao-acerto'); 
        feedbackEl.textContent = "Muito bem! 🎉"; feedbackEl.style.color = "var(--success)";
        spanRes.innerHTML = ` = ${correta} <span style="color:#4ade80">✔</span>`; spanRes.style.color = '#4ade80';
        quizLousa.acertos++;
        setTimeout(proximaPerguntaLousa, 1200);
    } else {
        if(typeof AudioMestre !== 'undefined') AudioMestre.erro();
        btn.classList.add('animacao-erro'); 
        feedbackEl.textContent = "Ops, tente de novo! ❌"; feedbackEl.style.color = "var(--error)";
        document.querySelectorAll('#opcoes-quiz-lousa button').forEach(b => { if (parseInt(b.textContent) === correta) b.classList.add('certo'); });
        spanRes.innerHTML = ` = ${correta} <span style="color:#ef4444">✘</span>`; spanRes.style.color = '#ef4444';
        quizLousa.erros++;
        setTimeout(proximaPerguntaLousa, 1500); 
    }
}

// --- 5. MODOS TELA CHEIA (LÓGICA PRINCIPAL) ---

function iniciarJogoTelaCheia(modo) {
    estado.modo = modo;
    estado.pontos = 0; estado.acertos = 0; estado.erros = 0; estado.totalQuestoes = 0;
    estado.emAndamento = true;
    
    // Configura o botão de navegação (Sair ou Voltar)
    const btnNav = document.getElementById('btn-sair-jogo');
    btnNav.className = 'btn-voltar'; 

    if (modo === 'treino') {
        // --- MODO TREINO ---
        btnNav.innerHTML = "⬅ Voltar"; 
        btnNav.onclick = () => { if(typeof AudioMestre !== 'undefined') AudioMestre.click(); pararJogoTelaCheia(); mostrarTela('config'); };
        
        estado.maxQuestoes = configTreino.qtdQuestoes;
        estado.modoInput = configTreino.modoInput;
        estado.subModo = null;
        
        telas.jogo.timer.classList.add('oculto');
        telas.jogo.barraTempoContainer.classList.add('oculto');
        
        // Barra Verde (Progresso)
        if (estado.maxQuestoes !== Infinity) telas.jogo.barraFixaContainer.classList.remove('oculto');
        else telas.jogo.barraFixaContainer.classList.add('oculto');

    } else {
        // --- MODO DESAFIO (4 Variações) ---
        btnNav.innerHTML = "✕ Sair";
        btnNav.onclick = () => { if(confirm("Sair do jogo?")) { pararJogoTelaCheia(); mostrarTela('inicial'); } };
        
        estado.subModo = configDesafio.modo;
        estado.modoInput = 'botoes'; // Desafios usam botões (por enquanto)
        estado.maxQuestoes = Infinity; // Padrão, mas muda no speedrun
        
        // Lógica de Tempo por SubModo
        if (estado.subModo === 'classico') estado.tempo = 60;
        else if (estado.subModo === 'morte') estado.tempo = 5;
        else if (estado.subModo === 'recarga') estado.tempo = 10;
        else if (estado.subModo === 'speedrun') {
            estado.tempo = 0; // Conta pra cima
            estado.maxQuestoes = 20; // Meta fixa
        }

        // UI do Desafio
        telas.jogo.timer.classList.remove('oculto');
        telas.jogo.barraTempoContainer.classList.remove('oculto'); 
        telas.jogo.barraFixaContainer.classList.add('oculto');    
        
        iniciarTimer();
    }

    document.getElementById('placar-display').textContent = `⭐ 0`;
    mostrarTela('jogo');
    proximaQuestaoTelaCheia();
}

function pararJogoTelaCheia() {
    estado.emAndamento = false;
    clearInterval(estado.timerInterval);
}

// ATUALIZA O CABEÇALHO (Contador e Barra)
function atualizarProgressoHeader() {
    const concluidas = estado.totalQuestoes; 
    const total = estado.maxQuestoes;
    
    // Texto do Contador
    if (total === Infinity) {
        telas.jogo.contadorTexto.textContent = `Feitas: ${concluidas}`;
        telas.jogo.barraFixaFill.style.width = '100%'; 
    } else {
        telas.jogo.contadorTexto.textContent = `${concluidas} / ${total}`;
        const pct = (concluidas / total) * 100;
        telas.jogo.barraFixaFill.style.width = `${pct}%`;
    }
}

function proximaQuestaoTelaCheia() {
    if (!estado.emAndamento) return;

    // --- REGRAS DE FIM DE JOGO ---
    
    // Treino ou Speedrun atingiram a meta
    if (estado.maxQuestoes !== Infinity && estado.totalQuestoes >= estado.maxQuestoes) {
        finalizarJogoTelaCheia();
        return;
    }

    // Desafio Morte Súbita: Reinicia o timer a cada pergunta
    if (estado.modo === 'desafio' && estado.subModo === 'morte') {
        estado.tempo = 5; 
        atualizarTimerUI(); // Atualiza visual na hora
        // A barra de tempo precisa resetar visualmente
        telas.jogo.barraTempoFill.style.transition = 'none';
        telas.jogo.barraTempoFill.style.width = '100%';
        setTimeout(() => telas.jogo.barraTempoFill.style.transition = 'width 1s linear', 50);
    }

    // --- GERAÇÃO DA QUESTÃO ---
    atualizarProgressoHeader();

    const feedbackEl = document.getElementById('feedback-jogo-tela-cheia');
    if(feedbackEl) feedbackEl.textContent = '';

    const a = Math.floor(Math.random() * 9) + 2; 
    const b = Math.floor(Math.random() * 10) + 1;
    const respostaCorreta = a * b;
    estado.questaoAtual = { a, b, respostaCorreta };

    const areaPergunta = document.querySelector('.area-pergunta');
    areaPergunta.innerHTML = ''; 
    elOpcoes.innerHTML = '';    

    // --- RENDERIZAÇÃO ---
    
    // 1. Badge do Modo
    let badgeHtml = '';
    if (estado.modo === 'desafio') {
        // Badges Especiais de Desafio
        if (estado.subModo === 'morte') badgeHtml = '<span class="badge-pilula badge-laranja">💣 Morte Súbita</span>';
        else if (estado.subModo === 'recarga') badgeHtml = '<span class="badge-pilula badge-verde">🔋 Recarga</span>';
        else if (estado.subModo === 'speedrun') badgeHtml = '<span class="badge-pilula badge-azul">🏁 Speedrun</span>';
        else badgeHtml = '<span class="badge-pilula badge-roxo">⏱️ Clássico</span>';
    } else {
        // Badges de Treino
        if (estado.modoInput === 'botoes') badgeHtml = '<span class="badge-pilula badge-azul">🔘 Múltipla Escolha</span>';
        else if (estado.modoInput === 'teclado') badgeHtml = '<span class="badge-pilula badge-roxo">⌨ Teclado Numérico</span>';
        else if (estado.modoInput === 'verdadeiro-falso') badgeHtml = '<span class="badge-pilula badge-laranja">⚡ Raciocínio Rápido</span>';
        else if (estado.modoInput === 'inverso') badgeHtml = '<span class="badge-pilula badge-rosa">🧠 Lógica Inversa</span>';
    }

    // 2. Monta HTML da Pergunta
    if (estado.modoInput === 'inverso') {
        areaPergunta.innerHTML = `
            ${badgeHtml}
            <div class="visor-inverso-numero">${respostaCorreta}</div>
            <div class="subtitulo-inverso">Qual conta dá esse resultado?</div>
            <div id="feedback-jogo-tela-cheia" class="feedback-texto"></div>
        `;
        gerarBotoesInverso(a, b, respostaCorreta);

    } else if (estado.modoInput === 'verdadeiro-falso') {
        const isVerdade = Math.random() > 0.5;
        const valorMostrado = isVerdade ? respostaCorreta : gerarErroPlausivel(respostaCorreta);
        estado.questaoAtual.respostaVF = isVerdade;

        areaPergunta.innerHTML = `
            ${badgeHtml}
            <div class="linha-equacao">
                <span style="font-size:3rem">${a}</span>
                <span class="sinal">×</span>
                <span style="font-size:3rem">${b}</span>
                <span class="igual">=</span>
                <span style="color:${isVerdade?'inherit':'var(--text-main)'}; font-size:3rem">${valorMostrado}</span>
            </div>
            <div id="feedback-jogo-tela-cheia" class="feedback-texto"></div>
        `;
        gerarBotoesVF(isVerdade);

    } else {
        // Padrão
        areaPergunta.innerHTML = `
            ${badgeHtml}
            <div class="linha-equacao">
                <span id="fator-a">${a}</span>
                <span class="sinal">×</span>
                <span id="fator-b">${b}</span>
                <span class="igual">=</span>
                <span id="interrogacao">?</span>
            </div>
            <div id="feedback-jogo-tela-cheia" class="feedback-texto"></div>
        `;

        if (estado.modoInput === 'teclado') { gerarInputTeclado(respostaCorreta); } 
        else { gerarBotoesOpcoes(respostaCorreta); }
    }
}

// --- GERADORES DE BOTÕES ---

function gerarErroPlausivel(correta) {
    let erro = correta + (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 3) + 1);
    if(erro < 0) erro = 0; if(erro === correta) erro = correta + 1;
    return erro;
}

function gerarBotoesVF(isVerdade) {
    const grid = document.createElement('div'); grid.className = 'grid-vf';
    const btnV = document.createElement('button'); btnV.className = 'btn-vf verdadeiro'; btnV.innerHTML = '👍<span>VERDADE</span>'; btnV.onclick = (e) => verificarRespostaTelaCheia(true, e.currentTarget);
    const btnF = document.createElement('button'); btnF.className = 'btn-vf falso'; btnF.innerHTML = '👎<span>MENTIRA</span>'; btnF.onclick = (e) => verificarRespostaTelaCheia(false, e.currentTarget);
    grid.appendChild(btnV); grid.appendChild(btnF); elOpcoes.appendChild(grid);
}

function gerarBotoesInverso(a, b, respostaCorreta) {
    const contaCertaStr = `${a} × ${b}`;
    let opcoes = new Set([contaCertaStr]);
    while(opcoes.size < 4) {
        const fa = Math.floor(Math.random() * 9) + 2; const fb = Math.floor(Math.random() * 10) + 1;
        if (fa * fb !== respostaCorreta) opcoes.add(`${fa} × ${fb}`);
    }
    Array.from(opcoes).sort(() => Math.random() - 0.5).forEach(txtConta => {
        const btn = document.createElement('button'); btn.className = 'botao-opcao'; btn.textContent = txtConta;
        const isCorrect = (txtConta === contaCertaStr); 
        btn.onclick = (e) => verificarRespostaTelaCheia(isCorrect, e.target);
        elOpcoes.appendChild(btn);
    });
}

function gerarBotoesOpcoes(respostaCorreta) {
    let alternativas = new Set([respostaCorreta]);
    while (alternativas.size < 4) {
        let erro = gerarErroPlausivel(respostaCorreta); 
        if (erro !== respostaCorreta) alternativas.add(erro); else alternativas.add(Math.floor(Math.random() * 80) + 1);
    }
    Array.from(alternativas).sort(() => Math.random() - 0.5).forEach(valor => {
        const btn = document.createElement('button'); btn.className = 'botao-opcao'; btn.textContent = valor;
        btn.onclick = (e) => verificarRespostaTelaCheia(valor, e.target);
        elOpcoes.appendChild(btn);
    });
}

// TECLADO INTEGRADO (Atualizado com Delete e OK no grid)
function gerarInputTeclado(respostaCorreta) {
    elOpcoes.innerHTML = ''; 
    const wrapper = document.createElement('div'); wrapper.className = 'teclado-custom-wrapper';
    const visor = document.createElement('div'); visor.className = 'visor-resposta ativo'; visor.id = 'visor-usuario'; visor.textContent = '?';
    let numeroDigitado = '';
    const grid = document.createElement('div'); grid.className = 'grid-teclado-num';
    
    const teclas = [7, 8, 9, 4, 5, 6, 1, 2, 3, 'del', 0, 'ok']; // Ordem otimizada

    teclas.forEach(tecla => {
        const btn = document.createElement('button'); btn.className = 'btn-num';
        
        if (tecla === 'del') {
            btn.innerHTML = '⌫'; btn.classList.add('acao-apagar');
            btn.onclick = () => { if(typeof AudioMestre !== 'undefined') AudioMestre.click(); numeroDigitado = numeroDigitado.slice(0, -1); atualizarVisor(); };
        } else if (tecla === 'ok') {
            btn.innerHTML = '✔'; btn.classList.add('acao-ok'); // Classe verde
            btn.onclick = () => { if (numeroDigitado === '') return; verificarRespostaTelaCheia(parseInt(numeroDigitado), btn); };
        } else {
            btn.textContent = tecla;
            btn.onclick = () => { if(typeof AudioMestre !== 'undefined') AudioMestre.click(); if (numeroDigitado.length < 5) { numeroDigitado += tecla; atualizarVisor(); } };
        }
        grid.appendChild(btn);
    });

    function atualizarVisor() { visor.textContent = numeroDigitado === '' ? '?' : numeroDigitado; visor.classList.remove('erro', 'sucesso'); }
    wrapper.appendChild(visor); wrapper.appendChild(grid); elOpcoes.appendChild(wrapper);
}

// --- VERIFICAÇÃO UNIFICADA ---
function verificarRespostaTelaCheia(valorEscolhido, btnClicado) {
    if (!estado.emAndamento) return;
    
    // Trava cliques
    const container = document.getElementById('opcoes-resposta');
    if (container) container.querySelectorAll('button').forEach(b => b.disabled = true);

    estado.totalQuestoes++;
    let acertou = false;

    if (estado.modoInput === 'verdadeiro-falso') { acertou = (valorEscolhido === estado.questaoAtual.respostaVF); } 
    else if (estado.modoInput === 'inverso') { acertou = (valorEscolhido === true); } 
    else { acertou = (valorEscolhido === estado.questaoAtual.respostaCorreta); }

    const visor = document.getElementById('visor-usuario'); 
    const feedbackEl = document.getElementById('feedback-jogo-tela-cheia');

    if (acertou) {
        if(typeof AudioMestre !== 'undefined') AudioMestre.acerto();
        btnClicado.classList.add('animacao-acerto'); 
        if(feedbackEl) { feedbackEl.textContent = "Muito bem! 🎉"; feedbackEl.style.color = "var(--success)"; }
        if(visor) { visor.classList.add('sucesso'); visor.textContent = `✔ ${valorEscolhido}`; } 
        else { 
            if (estado.modoInput === 'botoes' || estado.modoInput === 'inverso') btnClicado.classList.add('correto');
        }
        
        estado.pontos += 10; estado.acertos++;
        
        // BÔNUS DE TEMPO (RECARGA)
        if(estado.modo === 'desafio' && estado.subModo === 'recarga') {
            estado.tempo += 3; // Ganha 3 segundos
            // Efeito visual no timer
            const tDisplay = telas.jogo.timer;
            tDisplay.style.color = '#22c55e'; setTimeout(()=>tDisplay.style.color='inherit', 300);
        }

        setTimeout(proximaQuestaoTelaCheia, 800);
    } else {
        if(typeof AudioMestre !== 'undefined') AudioMestre.erro();
        btnClicado.classList.add('animacao-erro'); 
        if(feedbackEl) { feedbackEl.textContent = "Ops, tente de novo! ❌"; feedbackEl.style.color = "var(--error)"; }
        if(visor) {
            visor.classList.add('erro');
            visor.innerHTML = `<span style="text-decoration:line-through; font-size: 0.8em">${valorEscolhido}</span>`;
        } else {
            if(estado.modoInput === 'botoes') {
                btnClicado.classList.add('errado');
                elOpcoes.querySelectorAll('button').forEach(b => { if (parseInt(b.textContent) === estado.questaoAtual.respostaCorreta) b.classList.add('correto'); });
            }
            if(estado.modoInput === 'inverso') {
                btnClicado.classList.add('errado');
                const a = estado.questaoAtual.a; const b = estado.questaoAtual.b; const txtCerto = `${a} × ${b}`;
                elOpcoes.querySelectorAll('button').forEach(btn => { if (btn.textContent === txtCerto) btn.classList.add('correto'); });
            }
        }
        
        estado.erros++;
        
        // PENALIDADE (RECARGA)
        if(estado.modo === 'desafio' && estado.subModo === 'recarga') {
            estado.tempo -= 3; // Perde 3 segundos
            if(estado.tempo < 0) estado.tempo = 0;
        }

        // MORTE SÚBITA (GAME OVER IMEDIATO)
        if(estado.modo === 'desafio' && estado.subModo === 'morte') {
            setTimeout(finalizarJogoTelaCheia, 1000); // Game Over após ver o erro
        } else {
            setTimeout(proximaQuestaoTelaCheia, 1500); 
        }
    }
    document.getElementById('placar-display').textContent = `⭐ ${estado.pontos}`;
}

// --- TIMER (LÓGICA COMPLEXA PARA DESAFIOS) ---
function iniciarTimer() {
    atualizarTimerUI();
    
    estado.timerInterval = setInterval(() => {
        
        if (estado.subModo === 'speedrun') {
            // Speedrun: Conta pra CIMA
            estado.tempo++;
            atualizarTimerUI();
            // Barra não tem limite, então fica cheia ou fazemos um loop visual? 
            // Vamos deixar cheia fixa.
            telas.jogo.barraTempoFill.style.width = '100%';

        } else {
            // Outros modos: Conta pra BAIXO
            estado.tempo--;
            atualizarTimerUI();
            
            // Lógica visual da barra
            let maxTempo = 45;
            if(estado.subModo === 'classico') maxTempo = 60;
            if(estado.subModo === 'morte') maxTempo = 5;
            if(estado.subModo === 'recarga') maxTempo = 20; // Escala relativa visual
            
            // Impede barra negativa
            let porcentagem = (estado.tempo / maxTempo) * 100;
            if(porcentagem > 100) porcentagem = 100;
            if(porcentagem < 0) porcentagem = 0;
            
            telas.jogo.barraTempoFill.style.width = `${porcentagem}%`;

            if (estado.tempo <= 0) {
                estado.tempo = 0;
                atualizarTimerUI();
                finalizarJogoTelaCheia();
            }
        }
    }, 1000);
}

function atualizarTimerUI() {
    let t = estado.tempo;
    let min = Math.floor(t / 60);
    let sec = t % 60;
    
    // Formatação 00:00
    const textoTempo = `${min.toString().padStart(2,'0')}:${sec.toString().padStart(2,'0')}`;
    
    telas.jogo.timer.textContent = textoTempo;
    
    // Cores de alerta
    if (estado.subModo !== 'speedrun' && t <= 5) telas.jogo.timer.style.color = '#ef4444';
    else telas.jogo.timer.style.color = 'inherit';
}

function finalizarJogoTelaCheia() {
    pararJogoTelaCheia();
    
    if (estado.modo === 'desafio') salvarRecorde(estado.pontos);
    
    // Títulos Personalizados
    let titulo = 'Modo Prática';
    if (estado.modo === 'desafio') {
        if(estado.subModo === 'morte') titulo = 'Fim da Morte Súbita';
        else if(estado.subModo === 'speedrun') titulo = `Tempo: ${document.getElementById('timer-display').textContent}`;
        else titulo = 'Desafio Concluído';
    }
    
    processarResultadoFinal(estado.acertos, estado.erros, estado.totalQuestoes, titulo);
}

function processarResultadoFinal(acertos, erros, total, subtitulo) {
    const percentual = total > 0 ? Math.round((acertos / total) * 100) : 0;
    document.getElementById('subtitulo-resumo').textContent = subtitulo;
    document.getElementById('stat-acertos').textContent = acertos;
    document.getElementById('stat-erros').textContent = erros;
    document.getElementById('stat-total').textContent = total;
    const circle = document.getElementById('circle-path');
    const textPercent = document.getElementById('texto-percentual');
    circle.style.strokeDasharray = `0, 100`;
    circle.classList.remove('stroke-verde', 'stroke-amarelo', 'stroke-vermelho');
    let msg = "";
    if (percentual === 100) { msg = "Perfeito! Você é um gênio! 🏆"; circle.classList.add('stroke-verde'); } 
    else if (percentual >= 70) { msg = "Muito bem! Continue assim! 🚀"; circle.classList.add('stroke-verde'); } 
    else if (percentual >= 50) { msg = "Bom, mas pode melhorar! 💪"; circle.classList.add('stroke-amarelo'); } 
    else { msg = "Precisa estudar mais! 📚"; circle.classList.add('stroke-vermelho'); }
    document.getElementById('msg-motivacional').textContent = msg;
    mostrarTela('resultado');
    setTimeout(() => { circle.style.strokeDasharray = `${percentual}, 100`; textPercent.textContent = `${percentual}%`; }, 100);
}

function salvarRecorde(pts) {
    const recorde = parseInt(localStorage.getItem('tabuada_recorde') || 0);
    if (pts > recorde) { localStorage.setItem('tabuada_recorde', pts); document.getElementById('home-recorde').textContent = `${pts} pts (Novo!)`; }
}
function carregarRecorde() {
    const recorde = localStorage.getItem('tabuada_recorde') || 0;
    const el = document.getElementById('home-recorde');
    if(el) el.textContent = `${recorde} pts`;
}