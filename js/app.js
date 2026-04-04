import { estado, configTreino, configDesafio, quizLousa, tabuadaSelecionadaId } from './modules/state.js';
import * as UI from './modules/ui.js';
import * as Lousa from './modules/lousa.js';
import * as Game from './modules/game.js';
import { obterDadosDesempenho, limparDados, gerarDadosGrafico, obterDetalhesPorModo } from './modules/stats.js';
import * as Store from './modules/store.js'; 

// --- EXPOR FUNÃƒâ€¡Ãƒâ€¢ES GLOBAIS ---
window.escolherModoInput = UI.escolherModoInput;
window.atualizarValorSlider = UI.atualizarValorSlider;
window.escolherQtd = UI.escolherQtd;
window.escolherModoDesafio = UI.escolherModoDesafio;
window.escolherDificuldade = UI.escolherDificuldade;
window.limparTudo = limparDados;

// --- CONFIGURAÃƒâ€¡Ãƒâ€¢ES E PREFERÃƒÅ NCIAS (NOVO) ---
window.somLigado = true;      // Estado Global
window.vibracaoLigada = true; // Estado Global

// FunÃƒÂ§ÃƒÂ£o chamada pelo Switch de Som
window.alternarSom = function(ativo) {
    window.somLigado = ativo;
    localStorage.setItem('tabuada_som', ativo);
    // Toca um som de teste se ativou
    if(ativo && typeof AudioMestre !== 'undefined') AudioMestre.click();
}

// FunÃƒÂ§ÃƒÂ£o chamada pelo Switch de VibraÃƒÂ§ÃƒÂ£o
window.alternarVibracao = function(ativo) {
    window.vibracaoLigada = ativo;
    localStorage.setItem('tabuada_vibracao', ativo);
    // Vibra de teste se ativou (e se o dispositivo suportar)
    if(ativo && navigator.vibrate) navigator.vibrate(50);
}

// FunÃƒÂ§ÃƒÂ£o chamada pelo BotÃƒÂ£o de Apagar Dados
window.confirmarReset = function() {
    UI.mostrarConfirmacao({
        titulo: 'Apagar progresso',
        mensagem: 'Isso apaga estrelas, recordes e compras. Deseja continuar?',
        textoConfirmar: 'Apagar',
        textoCancelar: 'Cancelar',
        estiloConfirmar: 'perigo'
    }).then((confirmado) => {
        if (!confirmado) return;

        localStorage.removeItem('tabuada_store_v1');
        localStorage.removeItem('tabuada_stats_v1');
        localStorage.removeItem('tabuada_recorde');

        UI.mostrarAlerta({
            titulo: 'Conclu\u00eddo',
            mensagem: 'Dados apagados com sucesso. O app ser\u00e1 reiniciado.',
            textoConfirmar: 'OK'
        }).then(() => {
            window.location.reload();
        });
    });
}

// Carrega as preferÃƒÂªncias salvas ao iniciarÃƒÂªncias salvas ao iniciar
function carregarPreferencias() {
    const somSalvo = localStorage.getItem('tabuada_som');
    const vibSalvo = localStorage.getItem('tabuada_vibracao');

    // Se for null (primeira vez), considera true. SenÃƒÂ£o, converte string para boolean.
    window.somLigado = (somSalvo === null || somSalvo === 'true');
    window.vibracaoLigada = (vibSalvo === null || vibSalvo === 'true');

    // Atualiza visualmente os Switches na tela de ConfiguraÃƒÂ§ÃƒÂµes
    const toggleSom = document.getElementById('toggle-som');
    const toggleVib = document.getElementById('toggle-vibracao');

    if(toggleSom) toggleSom.checked = window.somLigado;
    if(toggleVib) toggleVib.checked = window.vibracaoLigada;
}

