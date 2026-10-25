-- Rode ANTES da migração 001. Só consulta, não altera nada.
-- Cada consulta deve voltar VAZIA (ou com a contagem esperada).
-- Se alguma voltar linhas, corrija esses dados antes de rodar a 001.

-- 1. Pacientes com o mesmo e-mail (ignorando maiúsculas)
SELECT LOWER(TRIM(email)) AS email, COUNT(*)
FROM pacientes
WHERE email IS NOT NULL
GROUP BY 1
HAVING COUNT(*) > 1;

-- 2. Pacientes e profissionais com o mesmo CPF depois de tirar a pontuação
SELECT regexp_replace(cpf, '\D', '', 'g') AS cpf, COUNT(*)
FROM pacientes
GROUP BY 1
HAVING COUNT(*) > 1;

SELECT regexp_replace(cpf, '\D', '', 'g') AS cpf, COUNT(*)
FROM profissionais
GROUP BY 1
HAVING COUNT(*) > 1;

-- 3. Profissionais com o mesmo e-mail
SELECT LOWER(TRIM(email)) AS email, COUNT(*)
FROM profissionais
WHERE email IS NOT NULL
GROUP BY 1
HAVING COUNT(*) > 1;

-- 4. Especialidades com o mesmo nome
SELECT LOWER(nome) AS nome, COUNT(*)
FROM especialidades
GROUP BY 1
HAVING COUNT(*) > 1;

-- 5. Profissionais SEM e-mail (não conseguirão entrar no portal até ter um)
SELECT id, nome FROM profissionais WHERE email IS NULL;

-- 6. Pacientes SEM e-mail (não conseguem entrar)
SELECT id, nome_completo FROM pacientes WHERE email IS NULL;

-- 7. Situações de agendamento fora do padrão
SELECT status, COUNT(*) FROM agendamentos GROUP BY status;

-- 8. Agendamentos que já se sobrepõem (relevante para a migração 002)
SELECT a.id AS agendamento_a, b.id AS agendamento_b,
       a.id_profissional, a.data_consulta,
       a.horario_inicio, a.horario_fim
FROM agendamentos a
JOIN agendamentos b
  ON a.id_profissional = b.id_profissional
 AND a.data_consulta = b.data_consulta
 AND a.id < b.id
 AND a.horario_inicio < b.horario_fim
 AND a.horario_fim > b.horario_inicio
WHERE a.status IS DISTINCT FROM 'Cancelado'
  AND b.status IS DISTINCT FROM 'Cancelado';

-- 9. Janelas de disponibilidade que já se sobrepõem (migração 002)
SELECT a.id AS janela_a, b.id AS janela_b,
       a.id_profissional, a.dia_semana
FROM disponibilidades a
JOIN disponibilidades b
  ON a.id_profissional = b.id_profissional
 AND a.dia_semana = b.dia_semana
 AND a.id < b.id
 AND a.horario_inicio < b.horario_fim
 AND a.horario_fim > b.horario_inicio;
