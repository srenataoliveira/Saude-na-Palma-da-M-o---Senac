const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const HORARIO_REGEX = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/;

const DATA_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function normalizarEmail(email) {
  return String(email ?? '').trim().toLowerCase();
}

function somenteDigitos(valor) {
  return String(valor ?? '').replace(/\D/g, '');
}

function dataValida(texto) {
  if (!DATA_REGEX.test(String(texto))) return false;

  const [ano, mes, dia] = texto.split('-').map(Number);
  const data = new Date(Date.UTC(ano, mes - 1, dia));

  return (
    data.getUTCFullYear() === ano &&
    data.getUTCMonth() === mes - 1 &&
    data.getUTCDate() === dia
  );
}

// 0 = domingo ... 6 = sábado (igual ao Date.getDay() usado no front)
function diaDaSemana(texto) {
  const [ano, mes, dia] = texto.split('-').map(Number);
  return new Date(Date.UTC(ano, mes - 1, dia)).getUTCDay();
}

// Data e hora atuais no fuso da clínica, como 'YYYY-MM-DD' e 'HH:MM'
function agoraNaClinica() {
  const fuso = process.env.TZ_CLINICA || 'America/Recife';
  const agora = new Date();

  return {
    data: agora.toLocaleDateString('en-CA', { timeZone: fuso }),
    hora: agora.toLocaleTimeString('en-GB', {
      timeZone: fuso,
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23'
    })
  };
}

module.exports = {
  UUID_REGEX,
  HORARIO_REGEX,
  DATA_REGEX,
  normalizarEmail,
  somenteDigitos,
  dataValida,
  diaDaSemana,
  agoraNaClinica
};
