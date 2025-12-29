/**
 * Módulo da Loja de Avatares e Economia do Jogo
 */
import { mostrarTela } from './ui.js';

// Catálogo de Avatares (Emojis)
const CATALOGO = [
    // Nível 1: Grátis
    { id: 'ini_1', icon: '🙂', nome: 'Iniciante', preco: 0 },
    
    // Nível 2: Baratinhos (500)
    { id: 'anim_1', icon: '🦊', nome: 'Raposa', preco: 500 },
    { id: 'anim_2', icon: '🐱', nome: 'Gato', preco: 500 },
    { id: 'anim_3', icon: '🐶', nome: 'Cachorro', preco: 500 },
    { id: 'anim_4', icon: '🐸', nome: 'Sapo', preco: 500 },

    // Nível 3: Intermediários (2000)
    { id: 'esp_1', icon: '🥷', nome: 'Ninja', preco: 2000 },
    { id: 'esp_2', icon: '🤖', nome: 'Robô', preco: 2000 },
    { id: 'esp_3', icon: '👻', nome: 'Fantasma', preco: 2000 },
    { id: 'esp_4', icon: '👽', nome: 'Alien', preco: 2000 },

    // Nível 4: Lendários (5000)
    { id: 'lend_1', icon: '🦁', nome: 'Rei Leão', preco: 5000 },
    { id: 'lend_2', icon: '🦄', nome: 'Unicórnio', preco: 5000 },
    { id: 'lend_3', icon: '🐉', nome: 'Dragão', preco: 5000 },
    { id: 'lend_4', icon: '🦸', nome: 'Super', preco: 5000 }
];

// Estado do Usuário (Carregado do localStorage)
let dadosUsuario = {
    estrelas: 0,
    desbloqueados: ['ini_1'],
    avatarAtual: 'ini_1'
};

// --- FUNÇÕES PRINCIPAIS ---

export function initStore() {
    const salvo = localStorage.getItem('tabuada_store_v1');
    if (salvo) {
        dadosUsuario = JSON.parse(salvo);
    }
    atualizarInterfaceAvatar();
}

export function adicionarEstrelas(qtd) {
    if (qtd <= 0) return;
    dadosUsuario.estrelas += qtd;
    salvarDados();
    atualizarInterfaceAvatar();
    // Feedback visual (opcional)
    console.log(`Ganhou ${qtd} estrelas! Total: ${dadosUsuario.estrelas}`);
}

function salvarDados() {
    localStorage.setItem('tabuada_store_v1', JSON.stringify(dadosUsuario));
}

// Atualiza o ícone na tela inicial e saldo
export function atualizarInterfaceAvatar() {
    // Atualiza ícone na Home
    const avatarEl = document.getElementById('avatar-display-home');
    const avatarObj = CATALOGO.find(a => a.id === dadosUsuario.avatarAtual);
    if (avatarEl && avatarObj) {
        avatarEl.textContent = avatarObj.icon;
    }

    // Atualiza saldo visual na loja
    const saldoLoja = document.getElementById('saldo-estrelas-loja');
    if (saldoLoja) saldoLoja.textContent = dadosUsuario.estrelas;
    
    // Atualiza saldo visual na Home (novo)
    const saldoHome = document.getElementById('saldo-estrelas-home');
    if (saldoHome) saldoHome.textContent = dadosUsuario.estrelas;
}

// Renderiza a grade de produtos
export function renderizarLoja() {
    const grid = document.getElementById('grid-loja');
    if (!grid) return;
    
    grid.innerHTML = ''; // Limpa
    document.getElementById('saldo-estrelas-loja').textContent = dadosUsuario.estrelas;

    CATALOGO.forEach(item => {
        const desbloqueado = dadosUsuario.desbloqueados.includes(item.id);
        const equipado = dadosUsuario.avatarAtual === item.id;
        const podeComprar = dadosUsuario.estrelas >= item.preco;

        const card = document.createElement('div');
        card.className = `card-avatar ${desbloqueado ? 'desbloqueado' : 'bloqueado'} ${equipado ? 'equipado' : ''}`;
        
        let botaoHtml = '';
        if (equipado) {
            botaoHtml = `<button class="btn-loja-acao btn-equipado" disabled>Em uso</button>`;
        } else if (desbloqueado) {
            botaoHtml = `<button class="btn-loja-acao btn-usar" onclick="window.equiparAvatar('${item.id}')">Usar</button>`;
        } else {
            if (podeComprar) {
                botaoHtml = `<button class="btn-loja-acao btn-comprar" onclick="window.comprarAvatar('${item.id}')">Comprar (${item.preco})</button>`;
            } else {
                botaoHtml = `<button class="btn-loja-acao btn-caro" disabled>🔒 ${item.preco}</button>`;
            }
        }

        card.innerHTML = `
            <div class="avatar-icon">${item.icon}</div>
            <div class="avatar-nome">${item.nome}</div>
            ${botaoHtml}
        `;
        
        grid.appendChild(card);
    });
}

// Funções globais para o HTML chamar
window.comprarAvatar = function(id) {
    if(typeof AudioMestre !== 'undefined') AudioMestre.click();
    
    const item = CATALOGO.find(a => a.id === id);
    if (!item) return;

    if (dadosUsuario.estrelas >= item.preco) {
        if (confirm(`Comprar ${item.nome} por ${item.preco} estrelas?`)) {
            dadosUsuario.estrelas -= item.preco;
            dadosUsuario.desbloqueados.push(id);
            dadosUsuario.avatarAtual = id; // Já equipa automaticamente
            
            salvarDados();
            renderizarLoja();
            atualizarInterfaceAvatar();
            
            if(typeof AudioMestre !== 'undefined') AudioMestre.acerto(); // Som de sucesso
            alert(`Parabéns! Você desbloqueou: ${item.icon} ${item.nome}`);
        }
    }
};

window.equiparAvatar = function(id) {
    if(typeof AudioMestre !== 'undefined') AudioMestre.click();
    if (dadosUsuario.desbloqueados.includes(id)) {
        dadosUsuario.avatarAtual = id;
        salvarDados();
        renderizarLoja();
        atualizarInterfaceAvatar();
    }
};