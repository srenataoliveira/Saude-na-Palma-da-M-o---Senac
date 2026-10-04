// teste de sincronização com GitHub
const express = require('express');
const cors = require('cors');
const app = express();

const pacienteRoutes = require('./routes/pacienteRoutes');
const profissionalRoutes = require('./routes/profissionalRoutes');
const agendamentoRoutes = require('./routes/agendamentoRoutes');
const authRoutes = require('./routes/authRoutes');
const clinicaRoutes = require('./routes/clinicaRoutes');
const especialidadeRoutes = require('./routes/especialidadeRoutes');
const disponibilidadeRoutes = require('./routes/disponibilidadeRoutes');
const triagemRoutes = require('./routes/triagemRoutes');

app.use(cors());
app.use(express.json());

app.use('/pacientes', pacienteRoutes);
app.use('/profissionais', profissionalRoutes);
app.use('/agendamentos', agendamentoRoutes);
app.use('/auth', authRoutes);
app.use('/clinicas', clinicaRoutes);
app.use('/especialidades', especialidadeRoutes);
app.use('/disponividades', disponibilidadeRoutes);
app.use('/triagens', triagemRoutes);

console.log('ROTA CLINICAS CARREGADA');
console.log('ROTA TRIAGENS CARREGADA');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});