// ========================================
// UNIT TESTS - Data Validation
// Empreendedores Exponenciais - CSM
// ========================================
// Run these tests in browser console or Node.js
// Usage: Open this file in browser with validacao-dados.js loaded
// Or run with: node test-validacao.js (requires mock setup)
// ========================================

(function() {
  'use strict';

  let passed = 0;
  let failed = 0;
  const results = [];

  function assert(condition, message) {
    if (condition) {
      passed++;
      results.push({ status: '✅ PASS', message });
      console.log(`✅ PASS: ${message}`);
    } else {
      failed++;
      results.push({ status: '❌ FAIL', message });
      console.error(`❌ FAIL: ${message}`);
    }
  }

  function section(name) {
    console.log(`\n${'='.repeat(50)}`);
    console.log(`📋 ${name}`);
    console.log('='.repeat(50));
  }

  // ========================================
  // TESTS FOR: detectarXSS
  // ========================================
  section('detectarXSS - XSS Detection');

  assert(
    typeof detectarXSS === 'function',
    'detectarXSS function should exist'
  );

  assert(
    detectarXSS('<script>alert("xss")</script>') === true,
    'Should detect <script> tag'
  );

  assert(
    detectarXSS('javascript:alert(1)') === true,
    'Should detect javascript: protocol'
  );

  assert(
    detectarXSS('<img onerror="alert(1)" src=x>') === true,
    'Should detect onerror event handler'
  );

  assert(
    detectarXSS('<svg onload="alert(1)">') === true,
    'Should detect svg onload'
  );

  assert(
    detectarXSS('<iframe src="evil.com">') === true,
    'Should detect iframe'
  );

  assert(
    detectarXSS('<object data="evil.com">') === true,
    'Should detect object tag'
  );

  assert(
    detectarXSS('<embed src="evil.com">') === true,
    'Should detect embed tag'
  );

  assert(
    detectarXSS('<form action="evil.com">') === true,
    'Should detect form tag'
  );

  assert(
    detectarXSS('eval("malicious")') === true,
    'Should detect eval()'
  );

  assert(
    detectarXSS('document.cookie') === true,
    'Should detect document.cookie'
  );

  assert(
    detectarXSS('window.location') === true,
    'Should detect window.location'
  );

  assert(
    detectarXSS('document.write("x")') === true,
    'Should detect document.write'
  );

  assert(
    detectarXSS('Texto normal sem XSS') === false,
    'Should return false for clean text'
  );

  assert(
    detectarXSS('Olá, meu nome é João') === false,
    'Should return false for regular names'
  );

  assert(
    detectarXSS('') === false,
    'Should return false for empty string'
  );

  assert(
    detectarXSS(null) === false,
    'Should return false for null'
  );

  assert(
    detectarXSS(undefined) === false,
    'Should return false for undefined'
  );

  // ========================================
  // TESTS FOR: sanitizeHTML
  // ========================================
  section('sanitizeHTML - HTML Sanitization');

  assert(
    typeof sanitizeHTML === 'function',
    'sanitizeHTML function should exist'
  );

  assert(
    sanitizeHTML('<script>alert(1)</script>') === 'alert(1)',
    'Should remove <script> tags'
  );

  assert(
    sanitizeHTML('<b>negrito</b>') === 'negrito',
    'Should remove <b> tags'
  );

  assert(
    sanitizeHTML('<div>texto</div>') === 'texto',
    'Should remove <div> tags'
  );

  assert(
    sanitizeHTML('Texto <i>italico</i> aqui') === 'Texto italico aqui',
    'Should remove tags but keep text'
  );

  assert(
    sanitizeHTML('   trim me   ') === 'trim me',
    'Should trim whitespace'
  );

  assert(
    sanitizeHTML('') === '',
    'Should return empty for empty string'
  );

  assert(
    sanitizeHTML(null) === '',
    'Should return empty for null'
  );

  assert(
    sanitizeHTML('Texto sem tags') === 'Texto sem tags',
    'Should keep clean text unchanged'
  );

  // ========================================
  // TESTS FOR: validarDuvida
  // ========================================
  section('validarDuvida - Doubt Validation');

  assert(
    typeof validarDuvida === 'function',
    'validarDuvida function should exist'
  );

  // Test: Valid data
  const duvidaValida = {
    nome: 'João Silva',
    turma: '6º Ano A',
    ano: '2026',
    aula: 'Aula 5 - Empreendedorismo',
    duvida: 'Como identificar oportunidades de negócio?'
  };

  const resultValid = validarDuvida(duvidaValida);
  assert(
    resultValid.valido === true,
    'Valid doubt should pass validation'
  );
  assert(
    resultValid.dadosLimpos !== null,
    'Valid doubt should return cleaned data'
  );

  // Test: Nome curto
  const resultNomeCurto = validarDuvida({ ...duvidaValida, nome: 'Jo' });
  assert(
    resultNomeCurto.valido === false,
    'Should reject short name (< 5 chars)'
  );

  // Test: Turma inválida
  const resultTurmaInvalida = validarDuvida({ ...duvidaValida, turma: '10º Ano C' });
  assert(
    resultTurmaInvalida.valido === false,
    'Should reject invalid class'
  );

  // Test: Ano inválido
  const resultAnoInvalido = validarDuvida({ ...duvidaValida, ano: '26' });
  assert(
    resultAnoInvalido.valido === false,
    'Should reject invalid year (not 4 digits)'
  );

  // Test: Dúvida curta
  const resultDuvidaCurta = validarDuvida({ ...duvidaValida, duvida: 'Curta' });
  assert(
    resultDuvidaCurta.valido === false,
    'Should reject short doubt (< 10 chars)'
  );

  // Test: XSS in doubt
  const resultXSS = validarDuvida({ ...duvidaValida, duvida: '<script>alert(1)</script>' });
  assert(
    resultXSS.valido === false,
    'Should reject doubt with XSS payload'
  );

  // ========================================
  // TESTS FOR: validarProjeto
  // ========================================
  section('validarProjeto - Project Validation');

  assert(
    typeof validarProjeto === 'function',
    'validarProjeto function should exist'
  );

  const projetoValido = {
    nomeAluno: 'Maria Oliveira',
    turma: '7º Ano A',
    ano: '2026',
    trimestre: '1º Trimestre',
    tipoProjeto: 'pitch',
    titulo: 'App de Caronas Solidárias',
    descricao: 'Um aplicativo para conectar alunos...'
  };

  const resultProjetoValid = validarProjeto(projetoValido);
  assert(
    resultProjetoValid.valido === true,
    'Valid project should pass validation'
  );

  // Test: Tipo inválido
  const resultTipoInvalido = validarProjeto({ ...projetoValido, tipoProjeto: 'invalido' });
  assert(
    resultTipoInvalido.valido === false,
    'Should reject invalid project type'
  );

  // Test: Trimestre inválido
  const resultTrimestreInvalido = validarProjeto({ ...projetoValido, trimestre: '4º Trimestre' });
  assert(
    resultTrimestreInvalido.valido === false,
    'Should reject invalid trimester'
  );

  // Test: Título curto
  const resultTituloCurto = validarProjeto({ ...projetoValido, titulo: 'Curto' });
  assert(
    resultTituloCurto.valido === false,
    'Should reject short title (< 5 chars)'
  );

  // ========================================
  // TESTS FOR: validarConquista
  // ========================================
  section('validarConquista - Achievement Validation');

  assert(
    typeof validarConquista === 'function',
    'validarConquista function should exist'
  );

  const conquistaValida = {
    nomeAluno: 'Carlos Santos',
    turma: '8º Ano A',
    ano: '2026',
    titulo: 'Líder Inspirador',
    descricao: 'Demonstrou excelente liderança',
    pontos: 50
  };

  const resultConquistaValid = validarConquista(conquistaValida);
  assert(
    resultConquistaValid.valido === true,
    'Valid achievement should pass validation'
  );

  // Test: Pontos inválidos
  const resultPontosInvalidos = validarConquista({ ...conquistaValida, pontos: 1500 });
  assert(
    resultPontosInvalidos.valido === false,
    'Should reject points > 1000'
  );

  const resultPontosNegativos = validarConquista({ ...conquistaValida, pontos: -10 });
  assert(
    resultPontosNegativos.valido === false,
    'Should reject negative points'
  );

  // ========================================
  // TESTS FOR: validarResposta
  // ========================================
  section('validarResposta - Answer Validation');

  assert(
    typeof validarResposta === 'function',
    'validarResposta function should exist'
  );

  const respostaValida = {
    resposta: 'Ótima pergunta! Para identificar oportunidades...',
    professorNome: 'Prof. Adelino'
  };

  const resultRespostaValid = validarResposta(respostaValida);
  assert(
    resultRespostaValid.valido === true,
    'Valid answer should pass validation'
  );

  // Test: Resposta curta
  const resultRespostaCurta = validarResposta({ ...respostaValida, resposta: 'Curta' });
  assert(
    resultRespostaCurta.valido === false,
    'Should reject short answer (< 10 chars)'
  );

  // ========================================
  // TESTS FOR: validarAvaliacao
  // ========================================
  section('validarAvaliacao - Evaluation Validation');

  assert(
    typeof validarAvaliacao === 'function',
    'validarAvaliacao function should exist'
  );

  const avaliacaoValida = {
    nota: 85.5,
    feedback: 'Excelente trabalho, continue assim!',
    professorNome: 'Prof. Maria'
  };

  const resultAvaliacaoValid = validarAvaliacao(avaliacaoValida);
  assert(
    resultAvaliacaoValid.valido === true,
    'Valid evaluation should pass validation'
  );

  // Test: Nota inválida (> 100)
  const resultNotaAlta = validarAvaliacao({ ...avaliacaoValida, nota: 150 });
  assert(
    resultNotaAlta.valido === false,
    'Should reject grade > 100'
  );

  // Test: Nota negativa
  const resultNotaBaixa = validarAvaliacao({ ...avaliacaoValida, nota: -10 });
  assert(
    resultNotaBaixa.valido === false,
    'Should reject negative grade'
  );

  // Test: Nota NaN
  const resultNotaNaN = validarAvaliacao({ ...avaliacaoValida, nota: 'abc' });
  assert(
    resultNotaNaN.valido === false,
    'Should reject non-numeric grade'
  );

  // ========================================
  // TESTS FOR: exibirErros / exibirSucesso
  // ========================================
  section('exibirErros / exibirSucesso - UI Functions');

  assert(
    typeof exibirErros === 'function',
    'exibirErros function should exist'
  );

  assert(
    typeof exibirSucesso === 'function',
    'exibirSucesso function should exist'
  );

  // ========================================
  // SUMMARY
  // ========================================
  console.log('\n' + '='.repeat(50));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(50));
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Total: ${passed + failed}`);
  console.log(`🎯 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
  console.log('='.repeat(50));

  // Expose results for programmatic access
  window.TestResults = {
    passed,
    failed,
    total: passed + failed,
    successRate: ((passed / (passed + failed)) * 100).toFixed(1),
    details: results
  };

  if (failed === 0) {
    console.log('\n🎉 All tests passed!');
  } else {
    console.log(`\n⚠️ ${failed} test(s) failed. Check the output above.`);
  }

})();
