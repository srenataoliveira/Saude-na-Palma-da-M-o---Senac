-- Migração 001: segurança, login do profissional e ligação triagem -> consulta.
-- Faça um backup antes:  pg_dump -U <usuario> -d <banco> -F c -f backup.dump
-- Rode UMA vez (é seguro rodar de novo). Tudo acontece numa transação:
-- se algo falhar, nada é aplicado.

BEGIN;

-- ---------------------------------------------------------------
-- 1. Normalização dos dados existentes
-- ---------------------------------------------------------------
UPDATE pacientes SET email = LOWER(TRIM(email)) WHERE email IS NOT NULL;
UPDATE pacientes SET cpf = regexp_replace(cpf, '\D', '', 'g');

UPDATE profissionais SET email = LOWER(TRIM(email)) WHERE email IS NOT NULL;
UPDATE profissionais SET cpf = regexp_replace(cpf, '\D', '', 'g');

-- ---------------------------------------------------------------
-- 2. Clínicas e especialidades
-- ---------------------------------------------------------------
UPDATE clinicas SET status = TRUE WHERE status IS NULL;
ALTER TABLE clinicas ALTER COLUMN status SET DEFAULT TRUE;
ALTER TABLE clinicas ALTER COLUMN status SET NOT NULL;

UPDATE especialidades SET status = TRUE WHERE status IS NULL;
ALTER TABLE especialidades ALTER COLUMN status SET DEFAULT TRUE;
ALTER TABLE especialidades ALTER COLUMN status SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS especialidades_nome_unico
  ON especialidades (LOWER(nome));

-- ---------------------------------------------------------------
-- 3. Profissionais: senha de acesso, UF do conselho, e-mail único
-- ---------------------------------------------------------------
ALTER TABLE profissionais ADD COLUMN IF NOT EXISTS senha_hash VARCHAR(255);
ALTER TABLE profissionais ADD COLUMN IF NOT EXISTS uf_conselho VARCHAR(2);

UPDATE profissionais SET status = TRUE WHERE status IS NULL;
ALTER TABLE profissionais ALTER COLUMN status SET DEFAULT TRUE;
ALTER TABLE profissionais ALTER COLUMN status SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS profissionais_email_unico
  ON profissionais (LOWER(email))
  WHERE email IS NOT NULL;

-- Apagar uma clínica NÃO pode mais apagar seus profissionais em cascata.
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN
    SELECT con.conname
    FROM pg_constraint con
    JOIN pg_class rel ON rel.oid = con.conrelid
    JOIN pg_attribute att
      ON att.attrelid = con.conrelid AND att.attnum = ANY (con.conkey)
    WHERE rel.relname = 'profissionais'
      AND con.contype = 'f'
      AND att.attname = 'id_clinica'
  LOOP
    EXECUTE format('ALTER TABLE profissionais DROP CONSTRAINT %I', r.conname);
  END LOOP;
END $$;

ALTER TABLE profissionais
  ADD CONSTRAINT profissionais_id_clinica_fkey
  FOREIGN KEY (id_clinica) REFERENCES clinicas(id) ON DELETE RESTRICT;

-- ---------------------------------------------------------------
-- 4. Pacientes: e-mail único (o login é por e-mail)
-- ---------------------------------------------------------------
CREATE UNIQUE INDEX IF NOT EXISTS pacientes_email_unico
  ON pacientes (LOWER(email))
  WHERE email IS NOT NULL;

-- ---------------------------------------------------------------
-- 5. Disponibilidades: início antes do fim
--    (NOT VALID: vale para dados novos; os antigos não são reavaliados)
-- ---------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'disponibilidades_horario_valido'
  ) THEN
    ALTER TABLE disponibilidades
      ADD CONSTRAINT disponibilidades_horario_valido
      CHECK (horario_inicio < horario_fim) NOT VALID;
  END IF;
END $$;

-- ---------------------------------------------------------------
-- 6. Agendamentos: triagem vinculada, status controlado
-- ---------------------------------------------------------------
ALTER TABLE agendamentos
  ADD COLUMN IF NOT EXISTS id_triagem UUID
  REFERENCES historico_triagem_paciente(id) ON DELETE SET NULL;

UPDATE agendamentos SET status = 'Agendado' WHERE status IS NULL;
ALTER TABLE agendamentos ALTER COLUMN status SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'agendamentos_status_valido'
  ) THEN
    ALTER TABLE agendamentos
      ADD CONSTRAINT agendamentos_status_valido
      CHECK (status IN ('Agendado', 'Cancelado', 'Concluido')) NOT VALID;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'agendamentos_horario_valido'
  ) THEN
    ALTER TABLE agendamentos
      ADD CONSTRAINT agendamentos_horario_valido
      CHECK (horario_inicio < horario_fim) NOT VALID;
  END IF;
END $$;

-- ---------------------------------------------------------------
-- 7. Respostas da triagem: uma resposta por pergunta
-- ---------------------------------------------------------------
CREATE UNIQUE INDEX IF NOT EXISTS respostas_unica_por_pergunta
  ON respostas_questionario (id_historico_triagem, id_pergunta);

-- ---------------------------------------------------------------
-- 8. Índices para as consultas do portal e da agenda
-- ---------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_agendamentos_profissional_data
  ON agendamentos (id_profissional, data_consulta);
CREATE INDEX IF NOT EXISTS idx_agendamentos_paciente
  ON agendamentos (id_paciente);
CREATE INDEX IF NOT EXISTS idx_disponibilidades_profissional
  ON disponibilidades (id_profissional, dia_semana);
CREATE INDEX IF NOT EXISTS idx_profissionais_clinica
  ON profissionais (id_clinica);

COMMIT;
