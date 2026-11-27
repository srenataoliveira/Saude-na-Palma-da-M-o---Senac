// Teste de integração do iaService SEM chamar IA de verdade.
//
// Subimos um servidor HTTP local que imita a resposta do Gemini. Assim testamos
// o caminho completo: montar prompt -> chamar -> ler -> validar contra o banco.
//
// Isso prova o comportamento antes de ter a chave e sem gastar cota.

const { test, before, after } = require('node:test');
const assert = require('node:assert');
const http = require('node:http');

const ESPECIALIDADES = [
  { id: 'id-cardio', nome: 'Cardiologia', status: true },
  { id: 'id-clinica', nome: 'Clínica Geral', status: true },
  { id: 'id-otorrino', nome: 'Otorrino', status: true }
];

const PERGUNTAS = [
  { id: 'p1', texto_pergunta: 'Você está com tosse?' },
  { id: 'p2', texto_pergunta: 'Você está sentindo falta de ar?' }
];

const RESPOSTAS = [
  { id_pergunta: 'p1', resposta_bool: true },
  { id_pergunta: 'p2', resposta_bool: false }
];

let servidor;
let porta;
let modo = 'ok';          // ok | inventa | lixo | erro500 | lento
let chamadas = 0;
let ultimaRequisicao = null;

function conteudoDoModelo() {
  if (modo === 'ok') {
    return JSON.stringify({
      especialidades: [
        { id: 'id-clinica', nome: 'Clínica Geral', confianca: 0.82 },
        { nome: 'Otorrino', confianca: 0.4 }
      ],
      justificativa: 'Tosse sem falta de ar sugere avaliação clínica geral.'
    });
  }

  if (modo === 'inventa') {
    return JSON.stringify({
      especialidades: [
        { nome: 'Neurologia', confianca: 0.95 },
        { nome: 'Pneumologia', confianca: 0.9 }
      ],
      justificativa: 'Sugestão inexistente no banco.'
    });
  }

  return null;
}

before(async () => {
  servidor = http.createServer((req, res) => {
    chamadas += 1;
    let corpo = '';
    req.on('data', (c) => { corpo += c; });
    req.on('end', () => {
      ultimaRequisicao = { url: req.url, headers: req.headers, corpo };

      if (modo === 'erro500') {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: { message: 'falha do provedor' } }));
      }

      if (modo === 'lento') {
        return; // não responde, para o timeout agir
      }

      const texto = modo === 'lixo' ? 'Desculpe, não consegui analisar.' : conteudoDoModelo();

      // Formato de resposta do Gemini.
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        candidates: [
          { content: { parts: [{ text: texto }], role: 'model' }, finishReason: 'STOP' }
        ]
      }));
    });
  });

  await new Promise((resolve) => {
    servidor.listen(0, '127.0.0.1', () => {
      porta = servidor.address().port;
      resolve();
    });
  });
});

after(() => servidor.close());

function carregarServico() {
  delete require.cache[require.resolve('../services/iaService')];
  delete require.cache[require.resolve('../config/ia')];

  // Gemini é o padrão: apontamos só a baseUrl para o servidor falso.
  process.env.PROVEDOR_IA = 'gemini';
  process.env.GEMINI_API_KEY = 'chave-de-teste';
  process.env.IA_MODELO = 'gemini-2.5-flash';
  process.env.IA_TIMEOUT_MS = '800';
  // O config monta a URL a partir desta base + modelo.
  delete process.env.IA_URL;

  const config = require('../config/ia');
  const original = config.obterProvedor;

  // Injeta a porta do servidor falso sem mexer no código de produção.
  require.cache[require.resolve('../config/ia')].exports.obterProvedor = () => {
    const p = original();
    return { ...p, url: `http://127.0.0.1:${porta}/v1beta/models/${p.modelo}:generateContent` };
  };

  return require('../services/iaService');
}

const ENTRADA = {
  categoria: 'Sintomas respiratórios',
  perguntas: PERGUNTAS,
  respostas: RESPOSTAS,
  especialidades: ESPECIALIDADES,
  descricao: 'tosse seca há alguns dias',
  intensidade: 6,
  duracaoDias: 4
};

