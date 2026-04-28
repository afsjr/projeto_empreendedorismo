// ========================================
// TESTES - NOVA LIBRARY VALIDATION
// Empreendedores CSM
// ========================================
import { describe, it, expect } from 'vitest'

// Carregar a library no contexto Node
global.window = global.window || {}
global.Validacao = null

// Copiar a logic da library para teste
const XSSDetector = () => ({
    patterns: [
        /<script/i, /javascript\s*:/i, /on\w+\s*=/i,
        /<img[^>]+onerror/i, /<svg[^>]+onload/i, /<iframe/i,
        /<object/i, /<embed/i, /<form/i,
        /<input[^>]+type\s*=\s*["']?file/i, /eval\s*\(/i,
        /document\s*\.\s*cookie/i, /window\s*\.\s*location/i,
        /document\s*\.\s*write/i
    ],
    detect(texto) {
        if (!texto) return false
        return this.patterns.some(p => p.test(texto))
    }
})

const sanitizeHTML = (texto) => {
    if (!texto) return ''
    return texto.replace(/<[^>]*>/g, '').trim()
}

const turmasValidas = ['6º Ano A', '6º Ano B', '7º Ano A', '7º Ano B', '8º Ano A', '8º Ano B', '9º Ano A', '9º Ano B']

function validarDuvida(dados) {
    const erros = []
    
    if (!dados.nome || dados.nome.trim().length < 5) erros.push('Nome deve ter pelo menos 5 caracteres')
    if (dados.nome && dados.nome.trim().length > 100) erros.push('Nome deve ter no máximo 100 caracteres')
    if (!dados.turma || !turmasValidas.includes(dados.turma)) erros.push('Selecione uma turma válida')
    if (!dados.ano || !/^\d{4}$/.test(dados.ano)) erros.push('Ano inválido')
    if (!dados.aula || dados.aula.trim().length < 3) erros.push('Informe sobre qual aula é a dúvida')
    if (!dados.duvida || dados.duvida.trim().length < 10) erros.push('Dúvida deve ter pelo menos 10 caracteres')
    if (dados.duvida && dados.duvida.trim().length > 2000) erros.push('Dúvida muito longa')
    
    if (dados.nome && XSSDetector().detect(dados.nome)) erros.push('Nome contém caracteres não permitidos')
    if (dados.duvida && XSSDetector().detect(dados.duvida)) erros.push('Dúvida contém caracteres não permitidos')
    
    return {
        valido: erros.length === 0,
        erros,
        dadosLimpos: erros.length === 0 ? {
            nome: sanitizeHTML(dados.nome?.trim()),
            turma: dados.turma,
            ano: dados.ano,
            aula: sanitizeHTML(dados.aula?.trim()),
            duvida: sanitizeHTML(dados.duvida?.trim())
        } : null
    }
}

function validarProjeto(dados) {
    const erros = []
    const tiposValidos = ['pitch', 'canvas', 'mvp', 'projeto_final', 'feira', 'consultoria', 'hackathon']
    
    if (!dados.nomeAluno || dados.nomeAluno.trim().length < 5) erros.push('Nome deve ter pelo menos 5 caracteres')
    if (!dados.turma || !turmasValidas.includes(dados.turma)) erros.push('Selecione uma turma válida')
    if (!dados.ano || !/^\d{4}$/.test(dados.ano)) erros.push('Ano inválido')
    if (!dados.trimestre || !['1º Trimestre', '2º Trimestre', '3º Trimestre'].includes(dados.trimestre)) erros.push('Trimestre inválido')
    if (!dados.tipoProjeto || !tiposValidos.includes(dados.tipoProjeto)) erros.push('Tipo de projeto inválido')
    if (!dados.titulo || dados.titulo.trim().length < 5) erros.push('Título deve ter pelo menos 5 caracteres')
    if (dados.titulo && dados.titulo.trim().length > 200) erros.push('Título muito longo')
    
    if (dados.nomeAluno && XSSDetector().detect(dados.nomeAluno)) erros.push('Nome contém caracteres não permitidos')
    
    return {
        valido: erros.length === 0,
        erros,
        dadosLimpos: erros.length === 0 ? {
            nomeAluno: sanitizeHTML(dados.nomeAluno?.trim()),
            turma: dados.turma,
            ano: dados.ano,
            trimestre: dados.trimestre,
            tipoProjeto: dados.tipoProjeto,
            titulo: sanitizeHTML(dados.titulo?.trim()),
            descricao: sanitizeHTML(dados.descricao?.trim())
        } : null
    }
}

// ========================================
// TESTES
// ========================================

describe('XSS Detection', () => {
    const detect = XSSDetector().detect.bind(XSSDetector())
    
    it('detecta script tag', () => {
        expect(detect('<script>alert(1)</script>')).toBe(true)
    })
    
    it('detecta event handler', () => {
        expect(detect('<img onerror="alert(1)">')).toBe(true)
    })
    
    it('detecta javascript protocol', () => {
        expect(detect('javascript:alert(1)')).toBe(true)
    })
    
    it('aceita texto seguro', () => {
        expect(detect('Olá mundo!')).toBe(false)
    })
})

describe('Sanitization', () => {
    it('remove tags HTML', () => {
        expect(sanitizeHTML('<b>texto</b>')).toBe('texto')
    })
    
    it('trata null/empty', () => {
        expect(sanitizeHTML(null)).toBe('')
        expect(sanitizeHTML('')).toBe('')
    })
})

describe('Validação de Dúvida', () => {
    const dadosValidos = {
        nome: 'João Silva',
        turma: '7º Ano A',
        ano: '2026',
        aula: 'Empreendedorismo',
        duvida: 'Como criar um negócio?'
    }
    
    it('aceita dúvida válida', () => {
        const result = validarDuvida(dadosValidos)
        expect(result.valido).toBe(true)
    })
    
    it('rejeita nome curto', () => {
        const result = validarDuvida({ ...dadosValidos, nome: 'João' })
        expect(result.valido).toBe(false)
    })
    
    it('rejeita turma inválida', () => {
        const result = validarDuvida({ ...dadosValidos, turma: '5º Ano A' })
        expect(result.valido).toBe(false)
    })
    
    it('rejeita XSS no nome', () => {
        const result = validarDuvida({ ...dadosValidos, nome: '<script>alert(1)</script>' })
        expect(result.valido).toBe(false)
    })
})

describe('Validação de Projeto', () => {
    const dadosValidos = {
        nomeAluno: 'Maria Santos',
        turma: '8º Ano A',
        ano: '2026',
        trimestre: '1º Trimestre',
        tipoProjeto: 'pitch',
        titulo: 'Meu Projeto',
        descricao: 'Descrição do projeto'
    }
    
    it('aceita projeto válido', () => {
        const result = validarProjeto(dadosValidos)
        expect(result.valido).toBe(true)
    })
    
    it('rejeita nome curto', () => {
        const result = validarProjeto({ ...dadosValidos, nomeAluno: 'Ana' })
        expect(result.valido).toBe(false)
    })
    
    it('rejeita tipo inválido', () => {
        const result = validarProjeto({ ...dadosValidos, tipoProjeto: 'outro' })
        expect(result.valido).toBe(false)
    })
})