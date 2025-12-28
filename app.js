/**
 * APP.JS - VERSÃO LOUSA INTERATIVA + MODOS DE JOGO
 */

// --- 1. ESTADO GLOBAL ---
let estado = {
    modo: null,         
    pontos: 0,
    acertos: 0, 
    erros: 0,   
    totalQuestoes: 0, 
    tempo: 30,
    timerInterval: null,
    emAndamento: false,
    questaoAtual: {}
};

// Variáveis Exclusivas do Modo Lousa
let tabuadaSelecionadaId = 1;
let quizLousa = {
    numero: 1,      // Tabuada (ex: 5)
    fila: [],       // Lista misturada (ex: [3, 9, 1, ...])
    atual: null,    // O número da vez (ex: 3)
    acertos: 0,
    erros: 0
};

// --- 2. MAPEAMENTO DOM ---
const telas = {
    inicial: document.getElementById('tela-inicial'),
    estudo: document.getElementById('tela-estudo'),
    jogo: { 
        header: document.getElementById('header-jogo'),
        container: document.getElementById('container-jogo'),
        timer: document.getElementById('timer-display'),
        placar: document.getElementById('placar-display'),
        barra: document.getElementById('barra-fill')
    },
    resultado: document.getElementById('tela-resultado')
};

// Elementos Quiz Tela Cheia
const elFatorA = document.getElementById('fator-a');
const elFatorB = document.getElementById('fator-b');
const elOpcoes = document.getElementById('opcoes-resposta');

// --- 3. INICIALIZAÇÃO ---
document.addEventListener('DOMContentLoaded', () => {
    carregarRecorde();
    setupEventos();
});

function setupEventos() {
    // Menu Principal
    document.getElementById('btn-estudar').onclick = () => { 
        if(typeof AudioMestre !== 'undefined') AudioMestre.click();
        iniciarModoLousa(); 
        mostrarTela('estudo'); 
    };
    
    document.getElementById('btn-treino').onclick = () => {
        if(typeof AudioMestre !== 'undefined') AudioMestre.click();
        iniciarJogoTelaCheia('treino');
    };

    document.getElementById('btn-desafio').onclick = () => {
        if(typeof AudioMestre !== 'undefined') AudioMestre.click();
        iniciarJogoTelaCheia('desafio');
    };
    
    // Botões Voltar (Inteligentes)
    document.querySelectorAll('.btn-voltar').forEach(btn => {
        btn.onclick = null; 
        btn.addEventListener('click', (e) => {
            e.preventDefault(); 
            if(typeof AudioMestre !== 'undefined') AudioMestre.click();
            
            pararJogoTelaCheia(); 
            
            // Se estiver na lousa e voltar, garante que reseta o visual
            if(estado.modo === 'estudo-lousa') {
                iniciarModoLousa(); // Reseta para visualização
            }

            const destino = btn.getAttribute('data-destino');
            if (destino) mostrarTela(destino);
        });
    });

    // Botões de Ação do Jogo
    document.getElementById('btn-sair-jogo').onclick = () => {
        if(confirm("Sair do jogo?")) { pararJogoTelaCheia(); mostrarTela('inicial'); }
    };

    document.getElementById('btn-reiniciar').onclick = () => {
        if(typeof AudioMestre !== 'undefined') AudioMestre.click();
        
        if (estado.modo === 'estudo-lousa') {
            // Reinicia o Quiz da Lousa
            iniciarDesafioLousa(); 
            mostrarTela('estudo');
        } else {
            // Reinicia Tela Cheia
            iniciarJogoTelaCheia(estado.modo);
        }
    };
    
    document.getElementById('btn-home-resultado').onclick = () => mostrarTela('inicial');
}

function mostrarTela(nomeTela) {
    // Esconde tudo
    document.querySelectorAll('#app > div').forEach(el => el.classList.add('oculto'));
    telas.jogo.header.classList.add('oculto');
    telas.jogo.container.classList.add('oculto');

    if (nomeTela === 'jogo') {
        telas.jogo.header.classList.remove('oculto');
        telas.jogo.container.classList.remove('oculto');
    } else {
        // Lógica para achar a tela pelo nome (ex: "tela-inicial" ou "inicial")
        let telaAlvo = telas[nomeTela];
        if (!telaAlvo && typeof nomeTela === 'string' && nomeTela.startsWith('tela-')) {
            const nomeCorrigido = nomeTela.replace('tela-', ''); 
            telaAlvo = telas[nomeCorrigido];
        }
        if (telaAlvo) telaAlvo.classList.remove('oculto');
    }
}

