BEGIN;

-- Cadastrar as 9 novas categorias
INSERT INTO categorias_sintomas
(id, nome_categoria, acao_imediata, ordem_exibicao)
VALUES
('e19f558d-cf26-4a56-9a46-83bc2d8d9a64', 'Sintomas respiratórios', 'Continuar_Questionario', 1),
('3a08f163-ab79-457f-b1db-59a2c11022e4', 'Dor de cabeça e sintomas neurológicos', 'Continuar_Questionario', 2),
('0693af5e-14d8-4c86-90d4-99f84a985eac', 'Sintomas gastrointestinais', 'Continuar_Questionario', 3),
('630b507a-c91e-432a-bf23-4e50147e3745', 'Dores musculares e articulares', 'Continuar_Questionario', 4),
('4c56dcb7-1017-42b4-85b6-552b8231e55d', 'Sintomas urinários', 'Continuar_Questionario', 5),
('24b6e0d3-6853-4393-81fd-8db812af1bd0', 'Problemas de pele', 'Continuar_Questionario', 6),
('0206a50a-9bc3-4669-8b19-2d332f96b878', 'Febre e mal-estar geral', 'Continuar_Questionario', 7),
('8b44744f-a1c2-44f2-9d57-d08f2951855b', 'Sintomas de ouvido, nariz e garganta', 'Continuar_Questionario', 8),
('431176cb-5003-427a-822f-f1d3702d583f', 'Sintomas oculares', 'Continuar_Questionario', 9)
ON CONFLICT (id) DO NOTHING;

-- Aproveitar a categoria original, preservando seu ID e sua pergunta
UPDATE categorias_sintomas
SET nome_categoria = 'Outros sintomas',
    ordem_exibicao = 10
WHERE id = '59e3c414-1058-46c2-86da-7f14851ffb35';

COMMIT;