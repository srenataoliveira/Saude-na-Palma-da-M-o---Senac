const bcrypt = require('bcrypt');
const crypto = require('crypto');

const Paciente = require('../models/Paciente');
const Profissional = require('../models/Profissional');

// Alfabeto sem caracteres que se confundem ao ler em voz alta (0/O, 1/I/L).
const ALFABETO = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

function gerarSenhaTemporaria(tamanho = 8) {
  const bytes = crypto.randomBytes(tamanho);
  let senha = '';

  for (let indice = 0; indice < tamanho; indice += 1) {
    senha += ALFABETO[bytes[indice] % ALFABETO.length];
  }

  return senha;
}

// POST /admin/senha-temporaria
// O administrador informa o e-mail e recebe, uma única vez, uma senha
// temporária para repassar ao paciente ou ao profissional. Não há envio de
// e-mail: quem entrega a senha é a recepção/administração da clínica.
async function redefinirSenha(req, res) {
  try {
    const email = String((req.body && req.body.email) || '').trim();

    if (!email) {
      return res.status(400).json({ error: 'Informe o e-mail' });
    }

    let perfil = null;
    let registro = await Paciente.findByEmail(email);

    if (registro) {
      perfil = 'paciente';
    } else {
      registro = await Profissional.findByEmail(email);
      if (registro) perfil = 'profissional';
    }

    // A mesma resposta vale para e-mail inexistente e conta inativa, para não
    // revelar quais e-mails existem na base.
    if (!registro || registro.status === false) {
      return res.status(404).json({ error: 'Não encontramos uma conta ativa com este e-mail' });
    }

    const senhaTemporaria = gerarSenhaTemporaria();
    const senha_hash = await bcrypt.hash(senhaTemporaria, 10);

    await registro.update({ senha_hash });

    return res.json({
      perfil,
      nome: perfil === 'paciente' ? registro.nome_completo : registro.nome,
      email: registro.email,
      senha_temporaria: senhaTemporaria
    });
  } catch (error) {
    console.error('Erro ao definir senha temporária:', error);
    return res.status(500).json({ error: 'Erro ao definir senha temporária' });
  }
}

module.exports = { redefinirSenha };