// --- 4. MODO ESTUDO: LOUSA INTERATIVA ---

// A. Visão Geral (Aprendizado)
function iniciarModoLousa() {
    estado.modo = 'visualizacao';
    
    // Garante que o jogo está escondido e os controles visíveis
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
    
    // Atualiza Títulos
    const tituloTopo = document.getElementById('titulo-pagina-estudo');
    if(tituloTopo) tituloTopo.textContent = `Tabuada do ${numero}`;
    
    // Atualiza Botão Praticar
    const btnPraticar = document.getElementById('btn-acao-praticar-dinamico');
    btnPraticar.innerHTML = `🎮 Praticar Tabuada do ${numero}`;
    btnPraticar.onclick = () => {
        if(typeof AudioMestre !== 'undefined') AudioMestre.click();
        iniciarDesafioLousa(); // <--- CHAMA O JOGO NA LOUSA
    };

    // Preenche a Lousa (Modo Leitura)
    const containerLousa = document.getElementById('lousa-conteudo');
    containerLousa.innerHTML = '';
    
    containerLousa.style.opacity = '0';
    setTimeout(() => containerLousa.style.opacity = '1', 50);

    for (let i = 1; i <= 10; i++) {
        const div = document.createElement('div');
        div.className = 'item-lousa';
        div.innerHTML = `
            <span>${numero} x ${i}</span>
            <span class="destaque-resultado">= ${numero * i}</span>
        `;
        containerLousa.appendChild(div);
    }
}

// B. O JOGO DA LOUSA (Prática)
// 1. COMEÇA O JOGO (Chamado pelo botão Praticar)
function iniciarDesafioLousa() {
    // Destrava som
    if(typeof AudioMestre !== 'undefined' && AudioMestre.ctx.state === 'suspended') {
        AudioMestre.ctx.resume();
    }

    estado.modo = 'estudo-lousa';

    // Esconde seletores e mostra quiz
    document.querySelector('.area-seletores-container').classList.add('oculto');
    document.querySelector('.area-acao-fixa').classList.add('oculto');
    document.getElementById('painel-quiz-lousa').classList.remove('oculto');

    // Reseta pontuação
    quizLousa.numero = tabuadaSelecionadaId;
    quizLousa.acertos = 0;
    quizLousa.erros = 0;

    // --- A MÁGICA DA ALEATORIEDADE AQUI ---
    // Cria uma lista de 1 a 10 e misturar tudo
    quizLousa.fila = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].sort(() => Math.random() - 0.5);
    // ---------------------------------------

    // Prepara a Lousa (Limpa tudo e põe interrogações)
    const container = document.getElementById('lousa-conteudo');
    const linhas = container.querySelectorAll('.item-lousa');
    
    linhas.forEach((div, index) => {
        const multiplicador = index + 1;
        div.id = `linha-quiz-${multiplicador}`; 
        div.innerHTML = `
            <span>${quizLousa.numero} x ${multiplicador}</span>
            <span class="destaque-resultado" id="res-quiz-${multiplicador}"> = ?</span>
        `;
        div.classList.remove('ativa-no-quiz');
        div.style.opacity = '0.4';
    });

    proximaPerguntaLousa();
}

