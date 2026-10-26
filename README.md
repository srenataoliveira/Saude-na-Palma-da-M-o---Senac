# Desafila — API Backend

API REST do Desafila, projeto acadêmico do Senac Pernambuco, desenvolvida com Node.js, Express e PostgreSQL. O backend oferece pré-triagem orientativa de sintomas e agendamento de consultas em clínicas. A pré-triagem **não fornece diagnóstico** e não substitui a avaliação de um profissional de saúde.

## Funcionalidades

- Cadastro e autenticação de pacientes e profissionais, além de login administrativo.
- Autorização por papel (`paciente`, `profissional` e `admin`) usando JWT Bearer.
- Consulta e atualização dos dados do próprio paciente, incluindo validação de data de nascimento.
- Catálogo de clínicas, especialidades e profissionais, com operações administrativas.
- Portal do profissional com perfil, agenda, pré-triagens vinculadas a consultas e gerenciamento de disponibilidades.
- Questionários por categoria, registro e histórico de pré-triagem.
- Agendamento e cancelamento de consultas, com validação de disponibilidade e conflitos de horário.
- Redefinição administrativa de senha de paciente ou profissional por senha temporária.
- Documentação interativa da API com Swagger UI e especificação OpenAPI 3.0.

## Tecnologias

- **Node.js** e **Express 5** — servidor HTTP e API REST.
- **PostgreSQL** — persistência relacional.
- **Sequelize** e **pg** — modelos, validações e acesso ao banco.
- **JWT (`jsonwebtoken`)** — autenticação Bearer.
- **bcrypt** — hash de senhas.
- **dotenv** — configuração por variáveis de ambiente.
- **helmet** e **cors** — cabeçalhos de segurança e configuração de origens.
- **express-rate-limit** — limitação de tentativas em operações sensíveis.
- **swagger-ui-express** — interface interativa da documentação OpenAPI.

## Requisitos

- Node.js em versão LTS e npm.
- PostgreSQL instalado ou acessível pela rede.
- Git (opcional, para clonar o repositório).

## Configuração local

1. Clone o repositório e entre na pasta:

   ```bash
   git clone https://github.com/srenataoliveira/Saude-na-Palma-da-M-o---Senac.git
   cd Saude-na-Palma-da-M-o---Senac
   ```

2. Instale as dependências:

   ```bash
   npm install
   ```

3. Copie `.env.example` para `.env` e configure os valores localmente. No PowerShell:

   ```powershell
   Copy-Item .env.example .env
   ```

   Variáveis usadas pelo backend:

   | Variável | Obrigatória para iniciar? | Descrição |
   | --- | --- | --- |
   | `PORT` | Não | Porta HTTP; padrão `3000`. |
   | `DB_HOST` | Sim | Host do PostgreSQL. |
   | `DB_PORT` | Sim | Porta do PostgreSQL, normalmente `5432`. |
   | `DB_NAME` | Sim | Nome do banco de dados. |
   | `DB_USER` | Sim | Usuário do PostgreSQL. |
   | `DB_PASSWORD` | Sim | Senha do usuário do PostgreSQL. |
   | `DB_SSL` | Não | Use `true` quando o provedor do banco exigir SSL; padrão `false`. |
   | `JWT_SECRET` | Sim | Segredo usado para assinar tokens JWT. Use um valor aleatório forte com pelo menos 32 caracteres. |
   | `ADMIN_EMAIL` | Não | E-mail da conta administrativa operacional. Necessário para habilitar o login de admin. |
   | `ADMIN_SENHA_HASH` | Não | Hash bcrypt da senha administrativa, nunca a senha em texto puro. Necessário para habilitar o login de admin. |
   | `CORS_ORIGINS` | Não | Origens permitidas separadas por vírgula; por padrão, `http://localhost:5173,http://127.0.0.1:5173`. |
   | `TZ_CLINICA` | Não | Fuso horário usado para verificar consultas no passado; configuração do projeto: `America/Recife`. |
   | `AUTH_RATE_LIMIT` | Não | Limite de tentativas por IP a cada 15 minutos; padrão `50`. |

   O arquivo `.env` contém credenciais: mantenha-o local, não o envie em issues ou mensagens e não o versione. O repositório inclui `.env.example` sem credenciais.

   Para gerar valores localmente, o Node.js pode criar um segredo JWT e um hash bcrypt:

   ```bash
   node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
   node -e "console.log(require('bcrypt').hashSync('EscolhaUmaSenhaLocal', 10))"
   ```

   Use a saída do primeiro comando em `JWT_SECRET` e a saída do segundo em `ADMIN_SENHA_HASH`. Escolha a senha administrativa localmente; não compartilhe a senha nem o hash.

## Banco de dados

