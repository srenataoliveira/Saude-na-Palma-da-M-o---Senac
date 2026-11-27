// Testa a chave do Gemini e o formato da API, SEM precisar do banco.
//
// Uso:
//   1. Coloque GEMINI_API_KEY no seu .env
//   2. node scripts/testar-ia.js
//
// O que ele faz:
//   - lê a configuração do config/ia.js (o mesmo código que a API usa)
//   - manda uma pergunta simples pedindo a mesma estrutura JSON da triagem
//   - mostra a resposta crua e o JSON interpretado
//
// Se este script funciona, a chave, o modelo e o formato estão certos.

require('dotenv').config();

const { obterProvedor, resumoConfiguracao } = require('../config/ia');

function linha() {
  console.log('─'.repeat(64));
}

async function main() {
  console.log('');
  linha();
  console.log('TESTE DA CHAVE DE IA');
  linha();
  console.log('Configuração:', resumoConfiguracao());
  console.log('');

  let config;

  try {
    config = obterProvedor();
  } catch (erro) {
    console.error('✗ Não foi possível configurar o provedor.');
    console.error('  Motivo:', erro.message);
    console.error('');
    console.error('  O que fazer:');
    console.error('    1. Abra o .env na raiz do backend');
    console.error('    2. Confira se existe a linha:  GEMINI_API_KEY=AIza...');
    console.error('    3. Confira se não há espaço nem aspas em volta do valor');
    console.error('');
    process.exit(1);
  }

  console.log('Provedor :', config.nome);
  console.log('Modelo   :', config.modelo);
  console.log('URL      :', config.url);
  console.log('Timeout  :', config.timeoutMs, 'ms');
  console.log('');

  // Prompt mínimo, mas no MESMO formato que a triagem usa.
  const prompt = [
    'Você é um assistente de pré-triagem de uma clínica no Brasil.',
    'Sugira especialidades para o relato abaixo, usando SOMENTE a lista.',
    '',
    'ESPECIALIDADES DISPONÍVEIS:',
    '- Cardiologia (id: id-cardio)',
    '- Clínica Geral (id: id-clinica)',
    '- Otorrino (id: id-otorrino)',
    '',
    'DADOS DO PACIENTE:',
    '- Descrição: tosse seca e febre há 3 dias',
    '- Intensidade informada: 6 de 10',
    '',
    'Responda SOMENTE com JSON no formato:',
    '{"especialidades":[{"id":"","nome":"","confianca":0.0}],"justificativa":""}'
  ].join('\n');

  const corpo = {
    systemInstruction: {
      parts: [{ text: 'Você responde apenas com JSON válido. Nunca dá diagnóstico médico.' }]
    },
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 300,
      responseMimeType: 'application/json',
      responseSchema: require('../config/ia').ESQUEMA_RESPOSTA
    }
  };

  console.log('Enviando...');
  const inicio = Date.now();

  const controlador = new AbortController();
  const timer = setTimeout(() => controlador.abort(), config.timeoutMs);

  let resposta;
  let texto;

  try {
    resposta = await fetch(config.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': config.chave
      },
      body: JSON.stringify(corpo),
      signal: controlador.signal
    });
  } catch (erro) {
    clearTimeout(timer);
    console.error('');
    console.error('✗ Não consegui falar com o provedor.');
    console.error('  Motivo:', erro.message);
    console.error('');
    console.error('  Causas comuns:');
    console.error('    - sem internet');
    console.error('    - firewall/proxy bloqueando a saída');
    console.error('    - o provedor demorou mais que o timeout');
    process.exit(1);
  }

  clearTimeout(timer);
  const duracao = Date.now() - inicio;

  console.log('HTTP', resposta.status, '|', duracao, 'ms');
  console.log('');

  const bruto = await resposta.text();

  if (!resposta.ok) {
    console.error('✗ O provedor recusou a requisição.');
    console.error('');
    console.error('Resposta:', bruto.slice(0, 600));
    console.error('');
    console.error('  Se o status for 400:');
    console.error('    - a chave pode estar incorreta ou com espaço sobrando');
    console.error('  Se for 403:');
    console.error('    - a chave existe, mas não tem permissão (ou a API não está ativada)');
    console.error('  Se for 404:');
    console.error('    - o modelo "' + config.modelo + '" não existe para esta chave.');
    console.error('      Tente IA_MODELO=gemini-3.5-flash-lite no .env');
    console.error('  Se for 429:');
    console.error('    - estourou a cota gratuita. Espere um pouco ou troque o modelo');
    console.error('      para gemini-3.5-flash-lite');
    process.exit(1);
  }

  let dados;

  try {
    dados = JSON.parse(bruto);
  } catch (erro) {
    console.error('✗ O provedor respondeu, mas não em JSON.');
    console.error('Resposta:', bruto.slice(0, 300));
    process.exit(1);
  }

  texto = dados?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') || '';

  if (!texto) {
    console.error('✗ O provedor respondeu, mas sem conteúdo.');
    console.error('');
    if (dados?.candidates?.[0]?.finishReason) {
      console.error('finishReason:', dados.candidates[0].finishReason);
    }
    if (dados?.promptFeedback) {
      console.error('promptFeedback:', JSON.stringify(dados.promptFeedback));
    }
    console.error('');
    console.error('  Isso costuma ser bloqueio de segurança do modelo.');
    console.error('  Tente de novo; se repetir, use outro modelo.');
    process.exit(1);
  }

  console.log('RESPOSTA CRUA DO MODELO:');
  console.log(texto);
  console.log('');

  let json;

  try {
    json = JSON.parse(texto);
  } catch (erro) {
    console.error('✗ Veio conteúdo, mas não é JSON parseável.');
    console.error('  Isso não deveria acontecer com responseSchema ativo.');
    process.exit(1);
  }

  console.log('JSON INTERPRETADO:');
  console.log(JSON.stringify(json, null, 2));
  console.log('');

  // Confere o que o nosso validarRecomendacoes faria com essa resposta.
  const validas = new Set(['id-cardio', 'id-clinica', 'id-otorrino']);
  const aceitas = (json.especialidades || []).filter((e) => validas.has(e.id));
  const descartadas = (json.especialidades || []).filter((e) => !validas.has(e.id));

  console.log('VALIDADO CONTRA O BANCO:');
  console.log('  aceitas   :', aceitas.map((e) => e.nome).join(', ') || '(nenhuma)');
  if (descartadas.length) {
    console.log('  descartadas:', descartadas.map((e) => e.nome || e.id).join(', '));
    console.log('  (isso é normal: a IA pode sugerir algo fora da lista)');
  }
  console.log('');

  linha();
  if (aceitas.length > 0) {
    console.log('✓ TUDO CERTO. A chave funciona, o modelo respondeu e devolveu');
    console.log('  especialidade válida. Pode seguir para a próxima tarefa.');
  } else {
    console.log('~ A CHAVE FUNCIONA, mas o modelo não devolveu especialidade da lista.');
    console.log('  Rode de novo. Se repetir, me mostre a saída inteira.');
  }
  linha();
  console.log('');
}

main().catch((erro) => {
  console.error('');
  console.error('✗ Erro inesperado:', erro.message);
  console.error(erro.stack);
  process.exit(1);
});
