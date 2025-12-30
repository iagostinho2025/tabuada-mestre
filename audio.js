const AudioMestre = {
    ctx: new (window.AudioContext || window.webkitAudioContext)(),
    
    iniciar() {
        // Destrava o áudio no primeiro clique (obrigatório para celulares)
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    },

    tocar(freq, tipo, duracao) {
        // --- NOVO: Verifica se o som está ligado nas configurações ---
        // Se for false (desligado), para a execução aqui.
        if (window.somLigado === false) return;

        this.iniciar(); // Tenta destravar sempre que for tocar
        
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = tipo;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        
        gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duracao);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.start();
        osc.stop(this.ctx.currentTime + duracao);
    },

    click() { 
        this.tocar(600, 'sine', 0.05); 
    },
    
    acerto() { 
        this.tocar(800, 'sine', 0.1); 
        // Toca o segundo som um pouco depois (efeito de moeda)
        setTimeout(() => this.tocar(1200, 'sine', 0.2), 100); 
    },
    
    erro() { 
        this.tocar(150, 'sawtooth', 0.3); 
        
        // --- NOVO: Verifica se a vibração está ligada ---
        if (window.vibracaoLigada !== false && navigator.vibrate) {
            navigator.vibrate(200);
        }
    }
};