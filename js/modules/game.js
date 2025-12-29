import { estado, configTreino, configDesafio } from './state.js';
import { telas, mostrarTela } from './ui.js';
import { salvarPartida } from './stats.js';

const elOpcoes = document.getElementById('opcoes-resposta');

// --- INÍCIO E CONTROLE ---
export function iniciarJogoTelaCheia(modo) {
    estado.modo = modo;
    estado.pontos = 0; estado.acertos = 0; estado.erros = 0; estado.totalQuestoes = 0;
    estado.emAndamento = true;
    
    // Zera rastreadores específicos desta partida
    estado.errosMap = {}; 
    estado.acertosMap = {}; // Novo: Rastreia acertos para o gráfico

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
        
        if (estado.maxQuestoes !== Infinity) telas.jogo.barraFixaContainer.classList.remove('oculto');
        else telas.jogo.barraFixaContainer.classList.add('oculto');

    } else {
        // --- MODO DESAFIO ---
        btnNav.innerHTML = "⬅ Voltar"; // Alterado para Voltar
        btnNav.onclick = () => { 
            if(confirm("Sair do desafio atual?")) { 
                pararJogoTelaCheia(); 
                mostrarTela('configDesafio'); 
            } 
        };
        
        estado.subModo = configDesafio.modo;
        estado.modoInput = 'botoes'; 
        estado.maxQuestoes = Infinity; 
        
        if (estado.subModo === 'classico') estado.tempo = 60;
        else if (estado.subModo === 'morte') estado.tempo = 5;
        else if (estado.subModo === 'recarga') estado.tempo = 10;
        else if (estado.subModo === 'speedrun') { estado.tempo = 0; estado.maxQuestoes = 20; }

        telas.jogo.timer.classList.remove('oculto');
        telas.jogo.barraTempoContainer.classList.remove('oculto'); 
        telas.jogo.barraFixaContainer.classList.add('oculto');    
        
        iniciarTimer();
    }

    document.getElementById('placar-display').textContent = `⭐ 0`;
    mostrarTela('jogo');
    proximaQuestaoTelaCheia();
}

export function pararJogoTelaCheia() {
    estado.emAndamento = false;
    clearInterval(estado.timerInterval);
}

