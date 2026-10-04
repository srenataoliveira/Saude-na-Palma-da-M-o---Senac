-- Ativa a extensão necessária para gerar UUIDs de forma nativa e segura
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==========================================
-- 1. CLÍNICAS E ESPECIALIDADES
-- ==========================================
CREATE TABLE clinicas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(255) NOT NULL,
    cnpj VARCHAR(20) UNIQUE NOT NULL,
    endereco TEXT NOT NULL,
    telefone VARCHAR(20),
    email VARCHAR(255),
    horario_funcionamento VARCHAR(100),
    status BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE especialidades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    status BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 2. PROFISSIONAIS E DISPONIBILIDADE
-- ==========================================
CREATE TABLE profissionais (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_clinica UUID REFERENCES clinicas(id) ON DELETE CASCADE,
    id_especialidade UUID REFERENCES especialidades(id) ON DELETE RESTRICT,
    nome VARCHAR(255) NOT NULL,
    cpf VARCHAR(14) UNIQUE NOT NULL,
    registro_conselho VARCHAR(50) NOT NULL,
    conselho VARCHAR(20) NOT NULL,
    telefone VARCHAR(20),
    email VARCHAR(255),
    status BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE disponibilidades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_profissional UUID REFERENCES profissionais(id) ON DELETE CASCADE,
    dia_semana INT CHECK (dia_semana BETWEEN 0 AND 6),
    horario_inicio TIME NOT NULL,
    horario_fim TIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 3. PACIENTES E CONTATO DE EMERGÊNCIA
-- ==========================================
CREATE TABLE pacientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome_completo VARCHAR(255) NOT NULL,
    cpf VARCHAR(14) UNIQUE NOT NULL,
    data_nascimento DATE NOT NULL,
    telefone VARCHAR(20),
    email VARCHAR(255),
    senha_hash VARCHAR(255) NOT NULL,
    -- Campos exclusivos do diferencial do projeto:
    contato_emergencia_nome VARCHAR(255),
    contato_emergencia_telefone VARCHAR(20),
    contato_emergencia_email VARCHAR(255),
    relacao_contato VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 4. AGENDAMENTOS
-- ==========================================
CREATE TABLE agendamentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_paciente UUID REFERENCES pacientes(id) ON DELETE RESTRICT,
    id_profissional UUID REFERENCES profissionais(id) ON DELETE RESTRICT,
    id_clinica UUID REFERENCES clinicas(id) ON DELETE RESTRICT,
    data_consulta DATE NOT NULL,
    horario_inicio TIME NOT NULL,
    horario_fim TIME NOT NULL,
    status VARCHAR(50) DEFAULT 'Agendado',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 5. PRÉ-TRIAGEM INTELIGENTE (O DIFERENCIAL)
-- ==========================================
CREATE TABLE categorias_sintomas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome_categoria VARCHAR(100) NOT NULL,
    acao_imediata VARCHAR(100) NOT NULL, -- Ex: 'Encaminhar_Presencial', 'Continuar_Questionario'
    ordem_exibicao INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE perguntas_categoria (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_categoria UUID REFERENCES categorias_sintomas(id) ON DELETE CASCADE,
    texto_pergunta TEXT NOT NULL,
    tipo_resposta VARCHAR(20) DEFAULT 'BOOLEAN', -- 'BOOLEAN' ou 'TEXT'
    ordem_exibicao INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE historico_triagem_paciente (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_paciente UUID REFERENCES pacientes(id) ON DELETE CASCADE,
    id_categoria_selecionada UUID REFERENCES categorias_sintomas(id) ON DELETE RESTRICT,
    status_final VARCHAR(100) NOT NULL,
    data_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE respostas_questionario (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_historico_triagem UUID REFERENCES historico_triagem_paciente(id) ON DELETE CASCADE,
    id_pergunta UUID REFERENCES perguntas_categoria(id) ON DELETE RESTRICT,
    resposta_bool BOOLEAN,
    resposta_texto TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- Garante que o paciente preencheu apenas uma das opções de resposta
    CONSTRAINT ck_resposta_exclusiva CHECK (
        (resposta_bool IS NOT NULL AND resposta_texto IS NULL) OR
        (resposta_bool IS NULL AND resposta_texto IS NOT NULL)
    )
);
