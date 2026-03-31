/**
 * Módulo da Loja de Avatares e Economia do Jogo
 */

// Catálogo de Avatares
const CATALOGO = [
    { id: 'neutral', icon: '\u{1F642}', nome: 'Padrão', preco: 0 },
    { id: 'soldier_m', icon: '\u{1F482}\u200D\u2642\uFE0F', nome: 'Soldado', preco: 200 },
    { id: 'soldier_f', icon: '\u{1F482}\u200D\u2640\uFE0F', nome: 'Soldada', preco: 200 },
    { id: 'pet_dog', icon: '\u{1F436}', nome: 'Cachorro', preco: 500 },
    { id: 'pet_cat', icon: '\u{1F431}', nome: 'Gato', preco: 500 },
    { id: 'pet_fox', icon: '\u{1F98A}', nome: 'Raposa', preco: 500 },
    { id: 'pet_uni', icon: '\u{1F984}', nome: 'Unicórnio', preco: 500 },
    { id: 'hero_m', icon: '\u{1F9B8}\u200D\u2642\uFE0F', nome: 'Super-Herói', preco: 1000 },
    { id: 'hero_f', icon: '\u{1F9B8}\u200D\u2640\uFE0F', nome: 'Super-Heroína', preco: 1000 },
    { id: 'police_m', icon: '\u{1F46E}\u200D\u2642\uFE0F', nome: 'Policial', preco: 2000 },
    { id: 'police_f', icon: '\u{1F46E}\u200D\u2640\uFE0F', nome: 'Policial', preco: 2000 },
    { id: 'esp_1', icon: '\u{1F977}', nome: 'Ninja', preco: 2000 },
    { id: 'astro_m', icon: '\u{1F468}\u200D\u{1F680}', nome: 'Astronauta', preco: 2500 },
    { id: 'astro_f', icon: '\u{1F469}\u200D\u{1F680}', nome: 'Astronauta', preco: 2500 },
    { id: 'esp_2', icon: '\u{1F916}', nome: 'Robô', preco: 4000 },
    { id: 'esp_3', icon: '\u{1F47B}', nome: 'Fantasma', preco: 4000 },
    { id: 'esp_4', icon: '\u{1F47D}', nome: 'Alien', preco: 4500 },
    { id: 'lend_3', icon: '\u{1F409}', nome: 'Dragão', preco: 4500 },
    { id: 'royal_m', icon: '\u{1F934}', nome: 'Príncipe', preco: 5000 },
    { id: 'royal_f', icon: '\u{1F478}', nome: 'Princesa', preco: 5000 },
    { id: 'magic_m', icon: '\u{1F9D9}\u200D\u2642\uFE0F', nome: 'Mago', preco: 7000 },
    { id: 'magic_f', icon: '\u{1F9DA}\u200D\u2640\uFE0F', nome: 'Fada', preco: 7000 },
    { id: 'genie_supreme', icon: '\u{1F9DE}', nome: 'Gênio Supremo', preco: 10000 }
];

const IDS_CATALOGO = new Set(CATALOGO.map((item) => item.id));
const DESBLOQUEADOS_INICIAIS = ['neutral'];

let dadosUsuario = {
    estrelas: 0,
    desbloqueados: [...DESBLOQUEADOS_INICIAIS],
    avatarAtual: 'neutral'
};

function normalizarDadosUsuario() {
    if (!Array.isArray(dadosUsuario.desbloqueados)) {
        dadosUsuario.desbloqueados = [...DESBLOQUEADOS_INICIAIS];
    }

    dadosUsuario.desbloqueados = [...new Set(
        dadosUsuario.desbloqueados.filter((id) => IDS_CATALOGO.has(id))
    )];

    DESBLOQUEADOS_INICIAIS.forEach((id) => {
        if (!dadosUsuario.desbloqueados.includes(id)) {
            dadosUsuario.desbloqueados.push(id);
        }
    });

    if (!IDS_CATALOGO.has(dadosUsuario.avatarAtual)) {
        dadosUsuario.avatarAtual = 'neutral';
    }
}

function salvarDados() {
    localStorage.setItem('tabuada_store_v1', JSON.stringify(dadosUsuario));
}

