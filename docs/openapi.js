const respostaErro = (description, exemplo) => ({
  description,
  content: {
    'application/json': {
      schema: { $ref: '#/components/schemas/Erro' },
      example: { error: exemplo }
    }
  }
});

const respostas = {
  sucesso: { description: 'Operação realizada com sucesso.' },
  criado: { description: 'Recurso criado com sucesso.' },
  semConteudo: { description: 'Operação realizada sem conteúdo de retorno.' },
  erro400: respostaErro('Requisição inválida.', 'Dados inválidos'),
  erro401: respostaErro('Token ausente ou inválido.', 'Token não informado'),
  erro403: respostaErro('Papel sem permissão para esta ação.', 'Você não tem permissão para esta ação'),
  erro404: respostaErro('Recurso não encontrado.', 'Recurso não encontrado'),
  erro409: respostaErro('Conflito com um recurso existente.', 'Conflito ao salvar o recurso')
};

const jsonBody = (schema, example) => ({
  required: true,
  content: {
    'application/json': {
      schema,
      example
    }
  }
});

const operacao = ({
  resumo,
  descricao,
  tag,
  papel,
  body,
  parameters,
  responses: respostasExtras = {},
  publica = false
}) => ({
  tags: [tag],
  summary: resumo,
  description: `${descricao}${papel ? ` Papel: ${papel}.` : ''}`,
  ...(papel ? { 'x-papel-requerido': papel } : {}),
  ...(publica ? {} : { security: [{ bearerAuth: [] }] }),
  ...(parameters ? { parameters } : {}),
  ...(body ? { requestBody: body } : {}),
  responses: {
    ...(publica ? {} : { 401: respostas.erro401 }),
    ...respostasExtras
  }
});

const parametroId = (nome = 'id', descricao = 'Identificador UUID do recurso') => ({
  name: nome,
  in: 'path',
  required: true,
  description: descricao,
  schema: { type: 'string', format: 'uuid' },
  example: 'd9428888-122b-4f58-9a7b-7f8c2f3a1b10'
});

const esquemaObjeto = (properties, required = []) => ({
  type: 'object',
  properties,
  ...(required.length ? { required } : {})
});

const campo = (type, description, extra = {}) => ({
  type,
  description,
  ...extra
});

