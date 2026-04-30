// Sistema de Progresso - CSM Empreendedores
// Inclua este script nas páginas de aula

(function() {
    const pathname = window.location.pathname;
    const filename = pathname.split('/').pop().replace('.html', '');
    
    const urlParams = new URLSearchParams(window.location.search);
    const ano = urlParams.get('ano') || getAnoFromPath();
    
    function getAnoFromPath() {
        const path = window.location.pathname;
        if (path.includes('6ano')) return '6ano';
        if (path.includes('7ano')) return '7ano';
        if (path.includes('8ano')) return '8ano';
        if (path.includes('9ano')) return '9ano';
        return null;
    }
    
    function getProgresso() {
        if (!ano) return [];
        const key = 'progresso_' + ano;
        const saved = localStorage.getItem(key);
        return saved ? JSON.parse(saved) : [];
    }
    
    function salvarProgresso(lista) {
        if (!ano) return;
        const key = 'progresso_' + ano;
        localStorage.setItem(key, JSON.stringify(lista));
    }
    
    function marcarConcluida(id) {
        const lista = getProgresso();
        if (!lista.includes(id)) {
            lista.push(id);
            salvarProgresso(lista);
        }
    }
    
    function isConcluida(id) {
        return getProgresso().includes(id);
    }
    
    window.SistemaProgresso = {
        marcarConcluida,
        isConcluida,
        getProgresso,
        ano,
        filename
    };
    
    if (ano && filename) {
       marcarConcluida(filename);
    }
})();