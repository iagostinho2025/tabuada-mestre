import { estado, configTreino, configDesafio, quizLousa, tabuadaSelecionadaId } from './modules/state.js';
import * as UI from './modules/ui.js';
import * as Lousa from './modules/lousa.js';
import * as Game from './modules/game.js';
// Importação atualizada para incluir a nova função de detalhes
import { obterDadosDesempenho, limparDados, gerarDadosGrafico, obterDetalhesPorModo } from './modules/stats.js';

// --- EXPOR FUNÇÕES GLOBAIS (Necessário para o HTML acessar) ---
window.escolherModoInput = UI.escolherModoInput;
window.atualizarValorSlider = UI.atualizarValorSlider;
window.escolherQtd = UI.escolherQtd;
window.escolherModoDesafio = UI.escolherModoDesafio;
window.escolherDificuldade = UI.escolherDificuldade;
window.limparTudo = limparDados;

// --- FUNÇÃO DO HISTÓRICO POR MODO (NOVA) ---
window.verHistoricoModo = function(modo) {
    if(typeof AudioMestre !== 'undefined') AudioMestre.click();
    
    // 1. Pega os dados filtrados desse modo
    const dados = obterDetalhesPorModo(modo);
    
    // 2. Mostra o painel de detalhes
    const painel = document.getElementById('painel-detalhes-historico');
    painel.classList.remove('oculto');
    
    // 3. Preenche Título e Recorde
    const nomes = { 
        'classico': '⏱️ Clássico', 
        'morte': '💣 Morte Súbita', 
        'recarga': '🔋 Recarga', 
        'speedrun': '🏁 Speedrun' 
    };
    document.getElementById('titulo-modo-historico').textContent = nomes[modo] || modo;
    document.getElementById('valor-recorde-modo').textContent = `${dados.recorde} pts`;
    
    // 4. Preenche a lista de últimas partidas
    const listaEl = document.getElementById('lista-historico-especifica');
    listaEl.innerHTML = '';
    
    if (dados.lista.length === 0) {
        listaEl.innerHTML = '<div style="text-align:center; padding:15px; color:#94a3b8; font-style:italic;">Nenhuma partida jogada neste modo ainda.</div>';
    } else {
        dados.lista.forEach(partida => {
            const dataObj = new Date(partida.data);
            const dataFormatada = dataObj.toLocaleDateString('pt-BR', {day: '2-digit', month: '2-digit'}) + 
                                  ' às ' + dataObj.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'});
            
            const html = `
                <div class="item-mini">
                    <span style="color:#64748b; font-size:0.85rem">${dataFormatada}</span>
                    <div style="display:flex; gap:10px; align-items:center;">
                        <span class="pts">${partida.pontos} pts</span>
                        <span style="font-size:0.8rem; color:var(--text-light)">(${partida.acertos}✅ / ${partida.erros}❌)</span>
                    </div>
                </div>
            `;
            listaEl.innerHTML += html;
        });
    }
    
    // Scroll suave até o painel para o usuário ver
    painel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Fecha o painel de detalhes
window.fecharHistoricoModo = function() {
    if(typeof AudioMestre !== 'undefined') AudioMestre.click();
    document.getElementById('painel-detalhes-historico').classList.add('oculto');
}

// --- FUNÇÃO DO GRÁFICO (Mantida e melhorada) ---
window.atualizarGrafico = function(periodo) {
    if(typeof AudioMestre !== 'undefined') AudioMestre.click();
    
    // 1. Atualiza botões visuais
    document.querySelectorAll('.btn-filtro').forEach(b => b.classList.remove('ativo'));
    // Encontra o botão correto pelo texto (simplificação robusta)
    const botoes = Array.from(document.querySelectorAll('.btn-filtro'));
    const botaoAlvo = botoes.find(b => b.textContent.toLowerCase().includes(periodo === 'dia' ? 'dia' : periodo === 'mes' ? 'mês' : 'ano'));
    if(botaoAlvo) botaoAlvo.classList.add('ativo');

    // 2. Pega dados
    const info = gerarDadosGrafico(periodo);
    const container = document.getElementById('container-barras');
    container.innerHTML = ''; // Limpa

    // 3. Renderiza barras (1 a 10)
    for (let i = 1; i <= 10; i++) {
        const valor = info.dados[i];
        // Calcula altura % (evita divisão por zero)
        let altura = info.max > 0 ? (valor / info.max) * 100 : 0;
        // Altura mínima visual de 4% pra barra aparecer se tiver valor, ou 2% se for zero (só pra marcar)
        if (valor > 0 && altura < 5) altura = 5;
        if (valor === 0) altura = 2;
        
        // Tooltip com quantidade exata
        const html = `
            <div class="barra-wrapper">
                <div class="barra" style="height: ${altura}%; opacity: ${valor===0 ? 0.3 : 1}" title="${valor} acertos"></div>
                <span>x${i}</span>
            </div>
        `;
        container.innerHTML += html;
    }
}

// --- INICIALIZAÇÃO ---
document.addEventListener('DOMContentLoaded', () => {
    Game.carregarRecorde();
    
    // Atualiza o recorde visualmente na hora
    const recorde = localStorage.getItem('tabuada_recorde') || 0;
    const el = document.getElementById('home-recorde');
    if(el) el.textContent = `${recorde} pts`;

    setupEventos();
});

function setupEventos() {
    // Menu
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

    // --- BOTÃO MEU DESEMPENHO ---
    document.getElementById('btn-desempenho').onclick = () => {
        if(typeof AudioMestre !== 'undefined') AudioMestre.click();
        
        // 1. Pega os dados gerais
        const dados = obterDadosDesempenho();
        
        // 2. Preenche o topo
        document.getElementById('dash-total-jogos').textContent = dados.totalJogos;
        document.getElementById('dash-total-acertos').textContent = dados.totalAcertos;
        document.getElementById('dash-pior-tabuada').textContent = dados.piorTabuada ? `Tabuada do ${dados.piorTabuada}` : "Nenhuma";
        
        // 3. Garante que o painel de detalhes comece fechado
        document.getElementById('painel-detalhes-historico').classList.add('oculto');

        // 4. Inicializa o gráfico (Padrão: Dia)
        window.atualizarGrafico('dia');

        UI.mostrarTela('tela-desempenho'); 
    };
    
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

    // Voltar
    document.querySelectorAll('.btn-voltar').forEach(btn => {
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

    // Sair Jogo
    const btnSair = document.getElementById('btn-sair-jogo');
    if(btnSair) {
        btnSair.onclick = () => { if(confirm("Sair do jogo?")) { Game.pararJogoTelaCheia(); UI.mostrarTela('inicial'); } };
    }

    // Reiniciar
    document.getElementById('btn-reiniciar').onclick = () => {
        if(typeof AudioMestre !== 'undefined') AudioMestre.click();
        if (estado.modo === 'estudo-lousa') { Lousa.iniciarDesafioLousa(); UI.mostrarTela('estudo'); } 
        else { Game.iniciarJogoTelaCheia(estado.modo); }
    };
    
    document.getElementById('btn-home-resultado').onclick = () => UI.mostrarTela('inicial');
}