// teste de sincronização com GitHub
const express = require('express');
const app = express();

const pacienteRoutes = require('./routes/pacienteRoutes');
const profissionalRoutes = require('./routes/profissionalRoutes');
const agendamentoRoutes = require('./routes/agendamentoRoutes');
const authRoutes = require('./routes/authRoutes');
const clinicaRoutes = require('./routes/clinicaRoutes');
const especialidadeRoutes = require('./routes/especialidadeRoutes');
const disponibilidadeRoutes = require('./routes/disponibilidadeRoutes');
const triagemRoutes = require('./routes/triagemRoutes'); // <--- 1. IMPORTAR AQUI

app.use(express.json());

app.use('/pacientes', pacienteRoutes);
app.use('/profissionais', profissionalRoutes);
app.use('/agendamentos', agendamentoRoutes);
app.use('/auth', authRoutes);
app.use('/clinicas', clinicaRoutes);
app.use('/especialidades', especialidadeRoutes);
app.use('/disponividades', disponibilidadeRoutes);
app.use('/triagens', triagemRoutes); // <--- 2. USAR AQUI

console.log('ROTA CLINICAS CARREGADA');
console.log('ROTA TRIAGENS CARREGADA');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});