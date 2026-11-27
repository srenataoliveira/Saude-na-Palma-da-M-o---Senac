// Testes das funções puras do iaService — não precisam de rede nem de banco.
// Rodar: node --test tests/
//
// O teste que mais importa aqui é "descarta especialidade inventada": é a
// proteção contra a IA sugerir algo que não existe no banco e quebrar o fluxo.

const { test } = require('node:test');
const assert = require('node:assert');

const {
  validarRecomendacoes,
  extrairJson,
  montarSintomas,
  montarPrompt,
  normalizarNome
} = require('../services/iaService');

const ESPECIALIDADES = [
  { id: 'id-cardio', nome: 'Cardiologia', status: true },
  { id: 'id-clinica', nome: 'Clínica Geral', status: true },
  { id: 'id-otorrino', nome: 'Otorrino', status: true }
];

test('aceita especialidade que existe pelo id', () => {
  const saida = validarRecomendacoes(
    { especialidades: [{ id: 'id-cardio', nome: 'Cardiologia', confianca: 0.9 }] },
    ESPECIALIDADES
  );

  assert.strictEqual(saida.length, 1);
  assert.strictEqual(saida[0].id, 'id-cardio');
  assert.strictEqual(saida[0].confianca, 0.9);
});

test('aceita especialidade pelo nome quando a IA erra o id', () => {
  const saida = validarRecomendacoes(
    { especialidades: [{ id: 'id-inventado', nome: 'cardiologia' }] },
    ESPECIALIDADES
  );

  assert.strictEqual(saida.length, 1);
  assert.strictEqual(saida[0].id, 'id-cardio', 'o id devolvido deve ser o do banco');
});

test('aceita nome sem acento e com caixa diferente', () => {
  const saida = validarRecomendacoes(
    { especialidades: [{ nome: 'CLINICA GERAL' }] },
    ESPECIALIDADES
  );

  assert.strictEqual(saida.length, 1);
  assert.strictEqual(saida[0].id, 'id-clinica');
});

test('DESCARTA especialidade que não existe no banco', () => {
  const saida = validarRecomendacoes(
    { especialidades: [{ nome: 'Neurologia' }, { nome: 'Endocrinologia' }] },
    ESPECIALIDADES
  );

  assert.strictEqual(saida.length, 0, 'nenhuma deve passar');
});

test('mantém as válidas e descarta as inventadas na mesma resposta', () => {
  const saida = validarRecomendacoes(
    {
      especialidades: [
        { nome: 'Neurologia' },        // inventada
        { id: 'id-otorrino', nome: 'Otorrino' },
        { nome: 'Cardiologia' }
      ]
    },
    ESPECIALIDADES
  );

  assert.deepStrictEqual(saida.map((e) => e.id), ['id-otorrino', 'id-cardio']);
});

test('não repete a mesma especialidade duas vezes', () => {
  const saida = validarRecomendacoes(
    {
      especialidades: [
        { id: 'id-cardio', nome: 'Cardiologia' },
        { id: 'id-cardio', nome: 'Cardiologia' }
      ]
    },
    ESPECIALIDADES
  );

  assert.strictEqual(saida.length, 1);
});

test('limita a no máximo 3 especialidades', () => {
  const muitas = [
    { nome: 'Cardiologia' },
    { nome: 'Clínica Geral' },
    { nome: 'Otorrino' },
    { nome: 'Cardiologia' }
  ];

  const saida = validarRecomendacoes({ especialidades: muitas }, ESPECIALIDADES);
  assert.ok(saida.length <= 3);
});

test('confiança fora da faixa é normalizada para 0..1', () => {
  const saida = validarRecomendacoes(
    { especialidades: [{ id: 'id-cardio', confianca: 95 }] },
    ESPECIALIDADES
  );

  assert.strictEqual(saida[0].confianca, 1);
});

test('confiança ausente vira null, não NaN', () => {
  const saida = validarRecomendacoes(
    { especialidades: [{ id: 'id-cardio' }] },
    ESPECIALIDADES
  );

  assert.strictEqual(saida[0].confianca, null);
});

test('resposta que não é objeto devolve lista vazia', () => {
  assert.deepStrictEqual(validarRecomendacoes(null, ESPECIALIDADES), []);
  assert.deepStrictEqual(validarRecomendacoes({}, ESPECIALIDADES), []);
  assert.deepStrictEqual(validarRecomendacoes({ especialidades: 'x' }, ESPECIALIDADES), []);
});

test('extrai JSON mesmo quando vem dentro de cerca markdown', () => {
  const texto = '```json\n{"especialidades":[],"justificativa":"teste"}\n```';
  const json = extrairJson(texto);

  assert.ok(json);
  assert.strictEqual(json.justificativa, 'teste');
});

test('extrai JSON com texto antes e depois', () => {
  const texto = 'Claro! Aqui está: {"a":1} Espero ter ajudado.';
  assert.deepStrictEqual(extrairJson(texto), { a: 1 });
});

test('devolve null para resposta sem JSON', () => {
  assert.strictEqual(extrairJson('Não consegui responder.'), null);
  assert.strictEqual(extrairJson(''), null);
  assert.strictEqual(extrairJson(null), null);
});

test('monta sintomas só a partir das respostas positivas', () => {
  const perguntas = [
    { id: 'p1', texto_pergunta: 'Você está com tosse?' },
    { id: 'p2', texto_pergunta: 'Você está sentindo falta de ar?' },
    { id: 'p3', texto_pergunta: 'Há quantos dias os sintomas começaram?' }
  ];

  const respostas = [
    { id_pergunta: 'p1', resposta_bool: true },
    { id_pergunta: 'p2', resposta_bool: false },
    { id_pergunta: 'p3', resposta_texto: '3 dias' }
  ];

  const sintomas = montarSintomas(respostas, perguntas);

  assert.strictEqual(sintomas.length, 2);
  assert.ok(sintomas.some((s) => s.includes('tosse')));
  assert.ok(sintomas.some((s) => s.includes('3 dias')));
  assert.ok(!sintomas.some((s) => s.includes('falta de ar')));
});

test('o prompt lista as especialidades e proíbe inventar', () => {
  const prompt = montarPrompt({
    categoria: 'Sintomas respiratórios',
    sintomas: ['Você está com tosse?'],
    descricao: 'tosse seca',
    intensidade: 6,
    duracaoDias: 4,
    especialidades: ESPECIALIDADES
  });

  assert.ok(prompt.includes('Cardiologia'));
  assert.ok(prompt.includes('Otorrino'));
  assert.ok(prompt.includes('Nunca invente'));
  assert.ok(prompt.includes('Não dê diagnóstico'));
  assert.ok(prompt.includes('6 de 10'));
  assert.ok(prompt.includes('4 dia'));
});

test('o prompt corta descrição gigante em 500 caracteres', () => {
  const prompt = montarPrompt({
    categoria: 'x',
    sintomas: [],
    descricao: 'a'.repeat(2000),
    especialidades: ESPECIALIDADES
  });

  const linha = prompt.split('\n').find((l) => l.startsWith('- Descrição do paciente:'));
  assert.ok(linha.length < 540, 'a descrição deve ser cortada, não colada inteira');
});

test('normalizarNome remove acento e caixa', () => {
  assert.strictEqual(normalizarNome('Clínica Geral'), 'clinica geral');
  assert.strictEqual(normalizarNome('OTORRINO'), 'otorrino');
});