export function initStore() {
    const salvo = localStorage.getItem('tabuada_store_v1');
    if (salvo) {
        try {
            const dadosSalvos = JSON.parse(salvo);
            dadosUsuario = { ...dadosUsuario, ...dadosSalvos };
        } catch (e) {
            console.error('Erro ao carregar save da loja:', e);
        }
    }

    normalizarDadosUsuario();
    salvarDados();
    atualizarInterfaceAvatar();
}

export function adicionarEstrelas(qtd) {
    if (qtd <= 0) return;
    dadosUsuario.estrelas += qtd;
    salvarDados();
    atualizarInterfaceAvatar();
}

export function atualizarInterfaceAvatar() {
    const avatarEl = document.getElementById('avatar-display-home');
    const avatarMenu = document.getElementById('avatar-menu-display');

    const avatarObj = CATALOGO.find((a) => a.id === dadosUsuario.avatarAtual);
    if (avatarObj) {
        if (avatarEl) avatarEl.textContent = avatarObj.icon;
        if (avatarMenu) avatarMenu.textContent = avatarObj.icon;
    }

    const saldoLoja = document.getElementById('saldo-estrelas-loja');
    const saldoHome = document.getElementById('saldo-estrelas-home');
    const saldoMenu = document.getElementById('saldo-menu');

    if (saldoLoja) saldoLoja.textContent = dadosUsuario.estrelas;
    if (saldoHome) saldoHome.textContent = dadosUsuario.estrelas;
    if (saldoMenu) saldoMenu.textContent = dadosUsuario.estrelas;
}

export function renderizarLoja() {
    const grid = document.getElementById('grid-loja');
    if (!grid) return;

    grid.innerHTML = '';
    document.getElementById('saldo-estrelas-loja').textContent = dadosUsuario.estrelas;

    CATALOGO.forEach((item) => {
        const desbloqueado = dadosUsuario.desbloqueados.includes(item.id);
        const equipado = dadosUsuario.avatarAtual === item.id;
        const podeComprar = dadosUsuario.estrelas >= item.preco;

        const card = document.createElement('div');
        card.className = `card-avatar ${desbloqueado ? 'desbloqueado' : 'bloqueado'} ${equipado ? 'equipado' : ''}`;

        let botaoHtml = '';
        if (equipado) {
            botaoHtml = '<button class="btn-loja-acao btn-equipado" disabled>Em uso</button>';
        } else if (desbloqueado) {
            botaoHtml = `<button class="btn-loja-acao btn-usar" onclick="window.equiparAvatar('${item.id}')">Usar</button>`;
        } else if (podeComprar) {
            botaoHtml = `<button class="btn-loja-acao btn-comprar" onclick="window.comprarAvatar('${item.id}')">Comprar (${item.preco})</button>`;
        } else {
            botaoHtml = `<button class="btn-loja-acao btn-caro" disabled>\u{1F512} ${item.preco}</button>`;
        }

        card.innerHTML = `
            <div class="avatar-icon">${item.icon}</div>
            <div class="avatar-nome">${item.nome}</div>
            ${botaoHtml}
        `;

        grid.appendChild(card);
    });
}

window.comprarAvatar = function(id) {
    if (typeof AudioMestre !== 'undefined') AudioMestre.click();

    const item = CATALOGO.find((a) => a.id === id);
    if (!item) return;

    if (dadosUsuario.estrelas >= item.preco) {
        if (confirm(`Desbloquear ${item.nome} por ${item.preco} estrelas?`)) {
            dadosUsuario.estrelas -= item.preco;
            if (!dadosUsuario.desbloqueados.includes(id)) {
                dadosUsuario.desbloqueados.push(id);
            }
            dadosUsuario.avatarAtual = id;

            normalizarDadosUsuario();
            salvarDados();
            renderizarLoja();
            atualizarInterfaceAvatar();

            if (typeof AudioMestre !== 'undefined') AudioMestre.acerto();
            alert(`Parabéns! Novo visual desbloqueado: ${item.icon}`);
        }
    }
};

window.equiparAvatar = function(id) {
    if (typeof AudioMestre !== 'undefined') AudioMestre.click();

    if (dadosUsuario.desbloqueados.includes(id)) {
        dadosUsuario.avatarAtual = id;
        normalizarDadosUsuario();
        salvarDados();
        renderizarLoja();
        atualizarInterfaceAvatar();
    }
};

