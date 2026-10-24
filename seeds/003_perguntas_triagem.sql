-- Categoria 1: Sintomas respiratórios
-- Evita inserir novamente perguntas já cadastradas.

INSERT INTO perguntas_categoria
    (id_categoria, texto_pergunta, tipo_resposta, ordem_exibicao)

SELECT
    dados.id_categoria::uuid,
    dados.texto_pergunta,
    dados.tipo_resposta,
    dados.ordem_exibicao

FROM (
    VALUES
    (
        'e19f558d-cf26-4a56-9a46-83bc2d8d9a64',
        'Você está com tosse?',
        'BOOLEAN',
        1
    ),
    (
        'e19f558d-cf26-4a56-9a46-83bc2d8d9a64',
        'Você está sentindo falta de ar?',
        'BOOLEAN',
        2
    ),
    (
        'e19f558d-cf26-4a56-9a46-83bc2d8d9a64',
        'Você está apresentando febre?',
        'BOOLEAN',
        3
    ),
    (
        'e19f558d-cf26-4a56-9a46-83bc2d8d9a64',
        'Há quantos dias os sintomas começaram?',
        'TEXT',
        4
    )
) AS dados (
    id_categoria,
    texto_pergunta,
    tipo_resposta,
    ordem_exibicao
)

WHERE NOT EXISTS (
    SELECT 1
    FROM perguntas_categoria AS existente
    WHERE existente.id_categoria = dados.id_categoria::uuid
      AND existente.texto_pergunta = dados.texto_pergunta
);

-- Categoria 2: Dor de cabeça e sintomas neurológicos

INSERT INTO perguntas_categoria
    (id_categoria, texto_pergunta, tipo_resposta, ordem_exibicao)

SELECT
    dados.id_categoria::uuid,
    dados.texto_pergunta,
    dados.tipo_resposta,
    dados.ordem_exibicao

FROM (
    VALUES
    (
        '3a08f163-ab79-457f-b1db-59a2c11022e4',
        'Você está sentindo dor de cabeça?',
        'BOOLEAN',
        1
    ),
    (
        '3a08f163-ab79-457f-b1db-59a2c11022e4',
        'A dor começou de forma súbita e muito intensa?',
        'BOOLEAN',
        2
    ),
    (
        '3a08f163-ab79-457f-b1db-59a2c11022e4',
        'Você está sentindo fraqueza ou dormência em alguma parte do corpo?',
        'BOOLEAN',
        3
    ),
    (
        '3a08f163-ab79-457f-b1db-59a2c11022e4',
        'Há quanto tempo esses sintomas começaram?',
        'TEXT',
        4
    )
) AS dados (
    id_categoria,
    texto_pergunta,
    tipo_resposta,
    ordem_exibicao
)

WHERE NOT EXISTS (
    SELECT 1
    FROM perguntas_categoria AS existente
    WHERE existente.id_categoria = dados.id_categoria::uuid
      AND existente.texto_pergunta = dados.texto_pergunta
);

-- Categoria 3: Sintomas gastrointestinais
-- Proteção contra perguntas duplicadas

INSERT INTO perguntas_categoria
    (id_categoria, texto_pergunta, tipo_resposta, ordem_exibicao)

SELECT
    dados.id_categoria::uuid,
    dados.texto_pergunta,
    dados.tipo_resposta,
    dados.ordem_exibicao

FROM (
    VALUES
    (
        '0693af5e-14d8-4c86-90d4-99f84a985eac',
        'Você está sentindo dor abdominal?',
        'BOOLEAN',
        1
    ),
    (
        '0693af5e-14d8-4c86-90d4-99f84a985eac',
        'Você está apresentando náuseas ou vômitos?',
        'BOOLEAN',
        2
    ),
    (
        '0693af5e-14d8-4c86-90d4-99f84a985eac',
        'Você está com diarreia?',
        'BOOLEAN',
        3
    ),
    (
        '0693af5e-14d8-4c86-90d4-99f84a985eac',
        'Há quanto tempo esses sintomas começaram?',
        'TEXT',
        4
    )
) AS dados (
    id_categoria,
    texto_pergunta,
    tipo_resposta,
    ordem_exibicao
)

WHERE NOT EXISTS (
    SELECT 1
    FROM perguntas_categoria AS existente
    WHERE existente.id_categoria = dados.id_categoria::uuid
      AND existente.texto_pergunta = dados.texto_pergunta
);

-- Categoria 4: Dores musculares e articulares
-- Proteção contra perguntas duplicadas

INSERT INTO perguntas_categoria
    (id_categoria, texto_pergunta, tipo_resposta, ordem_exibicao)

SELECT
    dados.id_categoria::uuid,
    dados.texto_pergunta,
    dados.tipo_resposta,
    dados.ordem_exibicao

