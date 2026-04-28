// ========================================
// LIB - VALIDAÇÃO COMPLETA (NO ES MODULES)
// Unifies XSSDetector, Sanitizer, BaseValidator + Validadores
// Para uso direto no browser
// ========================================

(function(global) {
    'use strict';

    // ========================================
    // XSSDetector
    // ========================================
    var XSSDetector = function() {
        this.patterns = [
            { regex: /<script/i, name: 'script tag' },
            { regex: /javascript\s*:/i, name: 'javascript protocol' },
            { regex: /on\w+\s*=/i, name: 'event handler' },
            { regex: /<img[^>]+onerror/i, name: 'img onerror' },
            { regex: /<svg[^>]+onload/i, name: 'svg onload' },
            { regex: /<iframe/i, name: 'iframe' },
            { regex: /<object/i, name: 'object' },
            { regex: /<embed/i, name: 'embed' },
            { regex: /<form/i, name: 'form' },
            { regex: /<input[^>]+type\s*=\s*["']?file/i, name: 'file input' },
            { regex: /eval\s*\(/i, name: 'eval' },
            { regex: /document\s*\.\s*cookie/i, name: 'document.cookie' },
            { regex: /window\s*\.\s*location/i, name: 'window.location' },
            { regex: /document\s*\.\s*write/i, name: 'document.write' }
        ];
    };

    XSSDetector.prototype.detect = function(texto) {
        if (!texto || typeof texto !== 'string') return { safe: true, threats: [] };
        var threats = [];
        for (var i = 0; i < this.patterns.length; i++) {
            if (this.patterns[i].regex.test(texto)) {
                threats.push(this.patterns[i].name);
            }
        }
        return { safe: threats.length === 0, threats: threats };
    };

    XSSDetector.prototype.isSafe = function(texto) {
        return this.detect(texto).safe;
    };

    // ========================================
    // Sanitizer
    // ========================================
    var Sanitizer = function() {
        this.tagRegex = /<[^>]*>/g;
    };

    Sanitizer.prototype.sanitize = function(texto) {
        if (!texto || typeof texto !== 'string') return '';
        return texto.replace(this.tagRegex, '').trim();
    };

    // ========================================
    // BaseValidator
    // ========================================
    var BaseValidator = function(schema) {
        this.schema = schema;
    };

    BaseValidator.prototype.validate = function(dados) {
        var erros = [];
        var limpos = {};

        for (var campo in this.schema) {
            var valor = dados[campo];
            var rules = this.schema[campo];
            
            for (var i = 0; i < rules.length; i++) {
                var erro = this._applyRule(campo, valor, rules[i]);
                if (erro) erros.push(erro);
            }
        }

        if (erros.length === 0) {
            for (var key in dados) {
                limpos[key] = dados[key];
            }
        }

        return {
            valido: erros.length === 0,
            erros: erros,
            dadosLimpos: erros.length === 0 ? limpos : null
        };
    };

    BaseValidator.prototype._applyRule = function(campo, valor, rule) {
        switch (rule.type) {
            case 'required':
                if (!valor || (typeof valor === 'string' && !valor.trim())) {
                    return (rule.label || campo) + ' é obrigatório';
                }
                break;
            case 'minLength':
                if (valor && valor.trim().length < rule.value) {
                    return (rule.label || campo) + ' deve ter pelo menos ' + rule.value + ' caracteres';
                }
                break;
            case 'maxLength':
                if (valor && valor.trim().length > rule.value) {
                    return (rule.label || campo) + ' muito longo (máx. ' + rule.value + ')';
                }
                break;
            case 'pattern':
                if (valor && !rule.value.test(valor)) {
                    return rule.message || (rule.label || campo) + ' inválido';
                }
                break;
            case 'oneOf':
                if (!rule.value.includes(valor)) {
                    return rule.message || (rule.label || campo) + ' não é válido';
                }
                break;
        }
        return null;
    };

    // ========================================
    // Validadores Específicos
    // ========================================
    var TURMAS_VALIDAS = ['6º Ano A', '6º Ano B', '7º Ano A', '7º Ano B', '8º Ano A', '8º Ano B', '9º Ano A', '9º Ano B'];
    var TIPOS_PROJETO = ['pitch', 'canvas', 'mvp', 'projeto_final', 'feira', 'consultoria', 'hackathon'];

    var createValidator = function(type) {
        var xss = new XSSDetector();
        var sanitizer = new Sanitizer();
        
        var schema = {
            Duvida: {
                nome: [{ type: 'required' }, { type: 'minLength', value: 5 }, { type: 'maxLength', value: 100 }],
                turma: [{ type: 'required' }, { type: 'oneOf', value: TURMAS_VALIDAS }],
                ano: [{ type: 'required' }, { type: 'pattern', value: /^\d{4}$/ }],
                aula: [{ type: 'required' }, { type: 'minLength', value: 3 }, { type: 'maxLength', value: 150 }],
                duvida: [{ type: 'required' }, { type: 'minLength', value: 10 }, { type: 'maxLength', value: 2000 }]
            },
            Projeto: {
                nomeAluno: [{ type: 'required' }, { type: 'minLength', value: 5 }, { type: 'maxLength', value: 100 }],
                turma: [{ type: 'required' }, { type: 'oneOf', value: TURMAS_VALIDAS }],
                ano: [{ type: 'required' }, { type: 'pattern', value: /^\d{4}$/ }],
                trimestre: [{ type: 'required' }, { type: 'oneOf', value: ['1º Trimestre', '2º Trimestre', '3º Trimestre'] }],
                tipoProjeto: [{ type: 'required' }, { type: 'oneOf', value: TIPOS_PROJETO }],
                titulo: [{ type: 'required' }, { type: 'minLength', value: 5 }, { type: 'maxLength', value: 200 }],
                descricao: [{ type: 'maxLength', value: 5000 }]
            },
            Conquista: {
                nomeAluno: [{ type: 'required' }, { type: 'minLength', value: 5 }, { type: 'maxLength', value: 100 }],
                turma: [{ type: 'required' }, { type: 'oneOf', value: TURMAS_VALIDAS }],
                ano: [{ type: 'required' }, { type: 'pattern', value: /^\d{4}$/ }],
                titulo: [{ type: 'required' }, { type: 'minLength', value: 3 }, { type: 'maxLength', value: 100 }],
                descricao: [{ type: 'maxLength', value: 1000 }]
            }
        };

        return function(dados) {
            var validator = new BaseValidator(schema[type]);
            var result = validator.validate(dados);
            
            if (result.valido) {
                var campos = type === 'Duvida' ? [dados.nome, dados.aula, dados.duvida] :
                             type === 'Projeto' ? [dados.nomeAluno, dados.titulo, dados.descricao] :
                             [dados.nomeAluno, dados.titulo, dados.descricao];
                
                var texto = campos.join(' ');
                var xssResult = xss.detect(texto);
                
                if (!xssResult.safe) {
                    result.erros.push('Conteúdo contém caracteres não permitidos');
                    result.valido = false;
                    result.dadosLimpos = null;
                } else {
                    result.dadosLimpos = {};
                    for (var key in dados) {
                        result.dadosLimpos[key] = typeof dados[key] === 'string' ? 
                            sanitizer.sanitize(dados[key]) : dados[key];
                    }
                }
            }
            
            return result;
        };
    };

    // ========================================
    // FACTORY
    // ========================================
    var Validation = {
        validarDuvida: createValidator('Duvida'),
        validarProjeto: createValidator('Projeto'),
        validarConquista: createValidator('Conquista'),
        
        validarResposta: function(dados) {
            var erros = [];
            var sanitizer = new Sanitizer();
            var xss = new XSSDetector();
            
            if (!dados.resposta || dados.resposta.trim().length < 10) {
                erros.push('Resposta deve ter pelo menos 10 caracteres');
            }
            if (dados.resposta && dados.resposta.trim().length > 5000) {
                erros.push('Resposta muito longa');
            }
            if (!dados.professorNome || dados.professorNome.trim().length < 5) {
                erros.push('Nome do professor deve ter pelo menos 5 caracteres');
            }
            
            var xssResult = xss.detect(dados.resposta + ' ' + dados.professorNome);
            if (!xssResult.safe) erros.push('Conteúdo contém caracteres não permitidos');
            
            return {
                valido: erros.length === 0,
                erros: erros,
                dadosLimpos: erros.length === 0 ? {
                    resposta: sanitizer.sanitize(dados.resposta.trim()),
                    professorNome: sanitizer.sanitize(dados.professorNome.trim())
                } : null
            };
        },
        
        validarAvaliacao: function(dados) {
            var erros = [];
            var sanitizer = new Sanitizer();
            var xss = new XSSDetector();
            
            if (dados.nota === undefined || dados.nota === null) {
                erros.push('Nota é obrigatória');
            } else {
                var nota = parseFloat(dados.nota);
                if (isNaN(nota)) {
                    erros.push('Nota deve ser um número');
                } else if (nota < 0 || nota > 100) {
                    erros.push('Nota deve ser entre 0 e 100');
                }
            }
            
            if (dados.feedback && dados.feedback.trim().length > 5000) {
                erros.push('Feedback muito longo');
            }
            if (!dados.professorNome || dados.professorNome.trim().length < 5) {
                erros.push('Nome do professor deve ter pelo menos 5 caracteres');
            }
            
            var xssResult = xss.detect(dados.feedback + ' ' + dados.professorNome);
            if (!xssResult.safe) erros.push('Conteúdo não permitido');
            
            return {
                valido: erros.length === 0,
                erros: erros,
                dadosLimpos: erros.length === 0 ? {
                    nota: parseFloat(dados.nota).toFixed(1),
                    feedback: sanitizer.sanitize((dados.feedback || '').trim()),
                    professorNome: sanitizer.sanitize(dados.professorNome.trim())
                } : null
            };
        }
    };

    // Exportar para janela global
    global.Validacao = Validation;
    console.log('✅ Validation library loaded');

})(window);