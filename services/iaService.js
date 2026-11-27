// Serviço de IA para a pré-triagem (Desafila).
//
// O QUE ESTE ARQUIVO FAZ
//   1. Monta o prompt com o contexto do paciente E com a lista real de
//      especialidades que existem no banco.
//   2. Chama o provedor de IA (Groq ou OpenAI) com timeout e 1 retry.
//   3. Lê a resposta em JSON e VALIDA contra a tabela de especialidades.
//      Se a IA inventar uma especialidade que não existe, ela é descartada.
//   4. Se qualquer coisa falhar, devolve null — quem chama cai para as regras.
//
// O QUE ESTE ARQUIVO NÃO FAZ
//   - Não decide sozinho: nunca devolve especialidade fora da lista do banco.
//   - Não faz diagnóstico. A palavra "diagnóstico" nunca aparece na saída.

const { obterProvedor, ESQUEMA_RESPOSTA } = require('../config/ia');

const MAX_TENTATIVAS = 2;
const LIMITE_TEXTO = 500;

function limparTexto(valor, limite = LIMITE_TEXTO) {
  return String(valor || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, limite);
}

// Remove acento e caixa alta para comparar nomes ("Clínica Geral" == "clinica geral").
function normalizarNome(nome) {
  return String(nome || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function montarSintomas(respostas, perguntas) {
  if (!Array.isArray(respostas) || respostas.length === 0) return [];

  const perguntaPorId = new Map(
    (perguntas || []).map((p) => [p.id, p])
  );

  const descritos = [];

  respostas.forEach((resposta) => {
    const pergunta = perguntaPorId.get(resposta.id_pergunta);
    if (!pergunta) return;

    const texto = limparTexto(pergunta.texto_pergunta, 200);

    if (typeof resposta.resposta_bool === 'boolean') {
      if (resposta.resposta_bool) descritos.push(texto);
    } else if (resposta.resposta_texto) {
      descritos.push(`${texto} ${limparTexto(resposta.resposta_texto, 100)}`);
    }
  });

  return descritos;
}

function montarPrompt({ categoria, sintomas, descricao, intensidade, duracaoDias, especialidades }) {
  const lista = especialidades
    .map((e) => `- ${e.nome} (id: ${e.id})`)
    .join('\n');

  const linhas = [];

  linhas.push('Você é um assistente de pré-triagem de uma clínica no Brasil.');
  linhas.push('Sua tarefa é sugerir QUAL ESPECIALIDADE médica o paciente deve procurar.');
  linhas.push('');
  linhas.push('REGRAS OBRIGATÓRIAS:');
  linhas.push('1. Escolha entre 1 e 3 especialidades, SOMENTE da lista abaixo.');
  linhas.push('2. Use exatamente o nome e o id como aparecem na lista.');
  linhas.push('3. Nunca invente especialidade que não esteja na lista.');
  linhas.push('4. Não dê diagnóstico, não cite doenças e não prescreva nada.');
  linhas.push('5. Responda SOMENTE com JSON válido, sem texto antes ou depois.');
  linhas.push('');
  linhas.push('ESPECIALIDADES DISPONÍVEIS:');
  linhas.push(lista);
  linhas.push('');
  linhas.push('DADOS DO PACIENTE:');
  if (categoria) linhas.push(`- Categoria relatada: ${limparTexto(categoria, 120)}`);
  if (sintomas.length) linhas.push(`- Sintomas marcados: ${sintomas.join('; ')}`);
  if (descricao) linhas.push(`- Descrição do paciente: ${limparTexto(descricao)}`);
  if (intensidade !== null && intensidade !== undefined) {
    linhas.push(`- Intensidade informada: ${intensidade} de 10`);
  }
  if (duracaoDias !== null && duracaoDias !== undefined) {
    linhas.push(`- Duração: ${duracaoDias} dia(s)`);
  }
  linhas.push('');
  linhas.push('FORMATO DA RESPOSTA (JSON):');
  linhas.push('{"especialidades":[{"id":"<id da lista>","nome":"<nome da lista>","confianca":0.0}],"justificativa":"<1 frase curta>"}');

  return linhas.join('\n');
}

const INSTRUCAO_SISTEMA =
  'Você responde apenas com JSON válido. Nunca dá diagnóstico médico.';

// Google Gemini: endpoint, header e corpo são DIFERENTES do padrão OpenAI.
//   header:  x-goog-api-key
//   corpo:   { contents: [{ parts: [{ text }] }], generationConfig: {...} }
//   resposta: candidates[0].content.parts[0].text
function requisicaoGemini(prompt, config) {
  return {
    url: config.url,
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': config.chave
    },
    corpo: {
      systemInstruction: { parts: [{ text: INSTRUCAO_SISTEMA }] },
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.2,       // baixo: queremos consistência, não criatividade
        maxOutputTokens: 500,
        responseMimeType: 'application/json',
        responseSchema: ESQUEMA_RESPOSTA
      }
    },
    extrair: (dados) =>
      dados?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') || ''
  };
}