function proximaPerguntaLousa() {
    // Se a fila acabou, fim de jogo
    if (quizLousa.fila.length === 0) {
        processarResultadoFinal(quizLousa.acertos, quizLousa.erros, 10, `Tabuada do ${quizLousa.numero}`);
        return;
    }

    // Pega o próximo número da cartola
    quizLousa.atual = quizLousa.fila.pop();
    
    const fator = quizLousa.atual;
    const respostaCerta = quizLousa.numero * fator;

    // Visual da Lousa (Foca na linha certa, mesmo que fora de ordem)
    document.querySelectorAll('.item-lousa').forEach(l => l.classList.remove('ativa-no-quiz'));
    
    const linhaDaVez = document.getElementById(`linha-quiz-${fator}`);
    if(linhaDaVez) {
        linhaDaVez.classList.add('ativa-no-quiz');
        linhaDaVez.style.opacity = '1'; 
        // Scroll suave caso a linha esteja longe (bom pra celular)
        linhaDaVez.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // Atualiza Cartão Branco
    document.getElementById('texto-pergunta-quiz').textContent = `${quizLousa.numero} x ${fator} = ?`;
    document.getElementById('feedback-quiz').textContent = '';

    // Gera Botões de Resposta
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
        btn.className = 'btn-lateral';
        btn.textContent = val;
        btn.onclick = (e) => confirmarRespostaLousa(val, respostaCerta, e.target);
        containerBotoes.appendChild(btn);
    });
}

// 3. VERIFICA RESPOSTA
function confirmarRespostaLousa(escolha, correta, btn) {
    document.querySelectorAll('#opcoes-quiz-lousa button').forEach(b => b.disabled = true);
    
    // Usa quizLousa.atual para saber qual linha atualizar
    const spanRes = document.getElementById(`res-quiz-${quizLousa.atual}`);
    const feedbackEl = document.getElementById('feedback-quiz'); 
    
    if (escolha === correta) {
        if(typeof AudioMestre !== 'undefined') AudioMestre.acerto();
        btn.classList.add('animacao-acerto'); 
        
        feedbackEl.textContent = "Muito bem! 🎉";
        feedbackEl.style.color = "var(--success)";

        spanRes.innerHTML = ` = ${correta} <span style="color:#4ade80">✔</span>`;
        spanRes.style.color = '#4ade80';
        
        quizLousa.acertos++;
        setTimeout(proximaPerguntaLousa, 1200);

    } else {
        if(typeof AudioMestre !== 'undefined') AudioMestre.erro();
        btn.classList.add('animacao-erro'); 
        
        feedbackEl.textContent = "Ops, tente de novo! ❌";
        feedbackEl.style.color = "var(--error)";

        document.querySelectorAll('#opcoes-quiz-lousa button').forEach(b => {
            if (parseInt(b.textContent) === correta) b.classList.add('certo'); 
        });

        spanRes.innerHTML = ` = ${correta} <span style="color:#ef4444">✘</span>`;
        spanRes.style.color = '#ef4444';

        quizLousa.erros++;
        setTimeout(proximaPerguntaLousa, 1500); 
    }
}

