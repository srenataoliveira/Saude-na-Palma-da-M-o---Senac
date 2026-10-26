-- Seed 004 — catálogo de demonstração: clínicas, especialidades e profissionais
--
-- Por que existe: o ambiente de demonstração tinha apenas 1 clínica, 1
-- especialidade e 1 profissional. Na prática, o paciente tinha um único caminho
-- para clicar — se algo falhasse ali, a demonstração não tinha alternativa.
--
-- Conteúdo: 2 clínicas, 6 especialidades, 6 profissionais e 30 janelas de
-- disponibilidade (segunda a sexta). Todos os dados são fictícios.
--
-- Todos os profissionais usam a mesma senha do ambiente de demonstração
-- (a mesma do Dr. Rafael Mendes), então dá para logar com qualquer um deles.
--
-- Seguro para rodar mais de uma vez: ON CONFLICT DO NOTHING em todas as tabelas.
-- Não altera nem remove nada que já existe.
--
-- Como aplicar (na pasta do back-end):
--   node seeds/executar_catalogo.js
-- ou, direto no banco:
--   psql "$DATABASE_URL" -f seeds/004_catalogo_demo.sql

BEGIN;

-- ─── Clínicas ────────────────────────────────────────────────────────────────
INSERT INTO clinicas (id, nome, cnpj, endereco, telefone, email, horario_funcionamento, status) VALUES
  ('a0000001-0000-4000-8000-000000000001', 'Clínica Bem Viver', '23.456.789/0001-01', 'Rua Aviador Severiano Lins, 245 - Boa Viagem, Recife, PE', '(81) 3456-7890', 'contato@clinicabemviver.com.br', '07:00 às 19:00', true),
  ('a0000002-0000-4000-8000-000000000002', 'Instituto Recife de Saúde', '34.567.890/0001-12', 'Av. Conselheiro Rosa e Silva, 1180 - Espinheiro, Recife, PE', '(81) 3567-8901', 'contato@institutorecifesaude.com.br', '08:00 às 17:00', true)
ON CONFLICT (id) DO NOTHING;

-- ─── Especialidades ──────────────────────────────────────────────────────────
INSERT INTO especialidades (id, nome, descricao, status) VALUES
  ('e0000001-0000-4000-8000-000000000001', 'Clínica Geral', 'Atendimento geral, avaliação inicial e encaminhamento para especialidades.', true),
  ('e0000002-0000-4000-8000-000000000002', 'Dermatologia', 'Cuidados com a pele, cabelos e unhas, incluindo alergias e irritações.', true),
  ('e0000003-0000-4000-8000-000000000003', 'Pediatria', 'Acompanhamento da saúde de crianças e adolescentes.', true),
  ('e0000004-0000-4000-8000-000000000004', 'Ortopedia', 'Dores nas costas, articulações, ossos e lesões por esforço.', true),
  ('e0000005-0000-4000-8000-000000000005', 'Ginecologia e Obstetrícia', 'Saúde da mulher, acompanhamento preventivo e pré-natal.', true),
  ('e0000006-0000-4000-8000-000000000006', 'Oftalmologia', 'Visão, cansaço visual, olhos secos e revisão de grau.', true)
ON CONFLICT (id) DO NOTHING;

-- ─── Profissionais ───────────────────────────────────────────────────────────
INSERT INTO profissionais (id, id_clinica, id_especialidade, nome, cpf,
  registro_conselho, conselho, uf_conselho, telefone, email, senha_hash, status) VALUES
  ('f0000001-0000-4000-8000-000000000001', 'a0000001-0000-4000-8000-000000000001', 'e0000001-0000-4000-8000-000000000001', 'Beatriz Camargo', '90000000001',
   '18842', 'CRM', 'PE', '(81) 98811-2233', 'beatriz.camargo@clinicabemviver.com.br', '$2b$10$sZGcjQJPbirdn805a6q79./InQzjC/nA.1UIW2N.3.GVQz9I.h97a', true),
  ('f0000002-0000-4000-8000-000000000002', 'a0000002-0000-4000-8000-000000000002', 'e0000002-0000-4000-8000-000000000002', 'Marcos Vinícius Alencar', '90000000002',
   '15420', 'CRM', 'PE', '(81) 98822-3344', 'marcos.alencar@institutorecifesaude.com.br', '$2b$10$sZGcjQJPbirdn805a6q79./InQzjC/nA.1UIW2N.3.GVQz9I.h97a', true),
  ('f0000003-0000-4000-8000-000000000003', 'a0000001-0000-4000-8000-000000000001', 'e0000003-0000-4000-8000-000000000003', 'Camila Bezerra Lima', '90000000003',
   '21307', 'CRM', 'PE', '(81) 98833-4455', 'camila.lima@clinicabemviver.com.br', '$2b$10$sZGcjQJPbirdn805a6q79./InQzjC/nA.1UIW2N.3.GVQz9I.h97a', true),
  ('f0000004-0000-4000-8000-000000000004', 'a0000002-0000-4000-8000-000000000002', 'e0000004-0000-4000-8000-000000000004', 'André Luiz Sampaio', '90000000004',
   '17655', 'CRM', 'PE', '(81) 98844-5566', 'andre.sampaio@institutorecifesaude.com.br', '$2b$10$sZGcjQJPbirdn805a6q79./InQzjC/nA.1UIW2N.3.GVQz9I.h97a', true),
  ('f0000005-0000-4000-8000-000000000005', 'a0000001-0000-4000-8000-000000000001', 'e0000005-0000-4000-8000-000000000005', 'Patrícia Nogueira', '90000000005',
   '19988', 'CRM', 'PE', '(81) 98855-6677', 'patricia.nogueira@clinicabemviver.com.br', '$2b$10$sZGcjQJPbirdn805a6q79./InQzjC/nA.1UIW2N.3.GVQz9I.h97a', true),
  ('f0000006-0000-4000-8000-000000000006', 'a0000002-0000-4000-8000-000000000002', 'e0000006-0000-4000-8000-000000000006', 'Sérgio Ramalho', '90000000006',
   '13274', 'CRM', 'PE', '(81) 98866-7788', 'sergio.ramalho@institutorecifesaude.com.br', '$2b$10$sZGcjQJPbirdn805a6q79./InQzjC/nA.1UIW2N.3.GVQz9I.h97a', true)