// Groq e OpenAI: mesmo formato entre si (chat/completions).
function requisicaoOpenAI(prompt, config) {
  return {
    url: config.url,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.chave}`
    },
    corpo: {
      model: config.modelo,
      temperature: 0.2,
      max_tokens: 400,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: INSTRUCAO_SISTEMA },
        { role: 'user', content: prompt }
      ]
    },
    extrair: (dados) => dados?.choices?.[0]?.message?.content || ''
  };
}

async function chamarProvedor(prompt, config) {
  const controlador = new AbortController();
  const timeout = setTimeout(() => controlador.abort(), config.timeoutMs);

  const montar =
    config.formato === 'gemini' ? requisicaoGemini : requisicaoOpenAI;
  const { url, headers, corpo, extrair } = montar(prompt, config);

  try {
    const resposta = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(corpo),
      signal: controlador.signal
    });

    if (!resposta.ok) {
      const detalhe = await resposta.text().catch(() => '');
      // Log sem a chave e sem o prompt completo.
      console.error('IA respondeu com erro HTTP', resposta.status, detalhe.slice(0, 200));
      throw new Error(`Provedor de IA respondeu ${resposta.status}`);
    }

    const dados = await resposta.json();
    return extrair(dados);
  } finally {
    clearTimeout(timeout);
  }
}

// A IA pode devolver o JSON dentro de ```json ... ```. Isso limpa.
function extrairJson(texto) {
  if (!texto) return null;

  const semCerca = String(texto)
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim();

  const inicio = semCerca.indexOf('{');
  const fim = semCerca.lastIndexOf('}');
  if (inicio === -1 || fim === -1 || fim <= inicio) return null;

  try {
    return JSON.parse(semCerca.slice(inicio, fim + 1));
  } catch (erro) {
    return null;
  }
}

// ETAPA CRÍTICA: a IA pode inventar. Aqui só passa o que existe no banco.
function validarRecomendacoes(bruto, especialidades) {
  const lista = Array.isArray(bruto?.especialidades) ? bruto.especialidades : [];

  const porId = new Map(especialidades.map((e) => [String(e.id), e]));
  const porNome = new Map(especialidades.map((e) => [normalizarNome(e.nome), e]));

  const vistas = new Set();
  const validas = [];

  for (const item of lista) {
    if (!item) continue;

    const encontrada =
      (item.id && porId.get(String(item.id))) ||
      (item.nome && porNome.get(normalizarNome(item.nome)));

    if (!encontrada) {
      console.warn('IA sugeriu especialidade inexistente e ela foi descartada:', item.nome || item.id);
      continue;
    }

    if (vistas.has(encontrada.id)) continue;
    vistas.add(encontrada.id);

    const confianca = Number(item.confianca);
    validas.push({
      id: encontrada.id,
      nome: encontrada.nome,   // nome sempre o do banco, não o que a IA escreveu
      confianca: Number.isFinite(confianca) ? Math.min(Math.max(confianca, 0), 1) : null
    });

    if (validas.length === 3) break;
  }

  return validas;
}

/**
 * Analisa a pré-triagem e recomenda especialidades.
 *
 * @returns {Promise<null | {especialidades, justificativa, modelo, origem, aviso}>}
 *          null quando a IA não está configurada ou falhou — quem chama usa as regras.
 */
async function analisarSintomas({ categoria, perguntas, respostas, especialidades, descricao, intensidade, duracaoDias }) {
  let config;

  try {
    config = obterProvedor();
  } catch (erro) {
    console.warn('Serviço de IA indisponível:', erro.message);
    return null;
  }

  const disponiveis = (especialidades || []).filter((e) => e && e.status !== false);

  if (disponiveis.length === 0) {
    console.warn('Nenhuma especialidade ativa no banco — a IA não tem entre o que escolher.');
    return null;
  }

  const sintomas = montarSintomas(respostas, perguntas);

  const prompt = montarPrompt({
    categoria,
    sintomas,
    descricao,
    intensidade,
    duracaoDias,
    especialidades: disponiveis
  });

  for (let tentativa = 1; tentativa <= MAX_TENTATIVAS; tentativa += 1) {
    try {
      const bruto = await chamarProvedor(prompt, config);
      const json = extrairJson(bruto);

      if (!json) {
        console.warn(`IA devolveu resposta não interpretável (tentativa ${tentativa}).`);
        continue;
      }

      const recomendadas = validarRecomendacoes(json, disponiveis);

      if (recomendadas.length === 0) {
        console.warn('IA não sugeriu nenhuma especialidade válida.');
        continue;
      }

      return {
        especialidades: recomendadas,
        justificativa: limparTexto(json.justificativa, 240),
        modelo: config.modelo,
        origem: 'ia',
        aviso: 'Recomendação gerada por inteligência artificial como orientação inicial. Não é diagnóstico e não substitui avaliação médica.'
      };
    } catch (erro) {
      console.error(`Falha ao consultar a IA (tentativa ${tentativa}):`, erro.message);
    }
  }

  return null;
}

module.exports = {
  analisarSintomas,
  // exportadas para teste
  montarPrompt,
  montarSintomas,
  validarRecomendacoes,
  extrairJson,
  normalizarNome
};