// --- 5. MODOS TELA CHEIA (TREINO E DESAFIO) ---
function iniciarJogoTelaCheia(modo) {
    estado.modo = modo;
    estado.pontos = 0;
    estado.acertos = 0;
    estado.erros = 0;
    estado.totalQuestoes = 0;
    estado.emAndamento = true;
    
    telas.jogo.timer.classList.add('oculto');
    telas.jogo.barra.parentElement.classList.add('oculto');

    if (modo === 'desafio') {
        estado.tempo = 45; 
        telas.jogo.timer.classList.remove('oculto');
        telas.jogo.barra.parentElement.classList.remove('oculto');
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

function proximaQuestaoTelaCheia() {
    if (!estado.emAndamento) return;

    const a = Math.floor(Math.random() * 9) + 2; 
    const b = Math.floor(Math.random() * 10) + 1;
    const respostaCorreta = a * b;
    estado.questaoAtual = { a, b, respostaCorreta };

    elFatorA.textContent = a;
    elFatorB.textContent = b;
    elOpcoes.innerHTML = '';

    let alternativas = new Set([respostaCorreta]);
    while (alternativas.size < 4) {
        let erro = respostaCorreta + (Math.floor(Math.random() * 10) - 5); 
        if (erro > 0 && erro !== respostaCorreta) alternativas.add(erro);
        else alternativas.add(Math.floor(Math.random() * 80) + 1);
    }

    Array.from(alternativas).sort(() => Math.random() - 0.5).forEach(valor => {
        const btn = document.createElement('button');
        btn.className = 'botao-opcao';
        btn.textContent = valor;
        btn.onclick = (e) => verificarRespostaTelaCheia(valor, e.target);
        elOpcoes.appendChild(btn);
    });
}

function verificarRespostaTelaCheia(valorEscolhido, btnClicado) {
    if (!estado.emAndamento) return;
    elOpcoes.querySelectorAll('button').forEach(b => b.disabled = true);
    const correta = estado.questaoAtual.respostaCorreta;
    estado.totalQuestoes++;

    if (valorEscolhido === correta) {
        if(typeof AudioMestre !== 'undefined') AudioMestre.acerto();
        btnClicado.classList.add('correto', 'animacao-acerto'); 
        estado.pontos += 10;
        estado.acertos++;
        setTimeout(proximaQuestaoTelaCheia, 600);
    } else {
        if(typeof AudioMestre !== 'undefined') AudioMestre.erro();
        btnClicado.classList.add('errado', 'animacao-erro'); 
        estado.erros++;
        elOpcoes.querySelectorAll('button').forEach(b => {
            if (parseInt(b.textContent) === correta) b.classList.add('correto');
        });
        setTimeout(proximaQuestaoTelaCheia, 1200);
    }
    document.getElementById('placar-display').textContent = `⭐ ${estado.pontos}`;
}

function iniciarTimer() {
    atualizarTimerUI();
    estado.timerInterval = setInterval(() => {
        estado.tempo--;
        atualizarTimerUI();
        const porcentagem = (estado.tempo / 45) * 100;
        telas.jogo.barra.style.width = `${porcentagem}%`;
        if (estado.tempo <= 0) finalizarJogoTelaCheia();
    }, 1000);
}

function atualizarTimerUI() {
    telas.jogo.timer.textContent = `00:${estado.tempo.toString().padStart(2, '0')}`;
    telas.jogo.timer.style.color = estado.tempo <= 10 ? '#ef4444' : 'inherit';
}

function finalizarJogoTelaCheia() {
    pararJogoTelaCheia();
    if (estado.modo === 'desafio') salvarRecorde(estado.pontos);
    const titulo = estado.modo === 'desafio' ? 'Desafio Relâmpago' : 'Modo Prática';
    processarResultadoFinal(estado.acertos, estado.erros, estado.totalQuestoes, titulo);
}

// --- 6. TELA DE RESULTADO UNIFICADA ---
function processarResultadoFinal(acertos, erros, total, subtitulo) {
    const percentual = total > 0 ? Math.round((acertos / total) * 100) : 0;

    document.getElementById('subtitulo-resumo').textContent = subtitulo;
    document.getElementById('stat-acertos').textContent = acertos;
    document.getElementById('stat-erros').textContent = erros;
    document.getElementById('stat-total').textContent = total;
    
    const circle = document.getElementById('circle-path');
    const textPercent = document.getElementById('texto-percentual');
    
    // Reseta animação e cores
    circle.style.strokeDasharray = `0, 100`;
    circle.classList.remove('stroke-verde', 'stroke-amarelo', 'stroke-vermelho');
    
    let msg = "";
    if (percentual === 100) {
        msg = "Perfeito! Você é um gênio! 🏆";
        circle.classList.add('stroke-verde');
    } else if (percentual >= 70) {
        msg = "Muito bem! Continue assim! 🚀";
        circle.classList.add('stroke-verde');
    } else if (percentual >= 50) {
        msg = "Bom, mas pode melhorar! 💪";
        circle.classList.add('stroke-amarelo');
    } else {
        msg = "Precisa estudar mais! 📚";
        circle.classList.add('stroke-vermelho');
    }

    document.getElementById('msg-motivacional').textContent = msg;
    mostrarTela('resultado');

    setTimeout(() => {
        circle.style.strokeDasharray = `${percentual}, 100`;
        textPercent.textContent = `${percentual}%`;
    }, 100);
}

// --- 7. PERSISTÊNCIA ---
function salvarRecorde(pts) {
    const recorde = parseInt(localStorage.getItem('tabuada_recorde') || 0);
    if (pts > recorde) {
        localStorage.setItem('tabuada_recorde', pts);
        document.getElementById('home-recorde').textContent = `${pts} pts (Novo!)`;
    }
}
function carregarRecorde() {
    const recorde = localStorage.getItem('tabuada_recorde') || 0;
    const el = document.getElementById('home-recorde');
    if(el) el.textContent = `${recorde} pts`;
}