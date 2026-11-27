// Configuração do provedor de IA.
//
// PADRÃO: Google Gemini (recomendação do professor).
// Opcionais: Groq e OpenAI (formato compatível com OpenAI).
//
// A chave NUNCA vai para o aplicativo nem para o repositório: só aqui, do lado
// do servidor, lida de variável de ambiente.

const PROVEDORES = {
  gemini: {
    formato: 'gemini',
    modelo: 'gemini-3.5-flash-lite',
    // O nome do modelo entra na URL, por isso não há "url" fixa aqui.
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/models'
  },
  groq: {
    formato: 'openai',
    modelo: 'llama-3.3-70b-versatile',
    url: 'https://api.groq.com/openai/v1/chat/completions'
  },
  openai: {
    formato: 'openai',
    modelo: 'gpt-4o-mini',
    url: 'https://api.openai.com/v1/chat/completions'
  }
};

function obterProvedor() {
  const nome = String(process.env.PROVEDOR_IA || 'gemini').toLowerCase();
  const provedor = PROVEDORES[nome];

  if (!provedor) {
    throw new Error(
      `PROVEDOR_IA inválido: "${nome}". Use "gemini", "groq" ou "openai".`
    );
  }

  // Aceita os dois nomes: GEMINI_API_KEY (padrão do Google) e IA_API_KEY.
  // Assim a banca não precisa adivinhar qual variável criamos.
  const chave =
    nome === 'gemini'
      ? process.env.GEMINI_API_KEY || process.env.IA_API_KEY
      : process.env.IA_API_KEY;

  if (!chave) {
    throw new Error(
      nome === 'gemini'
        ? 'GEMINI_API_KEY não configurada no ambiente.'
        : 'IA_API_KEY não configurada no ambiente.'
    );
  }

  const modelo = process.env.IA_MODELO || provedor.modelo;

  return {
    nome,
    formato: provedor.formato,
    modelo,
    chave,
    // No Gemini o modelo faz parte da URL.
    url:
      provedor.formato === 'gemini'
        ? `${provedor.baseUrl}/${modelo}:generateContent`
        : process.env.IA_URL || provedor.url,
    // Segundos. Se a IA demorar mais que isso, desistimos e usamos as regras.
    timeoutMs: Number(process.env.IA_TIMEOUT_MS) || 15000
  };
}

// Só para o log do boot: mostra se está configurado, sem revelar a chave.
function resumoConfiguracao() {
  try {
    const p = obterProvedor();
    return `IA configurada: ${p.nome} / ${p.modelo}`;
  } catch (erro) {
    return `IA NÃO configurada (${erro.message}) — o sistema usará apenas as regras de classificação.`;
  }
}

// Esquema da resposta, exigido pelo Gemini para garantir JSON válido.
// Sem isso, o modelo pode devolver texto livre e o parse quebra.
const ESQUEMA_RESPOSTA = {
  type: 'OBJECT',
  properties: {
    especialidades: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          id: { type: 'STRING' },
          nome: { type: 'STRING' },
          confianca: { type: 'NUMBER' }
        },
        required: ['nome']
      }
    },
    justificativa: { type: 'STRING' }
  },
  required: ['especialidades', 'justificativa']
};

module.exports = { obterProvedor, resumoConfiguracao, PROVEDORES, ESQUEMA_RESPOSTA };