Crie um banco PostgreSQL vazio e aplique os arquivos SQL na ordem indicada. Os comandos abaixo usam valores fictícios; ajuste o usuário e o banco à sua instalação. O `psql` pode solicitar a senha do banco:

```bash
psql -U SEU_USUARIO -d SEU_BANCO -f schema.sql
```

Antes da migração de segurança, execute as consultas de diagnóstico. Esse arquivo é somente leitura: examine os resultados e resolva duplicidades ou dados fora do padrão antes de prosseguir.

```bash
psql -U SEU_USUARIO -d SEU_BANCO -f migrations/000_diagnostico.sql
```

Depois, aplique a migração que prepara login, portal profissional e vínculos da triagem com agendamentos:

```bash
psql -U SEU_USUARIO -d SEU_BANCO -f migrations/001_seguranca_e_portal.sql
```

Para carregar dados de demonstração, execute os seeds SQL:

```bash
psql -U SEU_USUARIO -d SEU_BANCO -f seeds/001_dados_iniciais.sql
psql -U SEU_USUARIO -d SEU_BANCO -f seeds/002_categorias_triagem.sql
psql -U SEU_USUARIO -d SEU_BANCO -f seeds/003_perguntas_triagem.sql
```

`migrations/002_restricoes_de_horario.sql` é opcional e recomendada para impor também no PostgreSQL a prevenção de sobreposição de consultas e disponibilidades. Antes de aplicá-la, confirme que as consultas de conflito no diagnóstico (`migrations/000_diagnostico.sql`) não retornam registros.

Não há um executor automático de migrações no `package.json`; aplique os arquivos SQL conscientemente e faça backup antes de alterar um banco com dados existentes.

## Executar a API

Com o PostgreSQL configurado, o schema e as migrações aplicados e o `.env` preenchido:

```bash
npm start
```

O servidor escuta na porta definida por `PORT` (por padrão, `3000`). Para iniciar em desenvolvimento, também é possível executar `node app.js`. Não há script de desenvolvimento com recarga automática configurado no `package.json`.

## Documentação interativa

Com o servidor ativo, abra:

