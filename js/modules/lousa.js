import { estado, quizLousa, tabuadaSelecionadaId } from './state.js';
import { mostrarTela } from './ui.js';
import { processarResultadoFinal } from './game.js'; // Importação cruzada necessária

export function iniciarModoLousa() {
    estado.modo = 'visualizacao';
    document.querySelector('.area-seletores-container').classList.remove('oculto');
    document.querySelector('.area-acao-fixa').classList.remove('oculto');
    document.getElementById('painel-quiz-lousa').classList.add('oculto');
    gerarBotoesSeletores();
    atualizarLousa(tabuadaSelecionadaId.valor); 
}

function gerarBotoesSeletores() {
    const container = document.getElementById('lista-botoes-selecao');
    container.innerHTML = ''; 
    for (let i = 1; i <= 10; i++) {
        const btn = document.createElement('button');
        btn.className = 'btn-seletor-redondo';
        if(i === tabuadaSelecionadaId.valor) btn.classList.add('ativo');
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
    tabuadaSelecionadaId.valor = numero;
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

// --- QUIZ DA LOUSA ---
export function iniciarDesafioLousa() {
    if(typeof AudioMestre !== 'undefined' && AudioMestre.ctx.state === 'suspended') AudioMestre.ctx.resume();
    estado.modo = 'estudo-lousa';
    document.querySelector('.area-seletores-container').classList.add('oculto');
    document.querySelector('.area-acao-fixa').classList.add('oculto');
    document.getElementById('painel-quiz-lousa').classList.remove('oculto');
    quizLousa.numero = tabuadaSelecionadaId.valor;
    quizLousa.acertos = 0; quizLousa.erros = 0;
    quizLousa.fila = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].sort(() => Math.random() - 0.5);
    
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