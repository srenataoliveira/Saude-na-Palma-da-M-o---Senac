-- Migration do bloco de IA — Desafila
-- Adiciona o que a rubrica pede e o banco ainda não tem:
--   * intensidade  (0 a 10)  -> "coleta de sintomas, duração, intensidade"
--   * duracao_dias (em dias) -> "duração"
--   * descricao    (texto livre do chatbot)
--   * especialidades_recomendadas (o que a IA sugeriu) -> "persistência"
--
-- Seguro para rodar mais de uma vez (IF NOT EXISTS).

ALTER TABLE historico_triagem_paciente
  ADD COLUMN IF NOT EXISTS intensidade INTEGER,
  ADD COLUMN IF NOT EXISTS duracao_dias INTEGER,
  ADD COLUMN IF NOT EXISTS descricao TEXT,
  ADD COLUMN IF NOT EXISTS especialidades_recomendadas UUID[];

-- Regras de faixa no banco, não só no código.
-- (ADD CONSTRAINT não tem IF NOT EXISTS em versões antigas; por isso o bloco.)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ck_intensidade_faixa'
  ) THEN
    ALTER TABLE historico_triagem_paciente
      ADD CONSTRAINT ck_intensidade_faixa
      CHECK (intensidade IS NULL OR intensidade BETWEEN 0 AND 10);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ck_duracao_dias'
  ) THEN
    ALTER TABLE historico_triagem_paciente
      ADD CONSTRAINT ck_duracao_dias
      CHECK (duracao_dias IS NULL OR duracao_dias BETWEEN 0 AND 365);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ck_descricao_tamanho'
  ) THEN
    ALTER TABLE historico_triagem_paciente
      ADD CONSTRAINT ck_descricao_tamanho
      CHECK (descricao IS NULL OR length(descricao) <= 500);
  END IF;
END $$;

-- Índice para buscar por especialidade recomendada mais adiante.
CREATE INDEX IF NOT EXISTS idx_triagem_especialidades
  ON historico_triagem_paciente USING GIN (especialidades_recomendadas);

-- Conferir depois de aplicar:
--   \d historico_triagem_paciente
-- esperado: 4 colunas novas e 3 constraints
