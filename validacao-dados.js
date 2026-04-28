// ========================================
// VALIDAÇÃO DE DADOS - FRONTEND
// Empreendedores Exponenciais - CSM
// ========================================
// Este arquivo adiciona validação robusta
// antes de enviar dados para o Supabase
// ========================================

/**
 * Detecção robusta de XSS
 * Padrões perigosos para bloquear injeção de scripts
 */
const padroesXSS = [
  /<script/i,
  /javascript\s*:/i,
  /on\w+\s*=/i,           // onclick=, onerror=, onload=, etc
  /<img[^>]+onerror/i,    // <img onerror=...>
  /<svg[^>]+onload/i,     // <svg onload=...>
  /<iframe/i,             // iframes
  /<object/i,             // objects
  /<embed/i,              // embeds
  /<form/i,               // forms
  /<input[^>]+type\s*=\s*["']?file/i,  // file inputs
  /eval\s*\(/i,           // eval()
  /document\s*\.\s*cookie/i,
  /window\s*\.\s*location/i,
  /document\s*\.\s*write/i
];

function detectarXSS(texto) {
  if (!texto) return false;
  return padroesXSS.some(padrao => padrao.test(texto));
}

/**
 * Sanitização básica - remove TODAS as tags HTML
 */
function sanitizeHTML(texto) {
  if (!texto) return '';
  // Remove todas as tags HTML (simples mas eficaz)
  return texto.replace(/<[^>]*>/g, '').trim();
}

/**
 * Validação de Dúvidas
 */
function validarDuvida(dados) {
  const erros = [];

  // Validação de nome
  if (!dados.nome || dados.nome.trim().length < 5) {
    erros.push('Nome deve ter pelo menos 5 caracteres');
  }
  if (dados.nome && dados.nome.trim().length > 100) {
    erros.push('Nome deve ter no máximo 100 caracteres');
  }

  // Validação de turma
  const turmasValidas = [
    '6º Ano A', '6º Ano B',
    '7º Ano A', '7º Ano B',
    '8º Ano A', '8º Ano B',
    '9º Ano A', '9º Ano B'
  ];
  if (!dados.turma || !turmasValidas.includes(dados.turma)) {
    erros.push('Selecione uma turma válida');
  }

  // Validação de ano
  if (!dados.ano || !/^\d{4}$/.test(dados.ano)) {
    erros.push('Ano inválido');
  }

  // Validação de aula
  if (!dados.aula || dados.aula.trim().length < 3) {
    erros.push('Informe sobre qual aula é a dúvida');
  }
  if (dados.aula && dados.aula.trim().length > 150) {
    erros.push('Descrição da aula muito longa (máx. 150 caracteres)');
  }

  // Validação de dúvida
  if (!dados.duvida || dados.duvida.trim().length < 10) {
    erros.push('Dúvida deve ter pelo menos 10 caracteres');
  }
  if (dados.duvida && dados.duvida.trim().length > 2000) {
    erros.push('Dúvida muito longa (máx. 2000 caracteres)');
  }

  // Detecção robusta de XSS
  if (dados.nome && detectarXSS(dados.nome)) {
    erros.push('Nome contém caracteres não permitidos');
  }
  if (dados.aula && detectarXSS(dados.aula)) {
    erros.push('Aula contém caracteres não permitidos');
  }
  if (dados.duvida && detectarXSS(dados.duvida)) {
    erros.push('Dúvida contém caracteres não permitidos');
  }

  return {
    valido: erros.length === 0,
    erros: erros,
    dadosLimpos: erros.length === 0 ? {
      nome: sanitizeHTML(dados.nome.trim()),
      turma: dados.turma,
      ano: dados.ano,
      aula: sanitizeHTML(dados.aula.trim()),
      duvida: sanitizeHTML(dados.duvida.trim())
    } : null
  };
}

/**
 * Validação de Projetos
 */
function validarProjeto(dados) {
  const erros = [];

  // Validação de nome do aluno
  if (!dados.nomeAluno || dados.nomeAluno.trim().length < 5) {
    erros.push('Nome do aluno deve ter pelo menos 5 caracteres');
  }
  if (dados.nomeAluno && dados.nomeAluno.trim().length > 100) {
    erros.push('Nome do aluno muito longo (máx. 100 caracteres)');
  }

  // Validação de turma
  const turmasValidas = [
    '6º Ano A', '6º Ano B',
    '7º Ano A', '7º Ano B',
    '8º Ano A', '8º Ano B',
    '9º Ano A', '9º Ano B'
  ];
  if (!dados.turma || !turmasValidas.includes(dados.turma)) {
    erros.push('Selecione uma turma válida');
  }

  // Validação de ano
  if (!dados.ano || !/^\d{4}$/.test(dados.ano)) {
    erros.push('Ano inválido');
  }

  // Validação de trimestre
  if (!dados.trimestre || !['1º Trimestre', '2º Trimestre', '3º Trimestre'].includes(dados.trimestre)) {
    erros.push('Selecione um trimestre válido');
  }

  // Validação de tipo de projeto
  const tiposValidos = ['pitch', 'canvas', 'mvp', 'projeto_final', 'feira', 'consultoria', 'hackathon'];
  if (!dados.tipoProjeto || !tiposValidos.includes(dados.tipoProjeto)) {
    erros.push('Selecione um tipo de projeto válido');
  }

  // Validação de título
  if (!dados.titulo || dados.titulo.trim().length < 5) {
    erros.push('Título deve ter pelo menos 5 caracteres');
  }
  if (dados.titulo && dados.titulo.trim().length > 200) {
    erros.push('Título muito longo (máx. 200 caracteres)');
  }

  // Validação de descrição
  if (dados.descricao && dados.descricao.trim().length > 5000) {
    erros.push('Descrição muito longa (máx. 5000 caracteres)');
  }

  // Sanitização contra XSS
  const camposTexto = ['nomeAluno', 'titulo', 'descricao'];
  for (const campo of camposTexto) {
    if (dados[campo] && detectarXSS(dados[campo])) {
      erros.push(`${campo} contém caracteres não permitidos`);
    }
  }

  return {
    valido: erros.length === 0,
    erros: erros,
    dadosLimpos: erros.length === 0 ? {
      nomeAluno: sanitizeHTML(dados.nomeAluno.trim()),
      turma: dados.turma,
      ano: dados.ano,
      trimestre: dados.trimestre,
      tipoProjeto: dados.tipoProjeto,
      titulo: sanitizeHTML(dados.titulo.trim()),
      descricao: sanitizeHTML((dados.descricao || '').trim()),
      conteudo: dados.conteudo || null,
      arquivos: dados.arquivos || []
    } : null
  };
}

/**
 * Validação de Conquistas
 */
function validarConquista(dados) {
  const erros = [];

  // Validação de nome do aluno
  if (!dados.nomeAluno || dados.nomeAluno.trim().length < 5) {
    erros.push('Nome do aluno deve ter pelo menos 5 caracteres');
  }

  // Validação de turma
  const turmasValidas = [
    '6º Ano A', '6º Ano B',
    '7º Ano A', '7º Ano B',
    '8º Ano A', '8º Ano B',
    '9º Ano A', '9º Ano B'
  ];
  if (!dados.turma || !turmasValidas.includes(dados.turma)) {
    erros.push('Selecione uma turma válida');
  }

  // Validação de ano
  if (!dados.ano || !/^\d{4}$/.test(dados.ano)) {
    erros.push('Ano inválido');
  }

  // Validação de título
  if (!dados.titulo || dados.titulo.trim().length < 3) {
    erros.push('Título deve ter pelo menos 3 caracteres');
  }
  if (dados.titulo && dados.titulo.trim().length > 100) {
    erros.push('Título muito longo (máx. 100 caracteres)');
  }

  // Validação de descrição
  if (dados.descricao && dados.descricao.trim().length > 1000) {
    erros.push('Descrição muito longa (máx. 1000 caracteres)');
  }

  // Validação de pontos
  if (dados.pontos !== undefined && (dados.pontos < 0 || dados.pontos > 1000)) {
    erros.push('Pontos devem ser entre 0 e 1000');
  }

  // Sanitização contra XSS
  const camposTexto = ['nomeAluno', 'titulo', 'descricao'];
  for (const campo of camposTexto) {
    if (dados[campo] && detectarXSS(dados[campo])) {
      erros.push(`${campo} contém caracteres não permitidos`);
    }
  }

  return {
    valido: erros.length === 0,
    erros: erros,
    dadosLimpos: erros.length === 0 ? {
      nomeAluno: sanitizeHTML(dados.nomeAluno.trim()),
      turma: dados.turma,
      ano: dados.ano,
      tipoConquista: dados.tipoConquista || 'geral',
      titulo: sanitizeHTML(dados.titulo.trim()),
      descricao: sanitizeHTML((dados.descricao || '').trim()),
      icone: dados.icone || '🏆',
      pontos: dados.pontos || 0,
      concedidoPor: dados.concedidoPor || 'Sistema'
    } : null
  };
}

/**
 * Validação de Resposta de Dúvida
 */
function validarResposta(dados) {
  const erros = [];

  // Validação da resposta
  if (!dados.resposta || dados.resposta.trim().length < 10) {
    erros.push('Resposta deve ter pelo menos 10 caracteres');
  }
  if (dados.resposta && dados.resposta.trim().length > 5000) {
    erros.push('Resposta muito longa (máx. 5000 caracteres)');
  }

  // Validação do nome do professor
  if (!dados.professorNome || dados.professorNome.trim().length < 5) {
    erros.push('Nome do professor deve ter pelo menos 5 caracteres');
  }

  // Sanitização
  if (dados.resposta && detectarXSS(dados.resposta)) {
    erros.push('Resposta contém caracteres não permitidos');
  }
  if (dados.professorNome && detectarXSS(dados.professorNome)) {
    erros.push('Nome do professor contém caracteres não permitidos');
  }

  return {
    valido: erros.length === 0,
    erros: erros,
    dadosLimpos: erros.length === 0 ? {
      resposta: sanitizeHTML(dados.resposta.trim()),
      professorNome: sanitizeHTML(dados.professorNome.trim())
    } : null
  };
}

/**
 * Validação de Avaliação de Projeto
 */
function validarAvaliacao(dados) {
  const erros = [];

  // Validação da nota (0-100)
  if (dados.nota === undefined || dados.nota === null) {
    erros.push('Nota é obrigatória');
  } else {
    const nota = parseFloat(dados.nota);
    if (isNaN(nota)) {
      erros.push('Nota deve ser um número válido');
    } else if (nota < 0 || nota > 100) {
      erros.push('Nota deve ser entre 0 e 100');
    }
  }

  // Validação do feedback (opcional mas recomendado)
  if (dados.feedback && dados.feedback.trim().length > 5000) {
    erros.push('Feedback muito longo (máx. 5000 caracteres)');
  }

  // Validação do nome do professor
  if (!dados.professorNome || dados.professorNome.trim().length < 5) {
    erros.push('Nome do professor deve ter pelo menos 5 caracteres');
  }

  // Sanitização
  if (dados.feedback && detectarXSS(dados.feedback)) {
    erros.push('Feedback contém caracteres não permitidos');
  }
  if (dados.professorNome && detectarXSS(dados.professorNome)) {
    erros.push('Nome do professor contém caracteres não permitidos');
  }

  return {
    valido: erros.length === 0,
    erros: erros,
    dadosLimpos: erros.length === 0 ? {
      nota: parseFloat(dados.nota).toFixed(1),
      feedback: sanitizeHTML((dados.feedback || '').trim()),
      professorNome: sanitizeHTML(dados.professorNome.trim())
    } : null
  };
}

/**
 * Exibir erros em um elemento HTML
 */
function exibirErros(containerId, erros) {
  const container = document.getElementById(containerId);
  if (!container) {
    alert('Erros:\n' + erros.join('\n'));
    return;
  }

  container.innerHTML = `
    <div class="error-message" style="
      background: #fee2e2;
      color: #dc2626;
      padding: 12px;
      border-radius: 8px;
      margin-bottom: 16px;
      border: 1px solid #fecaca;
    ">
      <strong>❌ Erro de validação:</strong><br>
      <ul style="margin: 8px 0 0 20px; padding: 0;">
        ${erros.map(e => `<li>${e}</li>`).join('')}
      </ul>
    </div>
  `;

  // Auto-hide após 5 segundos
  setTimeout(() => {
    container.innerHTML = '';
  }, 5000);
}

/**
 * Exibir sucesso em um elemento HTML
 */
function exibirSucesso(containerId, mensagem) {
  const container = document.getElementById(containerId);
  if (!container) {
    alert('✅ ' + mensagem);
    return;
  }

  container.innerHTML = `
    <div class="success-message" style="
      background: #d1fae5;
      color: #059669;
      padding: 12px;
      border-radius: 8px;
      margin-bottom: 16px;
      border: 1px solid #a7f3d0;
    ">
      ✅ ${mensagem}
    </div>
  `;

  // Auto-hide após 3 segundos
  setTimeout(() => {
    container.innerHTML = '';
  }, 3000);
}

// ========================================
// EXPORTAR FUNÇÕES DE VALIDAÇÃO
// ========================================

window.Validacao = {
  validarDuvida,
  validarProjeto,
  validarConquista,
  validarResposta,
  validarAvaliacao,
  exibirErros,
  exibirSucesso
};

console.log('✅ Validação de dados configurada!');