ON CONFLICT (id) DO NOTHING;

-- ─── Disponibilidades (segunda a sexta, 1 = segunda ... 5 = sexta) ───────────
INSERT INTO disponibilidades (id, id_profissional, dia_semana, horario_inicio, horario_fim) VALUES
  ('d0000001-0000-4000-8000-000000000000', 'f0000001-0000-4000-8000-000000000001', 1, '08:00:00', '12:00:00'),
  ('d0000002-0000-4000-8000-000000000000', 'f0000001-0000-4000-8000-000000000001', 2, '08:00:00', '12:00:00'),
  ('d0000003-0000-4000-8000-000000000000', 'f0000001-0000-4000-8000-000000000001', 3, '08:00:00', '12:00:00'),
  ('d0000004-0000-4000-8000-000000000000', 'f0000001-0000-4000-8000-000000000001', 4, '08:00:00', '12:00:00'),
  ('d0000005-0000-4000-8000-000000000000', 'f0000001-0000-4000-8000-000000000001', 5, '08:00:00', '12:00:00'),
  ('d0000006-0000-4000-8000-000000000000', 'f0000002-0000-4000-8000-000000000002', 1, '13:00:00', '18:00:00'),
  ('d0000007-0000-4000-8000-000000000000', 'f0000002-0000-4000-8000-000000000002', 2, '13:00:00', '18:00:00'),
  ('d0000008-0000-4000-8000-000000000000', 'f0000002-0000-4000-8000-000000000002', 3, '13:00:00', '18:00:00'),
  ('d0000009-0000-4000-8000-000000000000', 'f0000002-0000-4000-8000-000000000002', 4, '13:00:00', '18:00:00'),
  ('d0000010-0000-4000-8000-000000000000', 'f0000002-0000-4000-8000-000000000002', 5, '13:00:00', '18:00:00'),
  ('d0000011-0000-4000-8000-000000000000', 'f0000003-0000-4000-8000-000000000003', 1, '08:00:00', '12:00:00'),
  ('d0000012-0000-4000-8000-000000000000', 'f0000003-0000-4000-8000-000000000003', 2, '08:00:00', '12:00:00'),
  ('d0000013-0000-4000-8000-000000000000', 'f0000003-0000-4000-8000-000000000003', 3, '08:00:00', '12:00:00'),
  ('d0000014-0000-4000-8000-000000000000', 'f0000003-0000-4000-8000-000000000003', 4, '08:00:00', '12:00:00'),
  ('d0000015-0000-4000-8000-000000000000', 'f0000003-0000-4000-8000-000000000003', 5, '08:00:00', '12:00:00'),
  ('d0000016-0000-4000-8000-000000000000', 'f0000004-0000-4000-8000-000000000004', 1, '14:00:00', '19:00:00'),
  ('d0000017-0000-4000-8000-000000000000', 'f0000004-0000-4000-8000-000000000004', 2, '14:00:00', '19:00:00'),
  ('d0000018-0000-4000-8000-000000000000', 'f0000004-0000-4000-8000-000000000004', 3, '14:00:00', '19:00:00'),
  ('d0000019-0000-4000-8000-000000000000', 'f0000004-0000-4000-8000-000000000004', 4, '14:00:00', '19:00:00'),
  ('d0000020-0000-4000-8000-000000000000', 'f0000004-0000-4000-8000-000000000004', 5, '14:00:00', '19:00:00'),
  ('d0000021-0000-4000-8000-000000000000', 'f0000005-0000-4000-8000-000000000005', 1, '08:00:00', '13:00:00'),
  ('d0000022-0000-4000-8000-000000000000', 'f0000005-0000-4000-8000-000000000005', 2, '08:00:00', '13:00:00'),
  ('d0000023-0000-4000-8000-000000000000', 'f0000005-0000-4000-8000-000000000005', 3, '08:00:00', '13:00:00'),
  ('d0000024-0000-4000-8000-000000000000', 'f0000005-0000-4000-8000-000000000005', 4, '08:00:00', '13:00:00'),
  ('d0000025-0000-4000-8000-000000000000', 'f0000005-0000-4000-8000-000000000005', 5, '08:00:00', '13:00:00'),
  ('d0000026-0000-4000-8000-000000000000', 'f0000006-0000-4000-8000-000000000006', 1, '09:00:00', '16:00:00'),
  ('d0000027-0000-4000-8000-000000000000', 'f0000006-0000-4000-8000-000000000006', 2, '09:00:00', '16:00:00'),
  ('d0000028-0000-4000-8000-000000000000', 'f0000006-0000-4000-8000-000000000006', 3, '09:00:00', '16:00:00'),
  ('d0000029-0000-4000-8000-000000000000', 'f0000006-0000-4000-8000-000000000006', 4, '09:00:00', '16:00:00'),
  ('d0000030-0000-4000-8000-000000000000', 'f0000006-0000-4000-8000-000000000006', 5, '09:00:00', '16:00:00')
ON CONFLICT (id) DO NOTHING;

COMMIT;
