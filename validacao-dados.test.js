// ========================================
// TESTES - VALIDAÇÃO DE DADOS
// Empreendedores CSM
// ========================================
import { describe, it, expect } from 'vitest'

// Copiar funções para teste puro (sem import)
const padroesXSS = [
  /<script/i,
  /javascript\s*:/i,
  /on\w+\s*=/i,
  /<img[^>]+onerror/i,
  /<svg[^>]+onload/i,
  /<iframe/i,
  /<object/i,
  /<embed/i,
  /<form/i,
  /<input[^>]+type\s*=\s*["']?file/i,
  /eval\s*\(/i,
  /document\s*\.\s*cookie/i,
  /window\s*\.\s*location/i,
  /document\s*\.\s*write/i
]

function detectarXSS(texto) {
  if (!texto) return false;
  return padroesXSS.some(padrao => padrao.test(texto));
}

function sanitizeHTML(texto) {
  if (!texto) return '';
  return texto.replace(/<[^>]*>/g, '').trim();
}

const turmasValidas = [
  '6º Ano A', '6º Ano B',
  '7º Ano A', '7º Ano B',
  '8º Ano A', '8º Ano B',
  '9º Ano A', '9º Ano B'
]

function validarDuvida(dados) {
  const erros = [];
  
  if (!dados.nome || dados.nome.trim().length < 5) {
    erros.push('Nome deve ter pelo menos 5 caracteres');
  }
  if (dados.nome && dados.nome.trim().length > 100) {
    erros.push('Nome deve ter no máximo 100 caracteres');
  }
  
  if (!dados.turma || !turmasValidas.includes(dados.turma)) {
    erros.push('Selecione uma turma válida');
  }
  
  if (!dados.ano || !/^\d{4}$/.test(dados.ano)) {
    erros.push('Ano inválido');
  }
  
  if (!dados.aula || dados.aula.trim().length < 3) {
    erros.push('Informe sobre qual aula é a dúvida');
  }
  
  if (!dados.duvida || dados.duvida.trim().length < 10) {
    erros.push('Dúvida deve ter pelo menos 10 caracteres');
  }
  if (dados.duvida && dados.duvida.trim().length > 2000) {
    erros.push('Dúvida muito longa (máx. 2000 caracteres)');
  }
  
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

function validarProjeto(dados) {
  const erros = [];
  
  if (!dados.nomeAluno || dados.nomeAluno.trim().length < 5) {
    erros.push('Nome do aluno deve ter pelo menos 5 caracteres');
  }
  
  if (!dados.turma || !turmasValidas.includes(dados.turma)) {
    erros.push('Selecione uma turma válida');
  }
  
  if (!dados.ano || ![6, 7, 8, 9].includes(parseInt(dados.ano))) {
    erros.push('Ano deve ser 6, 7, 8 ou 9');
  }
  
  if (!dados.trimestre || ![1, 2, 3].includes(parseInt(dados.trimestre))) {
    erros.push('Trimestre deve ser 1, 2 ou 3');
  }
  
  if (!dados.titulo || dados.titulo.trim().length < 5) {
    erros.push('Título deve ter pelo menos 5 caracteres');
  }
  if (dados.titulo && dados.titulo.trim().length > 200) {
    erros.push('Título muito longo (máx. 200 caracteres)');
  }
  
  if (!dados.descricao || dados.descricao.trim().length < 10) {
    erros.push('Descrição deve ter pelo menos 10 caracteres');
  }
  if (dados.descricao && dados.descricao.trim().length > 2000) {
    erros.push('Descrição muito longa (máx. 2000 caracteres)');
  }
  
  if (dados.nomeAluno && detectarXSS(dados.nomeAluno)) {
    erros.push('Nome contém caracteres não permitidos');
  }
  if (dados.titulo && detectarXSS(dados.titulo)) {
    erros.push('Título contém caracteres não permitidos');
  }
  
  return {
    valido: erros.length === 0,
    erros: erros,
    dadosLimpos: erros.length === 0 ? {
      nomeAluno: sanitizeHTML(dados.nomeAluno.trim()),
      turma: dados.turma,
      ano: parseInt(dados.ano),
      trimestre: parseInt(dados.trimestre),
      tipoProjeto: dados.tipoProjeto,
      titulo: sanitizeHTML(dados.titulo.trim()),
      descricao: sanitizeHTML(dados.descricao.trim())
    } : null
  };
}

// ========================================
// TESTES
// ========================================

describe('Detecção XSS', () => {
  it('deve detectar script inline', () => {
    expect(detectarXSS('<script>alert(1)</script>')).toBe(true);
  });
  
  it('deve detectar javascript protocol', () => {
    expect(detectarXSS('javascript:alert(1)')).toBe(true);
  });
  
  it('deve detectar event handlers', () => {
    expect(detectarXSS('<img onerror="alert(1)">')).toBe(true);
  });
  
  it('deve detectar iframe', () => {
    expect(detectarXSS('<iframe src="evil">')).toBe(true);
  });
  
  it('deve aceitar texto seguro', () => {
    expect(detectarXSS('Olá, mundo!')).toBe(false);
  });
  
  it('deve aceitar texto vazio', () => {
    expect(detectarXSS('')).toBe(false);
    expect(detectarXSS(null)).toBe(false);
  });
});

describe('Sanitização HTML', () => {
  it('deve remover tags HTML', () => {
    expect(sanitizeHTML('<b>texto</b>')).toBe('texto');
  });
  
  it('deve remover script', () => {
    expect(sanitizeHTML('<script>evil()</script>')).toBe('evil()');
  });
  
  it('deve retornar texto limpo', () => {
    expect(sanitizeHTML('Olá mundo')).toBe('Olá mundo');
  });
  
  it('deve tratar null', () => {
    expect(sanitizeHTML(null)).toBe('');
  });
});

describe('Validação de Dúvida', () => {
  const dadosValidos = {
    nome: 'João Silva',
    turma: '7º Ano A',
    ano: '2026',
    aula: 'Empreendedorismo',
    duvida: 'Como criar um negócio?'
  };
  
  it('deve aceitar dúvida válida', () => {
    const result = validarDuvida(dadosValidos);
    expect(result.valido).toBe(true);
    expect(result.erros).toHaveLength(0);
  });
  
  it('deve rejeitar nome curto', () => {
    const result = validarDuvida({ ...dadosValidos, nome: 'João' });
    expect(result.valido).toBe(false);
    expect(result.erros).toContain('Nome deve ter pelo menos 5 caracteres');
  });
  
  it('deve rejectar turma inválida', () => {
    const result = validarDuvida({ ...dadosValidos, turma: '5º Ano A' });
    expect(result.valido).toBe(false);
    expect(result.erros).toContain('Selecione uma turma válida');
  });
  
  it('deve rejeitar ano inválido', () => {
    const result = validarDuvida({ ...dadosValidos, ano: '26' });
    expect(result.valido).toBe(false);
  });
  
  it('deve rejeitar dúvida curta', () => {
    const result = validarDuvida({ ...dadosValidos, duvida: '?' });
    expect(result.valido).toBe(false);
  });
  
  it('deve rechazar XSS no nome', () => {
    const result = validarDuvida({ ...dadosValidos, nome: '<script>alert(1)</script>' });
    expect(result.valido).toBe(false);
    expect(result.erros).toContain('Nome contém caracteres não permitidos');
  });
  
  it('deve retornar dados limpos', () => {
    const result = validarDuvida(dadosValidos);
    expect(result.dadosLimpos).not.toBeNull();
    expect(result.dadosLimpos.nome).toBe('João Silva');
  });
});

describe('Validação de Projeto', () => {
  const dadosValidos = {
    nomeAluno: 'Maria Santos',
    turma: '8º Ano A',
    ano: '8',
    trimestre: '1',
    tipoProjeto: 'feira',
    titulo: 'Meu Projeto',
    descricao: 'Descrição do meu projeto de empreendedorismo'
  };
  
  it('deve aceitar projeto válido', () => {
    const result = validarProjeto(dadosValidos);
    expect(result.valido).toBe(true);
  });
  
  it('deve rejeitar nome curto', () => {
    const result = validarProjeto({ ...dadosValidos, nomeAluno: 'Ana' });
    expect(result.valido).toBe(false);
  });
  
  it('deve rejeitar turma inválida', () => {
    const result = validarProjeto({ ...dadosValidos, turma: '5º Ano A' });
    expect(result.valido).toBe(false);
  });
  
  it('deve rejeitar ano inválido', () => {
    const result = validarProjeto({ ...dadosValidos, ano: '10' });
    expect(result.valido).toBe(false);
  });
  
  it('deve rejeitar trimestre inválido', () => {
    const result = validarProjeto({ ...dadosValidos, trimestre: '4' });
    expect(result.valido).toBe(false);
  });
  
  it('deve rechazar XSS no título', () => {
    const result = validarProjeto({ ...dadosValidos, titulo: '<img onerror=1>' });
    expect(result.valido).toBe(false);
  });
});