test('caminho feliz: devolve recomendação válida e origem "ia"', async () => {
  modo = 'ok';
  const { analisarSintomas } = carregarServico();

  const saida = await analisarSintomas(ENTRADA);

  assert.ok(saida, 'deveria devolver resultado');
  assert.strictEqual(saida.origem, 'ia');
  assert.deepStrictEqual(saida.especialidades.map((e) => e.id), ['id-clinica', 'id-otorrino']);
  assert.ok(saida.aviso.includes('Não é diagnóstico'));
});

test('usa o formato do Gemini: header x-goog-api-key e corpo com contents', async () => {
  modo = 'ok';
  const { analisarSintomas } = carregarServico();
  await analisarSintomas(ENTRADA);

  // Header: Gemini usa x-goog-api-key, NÃO "Authorization: Bearer".
  assert.strictEqual(ultimaRequisicao.headers['x-goog-api-key'], 'chave-de-teste');
  assert.strictEqual(ultimaRequisicao.headers.authorization, undefined,
    'não deve mandar Authorization no Gemini');

  // Corpo: contents[0].parts[0].text, não "messages".
  const corpo = JSON.parse(ultimaRequisicao.corpo);
  assert.ok(Array.isArray(corpo.contents), 'deve ter contents');
  assert.ok(corpo.contents[0].parts[0].text.includes('Cardiologia'), 'o prompt deve ir no parts.text');
  assert.strictEqual(corpo.messages, undefined, 'não deve usar o formato OpenAI');

  // JSON garantido por esquema.
  assert.strictEqual(corpo.generationConfig.responseMimeType, 'application/json');
  assert.ok(corpo.generationConfig.responseSchema, 'deve enviar responseSchema');

  // URL com o modelo.
  assert.ok(ultimaRequisicao.url.includes('gemini-2.5-flash'), 'a URL deve citar o modelo');
});

test('IA inventa especialidade: devolve null para o sistema cair nas regras', async () => {
  modo = 'inventa';
  const { analisarSintomas } = carregarServico();

  const saida = await analisarSintomas(ENTRADA);

  assert.strictEqual(saida, null, 'sem especialidade válida, deve devolver null');
});

test('IA devolve texto sem JSON: devolve null depois de tentar 2x', async () => {
  modo = 'lixo';
  chamadas = 0;
  const { analisarSintomas } = carregarServico();

  const saida = await analisarSintomas(ENTRADA);

  assert.strictEqual(saida, null);
  assert.strictEqual(chamadas, 2, 'deve tentar 2 vezes antes de desistir');
});

test('provedor devolve 500: tenta 2x e devolve null', async () => {
  modo = 'erro500';
  chamadas = 0;
  const { analisarSintomas } = carregarServico();

  const saida = await analisarSintomas(ENTRADA);

  assert.strictEqual(saida, null);
  assert.strictEqual(chamadas, 2);
});

test('provedor demora: o timeout corta e devolve null (não trava a requisição)', async () => {
  modo = 'lento';
  const { analisarSintomas } = carregarServico();

  const inicio = Date.now();
  const saida = await analisarSintomas(ENTRADA);
  const duracao = Date.now() - inicio;

  assert.strictEqual(saida, null);
  assert.ok(duracao < 4000, `deveria cortar em ~1,6s, levou ${duracao}ms`);
});

test('sem GEMINI_API_KEY: devolve null sem nem tentar', async () => {
  delete process.env.GEMINI_API_KEY;
  delete process.env.IA_API_KEY;
  chamadas = 0;

  // Recarrega sem a injeção de URL para exercitar a validação de chave.
  delete require.cache[require.resolve('../services/iaService')];
  delete require.cache[require.resolve('../config/ia')];
  process.env.PROVEDOR_IA = 'gemini';
  const { analisarSintomas } = require('../services/iaService');

  const saida = await analisarSintomas(ENTRADA);

  assert.strictEqual(saida, null);
  assert.strictEqual(chamadas, 0, 'não deve chamar o provedor sem chave');
});

test('sem especialidade ativa no banco: devolve null sem chamar a IA', async () => {
  chamadas = 0;
  const { analisarSintomas } = carregarServico();

  const saida = await analisarSintomas({ ...ENTRADA, especialidades: [] });

  assert.strictEqual(saida, null);
  assert.strictEqual(chamadas, 0);
});