module.exports = {
  openapi: '3.0.3',
  info: {
    title: 'Desafila API',
    version: '1.0.0',
    description: 'API de pré-triagem orientativa e agendamento em clínicas. A pré-triagem não fornece diagnóstico nem substitui avaliação profissional.'
  },
  servers: [
    { url: 'http://localhost:3000', description: 'Servidor local' },
    { url: 'https://desafila-api.onrender.com', description: 'Servidor publicado' }
  ],
  tags: [
    { name: 'Autenticação', description: 'Cadastro e acesso de pacientes, profissionais e administradores.' },
    { name: 'Pacientes', description: 'Dados do paciente autenticado.' },
    { name: 'Profissionais', description: 'Consulta de profissionais, portal e gestão administrativa.' },
    { name: 'Clínicas', description: 'Consulta e gestão de clínicas.' },
    { name: 'Especialidades', description: 'Consulta e gestão de especialidades.' },
    { name: 'Disponibilidades', description: 'Janelas semanais de atendimento dos profissionais.' },
    { name: 'Triagem', description: 'Questionários, registro de pré-triagem e histórico.' },
    { name: 'Agendamentos', description: 'Consulta, criação e cancelamento de agendamentos.' },
    { name: 'Administração', description: 'Ações exclusivas do administrador, como redefinir senha.' }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    },
    schemas: {
      Erro: esquemaObjeto({
        error: campo('string', 'Descrição do erro'),
        code: campo('string', 'Código de erro de autenticação, quando aplicável')
      }, ['error']),
      Credenciais: esquemaObjeto({
        email: campo('string', 'E-mail da conta', { format: 'email' }),
        senha: campo('string', 'Senha da conta')
      }, ['email', 'senha']),
      PacienteCadastro: esquemaObjeto({
        nome_completo: campo('string', 'Nome completo'),
        cpf: campo('string', 'CPF com 11 dígitos'),
        data_nascimento: campo('string', 'Data de nascimento', { format: 'date' }),
        telefone: campo('string', 'Telefone', { nullable: true }),
        email: campo('string', 'E-mail', { format: 'email' }),
        senha: campo('string', 'Senha com pelo menos 8 caracteres', { minLength: 8 }),
        contato_emergencia_nome: campo('string', 'Nome do contato de emergência', { nullable: true }),
        contato_emergencia_telefone: campo('string', 'Telefone do contato de emergência', { nullable: true }),
        contato_emergencia_email: campo('string', 'E-mail do contato de emergência', { format: 'email', nullable: true }),
        relacao_contato: campo('string', 'Relação com o contato de emergência', { nullable: true })
      }, ['nome_completo', 'cpf', 'data_nascimento', 'email', 'senha']),
      TokenPaciente: esquemaObjeto({
        message: campo('string', 'Mensagem de confirmação'),
        token: campo('string', 'Token JWT fictício para autenticação'),
        paciente: esquemaObjeto({
          id: campo('string', 'UUID do paciente', { format: 'uuid' }),
          nome_completo: campo('string', 'Nome completo'),
          email: campo('string', 'E-mail', { format: 'email' })
        })
      }),
      Clinica: esquemaObjeto({
        id: campo('string', 'UUID da clínica', { format: 'uuid' }),
        nome: campo('string', 'Nome da clínica'),
        cnpj: campo('string', 'CNPJ com 14 dígitos'),
        endereco: campo('string', 'Endereço'),
        telefone: campo('string', 'Telefone'),
        email: campo('string', 'E-mail', { format: 'email' }),
        horario_funcionamento: campo('string', 'Horário de funcionamento'),
        status: campo('boolean', 'Indica se a clínica está ativa')
      }, ['nome', 'cnpj', 'endereco']),
      Especialidade: esquemaObjeto({
        id: campo('string', 'UUID da especialidade', { format: 'uuid' }),
        nome: campo('string', 'Nome da especialidade', { maxLength: 100 }),
        descricao: campo('string', 'Descrição'),
        status: campo('boolean', 'Indica se a especialidade está ativa')
      }, ['nome']),
      Profissional: esquemaObjeto({
        id_clinica: campo('string', 'UUID da clínica', { format: 'uuid', nullable: true }),
        id_especialidade: campo('string', 'UUID da especialidade', { format: 'uuid', nullable: true }),
        nome: campo('string', 'Nome do profissional'),
        cpf: campo('string', 'CPF com 11 dígitos'),
        registro_conselho: campo('string', 'Registro profissional'),
        conselho: campo('string', 'Conselho profissional'),
        uf_conselho: campo('string', 'UF do conselho', { minLength: 2, maxLength: 2 }),
        telefone: campo('string', 'Telefone'),
        email: campo('string', 'E-mail', { format: 'email' }),
        senha: campo('string', 'Senha inicial com pelo menos 8 caracteres', { minLength: 8 }),
        status: campo('boolean', 'Indica se o profissional está ativo')
      }, ['nome', 'cpf', 'registro_conselho', 'conselho', 'email']),
      Disponibilidade: esquemaObjeto({
        id: campo('string', 'UUID da disponibilidade', { format: 'uuid' }),
        id_profissional: campo('string', 'UUID do profissional', { format: 'uuid' }),
        dia_semana: campo('integer', 'Dia da semana: 0 (domingo) a 6 (sábado)', { minimum: 0, maximum: 6 }),
        horario_inicio: campo('string', 'Horário inicial no formato HH:MM', { example: '09:00' }),
        horario_fim: campo('string', 'Horário final no formato HH:MM', { example: '12:00' })
      }, ['dia_semana', 'horario_inicio', 'horario_fim']),
      RespostaTriagem: esquemaObjeto({
        id_pergunta: campo('string', 'UUID da pergunta', { format: 'uuid' }),
        resposta_bool: campo('boolean', 'Resposta sim/não; use em perguntas booleanas'),
        resposta_texto: campo('string', 'Resposta textual; use em perguntas abertas', { maxLength: 1000 })
      }, ['id_pergunta']),
      Agendamento: esquemaObjeto({
        id: campo('string', 'UUID do agendamento', { format: 'uuid' }),
        id_paciente: campo('string', 'UUID do paciente', { format: 'uuid' }),
        id_profissional: campo('string', 'UUID do profissional', { format: 'uuid' }),
        id_clinica: campo('string', 'UUID da clínica', { format: 'uuid' }),
        id_triagem: campo('string', 'UUID da pré-triagem associada', { format: 'uuid', nullable: true }),
        data_consulta: campo('string', 'Data da consulta', { format: 'date' }),
        horario_inicio: campo('string', 'Horário de início', { example: '09:00' }),
        horario_fim: campo('string', 'Horário de término', { example: '09:30' }),
        status: campo('string', 'Situação', { enum: ['Agendado', 'Cancelado', 'Concluido'] })
      }),
      CategoriaTriagem: esquemaObjeto({
        id: campo('string', 'UUID da categoria', { format: 'uuid' }),
        nome_categoria: campo('string', 'Nome da categoria'),
        acao_imediata: campo('string', 'Orientação associada, quando disponível'),
        ordem_exibicao: campo('integer', 'Ordem de exibição')
      }),
      PerguntaTriagem: esquemaObjeto({
        id: campo('string', 'UUID da pergunta', { format: 'uuid' }),
        texto_pergunta: campo('string', 'Texto da pergunta'),
        tipo_resposta: campo('string', 'Tipo de resposta, por exemplo BOOLEAN ou TEXT'),
        ordem_exibicao: campo('integer', 'Ordem de exibição')
      })
    }
  },
  paths: {
    '/auth/cadastro': {
      post: operacao({
        resumo: 'Cadastrar paciente',
        descricao: 'Cria a conta de paciente e retorna um token JWT.',
        tag: 'Autenticação',
        publica: true,
        body: jsonBody({ $ref: '#/components/schemas/PacienteCadastro' }, {
          nome_completo: 'Maria da Silva',
          cpf: '12345678901',
          data_nascimento: '1990-05-20',
          telefone: '11999990000',
          email: 'maria.exemplo@example.com',
          senha: 'senha123',
          contato_emergencia_nome: 'João da Silva',
          contato_emergencia_telefone: '11988887777'
        }),
        responses: {
          201: { description: 'Paciente cadastrado e token emitido.', content: { 'application/json': { schema: { $ref: '#/components/schemas/TokenPaciente' }, example: { message: 'Paciente cadastrado com sucesso', token: 'eyJhbGciOiJIUzI1NiJ9.exemplo.ficticio', paciente: { id: 'd9428888-122b-4f58-9a7b-7f8c2f3a1b10', nome_completo: 'Maria da Silva', email: 'maria.exemplo@example.com' } } } } },
          400: respostaErro('Campos obrigatórios ou dados inválidos.', 'CPF inválido'),
          409: respostaErro('E-mail ou CPF já cadastrado.', 'Já existe um paciente com este e-mail ou CPF')
        }
      })
    },
    '/auth/login': {
      post: operacao({
        resumo: 'Login de paciente',
        descricao: 'Autentica paciente e retorna token JWT.',
        tag: 'Autenticação',
        publica: true,
        body: jsonBody({ $ref: '#/components/schemas/Credenciais' }, { email: 'maria.exemplo@example.com', senha: 'senha123' }),
        responses: {
          200: { description: 'Login realizado.', content: { 'application/json': { example: { message: 'Login realizado com sucesso', token: 'eyJhbGciOiJIUzI1NiJ9.exemplo.ficticio', paciente: { id: 'd9428888-122b-4f58-9a7b-7f8c2f3a1b10', nome_completo: 'Maria da Silva', email: 'maria.exemplo@example.com' } } } } },
          400: respostaErro('E-mail e senha são obrigatórios.', 'Informe e-mail e senha'),
          401: respostaErro('Credenciais inválidas.', 'E-mail ou senha inválidos')
        }
      })
    },
    '/auth/profissional/login': {
      post: operacao({
        resumo: 'Login de profissional',
        descricao: 'Autentica profissional ativo e retorna token JWT.',
        tag: 'Autenticação',
        publica: true,
        body: jsonBody({ $ref: '#/components/schemas/Credenciais' }, { email: 'profissional.exemplo@example.com', senha: 'senha123' }),
        responses: {
          200: { description: 'Login realizado.', content: { 'application/json': { example: { message: 'Login realizado com sucesso', token: 'eyJhbGciOiJIUzI1NiJ9.exemplo.ficticio', profissional: { id: 'b7928888-122b-4f58-9a7b-7f8c2f3a1b11', nome: 'Ana Souza', email: 'profissional.exemplo@example.com' } } } } },
          400: respostaErro('E-mail e senha são obrigatórios.', 'Informe e-mail e senha'),
          401: respostaErro('Credenciais inválidas ou profissional inativo.', 'E-mail ou senha inválidos')
        }
      })
    },
    '/auth/admin/login': {
      post: operacao({
        resumo: 'Login de administrador',
        descricao: 'Autentica administrador configurado no ambiente e retorna token JWT.',
        tag: 'Autenticação',
        publica: true,
        body: jsonBody({ $ref: '#/components/schemas/Credenciais' }, { email: 'admin.exemplo@example.com', senha: 'senha123' }),
        responses: {
          200: { description: 'Login realizado.', content: { 'application/json': { example: { message: 'Login realizado com sucesso', token: 'eyJhbGciOiJIUzI1NiJ9.exemplo.ficticio', admin: { email: 'admin.exemplo@example.com' } } } } },
          400: respostaErro('E-mail e senha são obrigatórios.', 'Informe e-mail e senha'),
          401: respostaErro('Credenciais inválidas.', 'E-mail ou senha inválidos'),
          503: respostaErro('Login administrativo não configurado no ambiente.', 'Login administrativo não configurado')
        }
      })
    },
    '/pacientes/me': {
      get: operacao({
        resumo: 'Consultar meus dados',
        descricao: 'Retorna os dados da conta identificada pelo token.',
        tag: 'Pacientes',
        papel: 'paciente',
        responses: {
          200: { description: 'Dados do paciente.', content: { 'application/json': { example: { id: 'd9428888-122b-4f58-9a7b-7f8c2f3a1b10', nome_completo: 'Maria da Silva', email: 'maria.exemplo@example.com', data_nascimento: '1990-05-20' } } } },
          403: respostas.erro403,
          404: respostaErro('Paciente não encontrado.', 'Paciente não encontrado')
        }
      }),
      put: operacao({
        resumo: 'Atualizar meus dados',
        descricao: 'Atualiza campos permitidos do próprio paciente. CPF e e-mail não são alterados por esta operação.',
        tag: 'Pacientes',
        papel: 'paciente',
        body: jsonBody(esquemaObjeto({
          nome_completo: campo('string', 'Nome completo'),
          data_nascimento: campo('string', 'Data de nascimento', { format: 'date' }),
          telefone: campo('string', 'Telefone'),
          contato_emergencia_nome: campo('string', 'Nome do contato de emergência'),
          contato_emergencia_telefone: campo('string', 'Telefone do contato de emergência'),
          contato_emergencia_email: campo('string', 'E-mail do contato de emergência', { format: 'email' }),
          relacao_contato: campo('string', 'Relação com o contato')
        }), { telefone: '11999990000' }),
        responses: { 200: respostas.sucesso, 400: respostaErro('Dados inválidos.', 'Dados inválidos'), 403: respostas.erro403, 404: respostaErro('Paciente não encontrado.', 'Paciente não encontrado') }
      })
    },
    '/profissionais': {
      get: operacao({
        resumo: 'Listar profissionais',
        descricao: 'Lista profissionais; pacientes e profissionais recebem dados públicos e administradores recebem visão completa sem senha.',
        tag: 'Profissionais',
        papel: 'qualquer usuário autenticado; visão completa para admin',
        responses: { 200: { description: 'Lista de profissionais.' } }
      }),
      post: operacao({
        resumo: 'Cadastrar profissional',
        descricao: 'Cria um profissional. Senha é recebida apenas para autenticação e nunca retornada.',
        tag: 'Profissionais',
        papel: 'admin',
        body: jsonBody({ $ref: '#/components/schemas/Profissional' }, {
          nome: 'Ana Souza',
          cpf: '98765432100',
          registro_conselho: '12345',
          conselho: 'CRM',
          uf_conselho: 'SP',
          email: 'ana.exemplo@example.com',
          senha: 'senha123'
        }),
        responses: { 201: { description: 'Profissional criado.' }, 400: respostaErro('Dados inválidos.', 'CPF inválido'), 403: respostas.erro403, 409: respostaErro('E-mail ou CPF já cadastrado.', 'Já existe um profissional com este e-mail ou CPF') }
      })
    },
    '/profissionais/{id}': {
      put: operacao({
        resumo: 'Atualizar profissional',
        descricao: 'Atualiza dados administrativos do profissional; CPF não é alterado.',
        tag: 'Profissionais',
        papel: 'admin',
        parameters: [parametroId()],
        body: jsonBody({ $ref: '#/components/schemas/Profissional' }, { nome: 'Ana Souza', telefone: '11999990000', status: true }),
        responses: { 200: respostas.sucesso, 400: respostaErro('Dados inválidos.', 'Dados inválidos. Confira clínica, especialidade e e-mail.'), 403: respostas.erro403, 404: respostaErro('Profissional não encontrado.', 'Profissional não encontrado'), 409: respostaErro('E-mail ou CPF já cadastrado.', 'Já existe um profissional com este e-mail ou CPF') }
      }),
      delete: operacao({
        resumo: 'Inativar profissional',
        descricao: 'Inativa o profissional sem apagar o histórico de consultas.',
        tag: 'Profissionais',
        papel: 'admin',
        parameters: [parametroId()],
        responses: { 204: respostas.semConteudo, 400: respostaErro('Identificador inválido.', 'Identificador inválido'), 403: respostas.erro403, 404: respostaErro('Profissional não encontrado.', 'Profissional não encontrado') }
      })
    },
    '/profissionais/{id}/horarios-ocupados': {
      get: operacao({
        resumo: 'Consultar horários ocupados',
        descricao: 'Retorna somente datas e intervalos ocupados, sem dados de pacientes.',
        tag: 'Profissionais',
        papel: 'qualquer usuário autenticado',
        parameters: [
          parametroId(),
          { name: 'data_inicio', in: 'query', required: false, description: 'Data inicial inclusiva (AAAA-MM-DD)', schema: { type: 'string', format: 'date' }, example: '2026-11-01' },
          { name: 'data_fim', in: 'query', required: false, description: 'Data final inclusiva (AAAA-MM-DD)', schema: { type: 'string', format: 'date' }, example: '2026-11-30' }
        ],
        responses: { 200: { description: 'Intervalos ocupados do profissional.' }, 400: respostaErro('Data inválida ou intervalo invertido.', 'data_inicio não pode ser posterior a data_fim') }
      })
    },
    '/profissionais/me': {
      get: operacao({
        resumo: 'Consultar meu perfil profissional',
        descricao: 'Retorna o perfil do profissional autenticado.',
        tag: 'Profissionais',
        papel: 'profissional',
        responses: { 200: respostas.sucesso, 403: respostas.erro403, 404: respostaErro('Profissional não encontrado.', 'Profissional não encontrado') }
      }),
      put: operacao({
        resumo: 'Atualizar meu perfil profissional',
        descricao: 'Permite ao profissional alterar somente nome e telefone.',
        tag: 'Profissionais',
        papel: 'profissional',
        body: jsonBody(esquemaObjeto({
          nome: campo('string', 'Nome do profissional'),
          telefone: campo('string', 'Telefone')
        }), { nome: 'Ana Souza', telefone: '11999990000' }),
        responses: { 200: respostas.sucesso, 403: respostas.erro403, 404: respostaErro('Profissional não encontrado.', 'Profissional não encontrado') }
      })
    },
    '/profissionais/me/agendamentos': {
      get: operacao({
        resumo: 'Consultar minha agenda',
        descricao: 'Lista a agenda do profissional autenticado com informações limitadas do paciente.',
        tag: 'Profissionais',
        papel: 'profissional',
        responses: { 200: { description: 'Agendamentos da agenda profissional.' }, 403: respostas.erro403 }
      })
    },
    '/profissionais/me/agendamentos/{id}/triagem': {
      get: operacao({
        resumo: 'Consultar pré-triagem da consulta',
        descricao: 'Retorna a pré-triagem vinculada a um agendamento do próprio profissional.',
        tag: 'Profissionais',
        papel: 'profissional',
        parameters: [parametroId('id', 'UUID do agendamento')],
        responses: { 200: respostas.sucesso, 400: respostaErro('Identificador inválido.', 'Identificador inválido'), 403: respostas.erro403, 404: respostaErro('Pré-triagem não encontrada para esta consulta.', 'Pré-triagem não encontrada para esta consulta') }
      })
    },
    '/clinicas': {
      get: operacao({
        resumo: 'Listar clínicas',
        descricao: 'Pacientes e profissionais veem clínicas ativas; administradores veem todas.',
        tag: 'Clínicas',
        papel: 'qualquer usuário autenticado',
        responses: { 200: { description: 'Lista de clínicas.' } }
      }),
      post: operacao({
        resumo: 'Cadastrar clínica',
        descricao: 'Cadastra clínica com CNPJ de 14 dígitos.',
        tag: 'Clínicas',
        papel: 'admin',
        body: jsonBody({ $ref: '#/components/schemas/Clinica' }, { nome: 'Clínica Exemplo', cnpj: '12345678000199', endereco: 'Rua Exemplo, 100', telefone: '1133334444', email: 'contato@example.com', horario_funcionamento: 'Seg a Sex, 8h às 18h' }),
        responses: { 201: { description: 'Clínica criada.' }, 400: respostaErro('Dados obrigatórios ou CNPJ inválidos.', 'CNPJ inválido'), 403: respostas.erro403, 409: respostaErro('CNPJ já cadastrado.', 'CNPJ já cadastrado') }
      })
    },
    '/clinicas/{id}': {
      get: operacao({
        resumo: 'Consultar clínica',
        descricao: 'Consulta clínica por UUID; clínicas inativas só são visíveis para administradores.',
        tag: 'Clínicas',
        papel: 'qualquer usuário autenticado',
        parameters: [parametroId()],
        responses: { 200: { description: 'Dados da clínica.' }, 400: respostaErro('Identificador inválido.', 'Identificador inválido'), 404: respostaErro('Clínica não encontrada.', 'Clínica não encontrada') }
      }),
      put: operacao({
        resumo: 'Atualizar clínica',
        descricao: 'Atualiza os dados da clínica.',
        tag: 'Clínicas',
        papel: 'admin',
        parameters: [parametroId()],
        body: jsonBody({ $ref: '#/components/schemas/Clinica' }, { nome: 'Clínica Exemplo', cnpj: '12345678000199', endereco: 'Rua Exemplo, 100', status: true }),
        responses: { 200: respostas.sucesso, 400: respostaErro('Dados inválidos.', 'Dados inválidos'), 403: respostas.erro403, 404: respostaErro('Clínica não encontrada.', 'Clínica não encontrada'), 409: respostaErro('CNPJ já cadastrado.', 'CNPJ já cadastrado') }
      }),
      delete: operacao({
        resumo: 'Excluir clínica',
        descricao: 'Exclui clínica sem vínculos; quando há profissionais ou agendamentos vinculados, a exclusão é recusada.',
        tag: 'Clínicas',
        papel: 'admin',
        parameters: [parametroId()],
        responses: { 204: respostas.semConteudo, 400: respostaErro('Identificador inválido.', 'Identificador inválido'), 403: respostas.erro403, 404: respostaErro('Clínica não encontrada.', 'Clínica não encontrada'), 409: respostaErro('Há recursos vinculados à clínica.', 'Há profissionais ou agendamentos vinculados a esta clínica. Inative-a em vez de excluir.') }
      })
    },
    '/especialidades': {
      get: operacao({
        resumo: 'Listar especialidades',
        descricao: 'Pacientes e profissionais veem especialidades ativas; administradores veem todas.',
        tag: 'Especialidades',
        papel: 'qualquer usuário autenticado',
        responses: { 200: { description: 'Lista de especialidades.' } }
      }),
      post: operacao({
        resumo: 'Cadastrar especialidade',
        descricao: 'Cria especialidade com nome de até 100 caracteres.',
        tag: 'Especialidades',
        papel: 'admin',
        body: jsonBody({ $ref: '#/components/schemas/Especialidade' }, { nome: 'Clínica geral', descricao: 'Atendimento médico geral', status: true }),
        responses: { 201: { description: 'Especialidade criada.' }, 400: respostaErro('Nome obrigatório ou inválido.', 'Nome é obrigatório'), 403: respostas.erro403, 409: respostaErro('Especialidade já cadastrada.', 'Já existe uma especialidade com este nome') }
      })
    },
    '/especialidades/{id}': {
      get: operacao({
        resumo: 'Consultar especialidade',
        descricao: 'Consulta especialidade por UUID; especialidades inativas só são visíveis para administradores.',
        tag: 'Especialidades',
        papel: 'qualquer usuário autenticado',
        parameters: [parametroId()],
        responses: { 200: { description: 'Dados da especialidade.' }, 400: respostaErro('Identificador inválido.', 'Identificador inválido'), 404: respostaErro('Especialidade não encontrada.', 'Especialidade não encontrada') }
      }),
      put: operacao({
        resumo: 'Atualizar especialidade',
        descricao: 'Atualiza nome, descrição e status da especialidade.',
        tag: 'Especialidades',
        papel: 'admin',
        parameters: [parametroId()],
        body: jsonBody({ $ref: '#/components/schemas/Especialidade' }, { nome: 'Clínica geral', descricao: 'Atendimento médico geral', status: true }),
        responses: { 200: respostas.sucesso, 400: respostaErro('Dados inválidos.', 'Dados inválidos'), 403: respostas.erro403, 404: respostaErro('Especialidade não encontrada.', 'Especialidade não encontrada'), 409: respostaErro('Especialidade já cadastrada.', 'Já existe uma especialidade com este nome') }
      }),
      delete: operacao({
        resumo: 'Excluir especialidade',
        descricao: 'Exclui especialidade que não esteja vinculada a profissionais.',
        tag: 'Especialidades',
        papel: 'admin',
        parameters: [parametroId()],
        responses: { 204: respostas.semConteudo, 400: respostaErro('Identificador inválido.', 'Identificador inválido'), 403: respostas.erro403, 404: respostaErro('Especialidade não encontrada.', 'Especialidade não encontrada'), 409: respostaErro('Existem profissionais vinculados.', 'Há profissionais vinculados a esta especialidade') }
      })
    },
    '/disponibilidades': {
      get: operacao({
        resumo: 'Listar disponibilidades',
        descricao: 'Lista janelas de atendimento, opcionalmente filtradas por profissional.',
        tag: 'Disponibilidades',
        papel: 'qualquer usuário autenticado',
        parameters: [{ name: 'id_profissional', in: 'query', required: false, description: 'UUID do profissional', schema: { type: 'string', format: 'uuid' }, example: 'b7928888-122b-4f58-9a7b-7f8c2f3a1b11' }],
        responses: { 200: { description: 'Lista de disponibilidades.' }, 400: respostaErro('UUID do profissional inválido.', 'Profissional inválido') }
      }),
      post: operacao({
        resumo: 'Criar disponibilidade',
        descricao: 'Cria janela para o profissional autenticado; o profissional proprietário é obtido do token.',
        tag: 'Disponibilidades',
        papel: 'profissional',
        body: jsonBody({ $ref: '#/components/schemas/Disponibilidade' }, { dia_semana: 1, horario_inicio: '09:00', horario_fim: '12:00' }),
        responses: { 201: { description: 'Disponibilidade criada.' }, 400: respostaErro('Dia ou horários inválidos.', 'O horário de início deve ser anterior ao horário de fim'), 403: respostas.erro403, 409: respostaErro('Janela sobreposta a outra disponibilidade.', 'Este horário se sobrepõe a outro já cadastrado neste dia') }
      })
    },
    '/disponibilidades/me': {
      get: operacao({
        resumo: 'Listar minhas disponibilidades',
        descricao: 'Lista somente as janelas do profissional autenticado.',
        tag: 'Disponibilidades',
        papel: 'profissional',
        responses: { 200: { description: 'Disponibilidades do profissional.' }, 403: respostas.erro403 }
      })
    },
    '/disponibilidades/{id}': {
      put: operacao({
        resumo: 'Atualizar disponibilidade',
        descricao: 'Atualiza a janela pertencente ao profissional autenticado.',
        tag: 'Disponibilidades',
        papel: 'profissional',
        parameters: [parametroId()],
        body: jsonBody({ $ref: '#/components/schemas/Disponibilidade' }, { dia_semana: 1, horario_inicio: '10:00', horario_fim: '13:00' }),
        responses: { 200: respostas.sucesso, 400: respostaErro('Identificador ou janela inválidos.', 'Informe os horários no formato HH:MM'), 403: respostas.erro403, 404: respostaErro('Disponibilidade não encontrada.', 'Disponibilidade não encontrada'), 409: respostaErro('Janela sobreposta a outra disponibilidade.', 'Este horário se sobrepõe a outro já cadastrado neste dia') }
      }),
      delete: operacao({
        resumo: 'Excluir disponibilidade',
        descricao: 'Exclui a janela pertencente ao profissional autenticado.',
        tag: 'Disponibilidades',
        papel: 'profissional',
        parameters: [parametroId()],
        responses: { 204: respostas.semConteudo, 400: respostaErro('Identificador inválido.', 'Identificador inválido'), 403: respostas.erro403, 404: respostaErro('Disponibilidade não encontrada.', 'Disponibilidade não encontrada') }
      })
    },
    '/triagem/categorias': {
      get: operacao({
        resumo: 'Listar categorias de triagem',
        descricao: 'Lista categorias disponíveis para o questionário.',
        tag: 'Triagem',
        papel: 'paciente',
        responses: { 200: { description: 'Categorias disponíveis.', content: { 'application/json': { example: [{ id: 'c9428888-122b-4f58-9a7b-7f8c2f3a1b10', nome_categoria: 'Sintomas respiratórios', acao_imediata: 'Procure atendimento se houver piora.', ordem_exibicao: 1 }] } } }, 403: respostas.erro403 }
      })
    },
    '/triagem/categorias/{idCategoria}/perguntas': {
      get: operacao({
        resumo: 'Listar perguntas da categoria',
        descricao: 'Retorna perguntas associadas à categoria escolhida.',
        tag: 'Triagem',
        papel: 'paciente',
        parameters: [parametroId('idCategoria', 'UUID da categoria de triagem')],
        responses: { 200: { description: 'Perguntas da categoria.' }, 400: respostaErro('Identificador inválido.', 'O identificador da categoria é inválido.'), 403: respostas.erro403, 404: respostaErro('Categoria não encontrada.', 'Categoria de triagem não encontrada.') }
      })
    },
    '/triagem': {
      post: operacao({
        resumo: 'Registrar pré-triagem',
        descricao: 'Registra todas as respostas da categoria selecionada para o paciente autenticado e retorna uma classificação orientativa. Não é diagnóstico nem substitui avaliação profissional.',
        tag: 'Triagem',
        papel: 'paciente',
        body: jsonBody(esquemaObjeto({
          id_categoria: campo('string', 'UUID da categoria selecionada', { format: 'uuid' }),
          respostas: { type: 'array', minItems: 1, description: 'Uma resposta por pergunta da categoria.', items: { $ref: '#/components/schemas/RespostaTriagem' } }
        }, ['id_categoria', 'respostas']), {
          id_categoria: 'c9428888-122b-4f58-9a7b-7f8c2f3a1b10',
          respostas: [
            { id_pergunta: 'd9428888-122b-4f58-9a7b-7f8c2f3a1b10', resposta_bool: true },
            { id_pergunta: 'e9428888-122b-4f58-9a7b-7f8c2f3a1b10', resposta_texto: 'Sintomas iniciados há dois dias.' }
          ]
        }),
        responses: {
          201: { description: 'Pré-triagem registrada com aviso de caráter orientativo.', content: { 'application/json': { example: { message: 'Pré-triagem registrada com sucesso.', triagem: { id: 'f9428888-122b-4f58-9a7b-7f8c2f3a1b10', status_final: 'Pre_triagem_registrada', data_registro: '2026-10-25T10:00:00.000Z' }, classificacao: { nivel: 'orientativo' }, aviso: 'Este registro não é um diagnóstico nem substitui uma avaliação profissional.' } } } },
          400: respostaErro('Categoria ou respostas inválidas, incompletas ou incompatíveis.', 'Responda todas as perguntas da categoria selecionada.'),
          401: respostaErro('Sessão inválida.', 'Usuário não autenticado corretamente.'),
          403: respostas.erro403,
          404: respostaErro('Categoria não encontrada.', 'Categoria de triagem não encontrada.')
        }
      })
    },
    '/triagem/meu-historico': {
      get: operacao({
        resumo: 'Consultar meu histórico de triagens',
        descricao: 'Lista as pré-triagens do paciente autenticado.',
        tag: 'Triagem',
        papel: 'paciente',
        responses: { 200: { description: 'Histórico de pré-triagens.' }, 401: respostaErro('Sessão inválida.', 'Usuário não autenticado corretamente.'), 403: respostas.erro403 }
      })
    },
    '/agendamentos': {
      get: operacao({
        resumo: 'Listar meus agendamentos',
        descricao: 'Lista os agendamentos do paciente autenticado.',
        tag: 'Agendamentos',
        papel: 'paciente',
        responses: { 200: { description: 'Agendamentos do paciente.' }, 403: respostas.erro403 }
      }),
      post: operacao({
        resumo: 'Criar agendamento',
        descricao: 'Agenda um horário futuro dentro da disponibilidade do profissional. A pré-triagem é opcional e deve pertencer ao paciente autenticado.',
        tag: 'Agendamentos',
        papel: 'paciente',
        body: jsonBody(esquemaObjeto({
          id_profissional: campo('string', 'UUID do profissional', { format: 'uuid' }),
          id_clinica: campo('string', 'UUID da clínica atendida pelo profissional', { format: 'uuid' }),
          id_triagem: campo('string', 'UUID de pré-triagem do paciente', { format: 'uuid', nullable: true }),
          data_consulta: campo('string', 'Data futura da consulta', { format: 'date' }),
          horario_inicio: campo('string', 'Horário inicial no formato HH:MM'),
          horario_fim: campo('string', 'Horário final no formato HH:MM')
        }, ['id_profissional', 'id_clinica', 'data_consulta', 'horario_inicio', 'horario_fim']), {
          id_profissional: 'b7928888-122b-4f58-9a7b-7f8c2f3a1b11',
          id_clinica: 'a7928888-122b-4f58-9a7b-7f8c2f3a1b12',
          id_triagem: 'f9428888-122b-4f58-9a7b-7f8c2f3a1b10',
          data_consulta: '2026-11-10',
          horario_inicio: '09:00',
          horario_fim: '09:30'
        }),
        responses: {
          201: { description: 'Agendamento criado.', content: { 'application/json': { schema: { $ref: '#/components/schemas/Agendamento' }, example: { id: 'a9428888-122b-4f58-9a7b-7f8c2f3a1b10', id_profissional: 'b7928888-122b-4f58-9a7b-7f8c2f3a1b11', id_clinica: 'a7928888-122b-4f58-9a7b-7f8c2f3a1b12', data_consulta: '2026-11-10', horario_inicio: '09:00', horario_fim: '09:30', status: 'Agendado' } } } },
          400: respostaErro('Dados, data, horários ou relações inválidos.', 'Este horário não está na agenda do profissional'),
          401: respostas.erro401,
          403: respostas.erro403,
          404: respostaErro('Profissional ou clínica não encontrados/ativos.', 'Profissional não encontrado'),
          409: respostaErro('Já existe agendamento conflitante.', 'Já existe um agendamento para este profissional neste horário')
        }
      })
    },
    '/agendamentos/{id}': {
      get: operacao({
        resumo: 'Consultar agendamento',
        descricao: 'Consulta agendamento pertencente ao paciente autenticado.',
        tag: 'Agendamentos',
        papel: 'paciente',
        parameters: [parametroId()],
        responses: { 200: { description: 'Dados do agendamento.' }, 400: respostaErro('Identificador inválido.', 'Identificador inválido'), 403: respostas.erro403, 404: respostaErro('Agendamento não encontrado.', 'Agendamento não encontrado') }
      })
    },
    '/agendamentos/{id}/cancelar': {
      patch: operacao({
        resumo: 'Cancelar agendamento',
        descricao: 'Cancela agendamento do paciente autenticado; somente agendamentos com status Agendado podem ser cancelados.',
        tag: 'Agendamentos',
        papel: 'paciente',
        parameters: [parametroId()],
        responses: {
          200: { description: 'Agendamento atualizado para Cancelado.', content: { 'application/json': { example: { id: 'a9428888-122b-4f58-9a7b-7f8c2f3a1b10', status: 'Cancelado' } } } },
          400: respostaErro('Identificador inválido.', 'Identificador inválido'),
          403: respostas.erro403,
          404: respostaErro('Agendamento não encontrado.', 'Agendamento não encontrado'),
          409: respostaErro('Somente agendamentos ativos podem ser cancelados.', 'Só é possível cancelar consultas agendadas')
        }
      })
    },
    '/admin/senha-temporaria': {
      post: operacao({
        resumo: 'Definir senha temporária',
        descricao: 'Gera uma senha temporária para o paciente ou profissional dono do e-mail informado. A senha é devolvida apenas nesta resposta e deve ser repassada presencialmente pela recepção. Não envia e-mail.',
        tag: 'Administração',
        papel: 'admin',
        body: jsonBody(esquemaObjeto({
          email: campo('string', 'E-mail cadastrado do paciente ou do profissional', { format: 'email' })
        }, ['email']), { email: 'robertaalves@email.com' }),
        responses: {
          200: {
            description: 'Senha temporária definida.',
            content: {
              'application/json': {
                example: {
                  perfil: 'paciente',
                  nome: 'Roberta Alves',
                  email: 'robertaalves@email.com',
                  senha_temporaria: 'K7F2M9QX'
                }
              }
            }
          },
          400: respostaErro('E-mail não informado.', 'Informe o e-mail'),
          403: respostas.erro403,
          404: respostaErro('Conta não encontrada ou inativa.', 'Não encontramos uma conta ativa com este e-mail')
        }
      })
    }
  }
};
