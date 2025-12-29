/**
 * Módulo da Loja de Avatares e Economia do Jogo
 */
import { mostrarTela } from './ui.js';

// Catálogo de Avatares (Balanceado e Inclusivo)
const CATALOGO = [
    // Nível 0: Iniciais (Grátis)
    { id: 'neutral', icon: '🙂', nome: 'Padrão', preco: 0 },
    { id: 'soldier_m', icon: '💂‍♂️', nome: 'Soldado', preco: 200 },
    { id: 'soldier_f', icon: '💂‍♀️', nome: 'Soldada', preco: 200 },

    // Nível 1: Bichinhos Fofos (500 estrelas)
    { id: 'pet_dog', icon: '🐶', nome: 'Cachorro', preco: 500 },
    { id: 'pet_cat', icon: '🐱', nome: 'Gato', preco: 500 },
    { id: 'pet_fox', icon: '🦊', nome: 'Raposa', preco: 500 },
    { id: 'pet_uni', icon: '🦄', nome: 'Unicórnio', preco: 500 },

    // Nível 2: Heróis e Ação (2.000 estrelas)
    { id: 'hero_m', icon: '🦸‍♂️', nome: 'Super-Herói', preco: 1000 },
    { id: 'hero_f', icon: '🦸‍♀️', nome: 'Super-Heroína', preco: 1000 },
    { id: 'police_m', icon: '👮‍♂️', nome: 'Policial', preco: 2000 },
    { id: 'police_f', icon: '👮‍♀️', nome: 'Policial', preco: 2000 },
	{ id: 'esp_1', icon: '🥷', nome: 'Ninja', preco: 2000 },
    { id: 'astro_m', icon: '👨‍🚀', nome: 'Astronauta', preco: 2500 },
    { id: 'astro_f', icon: '👩‍🚀', nome: 'Astronauta', preco: 2500 },
    { id: 'esp_2', icon: '🤖', nome: 'Robô', preco: 4000 },
    { id: 'esp_3', icon: '👻', nome: 'Fantasma', preco: 4000 },
    { id: 'esp_4', icon: '👽', nome: 'Alien', preco: 4500 },

    // Nível 3: Lendas e Realeza (5.000 estrelas)
	{ id: 'lend_3', icon: '🐉', nome: 'Dragão', preco: 4500 },
    { id: 'royal_m', icon: '🤴', nome: 'Príncipe', preco: 5000 },
    { id: 'royal_f', icon: '👸', nome: 'Princesa', preco: 5000 },
    { id: 'magic_m', icon: '🧙‍♂️', nome: 'Mago', preco: 7000 },
    { id: 'magic_f', icon: '🧚‍♀️', nome: 'Fada', preco: 7000 },

	// Nível 4: Gênios Supremos (10.000 estrelas)
	{ id: 'genie_supreme', icon: '🧞', nome: 'Gênio Supremo', preco: 10000 }

];

// Estado Padrão
let dadosUsuario = {
    estrelas: 0,
    desbloqueados: ['neutral', 'boy', 'girl'], // Todos os iniciais liberados
    avatarAtual: 'neutral'
};

// --- FUNÇÕES PRINCIPAIS ---

export function initStore() {
    const salvo = localStorage.getItem('tabuada_store_v1');
    if (salvo) {
        try {
            const dadosSalvos = JSON.parse(salvo);
            // Mescla dados salvos com o estado padrão (preserva saldo e compras)
            dadosUsuario = { ...dadosUsuario, ...dadosSalvos };

            // Verificação de Segurança: Se o avatar salvo não existe mais no catálogo novo, volta pro padrão
            const existe = CATALOGO.find(a => a.id === dadosUsuario.avatarAtual);
            if (!existe) {
                dadosUsuario.avatarAtual = 'neutral';
            }

            // Garante que os novos gratuitos estejam na lista de desbloqueados do usuário antigo
            ['neutral', 'boy', 'girl'].forEach(id => {
                if (!dadosUsuario.desbloqueados.includes(id)) {
                    dadosUsuario.desbloqueados.push(id);
                }
            });

        } catch (e) {
            console.error("Erro ao carregar save da loja:", e);
        }
    }
    atualizarInterfaceAvatar();
}

export function adicionarEstrelas(qtd) {
    if (qtd <= 0) return;
    dadosUsuario.estrelas += qtd;
    salvarDados();
    atualizarInterfaceAvatar();
}

function salvarDados() {
    localStorage.setItem('tabuada_store_v1', JSON.stringify(dadosUsuario));
}

// Atualiza os locais visuais onde o avatar e o saldo aparecem
export function atualizarInterfaceAvatar() {
    // 1. Ícone na Home
    const avatarEl = document.getElementById('avatar-display-home');
    // 2. Ícone no MENU LATERAL (Novo)
    const avatarMenu = document.getElementById('avatar-menu-display');
    
    const avatarObj = CATALOGO.find(a => a.id === dadosUsuario.avatarAtual);
    if (avatarObj) {
        if (avatarEl) avatarEl.textContent = avatarObj.icon;
        if (avatarMenu) avatarMenu.textContent = avatarObj.icon;
    }

    // Atualiza saldos (Loja, Home e Menu)
    const saldoLoja = document.getElementById('saldo-estrelas-loja');
    const saldoHome = document.getElementById('saldo-estrelas-home');
    const saldoMenu = document.getElementById('saldo-menu'); // Novo no menu

    if (saldoLoja) saldoLoja.textContent = dadosUsuario.estrelas;
    if (saldoHome) saldoHome.textContent = dadosUsuario.estrelas;
    if (saldoMenu) saldoMenu.textContent = dadosUsuario.estrelas;
}

// Renderiza a grade de produtos na tela de Loja
export function renderizarLoja() {
    const grid = document.getElementById('grid-loja');
    if (!grid) return;
    
    grid.innerHTML = ''; // Limpa grid atual
    document.getElementById('saldo-estrelas-loja').textContent = dadosUsuario.estrelas;

    CATALOGO.forEach(item => {
        const desbloqueado = dadosUsuario.desbloqueados.includes(item.id);
        const equipado = dadosUsuario.avatarAtual === item.id;
        const podeComprar = dadosUsuario.estrelas >= item.preco;

        const card = document.createElement('div');
        // Adiciona classes para estilização (verde se equipado, cinza se bloqueado)
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

// --- Funções Globais (Expostas para o HTML onclick) ---

window.comprarAvatar = function(id) {
    if(typeof AudioMestre !== 'undefined') AudioMestre.click();
    
    const item = CATALOGO.find(a => a.id === id);
    if (!item) return;

    if (dadosUsuario.estrelas >= item.preco) {
        if (confirm(`Desbloquear ${item.nome} por ${item.preco} estrelas?`)) {
            dadosUsuario.estrelas -= item.preco;
            dadosUsuario.desbloqueados.push(id);
            dadosUsuario.avatarAtual = id; // Já equipa automaticamente ao comprar
            
            salvarDados();
            renderizarLoja();
            atualizarInterfaceAvatar();
            
            if(typeof AudioMestre !== 'undefined') AudioMestre.acerto();
            alert(`Parabéns! Novo visual desbloqueado: ${item.icon}`);
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