function atualizarProgressoHeader() {
    const concluidas = estado.totalQuestoes; 
    const total = estado.maxQuestoes;
    
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

    if (estado.maxQuestoes !== Infinity && estado.totalQuestoes >= estado.maxQuestoes) {
        finalizarJogoTelaCheia();
        return;
    }

    if (estado.modo === 'desafio' && estado.subModo === 'morte') {
        estado.tempo = 5; 
        atualizarTimerUI(); 
        telas.jogo.barraTempoFill.style.transition = 'none';
        telas.jogo.barraTempoFill.style.width = '100%';
        setTimeout(() => telas.jogo.barraTempoFill.style.transition = 'width 1s linear', 50);
    }

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

    let badgeHtml = '';
    if (estado.modo === 'desafio') {
        if (estado.subModo === 'morte') badgeHtml = '<span class="badge-pilula badge-laranja">💣 Morte Súbita</span>';
        else if (estado.subModo === 'recarga') badgeHtml = '<span class="badge-pilula badge-verde">🔋 Recarga</span>';
        else if (estado.subModo === 'speedrun') badgeHtml = '<span class="badge-pilula badge-azul">🏁 Speedrun</span>';
        else badgeHtml = '<span class="badge-pilula badge-roxo">⏱️ Clássico</span>';
    } else {
        if (estado.modoInput === 'botoes') badgeHtml = '<span class="badge-pilula badge-azul">🔘 Múltipla Escolha</span>';
        else if (estado.modoInput === 'teclado') badgeHtml = '<span class="badge-pilula badge-roxo">⌨ Teclado Numérico</span>';
        else if (estado.modoInput === 'verdadeiro-falso') badgeHtml = '<span class="badge-pilula badge-laranja">⚡ Raciocínio Rápido</span>';
        else if (estado.modoInput === 'inverso') badgeHtml = '<span class="badge-pilula badge-rosa">🧠 Lógica Inversa</span>';
    }

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

// --- GERADORES ---
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

function gerarInputTeclado(respostaCorreta) {
    elOpcoes.innerHTML = ''; 
    const wrapper = document.createElement('div'); wrapper.className = 'teclado-custom-wrapper';
    const visor = document.createElement('div'); visor.className = 'visor-resposta ativo'; visor.id = 'visor-usuario'; visor.textContent = '?';
    let numeroDigitado = '';
    const grid = document.createElement('div'); grid.className = 'grid-teclado-num';
    
    const teclas = [7, 8, 9, 4, 5, 6, 1, 2, 3, 'del', 0, 'ok']; 

    teclas.forEach(tecla => {
        const btn = document.createElement('button'); btn.className = 'btn-num';
        
        if (tecla === 'del') {
            btn.innerHTML = '⌫'; btn.classList.add('acao-apagar');
            btn.onclick = () => { if(typeof AudioMestre !== 'undefined') AudioMestre.click(); numeroDigitado = numeroDigitado.slice(0, -1); atualizarVisor(); };
        } else if (tecla === 'ok') {
            btn.innerHTML = '✔'; btn.classList.add('acao-ok');
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

// --- VERIFICAÇÃO ---
function verificarRespostaTelaCheia(valorEscolhido, btnClicado) {
    if (!estado.emAndamento) return;
    
    const container = document.getElementById('opcoes-resposta');
    if (container) container.querySelectorAll('button').forEach(b => b.disabled = true);

    estado.totalQuestoes++;
    let acertou = false;

    if (estado.modoInput === 'verdadeiro-falso') { acertou = (valorEscolhido === estado.questaoAtual.respostaVF); } 
    else if (estado.modoInput === 'inverso') { acertou = (valorEscolhido === true); } 
    else { acertou = (valorEscolhido === estado.questaoAtual.respostaCorreta); }

    const visor = document.getElementById('visor-usuario'); 
    const feedbackEl = document.getElementById('feedback-jogo-tela-cheia');
    const numA = estado.questaoAtual.a;
    // numB removido da lógica de estatística (Lógica Mandante)

    if (acertou) {
        if(typeof AudioMestre !== 'undefined') AudioMestre.acerto();
        btnClicado.classList.add('animacao-acerto'); 
        if(feedbackEl) { feedbackEl.textContent = "Muito bem! 🎉"; feedbackEl.style.color = "var(--success)"; }
        if(visor) { visor.classList.add('sucesso'); visor.textContent = `✔ ${valorEscolhido}`; } 
        else { 
            if (estado.modoInput === 'botoes' || estado.modoInput === 'inverso') btnClicado.classList.add('correto');
        }
        
        estado.pontos += 10; estado.acertos++;
        
        // --- MUDANÇA: SÓ CONTA O PRIMEIRO NÚMERO (MANDANTE) ---
        if (!estado.acertosMap[numA]) estado.acertosMap[numA] = 0;
        estado.acertosMap[numA]++; 

        if(estado.modo === 'desafio' && estado.subModo === 'recarga') {
            estado.tempo += 3; 
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
        
        // --- MUDANÇA: ERRO TAMBÉM SÓ NO MANDANTE ---
        if (!estado.errosMap[numA]) estado.errosMap[numA] = 0;
        estado.errosMap[numA]++;
        
        if(estado.modo === 'desafio' && estado.subModo === 'recarga') {
            estado.tempo -= 3; 
            if(estado.tempo < 0) estado.tempo = 0;
        }

        if(estado.modo === 'desafio' && estado.subModo === 'morte') {
            setTimeout(finalizarJogoTelaCheia, 1000); 
        } else {
            setTimeout(proximaQuestaoTelaCheia, 1500); 
        }
    }
    document.getElementById('placar-display').textContent = `⭐ ${estado.pontos}`;
}

// --- TIMER ---
function iniciarTimer() {
    atualizarTimerUI();
    
    estado.timerInterval = setInterval(() => {
        
        if (estado.subModo === 'speedrun') {
            estado.tempo++;
            atualizarTimerUI();
            telas.jogo.barraTempoFill.style.width = '100%';
        } else {
            estado.tempo--;
            atualizarTimerUI();
            
            let maxTempo = 45;
            if(estado.subModo === 'classico') maxTempo = 60;
            if(estado.subModo === 'morte') maxTempo = 5;
            if(estado.subModo === 'recarga') maxTempo = 20; 
            
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
    const textoTempo = `${min.toString().padStart(2,'0')}:${sec.toString().padStart(2,'0')}`;
    
    telas.jogo.timer.textContent = textoTempo;
    
    if (estado.subModo !== 'speedrun' && t <= 5) telas.jogo.timer.style.color = '#ef4444';
    else telas.jogo.timer.style.color = 'inherit';
}

function finalizarJogoTelaCheia() {
    pararJogoTelaCheia();
    
    // SALVAR ESTATÍSTICAS COMPLETAS
    salvarPartida({
        modo: estado.modo === 'desafio' ? estado.subModo : 'treino',
        acertos: estado.acertos,
        erros: estado.erros,
        pontos: estado.pontos,
        errosMap: estado.errosMap || {},
        acertosMap: estado.acertosMap || {} // Salva também os acertos para o gráfico
    });

    if (estado.modo === 'desafio') salvarRecorde(estado.pontos);
    
    let titulo = 'Modo Prática';
    if (estado.modo === 'desafio') {
        if(estado.subModo === 'morte') titulo = 'Fim da Morte Súbita';
        else if(estado.subModo === 'speedrun') titulo = `Tempo: ${document.getElementById('timer-display').textContent}`;
        else titulo = 'Desafio Concluído';
    }
    
    processarResultadoFinal(estado.acertos, estado.erros, estado.totalQuestoes, titulo);
}

export function processarResultadoFinal(acertos, erros, total, subtitulo) {
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

export function salvarRecorde(pts) {
    const recorde = parseInt(localStorage.getItem('tabuada_recorde') || 0);
    if (pts > recorde) { localStorage.setItem('tabuada_recorde', pts); document.getElementById('home-recorde').textContent = `${pts} pts (Novo!)`; }
}

export function carregarRecorde() {
    const recorde = localStorage.getItem('tabuada_recorde') || 0;
    const el = document.getElementById('home-recorde');
    if(el) el.textContent = `${recorde} pts`;
}