// --- FUNÃƒâ€¡ÃƒÆ’O DO HISTÃƒâ€œRICO POR MODO ---
window.verHistoricoModo = function(modo) {
    if(typeof AudioMestre !== 'undefined') AudioMestre.click();
    
    const dados = obterDetalhesPorModo(modo);
    const painel = document.getElementById('painel-detalhes-historico');
    painel.classList.remove('oculto');
    
    const nomes = {
        'classico': '\u23F1\uFE0F Cl\u00E1ssico',
        'morte': '\uD83D\uDCA3 Morte S\u00FAbita',
        'recarga': '\uD83D\uDD0B Recarga',
        'speedrun': '\uD83C\uDFC1 Speedrun'
    };
    document.getElementById('titulo-modo-historico').textContent = nomes[modo] || modo;
    document.getElementById('valor-recorde-modo').textContent = `${dados.recorde} pts`;
    
    const listaEl = document.getElementById('lista-historico-especifica');
    listaEl.innerHTML = '';
    
    if (dados.lista.length === 0) {
        listaEl.innerHTML = '<div style="text-align:center; padding:15px; color:#94a3b8; font-style:italic;">Nenhuma partida jogada neste modo ainda.</div>';
    } else {
        dados.lista.forEach(partida => {
            const dataObj = new Date(partida.data);
            const dataFormatada = dataObj.toLocaleDateString('pt-BR', {day: '2-digit', month: '2-digit'}) + 
                                  ' \u00E0s ' + dataObj.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'});
            
            const html = `
                <div class="item-mini">
                    <span style="color:#64748b; font-size:0.85rem">${dataFormatada}</span>
                    <div style="display:flex; gap:10px; align-items:center;">
                        <span class="pts">${partida.pontos} pts</span>
                        <span style="font-size:0.8rem; color:var(--text-light)">(${partida.acertos}\u2705 / ${partida.erros}\u274C)</span>
                    </div>
                </div>
            `;
            listaEl.innerHTML += html;
        });
    }
    painel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

window.fecharHistoricoModo = function() {
    if(typeof AudioMestre !== 'undefined') AudioMestre.click();
    document.getElementById('painel-detalhes-historico').classList.add('oculto');
}

// --- FUNÃƒâ€¡ÃƒÆ’O DO GRÃƒÂFICO (Com RÃƒÂ³tulos de Porcentagem) ---
window.atualizarGrafico = function(periodo) {
    if(typeof AudioMestre !== 'undefined') AudioMestre.click();
    
    document.querySelectorAll('.btn-filtro').forEach(b => b.classList.remove('ativo'));
    const botoes = Array.from(document.querySelectorAll('.btn-filtro'));
    const botaoAlvo = botoes.find(b => b.textContent.toLowerCase().includes(periodo === 'dia' ? 'dia' : periodo === 'mes' ? 'm\u00EAs' : 'ano'));
    if(botaoAlvo) botaoAlvo.classList.add('ativo');

    const info = gerarDadosGrafico(periodo);
    const container = document.getElementById('container-barras');
    if(container) {
        container.innerHTML = ''; 

        for (let i = 1; i <= 10; i++) {
            const acertos = info.dados[i].acertos;
            const erros = info.dados[i].erros;
            const total = acertos + erros;
            
            // Calcula Porcentagem
            let percentual = 0;
            if (total > 0) {
                percentual = Math.round((acertos / total) * 100);
            }

            // Altura da barra baseada no volume de acertos
            let altura = info.max > 0 ? (acertos / info.max) * 100 : 0;
            if (acertos > 0 && altura < 12) altura = 12; // MÃƒÂ­nimo para nÃƒÂ£o sumir
            if (acertos === 0) altura = 3; 
            
            // Define a cor do texto
            let corTexto = '';
            if (total > 0) {
                if (percentual === 100) corTexto = 'color: #22c55e;'; 
                else if (percentual < 50) corTexto = 'color: #ef4444;';
            }

            const textoRotulo = total > 0 ? `${percentual}%` : '-';

            const html = `
                <div class="barra-wrapper">
                    <span class="rotulo-barra" style="${corTexto}">${textoRotulo}</span>
                    <div class="barra" style="height: ${altura}%; opacity: ${acertos===0 ? 0.3 : 1}" title="${acertos} acertos / ${erros} erros"></div>
                    <span>x${i}</span>
                </div>
            `;
            container.innerHTML += html;
        }
    }
}

// --- INICIALIZAÃƒâ€¡ÃƒÆ’O ---
document.addEventListener('DOMContentLoaded', () => {
    Game.carregarRecorde();
    Store.initStore(); // Inicia a loja e carrega o saldo/avatar
    
    // --- NOVO: Carregar ConfiguraÃƒÂ§ÃƒÂµes ---
    carregarPreferencias();
    atualizarSaudacao();

    const recorde = localStorage.getItem('tabuada_recorde') || 0;
    const el = document.getElementById('home-recorde');
    if(el) el.textContent = `${recorde} pts`;

    setupEventos();
});

function setupEventos() {
    
    // --- MENU LATERAL ---
    
    // Abrir Menu (HambÃƒÂºrguer)
    const btnMenu = document.getElementById('btn-abrir-menu');
    if(btnMenu) {
        btnMenu.onclick = () => {
            if(typeof AudioMestre !== 'undefined') AudioMestre.click();
            UI.toggleMenu(true);
        };
    }

    // Fechar Menu (Overlay)
    const overlay = document.getElementById('overlay-menu');
    if(overlay) {
        overlay.onclick = () => UI.toggleMenu(false);
    }

    // BotÃƒÂ£o LOJA (Dentro do Menu)
    const menuLoja = document.getElementById('menu-loja');
    if(menuLoja) {
        menuLoja.onclick = () => {
            if(typeof AudioMestre !== 'undefined') AudioMestre.click();
            UI.toggleMenu(false); // Fecha o menu primeiro
            Store.renderizarLoja();
            UI.mostrarTela('tela-loja');
        };
    }

    // BotÃƒÂ£o DESEMPENHO (Dentro do Menu)
    const menuDesempenho = document.getElementById('menu-desempenho');
    if(menuDesempenho) {
        menuDesempenho.onclick = () => {
            if(typeof AudioMestre !== 'undefined') AudioMestre.click();
            UI.toggleMenu(false); // Fecha o menu primeiro
            
            // Carrega dados
            const dados = obterDadosDesempenho();
            document.getElementById('dash-total-jogos').textContent = dados.totalJogos;
            document.getElementById('dash-total-acertos').textContent = dados.totalAcertos;
            document.getElementById('dash-total-erros').textContent = dados.totalErros;
            
            // Reseta visualizaÃƒÂ§ÃƒÂ£o
            document.getElementById('painel-detalhes-historico').classList.add('oculto');
            window.atualizarGrafico('dia');

            UI.mostrarTela('tela-desempenho'); 
        };
    }

    // --- BOTÃƒâ€¢ES PRINCIPAIS DA HOME ---
    
    document.getElementById('btn-estudar').onclick = () => { 
        if(typeof AudioMestre !== 'undefined') AudioMestre.click();
        Lousa.iniciarModoLousa(); 
        UI.mostrarTela('estudo'); 
    };
    
    document.getElementById('btn-treino').onclick = () => {
        if(typeof AudioMestre !== 'undefined') AudioMestre.click();
        UI.mostrarTela('config'); 
    };

    document.getElementById('btn-desafio').onclick = () => {
        if(typeof AudioMestre !== 'undefined') AudioMestre.click();
        UI.mostrarTela('configDesafio'); 
    };

    // --- BOTÃƒâ€¢ES INTERNOS DE AÃƒâ€¡ÃƒÆ’O ---
    
    // Iniciar Treino
    const btnStartTreino = document.getElementById('btn-iniciar-treino-custom');
    if(btnStartTreino) {
        btnStartTreino.onclick = () => {
            if(typeof AudioMestre !== 'undefined') AudioMestre.click();
            Game.iniciarJogoTelaCheia('treino');
        };
    }

    // Iniciar Desafio
    const btnStartDesafio = document.getElementById('btn-iniciar-desafio-custom');
    if(btnStartDesafio) {
        btnStartDesafio.onclick = () => {
            if(typeof AudioMestre !== 'undefined') AudioMestre.click();
            Game.iniciarJogoTelaCheia('desafio'); 
        };
    }

    // BotÃƒÂ£o Voltar (Global)
    document.querySelectorAll('.btn-voltar').forEach(btn => {
        if (btn.id === 'btn-sair-jogo') return; // Ignora o botÃƒÂ£o de sair do jogo (Game.js cuida dele)

        btn.onclick = null; 
        btn.addEventListener('click', (e) => {
            e.preventDefault(); 
            if(typeof AudioMestre !== 'undefined') AudioMestre.click();
            Game.pararJogoTelaCheia(); 
            
            if(estado.modo === 'estudo-lousa') Lousa.iniciarModoLousa(); 
            
            const destino = btn.getAttribute('data-destino');
            if (destino) UI.mostrarTela(destino);
        });
    });

    // Reiniciar
    document.getElementById('btn-reiniciar').onclick = () => {
        if(typeof AudioMestre !== 'undefined') AudioMestre.click();
        if (estado.modo === 'estudo-lousa') { Lousa.iniciarDesafioLousa(); UI.mostrarTela('estudo'); } 
        else { Game.iniciarJogoTelaCheia(estado.modo); }
    };
    
    document.getElementById('btn-home-resultado').onclick = () => UI.mostrarTela('inicial');
}

// FunÃƒÂ§ÃƒÂ£o para atualizar a saudaÃƒÂ§ÃƒÂ£o
function atualizarSaudacao() {
    const hora = new Date().getHours();
    const textoEl = document.getElementById('texto-horario');
    
    if (!textoEl) return;

    let saudacao = "Ol\u00E1,";
    if (hora >= 5 && hora < 12) {
        saudacao = "Bom dia,";
    } else if (hora >= 12 && hora < 18) {
        saudacao = "Boa tarde,";
    } else {
        saudacao = "Boa noite,";
    }
    textoEl.textContent = saudacao;
}

