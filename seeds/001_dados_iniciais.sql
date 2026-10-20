-- seeds/001_dados_iniciais.sql
-- Dados iniciais de demonstração do Desafila.
-- Ordem oficial de criação do banco:
--   1) schema.sql
--   2) migrations/001_seguranca_e_portal.sql
--   3) este arquivo (seeds)
--   4) profissional de demonstração via scripts/ (nunca por SQL com senha)
-- Idempotente: pode ser executado mais de uma vez sem duplicar (ON CONFLICT DO NOTHING).
-- UUIDs fixos para os demais passos (ex.: profissional demo) serem reproduzíveis.
-- Textos com acentuação corrigida (no banco local estavam com encoding quebrado).

INSERT INTO clinicas (id, nome, cnpj, endereco, telefone, email, horario_funcionamento, status) VALUES
('0918d9a1-d6be-4103-bce1-f554e0c26178', 'Clínica Saúde Recife', '12.345.678/0001-90', 'Av. Agamenon Magalhães, 1000 - Recife, PE', '(81) 3333-4444', 'contato@sauderecife.com.br', '08:00 às 18:00', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO especialidades (id, nome, descricao, status) VALUES
('0c4cc83c-1e62-4edd-8d14-a8c8f98867f5', 'Cardiologia', 'Área da medicina especializada na prevenção, diagnóstico e tratamento de doenças cardiovasculares.', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO categorias_sintomas (id, nome_categoria, acao_imediata, ordem_exibicao) VALUES
('59e3c414-1058-46c2-86da-7f14851ffb35', 'Sintomas gerais', 'Continuar_Questionario', 1)
ON CONFLICT (id) DO NOTHING;

INSERT INTO perguntas_categoria (id, id_categoria, texto_pergunta, tipo_resposta, ordem_exibicao) VALUES
('13641723-78aa-4b5b-bde6-3b5fd8967d7e', '59e3c414-1058-46c2-86da-7f14851ffb35', 'Você está sentindo dor intensa?', 'BOOLEAN', 1)
ON CONFLICT (id) DO NOTHING;