- Local: [http://localhost:3000/api-docs](http://localhost:3000/api-docs)
- Servidor publicado descrito na especificação: [https://desafila-api.onrender.com](https://desafila-api.onrender.com)

O Swagger UI permite consultar endpoints e enviar requisições de teste. Para testar rotas protegidas, faça login, use o token JWT retornado no botão **Authorize** e execute a operação desejada. Nunca publique tokens ou use credenciais reais em exemplos.

A especificação OpenAPI fica em [`docs/openapi.js`](./docs/openapi.js). A API espera tokens no cabeçalho:

```http
Authorization: Bearer <token>
```

Os tokens são assinados com HS256 e expiram em oito horas. O middleware valida o token e os endpoints restringem ações de acordo com o papel. Leituras de clínicas, especialidades e disponibilidades também exigem autenticação. Para operações administrativas, é necessário um token com papel `admin`.

## Endpoints

Todas as rotas usam o prefixo indicado na coluna **Rota**. Salvo as rotas de autenticação, as operações protegidas esperam JWT Bearer. Os papéis são indicados entre parênteses.

| Grupo | Método e rota | Acesso |
| --- | --- | --- |
| Autenticação | `POST /auth/cadastro` | Público; cria paciente |
| Autenticação | `POST /auth/login` | Público; login de paciente |
| Autenticação | `POST /auth/profissional/login` | Público; login de profissional |
| Autenticação | `POST /auth/admin/login` | Público; login administrativo configurado pelo ambiente |
| Pacientes | `GET /pacientes/me` | Paciente |
| Pacientes | `PUT /pacientes/me` | Paciente |
| Profissionais | `GET /profissionais` | Qualquer usuário autenticado; dados públicos para paciente/profissional |
| Profissionais | `GET /profissionais/:id/horarios-ocupados` | Qualquer usuário autenticado |
| Profissionais | `GET /profissionais/me` | Profissional |
| Profissionais | `PUT /profissionais/me` | Profissional |
| Profissionais | `GET /profissionais/me/agendamentos` | Profissional |
| Profissionais | `GET /profissionais/me/agendamentos/:id/triagem` | Profissional; consulta vinculada à sua agenda |
| Profissionais | `POST /profissionais` | Admin |
| Profissionais | `PUT /profissionais/:id` | Admin |
| Profissionais | `DELETE /profissionais/:id` | Admin; inativa o profissional |
| Clínicas | `GET /clinicas`, `GET /clinicas/:id` | Qualquer usuário autenticado |
| Clínicas | `POST /clinicas`, `PUT /clinicas/:id`, `DELETE /clinicas/:id` | Admin |
| Especialidades | `GET /especialidades`, `GET /especialidades/:id` | Qualquer usuário autenticado |
| Especialidades | `POST /especialidades`, `PUT /especialidades/:id`, `DELETE /especialidades/:id` | Admin |
| Disponibilidades | `GET /disponibilidades` | Qualquer usuário autenticado; aceita filtro `id_profissional` |
| Disponibilidades | `GET /disponibilidades/me` | Profissional; próprias janelas |
| Disponibilidades | `POST /disponibilidades`, `PUT /disponibilidades/:id`, `DELETE /disponibilidades/:id` | Profissional; próprias janelas |
| Triagem | `GET /triagem/categorias` | Paciente |
| Triagem | `GET /triagem/categorias/:idCategoria/perguntas` | Paciente |
| Triagem | `POST /triagem` | Paciente; registra respostas |
| Triagem | `GET /triagem/meu-historico` | Paciente |
| Agendamentos | `GET /agendamentos`, `GET /agendamentos/:id` | Paciente; próprios agendamentos |
| Agendamentos | `POST /agendamentos` | Paciente |
| Agendamentos | `PATCH /agendamentos/:id/cancelar` | Paciente; próprio agendamento |
| Administração | `POST /admin/senha-temporaria` | Admin; redefine senha de paciente ou profissional |

### Fluxo de pré-triagem e agendamento

1. Autentique um paciente e use o token recebido nas rotas protegidas.
2. Consulte `GET /triagem/categorias` e as perguntas da categoria selecionada.
3. Envie todas as respostas válidas em `POST /triagem`. O resultado é orientativo e não é diagnóstico.
4. Consulte profissionais, disponibilidades e horários ocupados para escolher uma janela.
5. Envie `POST /agendamentos`, associando opcionalmente uma pré-triagem pertencente ao próprio paciente.
6. Consulte ou cancele o agendamento pelos endpoints de paciente.

### Senhas temporárias

O endpoint administrativo `POST /admin/senha-temporaria` recebe o e-mail de paciente ou profissional e retorna uma senha temporária uma única vez na resposta. A entrega é feita manualmente pelo administrador; não há envio automático por e-mail. Trate a resposta como segredo: entregue-a por um canal apropriado e não a salve em logs, tickets ou capturas de tela.

## Segurança e limites

- As senhas de contas são armazenadas como hashes bcrypt.
- JWT é validado pelo middleware; rotas de paciente e profissional acessam os dados da própria conta.
- O cadastro/login e a geração de senha temporária têm limite de tentativas configurável por `AUTH_RATE_LIMIT` (padrão: 50 em 15 minutos).
- O registro de triagem tem limite de 30 requisições por IP em 15 minutos.
- O corpo JSON tem limite de 100 KB.
- `helmet` configura cabeçalhos de segurança e `CORS_ORIGINS` limita origens permitidas.
- Não inclua dados sensíveis, senhas ou tokens reais em exemplos, commits ou documentação pública.

## Estrutura do projeto

```text
.
├── app.js                 # Configuração e inicialização do Express
├── controllers/           # Lógica HTTP e regras de cada operação
├── docs/openapi.js        # Especificação OpenAPI usada pelo Swagger UI
├── middleware/            # Autenticação JWT e autorização por papel
├── migrations/            # Diagnóstico e alterações incrementais no PostgreSQL
├── models/                # Modelos Sequelize e consultas ao banco
├── routes/                # Definição e proteção das rotas
├── schema.sql             # Estrutura inicial das tabelas
├── scripts/               # Utilitários administrativos/de desenvolvimento
├── seeds/                 # Dados iniciais e questionários de demonstração
├── services/              # Serviços de domínio, como classificação orientativa
├── utils/                 # Validações e utilitários compartilhados
├── db.js                  # Pool PostgreSQL usado por consultas SQL diretas
├── sequelize.js           # Configuração da conexão Sequelize
├── package.json           # Dependências e comandos npm
└── .env.example           # Modelo de configuração sem segredos
```

O backend usa Sequelize para modelos relacionais e também `pg` para consultas SQL diretas em partes do fluxo de triagem.

## Testes

O `package.json` ainda não configura uma suíte automatizada (`npm test` é apenas um placeholder). Para verificações rápidas de sintaxe:

```bash
node --check app.js
node --check docs/openapi.js
node --check controllers/pacienteControllers.js
node --check models/Paciente.js
```

Os fluxos da API também podem ser exercitados manualmente pelo Swagger UI, usando uma base de dados de desenvolvimento e contas de teste. A validação de `data_nascimento` do paciente aceita uma data válida no formato `AAAA-MM-DD` e rejeita valores vazios ou datas inválidas.

## Autores

Desenvolvido por **Renata Oliveira** e **Gabriel Tenório** como parte de um projeto acadêmico do Senac Pernambuco.
