-- Migração 002 (OPCIONAL, recomendada): trava no banco contra horário duplicado.
-- Rode DEPOIS da 001 e só se as consultas 8 e 9 do arquivo 000 voltarem vazias;
-- caso contrário a criação das restrições falha.
--
-- Efeito: mesmo que dois pacientes confirmem o mesmo horário no mesmo instante,
-- o banco recusa o segundo. O back já trata esse erro e responde 409.

CREATE EXTENSION IF NOT EXISTS btree_gist;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'agendamentos_sem_conflito'
  ) THEN
    ALTER TABLE agendamentos
      ADD CONSTRAINT agendamentos_sem_conflito
      EXCLUDE USING gist (
        id_profissional WITH =,
        tsrange(data_consulta + horario_inicio, data_consulta + horario_fim) WITH &&
      )
      WHERE (status <> 'Cancelado');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'disponibilidades_sem_sobreposicao'
  ) THEN
    ALTER TABLE disponibilidades
      ADD CONSTRAINT disponibilidades_sem_sobreposicao
      EXCLUDE USING gist (
        id_profissional WITH =,
        dia_semana WITH =,
        tsrange(DATE '2000-01-01' + horario_inicio, DATE '2000-01-01' + horario_fim) WITH &&
      );
  END IF;
END $$;