FROM (
    VALUES
    (
        '630b507a-c91e-432a-bf23-4e50147e3745',
        'Você está sentindo dores musculares?',
        'BOOLEAN',
        1
    ),
    (
        '630b507a-c91e-432a-bf23-4e50147e3745',
        'Você está sentindo dores nas articulações?',
        'BOOLEAN',
        2
    ),
    (
        '630b507a-c91e-432a-bf23-4e50147e3745',
        'Você apresenta inchaço ou dificuldade para movimentar alguma articulação?',
        'BOOLEAN',
        3
    ),
    (
        '630b507a-c91e-432a-bf23-4e50147e3745',
        'Há quanto tempo esses sintomas começaram?',
        'TEXT',
        4
    )
) AS dados (
    id_categoria,
    texto_pergunta,
    tipo_resposta,
    ordem_exibicao
)

WHERE NOT EXISTS (
    SELECT 1
    FROM perguntas_categoria AS existente
    WHERE existente.id_categoria = dados.id_categoria::uuid
      AND existente.texto_pergunta = dados.texto_pergunta
);

-- Categoria 5: Sintomas urinários
-- Proteção contra perguntas duplicadas

INSERT INTO perguntas_categoria
    (id_categoria, texto_pergunta, tipo_resposta, ordem_exibicao)

SELECT
    dados.id_categoria::uuid,
    dados.texto_pergunta,
    dados.tipo_resposta,
    dados.ordem_exibicao

FROM (
    VALUES
    (
        '4c56dcb7-1017-42b4-85b6-552b8231e55d',
        'Você está sentindo dor ou ardência ao urinar?',
        'BOOLEAN',
        1
    ),
    (
        '4c56dcb7-1017-42b4-85b6-552b8231e55d',
        'Você está urinando com mais frequência que o habitual?',
        'BOOLEAN',
        2
    ),
    (
        '4c56dcb7-1017-42b4-85b6-552b8231e55d',
        'Você percebeu sangue na urina?',
        'BOOLEAN',
        3
    ),
    (
        '4c56dcb7-1017-42b4-85b6-552b8231e55d',
        'Há quanto tempo esses sintomas começaram?',
        'TEXT',
        4
    )
) AS dados (
    id_categoria,
    texto_pergunta,
    tipo_resposta,
    ordem_exibicao
)

WHERE NOT EXISTS (
    SELECT 1
    FROM perguntas_categoria AS existente
    WHERE existente.id_categoria = dados.id_categoria::uuid
      AND existente.texto_pergunta = dados.texto_pergunta
);

-- Categoria 6: Problemas de pele
-- Proteção contra perguntas duplicadas

INSERT INTO perguntas_categoria
    (id_categoria, texto_pergunta, tipo_resposta, ordem_exibicao)

SELECT
    dados.id_categoria::uuid,
    dados.texto_pergunta,
    dados.tipo_resposta,
    dados.ordem_exibicao

FROM (
    VALUES
    (
        '24b6e0d3-6853-4393-81fd-8db812af1bd0',
        'Você está apresentando coceira na pele?',
        'BOOLEAN',
        1
    ),
    (
        '24b6e0d3-6853-4393-81fd-8db812af1bd0',
        'Você percebeu manchas ou vermelhidão na pele?',
        'BOOLEAN',
        2
    ),
    (
        '24b6e0d3-6853-4393-81fd-8db812af1bd0',
        'Você está apresentando feridas, bolhas ou inchaço na pele?',
        'BOOLEAN',
        3
    ),
    (
        '24b6e0d3-6853-4393-81fd-8db812af1bd0',
        'Há quanto tempo esses sintomas começaram?',
        'TEXT',
        4
    )
) AS dados (
    id_categoria,
    texto_pergunta,
    tipo_resposta,
    ordem_exibicao
)

WHERE NOT EXISTS (
    SELECT 1
    FROM perguntas_categoria AS existente
    WHERE existente.id_categoria = dados.id_categoria::uuid
      AND existente.texto_pergunta = dados.texto_pergunta
);

-- Categoria 7: Febre e mal-estar geral
-- Proteção contra perguntas duplicadas

INSERT INTO perguntas_categoria
    (id_categoria, texto_pergunta, tipo_resposta, ordem_exibicao)

SELECT
    dados.id_categoria::uuid,
    dados.texto_pergunta,
    dados.tipo_resposta,
    dados.ordem_exibicao

FROM (
    VALUES
    (
        '0206a50a-9bc3-4669-8b19-2d332f96b878',
        'Você está apresentando febre?',
        'BOOLEAN',
        1
    ),
    (
        '0206a50a-9bc3-4669-8b19-2d332f96b878',
        'Você está sentindo cansaço ou fraqueza fora do habitual?',
        'BOOLEAN',
        2
    ),
    (
        '0206a50a-9bc3-4669-8b19-2d332f96b878',
        'Você está apresentando calafrios ou suor excessivo?',
        'BOOLEAN',
        3
    ),
    (
        '0206a50a-9bc3-4669-8b19-2d332f96b878',
        'Há quanto tempo esses sintomas começaram?',
        'TEXT',
        4
    )
) AS dados (
    id_categoria,
    texto_pergunta,
    tipo_resposta,
    ordem_exibicao
)

