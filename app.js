require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const obrigatorias = [
  'DB_HOST',
  'DB_PORT',
  'DB_NAME',
  'DB_USER',
  'DB_PASSWORD',
  'JWT_SECRET'
];

const faltando = obrigatorias.filter((nome) => !process.env[nome]);

if (faltando.length > 0) {
  console.error(`Variáveis ausentes no .env: ${faltando.join(', ')}`);
  process.exit(1);
}

if (process.env.JWT_SECRET.length < 32) {
  console.warn('Aviso: JWT_SECRET curto. Use pelo menos 32 caracteres aleatórios.');
}

const app = express();

const pacienteRoutes = require('./routes/pacienteRoutes');
const profissionalRoutes = require('./routes/profissionalRoutes');
const agendamentoRoutes = require('./routes/agendamentoRoutes');
const authRoutes = require('./routes/authRoutes');
const clinicaRoutes = require('./routes/clinicaRoutes');
const especialidadeRoutes = require('./routes/especialidadeRoutes');
const disponibilidadeRoutes = require('./routes/disponibilidadeRoutes');
const triagemRoutes = require('./routes/triagemRoutes');

const origensPermitidas = (
  process.env.CORS_ORIGINS || 'http://localhost:5173,http://127.0.0.1:5173'
)
  .split(',')
  .map((origem) => origem.trim())
  .filter(Boolean);

app.use(helmet());
app.use(cors({
  origin: origensPermitidas,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '100kb' }));

app.use('/pacientes', pacienteRoutes);
app.use('/profissionais', profissionalRoutes);
app.use('/agendamentos', agendamentoRoutes);
app.use('/auth', authRoutes);
app.use('/clinicas', clinicaRoutes);
app.use('/especialidades', especialidadeRoutes);
app.use('/disponibilidades', disponibilidadeRoutes);
app.use('/triagem', triagemRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Último tratador: sempre responde JSON e nunca expõe detalhes internos.
app.use((error, req, res, next) => {
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'JSON inválido' });
  }

  if (error.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Requisição muito grande' });
  }

  console.error('Erro não tratado:', error.name);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

process.on('unhandledRejection', (motivo) => {
  console.error('Promessa rejeitada sem tratamento:', motivo?.name || motivo);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
