export const estado = {
    modo: null,
    subModo: null,
    pontos: 0,
    acertos: 0,
    erros: 0,
    totalQuestoes: 0,
    tempo: 0,
    timerInterval: null,
    emAndamento: false,
    questaoAtual: {},
    maxQuestoes: Infinity,
    modoInput: 'botoes'
};

export const configTreino = {
    modoInput: 'botoes',
    qtdQuestoes: 10
};

export const configDesafio = {
    modo: 'classico',
    dificuldade: 'medio'
};

export const quizLousa = {
    numero: 1,
    fila: [],
    atual: null,
    acertos: 0,
    erros: 0
};

// Variável simples para controlar qual tabuada está selecionada na Lousa
export let tabuadaSelecionadaId = { valor: 1 };