WHERE NOT EXISTS (
    SELECT 1
    FROM perguntas_categoria AS existente
    WHERE existente.id_categoria = dados.id_categoria::uuid
      AND existente.texto_pergunta = dados.texto_pergunta
);
-- Categoria 8: Sintomas de ouvido, nariz e garganta
-- Proteção contra perguntas duplicadas

INSERT INTO perguntas_categoria
    (id_categoria, texto_pergunta, tipo_resposta, ordem_exibicao)

SELECT
    dados.id_categoria::uuid,
    dados.texto_pergunta,
    dados.tipo_resposta,
    dados.ordem_exibicao

FROM (
    VALUES
    (
        '8b44744f-a1c2-44f2-9d57-d08f2951855b',
        'Você está sentindo dor de ouvido ou dor de garganta?',
        'BOOLEAN',
        1
    ),
    (
        '8b44744f-a1c2-44f2-9d57-d08f2951855b',
        'Você está apresentando congestão nasal ou coriza?',
        'BOOLEAN',
        2
    ),
    (
        '8b44744f-a1c2-44f2-9d57-d08f2951855b',
        'Você está com dificuldade para engolir?',
        'BOOLEAN',
        3
    ),
    (
        '8b44744f-a1c2-44f2-9d57-d08f2951855b',
        'Há quanto tempo esses sintomas começaram?',
        'TEXT',
        4
    )
) AS dados (
    id_categoria,
    texto_pergunta,
    tipo_resposta,
    ordem_exibicao
)

WHERE NOT EXISTS (
    SELECT 1
    FROM perguntas_categoria AS existente
    WHERE existente.id_categoria = dados.id_categoria::uuid
      AND existente.texto_pergunta = dados.texto_pergunta
);
-- Categoria 9: Sintomas oculares
-- Proteção contra perguntas duplicadas

INSERT INTO perguntas_categoria
    (id_categoria, texto_pergunta, tipo_resposta, ordem_exibicao)

SELECT
    dados.id_categoria::uuid,
    dados.texto_pergunta,
    dados.tipo_resposta,
    dados.ordem_exibicao

FROM (
    VALUES
    (
        '431176cb-5003-427a-822f-f1d3702d583f',
        'Você está sentindo dor ou desconforto nos olhos?',
        'BOOLEAN',
        1
    ),
    (
        '431176cb-5003-427a-822f-f1d3702d583f',
        'Você está apresentando vermelhidão ou secreção nos olhos?',
        'BOOLEAN',
        2
    ),
    (
        '431176cb-5003-427a-822f-f1d3702d583f',
        'Você percebeu alguma alteração ou perda de visão?',
        'BOOLEAN',
        3
    ),
    (
        '431176cb-5003-427a-822f-f1d3702d583f',
        'Há quanto tempo esses sintomas começaram?',
        'TEXT',
        4
    )
) AS dados (
    id_categoria,
    texto_pergunta,
    tipo_resposta,
    ordem_exibicao
)

WHERE NOT EXISTS (
    SELECT 1
    FROM perguntas_categoria AS existente
    WHERE existente.id_categoria = dados.id_categoria::uuid
      AND existente.texto_pergunta = dados.texto_pergunta
);

-- Categoria 10: Outros sintomas
-- A pergunta de ordem 1 já existe no banco.
-- Proteção contra perguntas duplicadas.

INSERT INTO perguntas_categoria
    (id_categoria, texto_pergunta, tipo_resposta, ordem_exibicao)

SELECT
    dados.id_categoria::uuid,
    dados.texto_pergunta,
    dados.tipo_resposta,
    dados.ordem_exibicao

FROM (
    VALUES
    (
        '59e3c414-1058-46c2-86da-7f14851ffb35',
        'Você está apresentando febre ou mal-estar?',
        'BOOLEAN',
        2
    ),
    (
        '59e3c414-1058-46c2-86da-7f14851ffb35',
        'Os sintomas estão dificultando suas atividades diárias?',
        'BOOLEAN',
        3
    ),
    (
        '59e3c414-1058-46c2-86da-7f14851ffb35',
        'Descreva os sintomas que você está sentindo e há quanto tempo começaram.',
        'TEXT',
        4
    )
) AS dados (
    id_categoria,
    texto_pergunta,
    tipo_resposta,
    ordem_exibicao
)

WHERE NOT EXISTS (
    SELECT 1
    FROM perguntas_categoria AS existente
    WHERE existente.id_categoria = dados.id_categoria::uuid
      AND existente.texto_pergunta = dados.texto_pergunta
);